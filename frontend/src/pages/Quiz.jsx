import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api, { createCancelToken, isCancel } from '../lib/api';
import { trackEvent } from '../lib/telemetry';
import Button from '../components/Button';
import Loading from '../components/Loading';
import RadarChart from '../components/RadarChart';
import { Coffee, Compass, Zap, Camera, Map, Heart, Palmtree, MapPin, Utensils, Sparkles, Moon, ShoppingBag, User, ChevronLeft, ArrowLeft, ArrowRight, Check, TrendingUp, CheckCircle2, ChevronRight, RefreshCw, CloudOff, ShieldCheck } from 'lucide-react';

const Quiz = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [displayQuestions, setQuestions] = useState(null);
  const [displayQuestionsLoading, setQuestionsLoading] = useState(true);
  const [displayQuestionsError, setQuestionsError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);
        const response = await api.get('/quiz/displayQuestions');
        if (response.data?.data) {
          setQuestions(response.data.data);
        } else if (response.data?.displayQuestions) {
          setQuestions(response.data.displayQuestions);
        } else if (Array.isArray(response.data)) {
          setQuestions(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch quiz displayQuestions:', err);
        setQuestionsError(err.message);
      } finally {
        setQuestionsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const defaultQuestions = [
    {
      id: 'adventureLevel',
      question: 'What\'s your ideal adventure level?',
      description: 'We use this to calibrate the activity intensity in your itineraries.',
      type: 'select',
      options: [
        { value: 'low', label: 'Cozy & Comfortable', sub: 'I prefer familiar comforts and relaxed sightseeing.', icon: Coffee },
        { value: 'medium', label: 'Balanced Explorer', sub: 'A mix of relaxation and moderate active discovery.', icon: Compass },
        { value: 'high', label: 'Adrenaline Junkie', sub: 'Give me hiking, heights, and high-energy experiences!', icon: Zap }
      ]
    },
    {
      id: 'culturalInterest',
      question: 'How deep into local culture do you want to go?',
      description: 'Affects the proportion of museums, local workshops, and historic sites.',
      type: 'select',
      options: [
        { value: 'low', label: 'Light & Casual', sub: "Just the main highlights and some nice views.", icon: Camera },
        { value: 'medium', label: 'Culturally Curious', sub: "I like to learn the basics and see a few museums.", icon: Map },
        { value: 'high', label: 'Immersive Historian', sub: "I want to speak the language and know the local lore.", icon: Heart }
      ]
    },
    {
      id: 'relaxationPreference',
      question: 'How important is "unwinding" on this trip?',
      type: 'select',
      options: [
        { value: 'low', label: 'Go Go Go!', sub: "I'll sleep when I'm home. Keep the pace high.", icon: Zap },
        { value: 'medium', label: 'Perfectly Balanced', sub: "One active day, one relaxed morning.", icon: Compass },
        { value: 'high', label: 'Complete Retreat', sub: "Spa, beaches, and slow breakfasts only.", icon: Palmtree }
      ]
    },
    {
      id: 'budgetLevel',
      question: 'What\'s your realistic travel budget?',
      type: 'select',
      options: [
        { value: 'budget', label: 'Savvy Budgeter', sub: "Hostels and street food. Experience > Luxury.", icon: MapPin },
        { value: 'moderate', label: 'Flashpacker', sub: "Mid-range hotels and some nice dinners.", icon: Utensils },
        { value: 'luxury', label: 'Grand Soloist', sub: "First class everything. Only the finest stays.", icon: Sparkles }
      ]
    },
    {
      id: 'interests',
      question: 'Which of these make your heart race?',
      description: 'Select everything you truly enjoy.',
      type: 'multi-select',
      options: [
        { value: 'hiking', label: 'Hiking', icon: Map },
        { value: 'photography', label: 'Photography', icon: Camera },
        { value: 'local food', label: 'Local Food', icon: Utensils },
        { value: 'museums', label: 'Museums', icon: Compass },
        { value: 'beaches', label: 'Beaches', icon: Palmtree },
        { value: 'nightlife', label: 'Nightlife', icon: Moon },
        { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
        { value: 'wellness', label: 'Wellness', icon: Heart }
      ]
    },
    {
      id: 'pace',
      question: 'What\'s your preferred travel rhythm?',
      type: 'select',
      options: [
        { value: 'fast', label: 'The Sprint', sub: "New city every 2 days. Maximizer." },
        { value: 'moderate', label: 'The Stroll', sub: "3-4 days per place. Balanced." },
        { value: 'slow', label: 'The Deep Dive', sub: "A week or more in one spot. Immersive." }
      ]
    }
  ];

  const finalQuestions = displayQuestionsLoading ? null : (displayQuestions && displayQuestions.length > 0 ? displayQuestions : defaultQuestions);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const cancelSourceRef = useRef(null);

  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    
    const syncProgress = async () => {
      cancelSourceRef.current = createCancelToken();
      localStorage.setItem('solo_quiz_progress', JSON.stringify({ answers, currentStep }));
      
      if (!isAuthenticated) return;

      setIsSaving(true);
      setSaveError(false);
      try {
        await api.post('/quiz/save-progress', { answers, currentStep }, { cancelToken: cancelSourceRef.current.token });
      } catch (err) {
        if (!isCancel(err)) setSaveError(true);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(syncProgress, 1000);
    return () => {
      clearTimeout(timer);
      if (cancelSourceRef.current) {
        cancelSourceRef.current.cancel('Component unmounted');
      }
    };
  }, [answers, currentStep, isAuthenticated]);

  useEffect(() => {
    // 1. Initial check for local storage progress (for guests)
    const saved = localStorage.getItem('solo_quiz_progress');
    if (saved) {
      try {
        const { answers: savedAnswers, currentStep: savedStep } = JSON.parse(saved);
        setAnswers(savedAnswers);
        setCurrentStep(savedStep);
      } catch (e) {
        console.warn('[Quiz] Failed to parse saved progress:', e);
        localStorage.removeItem('solo_quiz_progress');
      }
    }

    if (!isAuthenticated) {
      setIsLoadingProfile(false);
      return;
    }

    // 2. If authenticated, check server state
    const checkExistingProfile = async () => {
      try {
        const res = await api.get('/quiz/profile');
        if (res.data.hasQuiz) {
          if (res.data.isComplete) {
            setResult(res.data);
          } else if (res.data.profile?.answers) {
            setAnswers(res.data.profile.answers);
            setCurrentStep(res.data.profile.currentStep || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching quiz profile', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkExistingProfile();
  }, [isAuthenticated, navigate]);

  if (isLoadingProfile || displayQuestionsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;
  }

  if (!finalQuestions || finalQuestions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-base-content/60">Unable to load quiz questions. Please refresh.</div>;
  }

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // Auto-advance for simple selects
    if (finalQuestions[currentStep].type === 'select') {
      setTimeout(() => {
        if (currentStep < finalQuestions.length - 1) setCurrentStep(currentStep + 1);
      }, 400);
    }
  };

  const handleMultiSelect = (questionId, optionValue) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      const updated = current.includes(optionValue)
        ? current.filter(v => v !== optionValue)
        : [...current, optionValue];
      return { ...prev, [questionId]: updated };
    });
  };

  const nextStep = () => {
    if (currentStep < finalQuestions.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    // Save to local regardless for the final state
    localStorage.setItem('solo_quiz_progress', JSON.stringify({ answers, currentStep }));

    if (!isAuthenticated) {
       // Mock the score for guests for immediate "Aha!" moment
       const scores = { adrenaline: 0, culture: 0, chill: 0, budget: 0 };
       if (answers.adventureLevel === 'high') scores.adrenaline += 3;
       if (answers.culturalInterest === 'high') scores.culture += 3;
       if (answers.relaxationPreference === 'high') scores.chill += 3;
       
        const keys = Object.keys(scores);
        const dominant = keys.length > 0 ? keys.reduce((a, b) => scores[a] > scores[b] ? a : b) : 'chill';
       
       setResult({
          isGuest: true,
          profile: {
             dominantStyle: dominant === 'adrenaline' ? 'Adrenaline Junkie' : dominant === 'culture' ? 'Immersive Scholar' : 'Serene Nomad',
             scores
          },
          preferences: {
             pace: answers.pace || 'moderate',
             budget_level: answers.budgetLevel || 'moderate',
             accommodation_type: 'Solo-Friendly Boutique',
             preferred_climate: 'Temperate'
          }
       });
       setIsSubmitting(false);
       return;
    }

    try {
      const response = await api.post('/quiz/submit', { answers });
      // Update global auth store
      try {
        const { refreshUser } = useAuthStore.getState();
        if (refreshUser) await refreshUser();
      } catch (rErr) { console.warn('Refresh failed', rErr); }
      
      setResult(response.data);
      localStorage.removeItem('solo_quiz_progress'); // Clear on success
    } catch (err) {
      setError('Failed to process. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = finalQuestions[currentStep];
  const isLastStep = currentStep === finalQuestions.length - 1;
  const canProceed = answers[currentQuestion.id] !== undefined;

  if (result) {
    return (
      <div className="min-h-screen bg-mesh py-12 px-4 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-xl overflow-hidden shadow-2xl transition-all">
            <div className="bg-brand-deep p-10 md:p-16 text-white text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-vibrant/20 to-transparent"></div>
               <div className="relative z-10 flex flex-col items-center">
                 <div className="w-16 h-16 bg-base-100/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
                   <Sparkles className="text-brand-vibrant" size={32} />
                 </div>
                  <h2 className="text-4xl md:text-5xl font-black mb-4">Your Travel DNA</h2>
                  <p className="text-white/50 text-lg max-w-xl mx-auto font-medium">According to our AI, your dominant travel style is:</p>
                 <div className="mt-6 px-8 py-3 bg-brand-vibrant text-white rounded-full text-2xl font-black shadow-xl shadow-brand-vibrant/20 uppercase tracking-widest inline-block">
                    {result.profile.dominantStyle}
                 </div>
               </div>
            </div>

            <div className="p-8 md:p-12 space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-black text-base-content mb-6 flex items-center gap-2">
                    <TrendingUp className="text-brand-vibrant" /> Style Profile
                  </h3>
                  <div className="flex justify-center">
                    <RadarChart scores={result.profile.scores} size={300} />
                  </div>
                </div>

                <div>
                   <h3 className="text-xl font-black text-base-content mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-brand-accent" /> AI Recommendations
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: 'Pace', v: result.preferences.pace, i: Zap },
                      { l: 'Budget', v: result.preferences.budget_level, i: Utensils },
                      { l: 'Stay', v: result.preferences.accommodation_type, i: Moon },
                      { l: 'Weather', v: result.preferences.preferred_climate, i: Palmtree }
                    ].map((pref) => (
                      <div key={`pref-${pref.l}`} className="p-4 rounded-xl bg-base-200 border border-base-300/50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-base-100 flex items-center justify-center text-brand-accent shadow-sm">
                          <pref.i size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest leading-none mb-1">{pref.l}</p>
                          <p className="text-sm font-bold text-base-content/80 capitalize">{pref.v}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-6 rounded-xl bg-brand-accent/5 border border-brand-accent/10">
                    <p className="text-sm text-base-content/80 italic leading-relaxed">
                      "Based on your profile, we'll prioritize Destinations with a {result.preferences.preferred_climate} climate and moderate safety standards, focusing on {result.preferences.accommodation_type} accommodations."
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-base-300/50">
                {!isAuthenticated ? (
                  <Button
                    onClick={() => navigate('/register', { state: { dnaSaved: true }})}
                    variant="primary"
                    className="w-full py-5 rounded-xl font-black btn-premium shadow-2xl flex items-center justify-center gap-3"
                  >
                    <ShieldCheck size={24} /> Save My Travel DNA & Access Safety Intelligence
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      className="flex-1 py-4 rounded-xl font-black border-base-300"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      onClick={() => navigate('/destinations')}
                      variant="primary"
                      className="flex-1 py-4 rounded-xl font-black btn-premium shadow-xl"
                    >
                      Explore Destinations <ChevronRight size={20} className="ml-2 inline" />
                    </Button>
                  </>
                )}
              </div>
              <div className="text-center">
                <button 
                  onClick={() => { setResult(null); setAnswers({}); setCurrentStep(0); }}
                  className="text-base-content/40 hover:text-base-content font-bold transition-colors text-sm"
                >
                  Not quite right? Retake the quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-xl overflow-hidden shadow-2xl animate-fade-in">
          <div className="w-full bg-base-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-base-200/50">
              <div className="flex flex-col">
                <span className="text-[10px] font-[900] text-brand-vibrant uppercase tracking-[0.2em]">
                  Mission Briefing • Step {currentStep + 1}
                </span>
                <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-widest mt-1">
                  Drafting {currentQuestion.id.replace(/([A-Z])/g, ' $1').trim()} profile...
                </span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="px-3 py-1 rounded-full bg-brand-vibrant/10 border border-brand-vibrant/20 text-brand-vibrant text-[10px] font-black">
                    {Math.round(((currentStep + 1) / finalQuestions.length) * 100)}% COMPLETE
                 </div>
                 <div className="flex gap-1">
                  {finalQuestions.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx <= currentStep ? 'bg-brand-vibrant w-8' : 'bg-base-300 w-4'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-base-200">
              <div 
                className="h-full bg-gradient-to-r from-brand-vibrant to-emerald-500 transition-all duration-700 ease-in-out shadow-lg shadow-brand-vibrant/30" 
                style={{ width: `${((currentStep + 1) / finalQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-10">
               <div>
                   <h1 className="text-2xl font-black text-base-content">Discover Your Travel DNA</h1>
                  <div className="flex items-center gap-2 mt-2">
                    {isSaving ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-brand-vibrant uppercase tracking-widest animate-pulse">
                        <RefreshCw size={14} className="animate-spin" /> Syncing...
                      </span>
                    ) : saveError ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-error uppercase tracking-widest">
                        <CloudOff size={14} /> Sync Failed
                      </span>
                    ) : Object.keys(answers).length > 0 ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        <Check size={14} /> Progress Saved
                      </span>
                    ) : null}
                  </div>
               </div>
            </div>

            <div className="min-h-[400px]">
              <div key={currentStep} className="animate-slide-up space-y-2 mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-base-content tracking-tight">{currentQuestion.question}</h2>
                {currentQuestion.description && (
                  <p className="text-base-content/60 font-medium text-lg">{currentQuestion.description}</p>
                )}
              </div>
              
              <div className="grid gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const Icon = option.icon;
                  const isSelected = currentQuestion.type === 'select' 
                    ? answers[currentQuestion.id] === option.value
                    : (answers[currentQuestion.id] || []).includes(option.value);

                  return (
                    <button 
                      key={option.value}
                      onClick={() => currentQuestion.type === 'select' 
                        ? handleAnswer(currentQuestion.id, option.value) 
                        : handleMultiSelect(currentQuestion.id, option.value)
                      }
                      className={`group flex items-center p-6 rounded-[1.5rem] border-2 text-left transition-all duration-300 ${
                        isSelected
                          ? 'border-brand-vibrant bg-brand-vibrant/5 ring-4 ring-brand-vibrant/5 scale-[1.02]'
                          : 'border-base-300/50 bg-base-100 hover:border-base-300/70 hover:bg-base-200'
                      }`}
                      style={{ transitionDelay: `${idx * 50}ms` }}
                    >
                      {Icon && (
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-6 transition-colors ${
                          isSelected ? 'bg-brand-vibrant text-white' : 'bg-base-200 text-base-content/40 group-hover:bg-base-100 group-hover:text-base-content'
                        }`}>
                          <Icon size={24} />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`text-lg font-black ${isSelected ? 'text-base-content' : 'text-base-content/80'}`}>{option.label}</p>
                        {option.sub && <p className="text-sm text-base-content/60 font-medium mt-1">{option.sub}</p>}
                      </div>
                      {currentQuestion.type === 'multi-select' && (
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-brand-vibrant border-brand-vibrant' : 'border-base-300'
                        }`}>
                          {isSelected && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mt-12 pt-10 border-t border-base-300/50">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 font-black transition-all ${
                  currentStep === 0 
                    ? 'text-base-content/20 cursor-not-allowed' 
                    : 'text-base-content/40 hover:text-base-content'
                }`}
              >
                <ChevronLeft size={20} /> Back
              </button>

              <div className="flex items-center gap-4">
                {currentQuestion.type === 'multi-select' && (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed}
                    variant="outline"
                    className="rounded-xl px-8 py-3 border-base-300 font-black"
                  >
                    Next
                  </Button>
                )}

                {isLastStep && (
                  <div className="flex flex-col items-end">
                    {isSubmitting && (
                      <div className="text-xs font-bold text-brand-accent mb-2 animate-pulse uppercase tracking-[0.2em]">
                        {(() => {
                          const steps = ["Analyzing weather patterns...", "Consulting local maps...", "Calculating solo-safety scores...", "Finalizing your profile..."];
                          return steps[Math.floor(Date.now() / 2000) % steps.length];
                        })()}
                      </div>
                    )}
                    <Button
                      onClick={handleSubmit}
                      disabled={!canProceed || isSubmitting}
                      variant="primary"
                      className="btn-premium rounded-xl px-10 py-3 font-black flex items-center gap-2"
                    >
                      {isSubmitting ? 'Analyzing...' : <><ShieldCheck size={20} /> Finish Quiz</>}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-8 p-4 bg-error/10 border border-error/20 rounded-xl text-error font-bold text-center animate-slide-up">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
