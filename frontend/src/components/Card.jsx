import { memo } from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, className = '', title, footer }) => {
  return (
    <div className={`bg-base-100 rounded-xl shadow-sm border border-base-300/50 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-base-300/50">
          <h3 className="text-lg font-semibold text-base-content">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-base-300/50 bg-base-200/50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
  footer: PropTypes.node,
};

Card.defaultProps = {
  className: '',
};

export default memo(Card);
