import React from 'react';

interface EnteBazaarLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withTagline?: boolean;
  className?: string;
}

export const EnteBazaarLogo: React.FC<EnteBazaarLogoProps> = ({
  size = 'md',
  withTagline = false,
  className = '',
}) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Leaf Sprout Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${isLg ? 'w-9 h-9' : isSm ? 'w-6 h-6' : 'w-7 h-7'}`}
        >
          <path
            d="M18 32C18 32 18 20 28 14C28 14 26 26 18 32Z"
            fill="#10A978"
          />
          <path
            d="M18 32C18 32 18 16 8 10C8 10 10 24 18 32Z"
            fill="#064E3B"
          />
          <path
            d="M18 32V8"
            stroke="#04281C"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="18" cy="8" r="3" fill="#10A978" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight text-[#063B2A] leading-none ${
            isLg ? 'text-2xl' : isSm ? 'text-base' : 'text-xl'
          }`}
          style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        >
          Ente<span className="text-[#0B8F68]">Bazaar</span>
        </span>
        {withTagline && (
          <span className="text-[10px] text-[#66756E] font-medium tracking-normal mt-0.5 font-sans">
            Local Shops. Better Prices.
          </span>
        )}
      </div>
    </div>
  );
};
