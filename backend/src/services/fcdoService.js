import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import logger from './logger.js';

const ATOM_URL = 'https://www.gov.uk/foreign-travel-advice.atom';
const CACHE_BUSTER = () => `?t=${Date.now()}`;

// Memory cache to prevent slamming gov.uk and slowing down dashboards
let advisoryCache = {
  data: null,
  expiry: 0
};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function fetchFCDOAdvisories() {
  // Return cached data if available and not expired
  if (advisoryCache.data && Date.now() < advisoryCache.expiry) {
    return advisoryCache.data;
  }

  try {
    const response = await axios.get(ATOM_URL + CACHE_BUSTER());
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const result = parser.parse(response.data);
    
    // Parse the ATOM entries into a clean JSON format
    const entries = Array.isArray(result.feed.entry) ? result.feed.entry : (result.feed.entry ? [result.feed.entry] : []);
    
    // Helper to extract text from potential nested XML objects
    const extractText = (obj) => {
      if (typeof obj === 'string') {
        // Filter out common namespace/attribute values that might have been flattened
        if (obj.includes('http://www.w3.org/1999/xhtml')) return '';
        return obj;
      }
      if (!obj) return '';
      if (obj['#text']) return obj['#text'];
      if (Array.isArray(obj)) return obj.map(extractText).filter(Boolean).join(' ');
      if (typeof obj === 'object') {
        return Object.entries(obj)
          .filter(([key]) => !key.startsWith('@_') && !key.includes(':') && key !== 'xmlns')
          .map(([, value]) => extractText(value))
          .filter(Boolean)
          .join(' ');
      }
      return String(obj);
    };

    const parsedAdvisories = entries.slice(0, 20).map(entry => {
      // Clean up the country name from title (format usually: "Spain travel advice")
      const title = entry.title || '';
      const country = title.replace(' travel advice', '');
      
      // Handle potential object/xhtml summary
      let summaryText = '';
      if (typeof entry.summary === 'string') {
        summaryText = entry.summary;
      } else if (entry.summary?.div) {
        // If it's XHTML with a div, the text is often directly in the div or in p tags inside it
        const div = entry.summary.div;
        if (typeof div === 'string') {
          summaryText = div;
        } else {
          // Flatten child objects (p, span, etc)
          const flatten = (obj) => {
            if (typeof obj === 'string') return obj;
            if (!obj) return '';
            if (obj['#text']) return obj['#text'];
            if (Array.isArray(obj)) return obj.map(flatten).join(' ');
            return Object.entries(obj)
              .filter(([key]) => !key.startsWith('@_'))
              .map(([, v]) => flatten(v))
              .join(' ');
          };
          summaryText = flatten(div);
        }
      } else {
        summaryText = extractText(entry.summary).trim();
      }

      // Handle link array/object
      let link = '';
      if (Array.isArray(entry.link)) {
        const altLink = entry.link.find(l => l['@_rel'] === 'alternate' && l['@_type'] === 'text/html');
        link = altLink ? altLink['@_href'] : (entry.link[0]?.['@_href'] || '');
      } else {
        link = entry.link?.['@_href'] || '';
      }
      
      return {
        id: entry.id,
        country,
        title,
        updated: entry.updated,
        summary: summaryText.trim(),
        link: link.replace('.atom', '') // Remove .atom suffix if it accidentally crept in
      };
    });

    advisoryCache = {
      data: parsedAdvisories,
      expiry: Date.now() + CACHE_DURATION
    };

    return parsedAdvisories;
  } catch (error) {
    logger.error('FCDO Service Error:', error);
    return [];
  }
}
