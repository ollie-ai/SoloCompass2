import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, schema }) => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = 'SoloCompass';
    const finalTitle = title ? `${title} | ${baseTitle}` : baseTitle;
    const finalDesc = description || "SoloCompass: The world's #1 AI-powered solo travel planner with FCDO safety intelligence.";
    const siteUrl = import.meta.env.VITE_APP_URL || window.location.origin || 'https://solocompass.app';
    const currentUrl = window.location.href;
    const ogImage = new URL('/og-image.png', siteUrl).toString();

    document.title = finalTitle;

    // Update standard meta tags
    const updateMeta = (name, property, content) => {
      let meta = name 
        ? document.querySelector(`meta[name="${name}"]`)
        : document.querySelector(`meta[property="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (name) meta.setAttribute('name', name);
        if (property) meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', null, finalDesc);
    updateMeta(null, 'og:title', finalTitle);
    updateMeta(null, 'og:description', finalDesc);
    updateMeta(null, 'og:url', currentUrl);
    updateMeta(null, 'og:type', 'website');
    updateMeta(null, 'og:image', ogImage);

    updateMeta('twitter:card', null, 'summary_large_image');
    updateMeta('twitter:title', finalTitle);
    updateMeta('twitter:description', finalDesc);
    updateMeta('twitter:image', ogImage);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Schema.org injection
    const existingSchema = document.getElementById('seo-schema');
    if (existingSchema) existingSchema.remove();

    if (schema) {
      const script = document.createElement('script');
      script.id = 'seo-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [title, description, schema, location]);

  return null;
};

export default SEO;
