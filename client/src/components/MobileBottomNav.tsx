import React from 'react';
import { Home, MapPin, ShoppingBag, User as UserIcon, Store } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'shops' | 'map' | 'favorites' | 'orders' | 'profile';
  onSelectTab: (tab: 'home' | 'shops' | 'map' | 'favorites' | 'orders' | 'profile') => void;
  basketCount: number;
  onOpenBasket: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  basketCount,
  onOpenBasket,
  onOpenProfile,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-border py-1.5 px-3 shadow-[0_-4px_20px_rgba(6,59,42,0.04)] flex items-center justify-around font-malayalam select-none">
      
      {/* 1. Home Button */}
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'home'
            ? 'text-[#0B8F68] font-black scale-105'
            : 'text-slate-muted hover:text-slate-dark font-semibold'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-[#0B8F68] text-white shadow-xs' : 'hover:bg-[#DDF5EA]'}`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 leading-none">ഹോം</span>
      </button>

      {/* 2. Map Button */}
      <button
        type="button"
        onClick={() => onSelectTab('map')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'map'
            ? 'text-[#0B8F68] font-black scale-105'
            : 'text-slate-muted hover:text-slate-dark font-semibold'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'map' ? 'bg-[#0B8F68] text-white shadow-xs' : 'hover:bg-[#DDF5EA]'}`}>
          <MapPin className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 leading-none">മാപ്പ്</span>
      </button>

      {/* 3. Basket Button with badge */}
      <button
        type="button"
        onClick={onOpenBasket}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer text-slate-muted hover:text-slate-dark font-semibold relative"
      >
        <div className="p-1.5 rounded-xl relative hover:bg-[#DDF5EA] transition-colors">
          <ShoppingBag className="w-5 h-5 text-[#0B8F68]" />
          {basketCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#10A978] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50">
              {basketCount > 99 ? '99+' : basketCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 leading-none text-slate-dark font-bold">എന്റെ ബാസ്കറ്റ്</span>
      </button>

      {/* 4. Shops Directory Button */}
      <button
        type="button"
        onClick={() => onSelectTab('shops')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'shops'
            ? 'text-[#0B8F68] font-black scale-105'
            : 'text-slate-muted hover:text-slate-dark font-semibold'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'shops' ? 'bg-[#0B8F68] text-white shadow-xs' : 'hover:bg-[#DDF5EA]'}`}>
          <Store className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 leading-none">കടകൾ</span>
      </button>

      {/* 5. Profile Button */}
      <button
        type="button"
        onClick={onOpenProfile}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer text-slate-muted hover:text-slate-dark font-semibold"
      >
        <div className="p-1.5 rounded-xl hover:bg-[#DDF5EA] transition-colors">
          <UserIcon className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 leading-none">പ്രൊഫൈൽ</span>
      </button>

    </nav>
  );
};
