import { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  Globe, 
  AlertTriangle, 
  Navigation, 
  Mic, 
  Languages,
  Volume2,
  CheckCircle2,
  Smartphone,
  Zap,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Button from './Button';
import api from '../lib/api';

export const SafeReturnTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      triggerEmergency();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const triggerEmergency = async () => {
    try {
      setIsActive(false);
      // Get current location if possible
      const pos = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(resolve, () => resolve(null));
      });
      
      await api.post('/safety/emergency-alert', {
        lat: pos?.coords?.latitude || null,
        lng: pos?.coords?.longitude || null,
        message: 'Safe-Return timer expired. User did not check in.',
        type: 'missed_checkin'
      });
      toast.error('SOS Protocol Triggered! Emergency contacts notified.');
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (mins) => {
    setTimeLeft(mins * 60);
    setIsActive(true);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  return (
    <div className="glass-card p-6 rounded-xl border-t-4 border-brand-vibrant shadow-lg relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-black text-base-content flex items-center gap-2">
          <Clock className="text-brand-vibrant" size={20} /> Safe-Return
        </h4>
        <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${isActive ? 'bg-error/100 text-white animate-pulse' : 'bg-base-200 text-base-content/40'}`}>
          {isActive ? 'Active Monitoring' : 'Inactive'}
        </div>
      </div>

      {isActive ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <div className="text-4xl font-black text-base-content mb-2 font-mono">
            {formatTime(timeLeft)}
          </div>
          <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest text-center">
            Auto-SOS if not checked in
          </p>
          <Button 
            onClick={() => setIsActive(false)}
            variant="outline" 
            className="mt-6 w-full rounded-xl border-base-content/10 text-base-content/60 font-bold hover:bg-base-200"
          >
            I'm Safe - Cancel
          </Button>
        </div>
      ) : (
        <div className="flex-1 space-y-3">
          <p className="text-xs text-base-content/60 font-bold mb-4">Set a timer for your walk. If you don't check in, your emergency contacts are notified automatically.</p>
          <div className="grid grid-cols-2 gap-2">
            {[15, 30, 45, 60].map((mins) => (
              <button 
                key={mins}
                onClick={() => startTimer(mins)}
                className="py-2.5 rounded-xl bg-base-200 border border-base-content/10 text-base-content font-bold text-sm hover:border-brand-vibrant transition-all"
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="absolute inset-0 bg-brand-vibrant flex items-center justify-center p-6 text-center animate-fade-in z-20">
          <div className="text-white">
            <CheckCircle2 size={48} className="mx-auto mb-2" />
            <p className="font-black">Timer Set!</p>
            <p className="text-xs opacity-80">We'll alert your contacts if you don't arrive.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const QuickTranslator = () => {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [phrases, setPhrases] = useState([]);
  const [phrasesLoading, setPhrasesLoading] = useState(true);
  const [currentTrip, setCurrentTrip] = useState(null);

  useEffect(() => {
    const fetchPhrases = async () => {
      try {
        setPhrasesLoading(true);
        const response = await api.get('/trips');
        const trips = response.data.data?.trips || [];
        const activeOrUpcoming = trips.find(t => 
          t.status === 'planning' || t.status === 'confirmed' || t.status === 'active'
        );
        
        if (activeOrUpcoming) {
          setCurrentTrip(activeOrUpcoming);
          const countryCode = activeOrUpcoming.country_code || 'JP';
          const phraseRes = await api.get(`/emergency/phrases?country=${countryCode}`);
          if (phraseRes.data?.data) {
            setPhrases(phraseRes.data.data);
          } else if (phraseRes.data?.phrases) {
            setPhrases(phraseRes.data.phrases);
          } else if (Array.isArray(phraseRes.data)) {
            setPhrases(phraseRes.data);
          }
        }
      } catch (err) {
        console.error('Error fetching phrases:', err);
      } finally {
        setPhrasesLoading(false);
      }
    };
    fetchPhrases();
  }, []);

  const defaultPhrases = [
    "Where is the nearest police station?",
    "I need help, please.",
    "Do you speak English?",
    "I am lost, can you help me?"
  ];

  const displayPhrases = phrasesLoading ? [] : (phrases.length > 0 ? phrases : defaultPhrases);

  const handleTranslate = async () => {
    if (!text) return;
    setIsTranslating(true);
    try {
      const response = await api.post('/translate', { 
        text, 
        to: 'en', // Defaulting to English for survival, but should be dynamic
        from: 'auto'
      });
      setTranslated(response.data.data?.translated || response.data.translated || text);
    } catch (err) {
      console.error('Translation failed:', err);
      setTranslated(text);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border-t-4 border-indigo-500 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-black text-base-content flex items-center gap-2">
          <Languages className="text-indigo-500" size={20} /> Translator
        </h4>
        <div className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md text-[10px] font-black uppercase tracking-wider">
          AI Powered
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="relative">
          <input 
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or speak..."
            className="w-full bg-base-200 border border-base-content/10 rounded-xl px-4 py-3 text-sm font-bold text-base-content focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-indigo-500 transition-colors">
            <Mic size={18} />
          </button>
        </div>

        {translated && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 animate-slide-up">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Translation</p>
              <button className="text-indigo-500" aria-label="Play translation"><Volume2 size={14} /></button>
            </div>
            <p className="text-sm font-bold text-base-content leading-relaxed">{translated}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Quick Phrases</p>
          <div className="flex flex-wrap gap-2">
            {displayPhrases.map((p) => (
              <button 
                key={p}
                onClick={() => setText(p)}
                className="px-3 py-1.5 rounded-lg bg-base-200 text-base-content/70 text-[10px] font-bold border border-base-content/5 hover:bg-base-300 hover:border-base-content/10 transition-all text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={handleTranslate}
        disabled={isTranslating || !text}
        className="mt-6 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 shadow-lg shadow-indigo-600/20"
      >
        {isTranslating ? 'Translating...' : 'Translate'}
      </Button>
    </div>
  );
};

export const SurvivalTools = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <SafeReturnTimer />
      <QuickTranslator />
    </div>
  );
};

export default SurvivalTools;
