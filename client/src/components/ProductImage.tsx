import React, { useState, useEffect } from 'react';
import { getProxiedImageUrl } from '../services/api';
import { OutOfStockStamp } from './OutOfStockStamp';

interface ProductImageProps {
  productId?: string;
  image?: string;
  emoji?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  fallbackEmojiClassName?: string;
  loading?: 'lazy' | 'eager';
  isOutOfStock?: boolean;
  stampSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

function resolveProductImageSrc(image?: string): string | null {
  if (!image || !image.trim()) return null;
  let trimmed = image.trim();
  // Filter out any legacy local relative /products/ paths that do not exist on the server
  if (trimmed.startsWith('/products/')) {
    return null;
  }
  const doubleMatch = trimmed.match(/(https?:\/\/[^\s]+?)(?:https?:\/\/|$)/i);
  if (doubleMatch && doubleMatch[1]) {
    trimmed = doubleMatch[1].trim();
  }
  if (trimmed.startsWith('/api/proxy-image')) {
    return getProxiedImageUrl(trimmed);
  }
  if (trimmed.startsWith('/') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return getProxiedImageUrl(trimmed);
  }
  return trimmed;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  productId,
  image,
  emoji = '📦',
  alt = 'Product image',
  className = '',
  imgClassName = 'w-full h-full object-contain',
  fallbackEmojiClassName = 'text-2xl',
  loading = 'lazy',
  isOutOfStock = false,
  stampSize,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  // Re-resolve source whenever image prop changes
  useEffect(() => {
    setHasError(false);
    let initial = resolveProductImageSrc(image);
    
    // Safeguard: Never show banana fallback image for products that are not bananas
    if (initial && initial.includes('test-banana-green')) {
      const text = `${productId || ''} ${alt || ''}`.toLowerCase();
      const isBanana = text.includes('banana') || text.includes('വാഴ') || text.includes('പഴം') || text.includes('നേന്ത്ര') || text.includes('റോബസ്റ്റ') || text.includes('chips');
      if (!isBanana) {
        initial = null;
      }
    }
    
    setCurrentSrc(initial);
  }, [image, alt, productId]);

  const handleImageError = () => {
    // If proxied image still fails (e.g. broken or invalid remote link), fallback cleanly to emoji
    setHasError(true);
  };

  if (!currentSrc || hasError) {
    return (
      <div className={`relative inline-flex items-center justify-center select-none max-w-full max-h-full overflow-hidden ${className}`}>
        <span className={`${fallbackEmojiClassName} ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}>{emoji}</span>
        {isOutOfStock && (
          <OutOfStockStamp isOverlay size={stampSize || 'xs'} />
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden select-none max-w-full max-h-full ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={handleImageError}
        className={`max-w-full max-h-full transition-all duration-200 ${imgClassName} ${
          isOutOfStock ? 'opacity-55 grayscale-[30%]' : ''
        }`}
      />
      {isOutOfStock && (
        <OutOfStockStamp isOverlay size={stampSize || 'sm'} />
      )}
    </div>
  );
};




