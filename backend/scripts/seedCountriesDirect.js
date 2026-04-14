import db from '../src/db.js';

const countriesData = [
  { code: 'JP', name: 'Japan', region: 'Asia', subregion: 'Eastern Asia', flag_emoji: '🇯🇵', currency: 'JPY', currency_symbol: '¥', language: 'Japanese', timezone: 'Asia/Tokyo', calling_code: '+81' },
  { code: 'TH', name: 'Thailand', region: 'Asia', subregion: 'South-Eastern Asia', flag_emoji: '🇹🇭', currency: 'THB', currency_symbol: '฿', language: 'Thai', timezone: 'Asia/Bangkok', calling_code: '+66' },
  { code: 'ES', name: 'Spain', region: 'Europe', subregion: 'Southern Europe', flag_emoji: '🇪🇸', currency: 'EUR', currency_symbol: '€', language: 'Spanish', timezone: 'Europe/Madrid', calling_code: '+34' },
  { code: 'IT', name: 'Italy', region: 'Europe', subregion: 'Southern Europe', flag_emoji: '🇮🇹', currency: 'EUR', currency_symbol: '€', language: 'Italian', timezone: 'Europe/Rome', calling_code: '+39' },
  { code: 'FR', name: 'France', region: 'Europe', subregion: 'Western Europe', flag_emoji: '🇫🇷', currency: 'EUR', currency_symbol: '€', language: 'French', timezone: 'Europe/Paris', calling_code: '+33' },
  { code: 'DE', name: 'Germany', region: 'Europe', subregion: 'Western Europe', flag_emoji: '🇩🇪', currency: 'EUR', currency_symbol: '€', language: 'German', timezone: 'Europe/Berlin', calling_code: '+49' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', subregion: 'Northern Europe', flag_emoji: '🇬🇧', currency: 'GBP', currency_symbol: '£', language: 'English', timezone: 'Europe/London', calling_code: '+44' },
  { code: 'US', name: 'United States', region: 'Americas', subregion: 'Northern America', flag_emoji: '🇺🇸', currency: 'USD', currency_symbol: '$', language: 'English', timezone: 'America/New_York', calling_code: '+1' },
  { code: 'AU', name: 'Australia', region: 'Oceania', subregion: 'Australia and New Zealand', flag_emoji: '🇦🇺', currency: 'AUD', currency_symbol: '$', language: 'English', timezone: 'Australia/Sydney', calling_code: '+61' },
  { code: 'CA', name: 'Canada', region: 'Americas', subregion: 'Northern America', flag_emoji: '🇨🇦', currency: 'CAD', currency_symbol: '$', language: 'English', timezone: 'America/Toronto', calling_code: '+1' }
];

async function seed() {
  for (const c of countriesData) {
    await db.query(`
      INSERT INTO countries (code, name, region, subregion, flag_emoji, currency, currency_symbol, language, timezone, calling_code, research_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING
    `, [c.code, c.name, c.region, c.subregion, c.flag_emoji, c.currency, c.currency_symbol, c.language, c.timezone, c.calling_code]);
  }
  console.log('Seeded countries');
}

seed();