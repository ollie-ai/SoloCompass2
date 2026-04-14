import db from '../db.js';
import logger from './logger.js';

const MATCHING_WEIGHTS = {
  destination_match: 0.30,
  date_overlap: 0.25,
  personality_compatibility: 0.20,
  shared_interests: 0.15,
  budget_match: 0.10,
};

const PERSONALITY_MATRIX = {
  adventurous: { adventurous: 100, moderate: 70, chill: 40 },
  moderate: { adventurous: 70, moderate: 100, chill: 70 },
  chill: { adventurous: 40, moderate: 70, chill: 100 },
};

const SOCIAL_COMPATIBILITY = {
  solo: { solo: 100, mix: 70, social: 50 },
  mix: { solo: 70, mix: 100, social: 70 },
  social: { solo: 50, mix: 70, social: 100 },
};

const PACE_COMPATIBILITY = {
  relaxed: { relaxed: 100, balanced: 70, packed: 40 },
  balanced: { relaxed: 70, balanced: 100, packed: 70 },
  packed: { relaxed: 40, balanced: 70, packed: 100 },
};

const STYLE_COMPATIBILITY = {
  cultural: { cultural: 100, active: 60, mixed: 80, relaxed: 70 },
  active: { cultural: 60, active: 100, mixed: 80, relaxed: 50 },
  mixed: { cultural: 80, active: 80, mixed: 100, relaxed: 70 },
  relaxed: { cultural: 70, active: 50, mixed: 70, relaxed: 100 },
};

function calculateJaccardSimilarity(set1, set2) {
  if (!set1 || !set2 || set1.length === 0 || set2.length === 0) return 0;
  const arr1 = Array.isArray(set1) ? set1 : JSON.parse(set1);
  const arr2 = Array.isArray(set2) ? set2 : JSON.parse(set2);
  const intersection = arr1.filter(x => arr2.includes(x));
  const union = [...new Set([...arr1, ...arr2])];
  return intersection.length / union.length;
}

function normalizeDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  return { start, end, days };
}

function calculateDateOverlapPercent(dateRange1, dateRange2) {
  if (!dateRange1?.start || !dateRange2?.start) return 0;
  try {
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
    return Math.min(100, Math.round((overlapDays / shorterTrip) * 100));
  } catch (e) {
    return 0;
  }
}

function getDestinationScore(trip1, trip2) {
  if (!trip1?.destination || !trip2?.destination) return 0;
  const d1 = trip1.destination.toLowerCase().trim();
  const d2 = trip2.destination.toLowerCase().trim();
  if (d1 === d2) return 100;
  const words1 = d1.split(/[\s,]+/).filter(Boolean);
  const words2 = d2.split(/[\s,]+/).filter(Boolean);
  const matches = words1.filter(w => words2.some(w2 => w2.includes(w) || w.includes(w2)));
  if (matches.length > 0) return 80;
  const regionMap = {
    'europe': ['uk', 'france', 'spain', 'italy', 'germany', 'portugal', 'greece', 'netherlands'],
    'asia': ['japan', 'thailand', 'vietnam', 'china', 'korea', 'india', 'bali', 'singapore'],
    'americas': ['usa', 'canada', 'mexico', 'brazil', 'argentina', 'peru', 'colombia'],
    'oceania': ['australia', 'new zealand', 'fiji', 'bora bora'],
    'africa': ['morocco', 'egypt', 'south africa', 'kenya', 'tanzania', 'tunisia'],
  };
  for (const [region, countries] of Object.entries(regionMap)) {
    const inRegion = countries.some(c => d1.includes(c) || d2.includes(c));
    if (inRegion && (d1.includes(region) || d2.includes(region) || countries.some(c => d1.includes(c) && d2.includes(c)))) {
      return 60;
    }
  }
  return 20;
}

async function calculateDestinationScore(user1Trips, user2Trips) {
  if (!user1Trips?.length || !user2Trips?.length) return 0;
  let totalScore = 0;
  let comparisons = 0;
  for (const t1 of user1Trips) {
    for (const t2 of user2Trips) {
      const score = getDestinationScore(t1, t2);
      totalScore += score;
      comparisons++;
    }
  }
  return comparisons > 0 ? Math.round(totalScore / comparisons) : 0;
}

