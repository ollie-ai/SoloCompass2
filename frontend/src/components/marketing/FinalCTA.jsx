import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

const FinalCTA = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-vibrant/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Try a solo trip plan in minutes.
          </h2>
          <p className="text-lg text-white/50 mb-8 max-w-xl mx-auto">
            Start with the demo — then generate your first itinerary when you're ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const demoPanel = document.getElementById('demo-panel');
                demoPanel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-vibrant text-white rounded-xl font-bold text-base shadow-lg shadow-brand-vibrant/30 hover:bg-emerald-600 transition-colors"
            >
              <Sparkles size={20} />
              Try the Demo
              <ArrowRight size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToSection('pricing')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-base-100/10 text-white border border-white/20 rounded-xl font-bold text-base hover:bg-base-100/20 transition-colors"
            >
              Start Free
            </motion.button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-brand-vibrant" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-brand-vibrant" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-brand-vibrant" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
