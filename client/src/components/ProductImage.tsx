import React, { useState, useEffect } from 'react';
import { getProxiedImageUrl } from '../services/api';

interface ProductImageProps {
  productId?: string;
  image?: string;
  emoji?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  fallbackEmojiClassName?: string;
  loading?: 'lazy' | 'eager';
}

const KNOWN_PRESETS: Record<string, string> = {
  apple: '/products/apple.webp',
  apples: '/products/apple.webp',
  banana: '/products/banana.webp',
  bananas: '/products/banana.webp',
  orange: '/products/orange.webp',
  oranges: '/products/orange.webp',
  mango: '/products/mango.webp',
  mangoes: '/products/mango.webp',
  grapes: '/products/grapes.webp',
  grape: '/products/grapes.webp',
  watermelon: '/products/watermelon.webp',
  papaya: '/products/papaya.webp',
  pomegranate: '/products/pomegranate.webp',
  avocado: '/products/avocado.webp',
  pineapple: '/products/pineapple.webp',
  tomato: '/products/tomato.webp',
  tomatoes: '/products/tomato.webp',
  onion: '/products/onion.webp',
  onions: '/products/onion.webp',
  potato: '/products/potato.webp',
  potatoes: '/products/potato.webp',
  carrot: '/products/carrot.webp',
  carrots: '/products/carrot.webp',
  cucumber: '/products/cucumber.webp',
  ginger: '/products/ginger-garlic.webp',
  garlic: '/products/ginger-garlic.webp',
  chicken: '/products/chicken-broiler.webp',
  mutton: '/products/mutton-fresh.webp',
  beef: '/products/beef-fresh.webp',
  fish: '/products/fish-seer.webp',
  seer: '/products/fish-seer.webp',
  neymeen: '/products/fish-seer.webp',
  prawns: '/products/fish-prawns.webp',
  prawn: '/products/fish-prawns.webp',
  sardine: '/products/fish-sardine.webp',
  mathi: '/products/fish-sardine.webp',
  mackerel: '/products/fish-mackerel.webp',
  ayila: '/products/fish-mackerel.webp',
  milk: '/products/milk.webp',
  curd: '/products/curd.webp',
  paneer: '/products/paneer.webp',
  butter: '/products/butter.webp',
  eggs: '/products/eggs.webp',
  egg: '/products/eggs.webp',
  rice: '/products/rice.webp',
  atta: '/products/atta.webp',
  wheat: '/products/atta.webp',
  dal: '/products/toor-dal.webp',
  toor: '/products/toor-dal.webp',
  sugar: '/products/sugar.webp',
  tea: '/products/tea.webp',
  cashew: '/products/cashews.webp',
  cashews: '/products/cashews.webp',
  oil: '/products/coconut-oil.webp',
  coconut: '/products/coconut-oil.webp',
  turmeric: '/products/turmeric-powder.webp',
  chilli: '/products/chilli-powder.webp',
  bread: '/products/bread.webp',
  biscuit: '/products/biscuits.webp',
  biscuits: '/products/biscuits.webp',
  coffee: '/products/coffee.webp',
  kettle: '/products/electric-kettle.webp',
  mixer: '/products/mixer-grinder.webp',
  cooktop: '/products/induction-cooktop.webp',
  cooker: '/products/pressure-cooker.webp',
  tawa: '/products/dosa-tawa.webp',
  kadai: '/products/steel-kadai.webp',
  knife: '/products/knife-set.webp',
  detergent: '/products/detergent.webp',
  dishwash: '/products/dishwash.webp',
};

function matchPreset(keyOrName?: string): string | null {
  if (!keyOrName) return null;
  const lower = keyOrName.toLowerCase().trim();
  if (KNOWN_PRESETS[lower]) return KNOWN_PRESETS[lower];

  // Try token matches
  for (const [key, path] of Object.entries(KNOWN_PRESETS)) {
    if (lower.includes(key)) return path;
  }
  return null;
}

function resolveProductImageSrc(image?: string): string | null {
  if (!image || !image.trim()) return null;
  let trimmed = image.trim();
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
      <div className={`inline-flex items-center justify-center select-none max-w-full max-h-full ${className}`}>
        <span className={fallbackEmojiClassName}>{emoji}</span>
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
        className={`max-w-full max-h-full transition-all duration-200 ${imgClassName}`}
      />
    </div>
  );
};




