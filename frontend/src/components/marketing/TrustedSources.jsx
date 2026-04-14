import { motion } from 'framer-motion';
import { Globe, MapPin, Cloud, DollarSign, Plane, Search, Info } from 'lucide-react';

const sources = [
  { icon: Globe, name: 'FCDO ATOM Feed', description: 'Official travel advisories', meta: 'Advisories' },
  { icon: MapPin, name: 'OpenStreetMap', description: 'Lighting, safe havens, venues', meta: 'Mapping' },
  { icon: Cloud, name: 'OpenWeather', description: 'Weather data', meta: 'Forecasts' },
  { icon: DollarSign, name: 'Frankfurter API', description: 'Currency conversion', meta: 'Rates' },
  { icon: Plane, name: 'AviationStack', description: 'Flight status', meta: 'Live tracking' },
  { icon: Search, name: 'Geoapify', description: 'Places search', meta: 'Discovery' },
];

const TrustedSources = () => {
  return (
    <section className="py-20 bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-base-content mb-4">
            Powered by trusted sources
          </h2>
          <p className="text-base-content/80 max-w-2xl mx-auto">
            SoloCompass combines your Travel DNA profile with official advisories and practical local signals — so you can plan with more clarity and less stress.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {sources.map((source, index) => {
            const Icon = source.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-4 bg-base-100 rounded-xl border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-vibrant focus:ring-offset-2"
                tabIndex={0}
                role="button"
              >
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base-content text-sm truncate">{source.name}</p>
                  <p className="text-xs text-base-content/60 truncate">{source.description}</p>
                </div>
                <span className="text-[10px] font-medium text-success bg-success/10 px-2 py-1 rounded-full whitespace-nowrap">
                  {source.meta}
                </span>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-base-content/60 mt-8 flex items-center justify-center gap-2"
        >
          <Info size={14} />
          Data coverage varies by location. SoloCompass provides planning support, not guarantees.
        </motion.p>
      </div>
    </section>
  );
};

export default TrustedSources;
