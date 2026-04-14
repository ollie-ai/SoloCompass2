export const INTEREST_CATEGORIES = {
  CULTURE: ['museums', 'history', 'art', 'architecture', 'cultural_events'],
  FOOD: ['food', 'restaurants', 'street_food', 'cooking', 'wine'],
  NATURE: ['hiking', 'beach', 'wildlife', 'gardens', 'mountains'],
  ADVENTURE: ['diving', 'surfing', 'skiing', 'climbing', 'extreme_sports'],
  NIGHTLIFE: ['bars', 'clubs', 'live_music', 'socializing'],
  SHOPPING: ['markets', 'shopping', 'fashion', 'antiques'],
  WELLNESS: ['spa', 'yoga', 'meditation', 'relaxation'],
};

export const BUDGET_LEVELS = {
  budget: { min: 0, max: 50, label: 'Budget (£)' },
  moderate: { min: 50, max: 150, label: 'Moderate (££)' },
  luxury: { min: 150, max: Infinity, label: 'Luxury (£££)' },
};

export const ADVENTURE_LEVELS = {
  chill: { label: 'Chill', description: 'Relaxed pace, plenty of downtime' },
  moderate: { label: 'Moderate', description: 'Balanced activities and rest' },
  adventurous: { label: 'Adventurous', description: 'Active pace, thrill-seeking' },
};

export const SOCIAL_PREFERENCES = {
  solo: { label: 'Solo Explorer', description: 'Prefer traveling alone but open to meeting' },
  mix: { label: 'Mix', description: 'Balance of solo time and group activities' },
  social: { label: 'Social Butterfly', description: 'Love meeting fellow travelers' },
};

export function calculateJaccardSimilarity(set1, set2) {
  if (!set1 || !set2 || set1.length === 0 || set2.length === 0) return 0;
  const arr1 = Array.isArray(set1) ? set1 : JSON.parse(set1);
  const arr2 = Array.isArray(set2) ? set2 : JSON.parse(set2);
  const intersection = arr1.filter(x => arr2.includes(x));
  const union = [...new Set([...arr1, ...set2])];
  return intersection.length / union.length;
}

export function normalizeDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return { start, end, days };
}

export function calculateDateOverlapPercent(dateRange1, dateRange2) {
  const { start: s1, end: e1 } = normalizeDateRange(dateRange1.start, dateRange1.end);
  const { start: s2, end: e2 } = normalizeDateRange(dateRange2.start, dateRange2.end);
  
  const overlapStart = Math.max(s1, s2);
  const overlapEnd = Math.min(e1, e2);
  
  if (overlapStart > overlapEnd) return 0;
  
  const overlapDays = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
  const shorterTrip = Math.min(
    Math.ceil((e1 - s1) / (1000 * 60 * 60 * 24)),
    Math.ceil((e2 - s2) / (1000 * 60 * 60 * 24))
  );
  
  return (overlapDays / shorterTrip) * 100;
}

export function getAllInterests() {
  return Object.values(INTEREST_CATEGORIES).flat();
}

export function categorizeInterest(interest) {
  for (const [category, interests] of Object.entries(INTEREST_CATEGORIES)) {
    if (interests.includes(interest)) return category;
  }
  return null;
}

export function getCompatibilityLabel(score) {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Great Match';
  if (score >= 40) return 'Good Match';
  if (score >= 20) return 'Fair Match';
  return 'Low Compatibility';
}
