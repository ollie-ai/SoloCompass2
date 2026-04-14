import { forwardRef, memo } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  id,
  name,
  icon,
  iconPosition = 'left',
  ...props 
}, ref) => {
  const inputId = id || name;
  const hasIcon = !!icon;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-base-content/80 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {hasIcon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-required={props.required ? true : undefined}
          className={`
            w-full px-4 py-3 border-2 rounded-xl text-base-content text-base
            placeholder:text-base-content/40 bg-base-100/80 backdrop-blur-sm
            focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary
            disabled:bg-base-200 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-error focus:ring-error/20 focus:border-error' : 'border-base-300 hover:border-base-300/70'}
            ${hasIcon && iconPosition === 'left' ? 'pl-11' : ''}
            ${hasIcon && iconPosition === 'right' ? 'pr-11' : ''}
            ${className}
          `}
          {...props}
        />
        {hasIcon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error" role="alert">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Input.defaultProps = {
  className: '',
  type: 'text',
  iconPosition: 'left',
};

export default memo(Input);
