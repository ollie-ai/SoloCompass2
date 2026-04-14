import { memo } from 'react';
import PropTypes from 'prop-types';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = memo(({ message, isOwn, showTimestamp = true }) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isOwn
              ? 'bg-brand-vibrant text-white rounded-br-md'
              : 'bg-base-200 text-base-content rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        {showTimestamp && (
          <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-base-content/40 font-medium">
              {formatTime(message.createdAt)}
            </span>
            {isOwn && (
              message.read ? (
                <CheckCheck size={12} className="text-brand-vibrant/60" />
              ) : (
                <Check size={12} className="text-base-content/30" />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    read: PropTypes.bool
  }).isRequired,
  isOwn: PropTypes.bool.isRequired,
  showTimestamp: PropTypes.bool
};

MessageBubble.defaultProps = {
  showTimestamp: true
};

export default MessageBubble;
