import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import db from '../db.js';
import logger from '../services/logger.js';

const router = express.Router();

// Get user preferences
router.get('/', requireAuth, async (req, res) => {
  try {
    const preferences = await db.prepare(`
      SELECT travel_style, budget_level, pace, accommodation_type, 
             interests, preferred_climate, trip_duration, 
             solo_travel_experience, safety_priority
      FROM profiles 
      WHERE user_id = ?
    `).get(req.userId);

    if (!preferences) {
      // Return empty preferences object if none exist
      return res.json({ 
        travel_style: null,
        budget_level: null,
        pace: null,
        accommodation_type: null,
        interests: null,
        preferred_climate: null,
        trip_duration: null,
        solo_travel_experience: null,
        safety_priority: null
      });
    }

    // Parse interests from JSON string if it exists
    if (preferences.interests) {
      try {
        preferences.interests = JSON.parse(preferences.interests);
      } catch (e) {
        preferences.interests = null;
      }
    }

    res.json(preferences);
    } catch (error) {
      logger.error('Get preferences error:', error);
      res.status(500).json({ error: 'Failed to get preferences' });
    }
});

// Update user preferences
router.put('/', requireAuth, async (req, res) => {
  try {
    const {
      travel_style,
      budget_level,
      pace,
      accommodation_type,
      interests,
      preferred_climate,
      trip_duration,
      solo_travel_experience,
      safety_priority
    } = req.body;

    // Convert interests array to JSON string for storage
    const interestsJson = interests !== undefined && interests !== null 
      ? JSON.stringify(interests) 
      : null;

    // Check if profile exists
    const existingProfile = await db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(req.userId);

    if (existingProfile) {
      // Update existing profile
      await db.prepare(`
        UPDATE profiles SET 
          travel_style = ?,
          budget_level = ?,
          pace = ?,
          accommodation_type = ?,
          interests = ?,
          preferred_climate = ?,
          trip_duration = ?,
          solo_travel_experience = ?,
          safety_priority = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        travel_style,
        budget_level,
        pace,
        accommodation_type,
        interestsJson,
        preferred_climate,
        trip_duration,
        solo_travel_experience,
        safety_priority,
        req.userId
      );
    } else {
      // Create new profile
      await db.prepare(`
        INSERT INTO profiles (
          user_id, travel_style, budget_level, pace, accommodation_type, 
          interests, preferred_climate, trip_duration, 
          solo_travel_experience, safety_priority
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.userId,
        travel_style,
        budget_level,
        pace,
        accommodation_type,
        interestsJson,
        preferred_climate,
        trip_duration,
        solo_travel_experience,
        safety_priority
      );
    }

    res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
      logger.error('Update preferences error:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
});

export default router;