import { motion } from 'framer-motion';
import { Compass, MapPin, Shield, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Compass,
    title: 'Define your Travel DNA',
    description: '60-second quiz to calibrate pace, vibe, and interests.'
  },
  {
    icon: MapPin,
    title: 'Build your trip',
    description: 'Destination, dates, budget — then generate your itinerary.'
  },
  {
    icon: Shield,
    title: 'Add the safety layer',
    description: 'Set check-ins, add emergency contacts, and surface advisories in your plan.'
  }
];

const StepCards = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="how-it-works" className="py-20 bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-base-content mb-4">
            From travel style → itinerary → safety layer
          </h2>
          <p className="text-lg text-base-content/80 max-w-2xl mx-auto">
            Three simple steps to your personalized solo travel plan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-base-200 rounded-2xl p-8 border border-base-300/50 h-full">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-brand-vibrant text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  <div className="w-14 h-14 bg-brand-vibrant/10 rounded-xl flex items-center justify-center mb-6 mt-2">
                    <Icon size={28} className="text-brand-vibrant" />
                  </div>
                  <h3 className="text-xl font-bold text-base-content mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base-content/80 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-base-100 border border-base-300 rounded-full flex items-center justify-center">
                      <ArrowRight size={14} className="text-base-content/40" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-4 bg-success/10 border border-success/20 rounded-xl max-w-2xl mx-auto"
        >
          <p className="text-sm text-emerald-800 text-center">
            <Shield size={16} className="inline mr-2" />
            If you miss a check-in, SoloCompass escalates in steps: reminder → grace period → alerts to your emergency contacts.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default StepCards;
