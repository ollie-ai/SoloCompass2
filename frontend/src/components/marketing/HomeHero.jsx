import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, ExternalLink, Check, MapPin, Calendar, User, Shield, Zap, Clock, ChevronRight, ChevronDown, Loader2 as Spinner, Users } from 'lucide-react';
import useDemoStore from '../../stores/demoStore';

const InteractiveDemoPanel = () => {
  const {
    currentStep,
    selectedTrip,
    selectedTravelStyle,
    isGenerating,
    generatedItinerary,
    generatedSafety,
    loadingMessageIndex,
    loadingMessages,
    sampleTrips,
    selectTrip,
    selectTravelStyle,
    generateDemo,
    resetDemo
  } = useDemoStore();

  const travelStyles = ['Cultural Explorer', 'Adventure Seeker', 'Social Butterfly', 'Relaxed Wanderer'];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-3">Step 1: Choose a destination</p>
          <div className="grid gap-2">
            {sampleTrips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => selectTrip(trip.id)}
                className="flex items-center gap-3 p-3 rounded-xl border border-base-content/10 hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <MapPin size={16} className="text-primary" />
                <div className="flex-1">
                  <p className="font-semibold text-base-content text-sm">{trip.destination}</p>
                  <p className="text-xs text-base-content/60">{trip.days} days • {trip.travelStyle}</p>
                </div>
                <ChevronRight size={16} className="ml-auto text-base-content/20" />
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <button onClick={() => useDemoStore.getState().selectTrip(null)} className="text-xs text-primary font-medium hover:underline mb-2">← Back</button>
          <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-3">Step 2: Choose your travel style</p>
          <div className="grid gap-2">
            {travelStyles.map((style) => (
              <button
                key={style}
                onClick={() => selectTravelStyle(style)}
                className="flex items-center gap-3 p-3 rounded-xl border border-base-content/10 hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                {style === 'Cultural Explorer' && <Compass size={16} className="text-accent" />}
                {style === 'Adventure Seeker' && <Zap size={16} className="text-warning" />}
                {style === 'Social Butterfly' && <Users size={16} className="text-pink-500" />}
                {style === 'Relaxed Wanderer' && <Shield size={16} className="text-info" />}
                <span className="font-semibold text-base-content text-sm">{style}</span>
                <ChevronRight size={16} className="ml-auto text-base-content/20" />
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-4">
          <button onClick={() => selectTravelStyle(null)} className="text-xs text-primary font-medium hover:underline mb-2">← Back</button>
          <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-3">Step 3: Generate your plan</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-base-200 rounded-xl">
              <MapPin size={16} className="text-primary" />
              <span className="text-sm text-base-content/80">{selectedTrip?.destination}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-base-200 rounded-xl">
              <Calendar size={16} className="text-primary" />
              <span className="text-sm text-base-content/80">{selectedTrip?.days} days</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-base-200 rounded-xl">
              <Compass size={16} className="text-primary" />
              <span className="text-sm text-base-content/80">{selectedTravelStyle}</span>
            </div>
          </div>
          <button
            onClick={generateDemo}
            disabled={isGenerating}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Spinner size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate My Plan
              </>
            )}
          </button>
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Spinner size={20} className="animate-spin" />
            <span className="text-sm font-medium">Generating your personalized plan...</span>
          </div>
          <div className="space-y-2">
            {loadingMessages.slice(0, loadingMessageIndex).map((msg) => (
              <div key={`loading-${msg}`} className="flex items-center gap-2 text-xs text-success">
                <Check size={12} className="text-emerald-500" />
                {msg}
              </div>
            ))}
            {loadingMessageIndex < loadingMessages.length && (
              <div className="flex items-center gap-2 text-xs text-base-content/40">
                <Spinner size={12} className="animate-spin" />
                {loadingMessages[loadingMessageIndex]}
              </div>
            )}
          </div>
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={`skeleton-${i}`} className="h-16 bg-base-200 rounded-lg" />
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === 3 && generatedItinerary) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Your Itinerary</p>
            <button onClick={resetDemo} className="text-xs text-primary font-medium hover:underline">Start over</button>
          </div>
          
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-primary" />
              <span className="text-xs font-bold text-primary uppercase">Safety Layer Active</span>
            </div>
            <p className="text-xs text-primary/80">
              Check-ins: {generatedSafety?.checkInSchedule?.frequency} • 
              {generatedSafety?.emergencyContacts?.length} contacts • 
              {generatedSafety?.safeHavens?.police} nearby police
            </p>
            <p className="text-[10px] text-primary/60 mt-1">Example output using sample data (no sign-up).</p>
          </div>

          <div className="space-y-2">
            {generatedItinerary.days.slice(0, 3).map((day) => (
              <div key={day.day} className="p-3 bg-base-100 border border-base-200 rounded-lg hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary">Day {day.day}</span>
                  <span className="text-xs text-base-content/40">• {day.date}</span>
                </div>
                <p className="text-sm font-medium text-base-content">{day.title}</p>
                <div className="mt-2 space-y-1">
                  {day.activities.slice(0, 2).map((activity) => (
                    <div key={`${day.day}-${activity.time}`} className="flex items-center gap-2 text-xs text-base-content/60">
                      <span className="text-base-content/40 font-mono">{activity.time}</span>
                      <span>{activity.name}</span>
                    </div>
                  ))}
                  {day.activities.length > 2 && (
                    <p className="text-[10px] text-base-content/40">+ {day.activities.length - 2} more activities</p>
                  )}
                </div>
              </div>
            ))}
            {generatedItinerary.days.length > 3 && (
              <button className="w-full py-2 text-xs text-base-content/60 hover:text-primary transition-colors">
                + {generatedItinerary.days.length - 3} more days
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scrollToSection('pricing')}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Create Full Account
              <ChevronRight size={16} />
            </button>
            <button className="px-3 py-3 bg-base-200 text-base-content rounded-xl hover:bg-base-300 transition-colors">
              <ChevronDown size={16} className="rotate-[-90deg]" />
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-200 overflow-hidden hover:shadow-3xl hover:-translate-y-0.5 transition-all duration-300">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400 animate-pulse" />
          <span className="font-black text-white text-sm">Interactive Demo</span>
          <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">TRY IT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 hidden sm:inline">Tap through →</span>
          <span className="text-[10px] text-white/60 font-medium">No sign-up required</span>
        </div>
      </div>

      <div className="p-5">
        {currentStep === 0 && (
          <div className="flex items-center gap-2 text-xs text-base-content/60 mb-3 pb-3 border-b border-base-200">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">1</span>
            <span className="text-base-content/80">Choose destination</span>
            <ChevronRight size={12} className="text-base-content/20" />
            <span className="w-5 h-5 rounded-full bg-base-200 text-base-content/40 flex items-center justify-center font-bold text-[10px]">2</span>
            <span className="text-base-content/40">Pick style</span>
            <ChevronRight size={12} className="text-base-content/20" />
            <span className="w-5 h-5 rounded-full bg-base-200 text-base-content/40 flex items-center justify-center font-bold text-[10px]">3</span>
            <span className="text-base-content/40">See plan</span>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-5 py-3 bg-base-200/50 border-t border-base-200">
        <p className="text-[10px] text-base-content/40 text-center">
          Guidance, not guarantees. Always follow official local advice.
        </p>
      </div>
    </div>
  );
};

const HomeHero = () => {
  const [variant, setVariant] = useState('A');

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTryDemo = () => {
    const demoPanel = document.getElementById('demo-panel');
    demoPanel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-base-200 to-base-100 transition-colors duration-300">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                Early Access
              </span>
              <span className="text-xs text-base-content/60 font-medium">Solo travelers worldwide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-base-content leading-[1.1] mb-6">
              Plan solo trips with{' '}
              <span className="text-primary font-black">
                built-in safety
              </span>
              {' '}and confidence.
            </h1>

            <p className="text-lg sm:text-xl text-base-content/80 mb-8 max-w-lg leading-relaxed">
              Generate a day-by-day itinerary that matches your travel style — plus check-ins, advisories, and practical trip tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTryDemo}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold text-base shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
              >
                <Sparkles size={20} />
                Try the Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('how-it-works')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-base-100 text-base-content border-2 border-base-300 rounded-xl font-bold text-base hover:border-primary/50 hover:bg-base-200 transition-colors"
              >
                See How It Works
                <ChevronDown size={20} />
              </motion.button>
            </div>

            <p className="text-sm text-base-content/60 mb-8">
              Interactive demo — no sign-up required
            </p>

            <div className="flex items-center gap-4 text-sm text-base-content/60">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-primary" />
                <span>Free forever plan</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            id="demo-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <InteractiveDemoPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

HomeHero.propTypes = {};

export default memo(HomeHero);
