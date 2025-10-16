import React from 'react';

interface UnreadMessageBadgeProps {
  count: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
}

const UnreadMessageBadge: React.FC<UnreadMessageBadgeProps> = ({ 
  count, 
  className = '', 
  size = 'medium',
  showZero = false 
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const sizeClasses = {
    small: 'w-4 h-4 text-xs',
    medium: 'w-5 h-5 text-xs',
    large: 'w-6 h-6 text-sm'
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-red-500 text-white rounded-full 
        flex items-center justify-center 
        font-bold min-w-fit px-1
        animate-pulse
        ${className}
      `}
      title={`${count} unread message${count !== 1 ? 's' : ''}`}
    >
      {displayCount}
    </div>
  );
};

export default UnreadMessageBadge;
