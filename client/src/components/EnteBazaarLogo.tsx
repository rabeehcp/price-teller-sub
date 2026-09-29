import React from 'react';

export interface EnteBazaarLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'icon' | 'full';
  theme?: 'light' | 'dark';
  withTagline?: boolean;
  withMalayalam?: boolean;
  className?: string;
  onClick?: () => void;
  alt?: string;
}

export const EnteBazaarLogo: React.FC<EnteBazaarLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  theme = 'light',
  withTagline = false,
  className = '',
  onClick,
  alt = 'PeediyaCart',
}) => {
  const isDark = theme === 'dark';

  // Sizing configurations for logo image heights
  const logoHeights = {
    xs: 'h-5 sm:h-6',
    sm: 'h-6 sm:h-7',
    md: 'h-7 sm:h-8 md:h-9',
    lg: 'h-9 sm:h-11 md:h-12',
    xl: 'h-12 sm:h-14 md:h-16',
  };

  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-11 h-11 sm:w-12 sm:h-12',
    xl: 'w-14 h-14 sm:w-16 sm:h-16',
  };

  // 1. Icon variant: circular emblem with logo icon
  if (variant === 'icon') {
    return (
      <div
        onClick={onClick}
        className={`relative flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none transition-transform hover:scale-105 active:scale-95 rounded-xl border border-slate-200/80 bg-white p-1 ${
          iconSizes[size] || iconSizes.md
        } ${onClick ? 'cursor-pointer' : ''} ${className}`}
        title="PeediyaCart"
      >
        <img
          src="/pwa-192x192.png"
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // 2. Full card variant
  if (variant === 'full') {
    const fullSizes = {
      xs: 'w-24 py-1.5 px-2.5',
      sm: 'w-32 py-2 px-3.5',
      md: 'w-44 sm:w-52 py-2.5 px-4',
      lg: 'w-56 sm:w-64 py-3 px-5',
      xl: 'w-72 sm:w-80 py-4 px-6',
    };
    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-md border border-slate-200/90 bg-white select-none ${
          fullSizes[size] || fullSizes.md
        } ${onClick ? 'cursor-pointer hover:scale-102 active:scale-98 transition-transform' : ''} ${className}`}
      >
        <img
          src="/logo.png"
          alt={alt}
          className="w-full h-auto object-contain"
        />
      </div>
    );
  }

  // 3. Horizontal primary brand mark
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none transition-transform group ${
        onClick ? 'cursor-pointer active:scale-98' : ''
      } ${className}`}
    >
      <img
        src="/logo.png"
        alt={alt}
        className={`w-auto object-contain transition-transform group-hover:scale-102 ${
          isDark ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] brightness-[1.08]' : ''
        } ${logoHeights[size] || logoHeights.md}`}
      />
    </div>
  );
};

// Aliased export for convenience
export const PeediyaCartLogo = EnteBazaarLogo;

