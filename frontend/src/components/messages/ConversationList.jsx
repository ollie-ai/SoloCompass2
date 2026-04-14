import { memo } from 'react';
import PropTypes from 'prop-types';
import { User } from 'lucide-react';

const ConversationList = memo(({ conversation, isSelected, onClick, currentUserId }) => {
  const otherUser = conversation.participants?.find(p => p.id !== currentUserId) || conversation.participant;
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount || 0;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left ${
        isSelected
          ? 'bg-brand-vibrant/10 border border-brand-vibrant/20'
          : 'hover:bg-base-200/50 border border-transparent'
      }`}
    >
      <div className="relative shrink-0">
        {otherUser?.avatarUrl ? (
          <img
            src={otherUser.avatarUrl}
            alt={otherUser.name || 'User'}
            className="w-12 h-12 rounded-xl object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-vibrant/20 to-emerald-500/20 flex items-center justify-center">
            <span className="text-sm font-black text-brand-vibrant">
              {getInitials(otherUser?.name)}
            </span>
          </div>
        )}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-vibrant text-white text-[10px] font-black flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className={`font-bold text-sm truncate ${unreadCount > 0 ? 'text-base-content' : 'text-base-content/80'}`}>
            {otherUser?.name || 'Unknown User'}
          </h4>
          {lastMessage?.createdAt && (
            <span className="text-[10px] font-medium text-base-content/40 shrink-0">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-xs truncate ${unreadCount > 0 ? 'text-base-content/80 font-medium' : 'text-base-content/50'}`}>
            {lastMessage?.content || 'No messages yet'}
          </p>
        </div>
      </div>
    </button>
  );
});

ConversationList.displayName = 'ConversationList';

ConversationList.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    participants: PropTypes.array,
    participant: PropTypes.object,
    lastMessage: PropTypes.shape({
      content: PropTypes.string,
      createdAt: PropTypes.string,
      senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    unreadCount: PropTypes.number
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ConversationList;
