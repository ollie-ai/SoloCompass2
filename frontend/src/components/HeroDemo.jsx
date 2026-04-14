import { useState } from 'react';
import { ShieldCheck, Sparkles, MapPin, Navigation, Moon, Heart, ArrowRight } from 'lucide-react';
import Button from './Button';

const HeroDemo = () => {
  const [destination, setDestination] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDemo = (e) => {
    e.preventDefault();
    if (!destination) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-20 animate-fade-in [animation-delay:800ms]">
      <div className="glass-card p-1 rounded-xl bg-gradient-to-br from-brand-vibrant/20 to-brand-accent/20 border border-white/40 shadow-2xl overflow-hidden">
        <div className="bg-base-100/90 backdrop-blur-xl rounded-xl p-8 md:p-12">
          {!showResult ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-vibrant/10 text-brand-vibrant text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                Interactive AI Preview
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-base-content mb-8">Where are you heading solo?</h2>
              
              <form onSubmit={handleDemo} className="relative max-w-lg mx-auto">
                <input 
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter a city (e.g. Tokyo, Lisbon, Tulum)"
                  className="w-full pl-14 pr-32 py-5 bg-base-200 border-2 border-base-300/50 rounded-xl outline-none focus:border-brand-vibrant focus:ring-4 focus:ring-brand-vibrant/5 transition-all font-bold text-lg shadow-inner group-hover:bg-base-100"
                />
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-vibrant group-hover:scale-110 transition-transform" size={24} />
                <Button 
                  type="submit"
                  disabled={isAnalyzing || !destination}
                  className="absolute right-2 top-2 bottom-2 bg-brand-vibrant hover:bg-emerald-600 text-white rounded-xl px-8 font-[900] uppercase tracking-wider text-xs shadow-lg shadow-brand-vibrant/20 transition-all active:scale-95"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       Analyzing...
                    </div>
                  ) : 'Try AI'}
                </Button>
              </form>
              
              <p className="mt-8 text-base-content/40 text-sm font-medium italic">
                AI Agent will pull real-time safety indices and solo-vetted neighborhoods.
              </p>
            </div>
          ) : (
            <div className="animate-slide-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-base-300/50">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-brand-vibrant rounded-xl flex items-center justify-center text-white shadow-lg">
                       <Sparkles size={28} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-base-content">{destination} <span className="opacity-40 text-lg">Safe-Vault Intel</span></h3>
                       <p className="text-base-content/60 font-medium">Confidence Score: <span className="text-emerald-500 font-black">98% High</span></p>
                    </div>
                 </div>
                 <Button 
                   onClick={() => setShowResult(false)}
                   variant="outline" 
                   className="rounded-xl border-base-300 text-base-content/60 font-bold hover:bg-base-200"
                 >
                   Reset Demo
                 </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                 <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-100 hover:shadow-lg transition-all">
                    <div className="w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center text-indigo-500 mb-4 shadow-sm"><Moon size={20} /></div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Night Lighting</h4>
                    <p className="text-lg font-black text-indigo-900">96% Verified</p>
                 </div>
                 <div className="p-5 rounded-xl bg-pink-50/50 border border-pink-100 hover:shadow-lg transition-all">
                    <div className="w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center text-pink-500 mb-4 shadow-sm"><Heart size={20} /></div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-1">Solo-Friendly</h4>
                    <p className="text-lg font-black text-pink-900">Top 1% Global</p>
                 </div>
                 <div className="p-5 rounded-xl bg-success/10/50 border border-success/20 hover:shadow-lg transition-all">
                    <div className="w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center text-brand-vibrant mb-4 shadow-sm"><Navigation size={20} /></div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Transit Risk</h4>
                    <p className="text-lg font-black text-emerald-900">Safe-Return active</p>
                 </div>
              </div>

              <div className="p-8 rounded-xl bg-brand-deep text-white flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex-1">
                    <h4 className="text-xl font-black mb-2 flex items-center gap-2"><ShieldCheck className="text-brand-vibrant" /> Agent Recommendation</h4>
                    <p className="text-white/50 text-sm leading-relaxed">
                      "I've vetted the {destination} tourist hub. Stay in the East End neighborhood for optimal safety. I can generate a complete solo-blueprint for this mission in 5 seconds."
                    </p>
                 </div>
                 <Button 
                   onClick={() => window.location.href = `/register?destination=${encodeURIComponent(destination)}`}
                   className="btn-premium px-10 py-5 rounded-xl font-black whitespace-nowrap shadow-xl shadow-brand-vibrant/20 flex items-center gap-2 group"
                 >
                   Claim My Full Blueprint <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroDemo;
