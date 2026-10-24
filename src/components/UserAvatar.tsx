import React from 'react';

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'full' | '2xl' | 'xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name = 'User',
  size = 'md',
  className = '',
  rounded = 'full'
}) => {
  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const roundedClass = rounded === '2xl' ? 'rounded-2xl' : rounded === 'xl' ? 'rounded-xl' : 'rounded-full';

  const initial = (name.trim().charAt(0) || 'U').toUpperCase();

  if (avatar && avatar.trim() !== '' && !avatar.includes('unsplash.com/photo-1535713875002') && !avatar.includes('unsplash.com/photo-1507003211169')) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClasses[size]} ${roundedClass} object-cover ring-1 ring-slate-200/80 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${roundedClass} bg-slate-100 border border-slate-200/80 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 select-none font-display ${className}`}
      title={name}
    >
      {initial}
    </div>
  );
};
