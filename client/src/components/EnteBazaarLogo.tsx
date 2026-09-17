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
  withMalayalam = false,
  className = '',
  onClick,
  alt = 'EnteBazaar',
}) => {
  // If variant === 'full', display the complete official emblem card
  if (variant === 'full') {
    const fullSizes = {
      xs: 'w-16 h-16',
      sm: 'w-24 h-24',
      md: 'w-32 h-32 sm:w-36 sm:h-36',
      lg: 'w-44 h-44 sm:w-48 sm:h-48',
      xl: 'w-56 h-56 sm:w-64 sm:h-64',
    };
    return (
      <div
        onClick={onClick}
        className={`relative inline-block rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-emerald-900/20 select-none ${
          fullSizes[size] || fullSizes.md
        } ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''} ${className}`}
      >
        <img
          src="/logo.png"
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Sizing configurations for horizontal & icon
  const iconSizes = {
    xs: 'w-6 h-6 rounded-md',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    lg: 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl',
    xl: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
  };

  const isDark = theme === 'dark';

  if (variant === 'icon') {
    return (
      <div
        onClick={onClick}
        className={`relative flex items-center justify-center shrink-0 overflow-hidden shadow-xs select-none transition-transform hover:scale-105 active:scale-95 border border-emerald-800/15 ${
          iconSizes[size] || iconSizes.md
        } ${onClick ? 'cursor-pointer' : ''} ${className}`}
        title="EnteBazaar"
      >
        <img
          src="/logo.png"
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-2.5 select-none transition-transform group ${
        onClick ? 'cursor-pointer active:scale-98' : ''
      } ${className}`}
    >
      {/* Official Emblem Mark */}
      <div
        className={`relative flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-emerald-800/15 group-hover:scale-105 transition-transform ${
          iconSizes[size] || iconSizes.md
        }`}
      >
        <img
          src="/logo.png"
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight min-w-0">
        <div
          className={`font-black tracking-tight flex items-center gap-0.5 font-sans leading-none ${
            isDark ? 'text-white' : 'text-[#17221D]'
          } ${textSizes[size] || textSizes.md}`}
        >
          <span>Ente</span>
          <span className="text-[#10A978]">Bazaar</span>
        </div>

        {withTagline && (
          <span
            className={`text-[8px] sm:text-[9px] lg:text-[10px] font-medium tracking-tight mt-0.5 leading-none ${
              isDark ? 'text-[#8F9F97]' : 'text-[#66756E]'
            }`}
          >
            Local Shops. Better Prices.
          </span>
        )}
      </div>
    </div>
  );
};
