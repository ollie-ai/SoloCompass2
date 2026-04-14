import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function EmptyList({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = ''
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 px-6 ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-base-200 flex items-center justify-center">
          <Icon size={32} className="text-base-content/30" />
        </div>
      )}
      <h3 className="text-lg font-black text-base-content mb-2">{title}</h3>
      {description && (
        <p className="text-base-content/60 font-medium max-w-sm mx-auto mb-6">
          {description}
        </p>
      )}
      {actionLabel && (
        onAction ? (
          <button
            onClick={onAction}
            className="px-6 py-2.5 bg-brand-vibrant text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
          >
            {actionLabel}
          </button>
        ) : actionHref ? (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-vibrant text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
          >
            <Sparkles size={16} />
            {actionLabel}
          </Link>
        ) : null
      )}
    </motion.div>
  );
}