async function calculateDateOverlap(user1Trips, user2Trips) {
  if (!user1Trips?.length || !user2Trips?.length) return 0;
  let totalScore = 0;
  let comparisons = 0;
  for (const t1 of user1Trips) {
    for (const t2 of user2Trips) {
      const score = calculateDateOverlapPercent(
        { start: t1.start_date, end: t1.end_date },
        { start: t2.start_date, end: t2.end_date }
      );
      totalScore += score;
      comparisons++;
    }
  }
  return comparisons > 0 ? Math.round(totalScore / comparisons) : 0;
}

function calculatePersonalityScore(user1Profile, user2Profile) {
  if (!user1Profile || !user2Profile) return 50;
  const adventureScore = PERSONALITY_MATRIX[user1Profile.adventure_level]?.[user2Profile.adventure_level] ?? 50;
  const socialScore = SOCIAL_COMPATIBILITY[user1Profile.social_preference]?.[user2Profile.social_preference] ?? 50;
  const paceScore = PACE_COMPATIBILITY[user1Profile.pace_preference]?.[user2Profile.pace_preference] ?? 50;
  const styleScore = STYLE_COMPATIBILITY[user1Profile.trip_style]?.[user2Profile.trip_style] ?? 50;
  return Math.round((adventureScore + socialScore + paceScore + styleScore) / 4);
}

async function calculateInterestScore(user1Interests, user2Interests) {
  const score = calculateJaccardSimilarity(user1Interests, user2Interests);
  return Math.round(score * 100);
}

async function calculateBudgetScore(user1Budget, user2Budget) {
  if (!user1Budget || !user2Budget) return 50;
  if (user1Budget === user2Budget) return 100;
  const levels = ['budget', 'moderate', 'luxury'];
  const idx1 = levels.indexOf(user1Budget);
  const idx2 = levels.indexOf(user2Budget);
  if (idx1 === -1 || idx2 === -1) return 50;
  const diff = Math.abs(idx1 - idx2);
  return diff === 1 ? 70 : 40;
}

async function getUserTrips(userId) {
  const today = new Date().toISOString().split('T')[0];
  return db.prepare(`
    SELECT id, user_id, name, destination, start_date, end_date, status
    FROM trips WHERE user_id = ? AND start_date >= ?
  `).all(userId, today);
}

async function getUserProfile(userId) {
  return db.prepare(`
    SELECT id, user_id, travel_style, budget_level, interests
    FROM profiles WHERE user_id = ?
  `).get(userId);
}

async function getUserById(userId) {
  return db.prepare(`
    SELECT id, name, email, role FROM users WHERE id = ?
  `).get(userId);
}

async function getBlockedUserIds(userId) {
  const blocks = await db.prepare(`
    SELECT blocked_id FROM buddy_blocks WHERE blocker_id = ?
  `).all(userId);
  return blocks.map(b => b.blocked_id);
}

async function getConnectedUserIds(userId) {
  const connections = await db.prepare(`
    SELECT sender_id, receiver_id FROM buddy_requests
    WHERE status = 'accepted' AND (sender_id = ? OR receiver_id = ?)
  `).all(userId, userId);
  const ids = new Set();
  connections.forEach(c => {
    ids.add(c.sender_id);
    ids.add(c.receiver_id);
  });
  ids.delete(userId);
  return Array.from(ids);
}

