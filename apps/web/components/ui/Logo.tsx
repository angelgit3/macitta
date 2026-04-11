import React from 'react';
import { Atom } from 'lucide-react';

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
    <Atom 
      size={size} 
      strokeWidth={2}
      className={`transition-all duration-300 ${iconClassName}`.trim()} 
    />
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
