import { getStreetLevelCrime, getNeighborhoodsForLocation, clearCrimeCache } from './crimeService.js';

const CRIME_WEIGHTS = {
  violence: 0.4,
  sexual: 0.35,
  robbery: 0.3,
  burglary: 0.15,
  theft: 0.1,
  vehicle: 0.15,
  antiSocial: 0.05,
  other: 0.05
};

const TIME_OF_DAY_RISK = {
  earlyMorning: 1.5,
  morning: 0.8,
  afternoon: 0.6,
  evening: 0.9,
  night: 1.4,
  lateNight: 1.8
};

export function getCrimeTypeWeight(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('violence') || cat.includes('death') || cat.includes('assault')) return CRIME_WEIGHTS.violence;
  if (cat.includes('sexual') || cat.includes('rape')) return CRIME_WEIGHTS.sexual;
  if (cat.includes('robbery')) return CRIME_WEIGHTS.robbery;
  if (cat.includes('burglary')) return CRIME_WEIGHTS.burglary;
  if (cat.includes('theft') || cat.includes('shoplifting')) return CRIME_WEIGHTS.theft;
  if (cat.includes('vehicle')) return CRIME_WEIGHTS.vehicle;
  if (cat.includes('anti-social') || cat.includes('asbo')) return CRIME_WEIGHTS.antiSocial;
  return CRIME_WEIGHTS.other;
}

export function getTimeOfDayRisk(hour) {
  if (hour >= 0 && hour < 5) return TIME_OF_DAY_RISK.lateNight;
  if (hour >= 5 && hour < 8) return TIME_OF_DAY_RISK.earlyMorning;
  if (hour >= 8 && hour < 12) return TIME_OF_DAY_RISK.morning;
  if (hour >= 12 && hour < 17) return TIME_OF_DAY_RISK.afternoon;
  if (hour >= 17 && hour < 21) return TIME_OF_DAY_RISK.evening;
  return TIME_OF_DAY_RISK.night;
}

export function calculateCrimeScore(crimes, hour = new Date().getHours()) {
  if (!crimes || crimes.length === 0) {
    return { score: 85, riskLevel: 'low', factors: { crimeDensity: 0, timeRisk: 1 } };
  }

  const timeRisk = getTimeOfDayRisk(hour);
  const crimeCount = crimes.length;
  const crimeDensity = Math.min(crimeCount / 50, 1);

  let weightedCrimeScore = 0;
  crimes.forEach(crime => {
    const category = crime.category || '';
    const weight = getCrimeTypeWeight(category);
    weightedCrimeScore += weight;
  });

  const avgCrimeWeight = weightedCrimeScore / crimes.length;
  const baseScore = 100 - (crimeDensity * 50 + avgCrimeWeight * 30);
  const timeAdjusted = baseScore / timeRisk;
  const finalScore = Math.max(0, Math.min(100, Math.round(timeAdjusted)));

  let riskLevel = 'low';
  if (finalScore < 40) riskLevel = 'high';
  else if (finalScore < 60) riskLevel = 'medium';
  else if (finalScore < 75) riskLevel = 'moderate';

  return {
    score: finalScore,
    riskLevel,
    factors: {
      crimeDensity: Math.round(crimeDensity * 100),
      timeRisk: Math.round(timeRisk * 100),
      avgCrimeWeight: Math.round(avgCrimeWeight * 100)
    },
    crimeCount,
    crimeBreakdown: getCrimeBreakdown(crimes)
  };
}

function getCrimeBreakdown(crimes) {
  const breakdown = {};
  crimes.forEach(crime => {
    const category = crime.category || 'other';
    breakdown[category] = (breakdown[category] || 0) + 1;
  });
  return breakdown;
}

export async function getAreaSafetyScore(lat, lng, hour = new Date().getHours()) {
  const crimes = await getStreetLevelCrime(lat, lng, 1000);
  return calculateCrimeScore(crimes, hour);
}

export function calculateSegmentSafetyScore(segmentCrimes, lighting, venues, hour) {
  const crimeScore = segmentCrimes ? calculateCrimeScore(segmentCrimes, hour) : { score: 70 };
  
  let lightingScore = 50;
  if (lighting === 'good') lightingScore = 100;
  else if (lighting === 'moderate') lightingScore = 70;
  else if (lighting === 'poor') lightingScore = 30;

  let venueScore = Math.min(venues * 5, 30);

  const segmentScore = (crimeScore.score * 0.5) + (lightingScore * 0.35) + (venueScore * 0.15);
  return Math.round(segmentScore);
}

export function calculateRouteSafetyScore(route, options = {}) {
  const { timeOfDay = new Date().getHours(), lightingQuality = 'moderate' } = options;
  
  if (!route || !route.legs || route.legs.length === 0) {
    return { overallScore: 70, segments: [], route: null };
  }

  const segments = [];
  let totalScore = 0;
  let segmentCount = 0;

  route.legs.forEach(leg => {
    if (!leg.steps) return;
    
    leg.steps.forEach(step => {
      const endLocation = step.end_location;
      const stepCrimes = null;
      
      const safetyScore = calculateSegmentSafetyScore(
        stepCrimes,
        lightingQuality,
        Math.floor(Math.random() * 3) + 1,
        timeOfDay
      );
      
      segments.push({
        instruction: step.html_instructions?.replace(/<[^>]*>/g, ''),
        distance: step.distance?.text,
        duration: step.duration?.text,
        safetyScore,
        start: step.start_location,
        end: step.end_location
      });
      
      totalScore += safetyScore;
      segmentCount++;
    });
  });

  const overallScore = segmentCount > 0 ? Math.round(totalScore / segmentCount) : 70;

  return {
    overallScore,
    segments,
    route,
    recommendations: generateSafetyRecommendations(overallScore, segments)
  };
}

function generateSafetyRecommendations(score, segments) {
  const recommendations = [];
  
  if (score < 50) {
    recommendations.push('Consider using a different route or transportation');
    recommendations.push('Stay in well-lit, populated areas');
  } else if (score < 70) {
    recommendations.push('Avoid walking alone at night in low-safety segments');
  }
  
  const lowSafetySegments = segments.filter(s => s.safetyScore < 50);
  if (lowSafetySegments.length > 0) {
    recommendations.push(`${lowSafetySegments.length} segment(s) have low safety scores`);
  }
  
  return recommendations;
}

export function clearSafetyCache() {
  if (clearCrimeCache) {
    clearCrimeCache();
  }
}