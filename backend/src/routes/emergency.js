import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import logger from '../services/logger.js';

const router = express.Router();

const EMERGENCY_PHRASES = {
  english: {
    help: "Help! I need help!",
    police: "I need the police",
    ambulance: "I need an ambulance",
    hospital: "I need to go to a hospital",
    lost: "I am lost",
    danger: "I am in danger",
    thief: "I have been robbed",
    emergency: "EMERGENCY - Please help!"
  },
  spanish: {
    help: "¡Ayuda! ¡Necesito ayuda!",
    police: "Necesito a la policía",
    ambulance: "Necesito una ambulancia",
    hospital: "Necesito ir al hospital",
    lost: "Estoy perdido/a",
    danger: "Estoy en peligro",
    thief: "Me han robado",
    emergency: "EMERGENCIA - ¡Por favor ayúdenme!"
  },
  french: {
    help: "Au secours! J'ai besoin d'aide!",
    police: "J'ai besoin de la police",
    ambulance: "J'ai besoin d'une ambulance",
    hospital: "Je dois aller à l'hôpital",
    lost: "Je suis perdu/perdue",
    danger: "Je suis en danger",
    thief: "On m'a volé",
    emergency: "URGENCE - Aidez-moi s'il vous plaît!"
  },
  german: {
    help: "Hilfe! Ich brauche Hilfe!",
    police: "Ich brauche die Polizei",
    ambulance: "Ich brauche einen Krankenwagen",
    hospital: "Ich muss ins Krankenhaus",
    lost: "Ich habe mich verlaufen",
    danger: "Ich bin in Gefahr",
    thief: "Ich wurde bestohlen",
    emergency: "NOTFALL - Bitte helfen Sie mir!"
  },
  italian: {
    help: "Aiuto! Ho bisogno di aiuto!",
    police: "Ho bisogno della polizia",
    ambulance: "Ho bisogno di un'ambulanza",
    hospital: "Devo andare in ospedale",
    lost: "Mi sono perso/a",
    danger: "Sono in pericolo",
    thief: "Sono stato/a derubato/a",
    emergency: "EMERGENZA - Per favore aiutatemi!"
  },
  japanese: {
    help: "助けて！助けが必要です！",
    police: "警察が必要です",
    ambulance: "救急車が必要です",
    hospital: "病院に行きたいです",
    lost: "道に迷いました",
    danger: "危険です",
    thief: "泥棒に入られました",
    emergency: "緊急 - 助けてください！"
  },
  chinese: {
    help: "救命！我需要帮助！",
    police: "我需要警察",
    ambulance: "我需要救护车",
    hospital: "我需要去医院",
    lost: "我迷路了",
    danger: "我有危险",
    thief: "我被抢劫了",
    emergency: "紧急情况 - 请帮助我！"
  },
  arabic: {
    help: "مساعدة! أحتاج مساعدة!",
    police: "أحتاج الشرطة",
    ambulance: "أحتاج سيارة إسعاف",
    hospital: "أحتاج للذهاب إلى المستشفى",
    lost: "تاهت",
    danger: "أنا في خطر",
    thief: "سرقوا ممتلكاتي",
    emergency: "طوارئ - أرجو المساعدة!"
  }
};

const LANGUAGE_NAMES = {
  english: 'English',
  spanish: 'Spanish',
  french: 'French',
  german: 'German',
  italian: 'Italian',
  japanese: 'Japanese',
  chinese: 'Chinese (Mandarin)',
  arabic: 'Arabic'
};

// GET /emergency/phrases - Get emergency phrases (public)
router.get('/phrases', async (req, res) => {
  try {
    const { language } = req.query;
    
    if (language && EMERGENCY_PHRASES[language]) {
      return res.json({
        success: true,
        data: {
          language: language,
          languageName: LANGUAGE_NAMES[language],
          phrases: EMERGENCY_PHRASES[language]
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        languages: Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({ code, name }))
      }
    });
  } catch (error) {
    logger.error(`[Emergency] Failed to get phrases: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get emergency phrases' }
    });
  }
});

export default router;