import { memo } from 'react';
import PropTypes from 'prop-types';

const Skeleton = memo(function Skeleton({ className = '', variant = 'rect' }) {
  const baseClasses = "skeleton rounded-lg";
  
  if (variant === 'circle') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }
  
  if (variant === 'text') {
    return <div className={`${baseClasses} h-4 w-3/4 ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-xl bg-base-100 border border-base-300/50 p-8 shadow-sm ${className}`}>
        <div className={`${baseClasses} h-48 rounded-xl mb-6 shadow-inner`}></div>
        <div className={`${baseClasses} h-8 w-3/4 mb-3`}></div>
        <div className={`${baseClasses} h-4 w-full mb-2`}></div>
        <div className={`${baseClasses} h-4 w-2/3`}></div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className={`${baseClasses} rounded-full h-10 w-10 ${className}`} />;
  }

  if (variant === 'stats') {
    return (
      <div className={`p-6 rounded-2xl bg-base-100 border border-base-300/50 shadow-sm ${className}`}>
        <div className={`${baseClasses} h-4 w-24 mb-3`} />
        <div className={`${baseClasses} h-10 w-32 mb-2`} />
        <div className={`${baseClasses} h-4 w-full opacity-50`} />
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
          {[1, 2, 3].map(i => (
          <div key={'skeleton-' + i} className="p-6 rounded-2xl bg-base-100 border border-base-300/50 shadow-sm">
            <div className={`${baseClasses} aspect-video rounded-xl mb-4`} />
            <div className={`${baseClasses} h-6 w-3/4 mb-3`} />
            <div className={`${baseClasses} h-4 w-full mb-2`} />
            <div className={`${baseClasses} h-4 w-1/2`} />
          </div>
        ))}
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
});

Skeleton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['rect', 'circle', 'text', 'card', 'avatar', 'stats', 'grid']),
};

Skeleton.defaultProps = {
  className: '',
  variant: 'rect',
};

export default Skeleton;
