import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import db from '../db.js';
import logger from '../services/logger.js';

const router = express.Router();

const VALID_ADVENTURE_LEVELS = ['low', 'medium', 'high'];
const VALID_BUDGET_LEVELS = ['budget', 'moderate', 'luxury'];
const VALID_PACE_LEVELS = ['slow', 'moderate', 'fast'];
const VALID_INTERESTS = ['hiking', 'adventure', 'museums', 'local food', 'wellness', 'beaches', 'nightlife', 'nature', 'history', 'sports'];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route GET /api/quiz/displayQuestions
 * @desc Get dynamic quiz questions for frontend display
 */
router.get('/displayQuestions', (req, res) => {
  try {
    const questions = [
      {
        id: 'adventureLevel',
        question: 'What\'s your ideal adventure level?',
        description: 'We use this to calibrate the activity intensity in your itineraries.',
        type: 'select',
        options: [
          { value: 'low', label: 'Chill & Relaxed', icon: 'Coffee' },
          { value: 'medium', label: 'Balanced Mix', icon: 'Compass' },
          { value: 'high', label: 'Action-Packed', icon: 'Zap' },
        ],
      },
      {
        id: 'culturalInterest',
        question: 'How important is culture & history?',
        description: 'Museums, historical sites, local traditions.',
        type: 'select',
        options: [
          { value: 'low', label: 'Not a priority', icon: 'Coffee' },
          { value: 'medium', label: 'Some interest', icon: 'Compass' },
          { value: 'high', label: 'Very important', icon: 'Camera' },
        ],
      },
      {
        id: 'relaxationPreference',
        question: 'How do you like to unwind?',
        description: 'Beach lounging, spa days, nature walks.',
        type: 'select',
        options: [
          { value: 'low', label: 'I don\'t need much downtime', icon: 'Zap' },
          { value: 'medium', label: 'A few hours of chill daily', icon: 'Compass' },
          { value: 'high', label: 'Full rest days', icon: 'Heart' },
        ],
      },
      {
        id: 'budgetLevel',
        question: 'What\'s your daily budget range?',
        description: 'This helps us suggest appropriate accommodations and activities.',
        type: 'select',
        options: [
          { value: 'budget', label: 'Budget (£30-50/day)', icon: 'Coffee' },
          { value: 'moderate', label: 'Moderate (£50-150/day)', icon: 'Compass' },
          { value: 'luxury', label: 'Luxury (£150+/day)', icon: 'Map' },
        ],
      },
      {
        id: 'pace',
        question: 'What pace do you prefer?',
        description: 'How many activities per day feel right?',
        type: 'select',
        options: [
          { value: 'slow', label: 'Slow (1-2 activities)', icon: 'Coffee' },
          { value: 'moderate', label: 'Moderate (3-4 activities)', icon: 'Compass' },
          { value: 'fast', label: 'Fast (5+ activities)', icon: 'Zap' },
        ],
      },
      {
        id: 'interests',
        question: 'What are you most excited about?',
        description: 'Select all that apply. We\'ll prioritize these in your itinerary.',
        type: 'multi-select',
        options: VALID_INTERESTS.map(i => ({ value: i, label: i.charAt(0).toUpperCase() + i.slice(1) })),
      },
    ];
    res.json({ success: true, data: questions });
  } catch (error) {
    logger.error(`[Quiz] Failed to display questions: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

/**
 * @route GET /api/quiz/profile
 * @desc Get user's existing Travel DNA
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const response = await db.prepare('SELECT * FROM quiz_responses WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(req.userId);
    const profile = await db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId);

    if (!response) {
      return res.json({ hasQuiz: false });
    }

    const isComplete = !!response.result;
    let answers = {};
    let result = null;

    try {
      answers = JSON.parse(response.answers || '{}');
      result = isComplete ? JSON.parse(response.result) : null;
    } catch (parseError) {
      logger.warn(`[Quiz] Parse error: ${parseError.message}`);
      answers = {};
      result = null;
    }

    res.json({
      hasQuiz: true,
      isComplete,
      profile: {
        answers,
        currentStep: answers.currentStep || 0,
        dominantStyle: result?.dominantStyle || profile?.travel_style,
        scores: result?.scores || {}
      },
      preferences: {
        pace: profile?.pace || 'moderate',
        budget_level: profile?.budget_level || 'moderate',
        accommodation_type: profile?.accommodation_type || 'hotel',
        preferred_climate: profile?.preferred_climate || 'temperate'
      }
    });

  } catch (error) {
     logger.error(`[Quiz] Failed to fetch profile: ${error.message}`);
     res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * @route POST /api/quiz/save-progress
 * @desc Save partial quiz answers (Auto-save)
 */
router.post('/save-progress', requireAuth, [
  body('answers').optional().isObject().withMessage('Answers must be an object'),
  body('currentStep').optional().isInt({ min: 0, max: 10 }).withMessage('Current step must be between 0 and 10')
], handleValidationErrors, async (req, res) => {
  try {
    const { answers, currentStep } = req.body;
    
    if (answers === undefined && currentStep === undefined) {
      return res.status(400).json({ error: 'Either answers or currentStep must be provided' });
    }

    const latest = await db.prepare('SELECT id FROM quiz_responses WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(req.userId);
    
    const enrichedAnswers = { ...(answers || {}), currentStep: currentStep ?? answers?.currentStep ?? 0 };

    if (latest) {
      await db.prepare('UPDATE quiz_responses SET answers = ? WHERE id = ?').run(JSON.stringify(enrichedAnswers), latest.id);
    } else {
      await db.prepare('INSERT INTO quiz_responses (user_id, answers) VALUES (?, ?)').run(req.userId, JSON.stringify(enrichedAnswers));
    }

    res.json({ success: true });
  } catch (error) {
     logger.error(`[Quiz] Auto-save failed: ${error.message}`);
     res.status(500).json({ error: 'Failed to auto-save' });
  }
});

/**
 * @route POST /api/quiz/submit
 * @desc Finalize Travel DNA
 */
router.post('/submit', requireAuth, [
  body('answers').isObject().withMessage('Answers must be an object'),
  body('answers.adventureLevel').optional().isIn(VALID_ADVENTURE_LEVELS).withMessage('Invalid adventure level'),
  body('answers.culturalInterest').optional().isIn(VALID_ADVENTURE_LEVELS).withMessage('Invalid cultural interest'),
  body('answers.relaxationPreference').optional().isIn(VALID_ADVENTURE_LEVELS).withMessage('Invalid relaxation preference'),
  body('answers.budgetLevel').optional().isIn(VALID_BUDGET_LEVELS).withMessage('Invalid budget level'),
  body('answers.pace').optional().isIn(VALID_PACE_LEVELS).withMessage('Invalid pace level'),
  body('answers.interests').optional().isArray().withMessage('Interests must be an array'),
  body('answers.interests.*').optional().isIn(VALID_INTERESTS).withMessage('Invalid interest value')
], handleValidationErrors, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid answers object' });
    }

    const styles = {
        adventurer: 0,
        culture: 0,
        relaxation: 0,
        budget: 0,
        luxury: 0
    };

    if (answers.adventureLevel === 'high') styles.adventurer += 5;
    if (answers.culturalInterest === 'high') styles.culture += 5;
    if (answers.relaxationPreference === 'high') styles.relaxation += 5;
    if (answers.budgetLevel === 'budget') styles.budget += 5;
    if (answers.budgetLevel === 'luxury') styles.luxury += 5;
    
    const validInterests = Array.isArray(answers.interests) 
      ? answers.interests.filter(i => VALID_INTERESTS.includes(i))
      : [];
    
    validInterests.forEach(interest => {
        if (['hiking', 'adventure'].includes(interest)) styles.adventurer += 2;
        if (['museums', 'local food'].includes(interest)) styles.culture += 2;
        if (['wellness', 'beaches'].includes(interest)) styles.relaxation += 2;
    });

    const dominantStyle = Object.keys(styles).reduce((a, b) => styles[a] > styles[b] ? a : b);

    const result = {
        dominantStyle: dominantStyle.charAt(0).toUpperCase() + dominantStyle.slice(1),
        scores: styles
    };

    const latest = await db.prepare('SELECT id FROM quiz_responses WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(req.userId);
    
    if (latest) {
      await db.prepare('UPDATE quiz_responses SET answers = ?, result = ? WHERE id = ?')
        .run(JSON.stringify(answers), JSON.stringify(result), latest.id);
    } else {
      await db.prepare('INSERT INTO quiz_responses (user_id, answers, result) VALUES (?, ?, ?)')
        .run(req.userId, JSON.stringify(answers), JSON.stringify(result));
    }

    await db.prepare(`
        UPDATE profiles SET 
            travel_style = ?, 
            budget_level = ?, 
            pace = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
    `).run(
        result.dominantStyle, 
        answers.budgetLevel || 'moderate', 
        answers.pace || 'moderate', 
        req.userId
    );

    res.json({
        success: true,
        profile: result,
        preferences: {
            pace: answers.pace || 'moderate',
            budget_level: answers.budgetLevel || 'moderate',
            accommodation_type: 'hotel',
            preferred_climate: 'temperate'
        }
    });

  } catch (error) {
     logger.error(`[Quiz] Submit failed: ${error.message}`);
     res.status(500).json({ error: 'Failed to process quiz' });
  }
});

export default router;