async function getOverallCompatibilityScore(user1, user2) {
  try {
    const [trips1, trips2, profile1, profile2] = await Promise.all([
      getUserTrips(user1.id),
      getUserTrips(user2.id),
      getUserProfile(user1.id),
      getUserProfile(user2.id),
    ]);

    const [destScore, dateScore, interestScore, budgetScore] = await Promise.all([
      calculateDestinationScore(trips1, trips2),
      calculateDateOverlap(trips1, trips2),
      profile1?.interests && profile2?.interests
        ? calculateInterestScore(profile1.interests, profile2.interests)
        : 50,
      profile1?.budget_level && profile2?.budget_level
        ? calculateBudgetScore(profile1.budget_level, profile2.budget_level)
        : 50,
    ]);

    const personalityScore = calculatePersonalityScore(profile1, profile2);
    const totalScore = Math.round(
      destScore * MATCHING_WEIGHTS.destination_match +
      dateScore * MATCHING_WEIGHTS.date_overlap +
      personalityScore * MATCHING_WEIGHTS.personality_compatibility +
      interestScore * MATCHING_WEIGHTS.shared_interests +
      budgetScore * MATCHING_WEIGHTS.budget_match
    );

    return {
      overall: totalScore,
      breakdown: {
        destination: destScore,
        date_overlap: dateScore,
        personality: personalityScore,
        interests: interestScore,
        budget: budgetScore,
      },
    };
  } catch (error) {
    logger.error(`[Matching Service] Error calculating compatibility score: ${error.message}`);
    return { overall: 0, breakdown: {} };
  }
}

async function findTopMatches(userId, limit = 20) {
  try {
    const currentUser = await getUserById(userId);
    if (!currentUser) return [];

    const blockedIds = await getBlockedUserIds(userId);
    const connectedIds = await getConnectedUserIds(userId);

    const userTrips = await getUserTrips(userId);
    if (!userTrips.length) return [];

    const today = new Date().toISOString().split('T')[0];
    const excludeIds = [userId, ...blockedIds, ...connectedIds];
    const placeholders = excludeIds.map(() => '?').join(',');

    const potentialMatches = await db.prepare(`
      SELECT user_id, destination, start_date, end_date
      FROM trips
      WHERE start_date >= ? AND user_id NOT IN (${placeholders})
      GROUP BY user_id
      LIMIT ?
    `).all(today, ...excludeIds, limit * 3);

    const matches = [];
    for (const match of potentialMatches) {
      const matchUser = await getUserById(match.user_id);
      if (!matchUser) continue;

      const [profile, trips] = await Promise.all([
        getUserProfile(match.user_id),
        getUserTrips(match.user_id),
      ]);

      const scores = await getOverallCompatibilityScore(currentUser, matchUser);
      const matchReasons = [];
      if (scores.breakdown.destination >= 80) matchReasons.push('Same destination');
      else if (scores.breakdown.destination >= 60) matchReasons.push('Similar region');
      if (scores.breakdown.interests >= 50) matchReasons.push('Shared interests');
      if (scores.breakdown.personality >= 70) matchReasons.push('Compatible travel style');
      if (scores.breakdown.date_overlap >= 50) matchReasons.push('Overlapping dates');

      matches.push({
        userId: matchUser.id,
        name: matchUser.name,
        avatar: null,
        profile: profile || null,
        upcomingTrips: trips,
        compatibilityScore: scores.overall,
        matchReasons,
      });
    }

    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return matches.slice(0, limit);
  } catch (error) {
    logger.error(`[Matching Service] Error finding top matches: ${error.message}`);
    return [];
  }
}

async function getMatchDetails(userId, targetUserId) {
  try {
    const [user1, user2] = await Promise.all([
      getUserById(userId),
      getUserById(targetUserId),
    ]);
    if (!user1 || !user2) return null;

    const [trips1, trips2, profile1, profile2] = await Promise.all([
      getUserTrips(userId),
      getUserTrips(targetUserId),
      getUserProfile(userId),
      getUserProfile(targetUserId),
    ]);

    const scores = await getOverallCompatibilityScore(user1, user2);

    return {
      user: { id: user2.id, name: user2.name, avatar: null },
      profile: profile2,
      trips: trips2,
      compatibility: scores,
    };
  } catch (error) {
    logger.error(`[Matching Service] Error getting match details: ${error.message}`);
    return null;
  }
}

export {
  MATCHING_WEIGHTS,
  calculateDestinationScore,
  calculateDateOverlap,
  calculatePersonalityScore,
  calculateInterestScore,
  calculateBudgetScore,
  getOverallCompatibilityScore,
  findTopMatches,
  getMatchDetails,
  calculateJaccardSimilarity,
  calculateDateOverlapPercent,
};
