import React from 'react';
import { TrendingDown, Zap, Store, Sparkles } from 'lucide-react';

interface HeroProps {
  currentLocationName: string;
  totalProductsCount: number;
  totalShopsCount: number;
  userName?: string;
  onQuickAddPopular: () => void;
  onOpenShopCatalogue?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentLocationName,
  totalProductsCount,
  totalShopsCount,
  userName = 'സുഹൃത്തേ',
  onQuickAddPopular,
  onOpenShopCatalogue,
}) => {
  return (
    <section className="bg-[#063B2A] text-white rounded-3xl p-5 sm:p-6 mb-4 shadow-sm border border-[#0B8F68]/30 relative overflow-hidden transition-all font-sans">
      {/* Scenic Kerala Backwaters Background Artwork Overlay */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-20 pointer-events-none bg-no-repeat bg-right bg-contain" style={{
        backgroundImage: `radial-gradient(circle at 80% 50%, rgba(16, 169, 120, 0.25) 0%, transparent 60%)`
      }} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-2xl space-y-1.5">
          {/* Greeting from Reference Image */}
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white font-malayalam">
              ശുഭോദയം, {userName}!
            </h1>
          </div>

          <p className="text-[#DDF5EA] text-xs sm:text-sm font-semibold font-malayalam">
            നിങ്ങളുടെ പ്രദേശത്തെ മികച്ച വിലകൾ ഇവിടെ കാണാം ({currentLocationName})
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10 text-[#DDF5EA] text-[11px] sm:text-xs">
              <Store className="w-3.5 h-3.5 text-[#10A978] shrink-0" />
              <span><b>{totalShopsCount}</b> കടകൾ ലൈവ്</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10 text-[#DDF5EA] text-[11px] sm:text-xs font-malayalam">
              <TrendingDown className="w-3.5 h-3.5 text-[#10A978] shrink-0" />
              <span><b>28%</b> വരെ ലാഭം</span>
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 justify-center">
          <button
            onClick={onQuickAddPopular}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10A978] hover:bg-[#0B8F68] active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer font-malayalam"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>പ്രധാന സാധനങ്ങൾ ചേർക്കൂ (Quick Add)</span>
          </button>

          {onOpenShopCatalogue && (
            <button
              onClick={onOpenShopCatalogue}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer font-malayalam"
            >
              <Store className="w-3.5 h-3.5 text-[#DDF5EA]" />
              <span>കടകളുടെ വിലവിവരം കാണുക</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
