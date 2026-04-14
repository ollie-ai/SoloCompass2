import logger from './logger.js';
import axios from 'axios';

const timezoneCache = new Map();

const destinationTimezoneMap = {
  'london': 'Europe/London',
  'paris': 'Europe/Paris',
  'tokyo': 'Asia/Tokyo',
  'new york': 'America/New_York',
  'new york city': 'America/New_York',
  'nyc': 'America/New_York',
  'los angeles': 'America/Los_Angeles',
  'la': 'America/Los_Angeles',
  'san francisco': 'America/Los_Angeles',
  'chicago': 'America/Chicago',
  'sydney': 'Australia/Sydney',
  'melbourne': 'Australia/Melbourne',
  'berlin': 'Europe/Berlin',
  'rome': 'Europe/Rome',
  'madrid': 'Europe/Madrid',
  'barcelona': 'Europe/Madrid',
  'amsterdam': 'Europe/Amsterdam',
  'dubai': 'Asia/Dubai',
  'bangkok': 'Asia/Bangkok',
  'singapore': 'Asia/Singapore',
  'hong kong': 'Asia/Hong_Kong',
  'seoul': 'Asia/Seoul',
  'mumbai': 'Asia/Kolkata',
  'delhi': 'Asia/Kolkata',
  'cairo': 'Africa/Cairo',
  'istanbul': 'Europe/Istanbul',
  'moscow': 'Europe/Moscow',
  'toronto': 'America/Toronto',
  'vancouver': 'America/Vancouver',
  'mexico city': 'America/Mexico_City',
  'buenos aires': 'America/Argentina/Buenos_Aires',
  'sao paulo': 'America/Sao_Paulo',
  'lisbon': 'Europe/Lisbon',
  'athens': 'Europe/Athens',
  'vienna': 'Europe/Vienna',
  'zurich': 'Europe/Zurich',
  'stockholm': 'Europe/Stockholm',
  'copenhagen': 'Europe/Copenhagen',
  'oslo': 'Europe/Oslo',
  'helsinki': 'Europe/Helsinki',
  'dublin': 'Europe/Dublin',
  'edinburgh': 'Europe/London',
  'prague': 'Europe/Prague',
  'warsaw': 'Europe/Warsaw',
  'budapest': 'Europe/Budapest',
  'kuala lumpur': 'Asia/Kuala_Lumpur',
  'jakarta': 'Asia/Jakarta',
  'manila': 'Asia/Manila',
  'taipei': 'Asia/Taipei',
  'ho chi minh': 'Asia/Ho_Chi_Minh',
  'nairobi': 'Africa/Nairobi',
  'cape town': 'Africa/Johannesburg',
  'johannesburg': 'Africa/Johannesburg',
  'lagos': 'Africa/Lagos',
  'tel aviv': 'Asia/Jerusalem',
  'beirut': 'Asia/Beirut',
  'athens': 'Europe/Athens',
  'nice': 'Europe/Paris',
  'milan': 'Europe/Rome',
  'florence': 'Europe/Rome',
  'venice': 'Europe/Rome',
};

export function getTimezoneFromDestination(destination) {
  if (!destination) return null;
  
  const normalized = destination.toLowerCase().trim();
  
  if (timezoneCache.has(normalized)) {
    return timezoneCache.get(normalized);
  }
  
  const timezone = destinationTimezoneMap[normalized] || null;
  timezoneCache.set(normalized, timezone);
  
  return timezone;
}

// Fetch timezone from external API as fallback
async function fetchTimezoneFromAPI(destination) {
  try {
    // Use Geoapify to get coordinates, then timezone
    const geoResponse = await axios.get(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(destination)}&limit=1&apiKey=${process.env.GEOAPIFY_API_KEY || ''}`
    );
    
    if (geoResponse.data?.features?.[0]) {
      const { lat, lon } = geoResponse.data.features[0].properties;
      
      // Use WorldTimeAPI to get timezone
      const timeResponse = await axios.get(
        `http://worldtimeapi.org/api/ip`
      );
      
      if (timeResponse.data?.timezone) {
        return timeResponse.data.timezone;
      }
    }
  } catch (error) {
    logger.warn(`[Timezone] API fallback failed for ${destination}: ${error.message}`);
  }
  return null;
}

export async function getTimezoneFromDestinationAsync(destination) {
  if (!destination) return null;
  
  const normalized = destination.toLowerCase().trim();
  
  // Check cache first
  if (timezoneCache.has(normalized)) {
    return timezoneCache.get(normalized);
  }
  
  // Try hardcoded map first
  let timezone = destinationTimezoneMap[normalized] || null;
  
  // If not found, try API
  if (!timezone) {
    timezone = await fetchTimezoneFromAPI(destination);
  }
  
  timezoneCache.set(normalized, timezone);
  return timezone;
}

export function getTimezoneInfo(destination, homeTimezone = 'UTC') {
  const timezone = getTimezoneFromDestination(destination);
  
  if (!timezone) {
    return {
      timezone: null,
      localTime: null,
      timezoneName: 'Unknown',
      timeDiff: null,
      timeDiffHours: null,
    };
  }
  
  try {
    const now = new Date();
    
    const localFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    const tzNameFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'long',
    });
    
    const parts = tzNameFormatter.formatToParts(now);
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value || timezone;
    
    const homeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: homeTimezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
    
    const destFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
    
    const homeDate = new Date(homeFormatter.format(now));
    const destDate = new Date(destFormatter.format(now));
    
    let diffMs = destDate - homeDate;
    let diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    const absHours = Math.abs(diffHours);
    const sign = diffHours >= 0 ? '+' : '-';
    const timeDiffStr = diffHours === 0 ? 'Same time' : `${sign}${absHours}h from home`;
    
    return {
      timezone,
      localTime: localFormatter.format(now),
      timezoneName: tzName,
      timeDiff: timeDiffStr,
      timeDiffHours: diffHours,
    };
  } catch (error) {
    logger.error('Timezone calculation error:', error.message);
    return {
      timezone,
      localTime: null,
      timezoneName: timezone,
      timeDiff: null,
      timeDiffHours: null,
    };
  }
}

export function getTimezoneForTrip(trip, userHomeTimezone = 'UTC') {
  return getTimezoneInfo(trip.destination, userHomeTimezone);
}