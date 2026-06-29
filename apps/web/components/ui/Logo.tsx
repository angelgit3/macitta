import React from 'react';

// Macitta mark: an open study book with an "M" memory path.
export const MacittaMarkIcon = ({
  size = 24,
  className = '',
  color = 'currentColor',
}: {
  size?: number;
  className?: string;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-all duration-300 ${className}`.trim()}
  >
    <path
      d="M13 18.8C20.1 14.9 26.4 15.6 32 20.9C37.6 15.6 43.9 14.9 51 18.8V47.5C43.9 43.6 37.6 44.3 32 49.6C26.4 44.3 20.1 43.6 13 47.5V18.8Z"
      fill={color}
      opacity="0.14"
    />
    <path
      d="M13 18.8C20.1 14.9 26.4 15.6 32 20.9C37.6 15.6 43.9 14.9 51 18.8V47.5C43.9 43.6 37.6 44.3 32 49.6C26.4 44.3 20.1 43.6 13 47.5V18.8Z"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 38V26L32 35.5L42 26V38"
      stroke="var(--color-ink, #F0F1FF)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="15" r="3" fill="var(--color-amber, #E8B84B)" />
  </svg>
);

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
  const iconMarkup = <MacittaMarkIcon size={size} className={iconClassName} />;

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
