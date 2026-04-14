import { motion } from 'framer-motion';

const PageHeader = ({ 
  title, 
  subtitle, 
  badge, 
  icon: Icon,
  className = "",
  actions
}) => {
  return (
    <div className={`mb-8 sm:mb-12 ${className}`}>
      {badge && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-vibrant/10 text-brand-vibrant text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-brand-vibrant/20 shadow-sm shadow-brand-vibrant/5"
        >
          {Icon && <Icon size={12} strokeWidth={2.5} />}
          {badge}
        </motion.span>
      )}
      
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-outfit font-black text-base-content leading-[1.1] tracking-tight"
          >
            {title}
          </motion.h1>
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="text-lg sm:text-xl text-base-content/50 font-bold mt-4 leading-relaxed max-w-2xl"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        {actions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
