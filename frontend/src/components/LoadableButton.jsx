import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadableButton = memo(function LoadableButton({
  children,
  loading = false,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  ...props
}) {
  const variants = {
    primary: 'bg-brand-vibrant text-white hover:bg-emerald-600',
    secondary: 'bg-base-200 text-base-content hover:bg-base-300',
    outline: 'border-2 border-base-content/20 text-base-content hover:bg-base-200',
    ghost: 'text-base-content/60 hover:text-base-content hover:bg-base-200',
    danger: 'bg-error text-white hover:bg-red-600'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileTap={!isDisabled && { scale: 0.98 }}
      className={`
        ${variants[variant]} ${sizes[size]}
        font-bold rounded-xl flex items-center justify-center gap-2
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </motion.button>
  );
});

export default LoadableButton;