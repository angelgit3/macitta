import React from 'react';

// Cloud icon SVG path - reusable, scalable, consistent
// Classic cloud outline (Material Design style)
export const CloudMIcon = ({
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
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-all duration-300 ${className}`.trim()}
  >
    <path
      d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
      transform="translate(2.5, 1.5) scale(0.8)"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
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
  const iconMarkup = <CloudMIcon size={size} className={iconClassName} />;

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
