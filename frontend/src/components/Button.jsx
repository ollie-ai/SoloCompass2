import { forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary hover:bg-primary/90 text-primary-content shadow-lg shadow-primary/20',
  secondary: 'bg-secondary hover:bg-secondary/90 text-secondary-content shadow-lg shadow-secondary/20',
  outline: 'border-2 border-primary text-primary hover:bg-primary/5',
  ghost: 'hover:bg-base-200 text-base-content/80',
  danger: 'bg-error hover:bg-error/90 text-error-content',
  premium: 'btn-premium',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled,
  loading = false,
  type = 'button',
  ...props 
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-base-100
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin mr-2" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'premium']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
};

Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  className: '',
  disabled: false,
  loading: false,
  type: 'button',
};

export default memo(Button);
