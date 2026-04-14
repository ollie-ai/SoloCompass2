import { memo } from 'react';
import PropTypes from 'prop-types';

const Loading = memo(function Loading({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes[size]}
          border-primary/20 border-t-primary
          rounded-full animate-spin
        `}
      />
    </div>
  );
});

Loading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

Loading.defaultProps = {
  size: 'md',
  className: '',
};

export default Loading;
