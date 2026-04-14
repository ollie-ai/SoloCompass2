import { motion } from 'framer-motion';
import { Sparkles, Shield, ArrowRight } from 'lucide-react';

const FoundingExplorer = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden"
        >
          <div className="grid lg:grid-cols-2">
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/0 via-emerald-600/20 to-emerald-700/40" />
              <img 
                src="/ollie.jpg" 
                alt="Ollie, Founder" 
                className="w-40 h-40 rounded-full object-cover border-4 border-white/30 shadow-xl relative z-10"
              />
            </div>
            
            <div className="p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-vibrant/10 text-brand-vibrant text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                <Sparkles size={12} />
                Early Access
              </div>
              
              <h3 className="text-xl font-bold text-base-content mb-4">
                A note from the founder
              </h3>
              
              <p className="text-base-content/80 leading-relaxed mb-4">
                "I built SoloCompass because the 'what-ifs' shouldn't stop you from seeing the world. In solo travel, reliability is everything.
              </p>
              <p className="text-base-content/80 leading-relaxed mb-6">
                That's why SoloCompass is designed around clear escalation logic and dependable messaging infrastructure — so your check-ins and alerts behave predictably when it matters.
              </p>
              <p className="text-base-content/80 leading-relaxed mb-6">
                We're currently in Early Access. We don't have thousands of users yet, and that's intentional: I'm personally reading feedback and prioritising the features solo travellers actually need. Join as a Founding Explorer and help shape the roadmap."
              </p>
              <p className="font-semibold text-base-content mb-6">
                — Ollie, Founder
              </p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('pricing')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-vibrant text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
              >
                Become a Founding Explorer
                <ArrowRight size={18} />
              </motion.button>
              <p className="text-xs text-base-content/60 mt-4">
                Join our community and shape the roadmap.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FoundingExplorer;
