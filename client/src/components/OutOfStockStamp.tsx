import React from 'react';

export interface OutOfStockStampProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showMalayalam?: boolean;
  angle?: number;
  isOverlay?: boolean;
}

export const OutOfStockStamp: React.FC<OutOfStockStampProps> = ({
  className = '',
  size = 'md',
  showMalayalam = true,
  angle = -7,
  isOverlay = false,
}) => {
  const sizeClasses = {
    xs: 'w-11 h-auto',
    sm: 'w-16 h-auto',
    md: 'w-24 sm:w-28 h-auto',
    lg: 'w-36 sm:w-44 h-auto',
    xl: 'w-48 sm:w-56 h-auto',
  }[size];

  // SVG stamp mimicking the distressed double-border rubber stamp
  const stampSvg = (
    <svg
      viewBox="0 0 160 94"
      className={`${sizeClasses} max-w-full`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Out of Stock"
    >
      <defs>
        {/* Subtle distress texture filter to match the real grunge stamp look */}
        <filter id={`stamp-grunge-${size}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <g filter={`url(#stamp-grunge-${size})`}>
        {/* Background tint for readability over any photo/color */}
        <rect
          x="3"
          y="3"
          width="154"
          height="88"
          rx="8"
          ry="8"
          fill="rgba(255, 255, 255, 0.88)"
        />

        {/* Outer thick stamp border */}
        <rect
          x="4"
          y="4"
          width="152"
          height="86"
          rx="7"
          ry="7"
          fill="none"
          stroke="#DC2626"
          strokeWidth="5.5"
          strokeDasharray="60 1 80 1.5 50 1"
        />

        {/* Inner thin stamp border */}
        <rect
          x="10.5"
          y="10.5"
          width="139"
          height="73"
          rx="4.5"
          ry="4.5"
          fill="none"
          stroke="#DC2626"
          strokeWidth="2.2"
        />

        {/* Big Stencil OUT OF Text */}
        <text
          x="80"
          y={showMalayalam ? "38" : "42"}
          textAnchor="middle"
          fill="#DC2626"
          fontSize="24"
          fontWeight="900"
          fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
          letterSpacing="2.5"
        >
          OUT OF
        </text>

        {/* Big Stencil STOCK Text */}
        <text
          x="80"
          y={showMalayalam ? "64" : "72"}
          textAnchor="middle"
          fill="#DC2626"
          fontSize="26"
          fontWeight="900"
          fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
          letterSpacing="2.5"
        >
          STOCK
        </text>

        {/* Malayalam Subtitle: സ്റ്റോക്കില്ല */}
        {showMalayalam && (
          <text
            x="80"
            y="79"
            textAnchor="middle"
            fill="#B91C1C"
            fontSize="9.5"
            fontWeight="800"
            fontFamily="sans-serif"
            letterSpacing="0.8"
          >
            (സ്റ്റോക്കില്ല)
          </text>
        )}
      </g>
    </svg>
  );

  if (isOverlay) {
    return (
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center bg-white/45 backdrop-blur-[1px] pointer-events-none select-none animate-in fade-in zoom-in-95 duration-150 p-1 ${className}`}
      >
        <div
          style={{ transform: `rotate(${angle}deg)` }}
          className="drop-shadow-md transition-transform"
        >
          {stampSvg}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ transform: `rotate(${angle}deg)` }}
      className={`inline-flex items-center justify-center select-none drop-shadow-xs ${className}`}
    >
      {stampSvg}
    </div>
  );
};
