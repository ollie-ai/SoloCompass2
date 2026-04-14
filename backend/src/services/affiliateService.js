// Affiliate Programs Configuration
// These would typically come from environment variables or a database

const AFFILIATE_CONFIG = {
  amazon: {
    associateTag: process.env.AMAZON_ASSOCIATES_TAG || 'solocompass-21',
    baseUrl: 'https://www.amazon.co.uk',
    searchUrl: 'https://www.amazon.co.uk/s',
    // Product categories relevant for travel
    categories: {
      travel: 'travel-p-123',
      electronics: 'electronics',
      luggage: 'luggage'
    }
  },
  viator: {
    affiliateId: process.env.VIATOR_AFFILIATE_ID || '',
    baseUrl: 'https://www.viator.com',
    // Viator uses deep linking
    getSearchUrl: (query, location) => 
      `https://www.viator.com/search?q=${encodeURIComponent(query)}&activity=&location=${encodeURIComponent(location || '')}`
  },
  agoda: {
    affiliateId: process.env.AGODA_PUBLISHER_ID || '',
    apiKey: process.env.AGODA_API_KEY || '',
    baseUrl: 'https://www.agoda.com',
    getHotelUrl: (city) => 
      `https://www.agoda.com/pages/agodausers/DearchSearchRC.aspx?CID=${AFFILIATE_CONFIG.agoda.affiliateId || -1}&checkin=&checkout=&adults=1&children=0&rooms=1&searchcode=${encodeURIComponent(city)}`
  },
  aviasales: {
    affiliateId: process.env.AVIASALES_AFFILIATE_ID || '',
    baseUrl: 'https://www.aviasales.com',
    getFlightUrl: (origin, destination, date) =>
      `https://www.aviasales.com/flights/${origin.toLowerCase()}-${destination.toLowerCase()}/${date || ''}`
  },
  safetyWing: {
    affiliateId: process.env.SAFETYWING_AFFILIATE_ID || '',
    baseUrl: 'https://safetywing.com',
    getQuoteUrl: () => `https://safetywing.com/nomad-insurance/?referenceID=${AFFILIATE_CONFIG.safetyWing.affiliateId || ''}`
  }
};

/**
 * Generate Amazon search URL with associate tag
 */
export function getAmazonSearchUrl(query, category = 'travel') {
  const config = AFFILIATE_CONFIG.amazon;
  return `${config.searchUrl}?k=${encodeURIComponent(query)}&tag=${config.associateTag}&ref_=as_li_ss_tl`;
}

/**
 * Generate Viator search URL
 */
export function getViatorSearchUrl(query, location = '') {
  const config = AFFILIATE_CONFIG.viator;
  const affiliateParam = config.affiliateId ? `&pid=${config.affiliateId}` : '';
  return `https://www.viator.com/search?q=${encodeURIComponent(query)}&activity=&location=${encodeURIComponent(location || '')}${affiliateParam}`;
}

/**
 * Generate Agoda hotel search URL
 */
export function getAgodaHotelUrl(city) {
  const config = AFFILIATE_CONFIG.agoda;
  return config.getHotelUrl(city);
}

/**
 * Generate Aviasales flight URL
 */
export function getAviasalesFlightUrl(origin, destination, date = '') {
  const config = AFFILIATE_CONFIG.aviasales;
  return config.getFlightUrl(origin, destination, date);
}

/**
 * Generate SafetyWing insurance URL
 */
export function getSafetyWingUrl() {
  const config = AFFILIATE_CONFIG.safetyWing;
  return config.getQuoteUrl();
}

/**
 * Get all affiliate links for a destination
 */
export function getAffiliateLinksForDestination(destination) {
  return {
    hotels: getAgodaHotelUrl(destination),
    flights: getAviasalesFlightUrl('', destination),
    tours: getViatorSearchUrl('tours', destination),
    insurance: getSafetyWingUrl(),
    shopping: getAmazonSearchUrl('travel packing list')
  };
}

/**
 * Get all affiliate links for a trip
 */
export function getAffiliateLinksForTrip(trip) {
  const { destination, departure, return: returnDate } = trip;
  
  return {
    hotels: getAgodaHotelUrl(destination),
    flights: getAviasalesFlightUrl(departure?.from || '', destination, departure?.date),
    activities: getViatorSearchUrl('activities', destination),
    travelInsurance: getSafetyWingUrl(),
    packingList: getAmazonSearchUrl('travel packing list')
  };
}

/**
 * Get affiliate config status (for admin dashboard)
 */
export function getAffiliateStatus() {
  return {
    amazon: !!process.env.AMAZON_ASSOCIATES_TAG,
    viator: !!process.env.VIATOR_AFFILIATE_ID,
    agoda: !!(process.env.AGODA_API_KEY || process.env.AGODA_PUBLISHER_ID),
    aviasales: !!process.env.AVIASALES_AFFILIATE_ID,
    safetyWing: !!process.env.SAFETYWING_AFFILIATE_ID
  };
}
