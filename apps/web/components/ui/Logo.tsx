import React from 'react';


interface LogoProps extends React.ComponentPropsWithoutRef<'div'> {
  size?: number;
  variant?: 'icon' | 'full';
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({ 
  size = 24, 
  variant = 'icon', 
  className = '',
  iconClassName = '',
  textClassName = '',
  ...props 
}: LogoProps) {
  const iconMarkup = (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={2} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`transition-all duration-300 ${iconClassName}`.trim()}
    >
      <path d="M4 20V5a2 2 0 0 1 2-2h2l4 8 4-8h2a2 2 0 0 1 2 2v15" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={className} {...props}>
        {iconMarkup}
      </div>
    );
  }

  // Full variant includes typography
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()} {...props}>
      {iconMarkup}
      <span 
        className={`font-bold tracking-tight ${textClassName}`.trim()} 
        style={{ fontSize: `calc(${size}px * 0.85)` }}
      >
        Macitta
      </span>
    </div>
  );
}
