import React from 'react';
import { Home, Search, ShoppingBag, ClipboardList, User as UserIcon, Scale } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: 'home' | 'search' | 'compare' | 'cart' | 'orders' | 'profile') => void;
  basketCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  basketCount,
}) => {
  const navItems: Array<{
    id: 'home' | 'search' | 'compare' | 'cart' | 'profile';
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'home',
      label: 'ഹോം',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'search',
      label: 'തിരയുക',
      icon: <Search className="w-5 h-5" />,
    },
    {
      id: 'compare',
      label: 'താരതമ്യം',
      icon: <Scale className="w-5 h-5" />,
    },
    {
      id: 'cart',
      label: 'കാർട്ട്',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: basketCount,
    },
    {
      id: 'profile',
      label: 'പ്രൊഫൈൽ',
      icon: <UserIcon className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F0F4F2] py-2 px-2 shadow-[0_-4px_20px_rgba(6,59,42,0.06)] flex items-center justify-around font-malayalam select-none">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
              isActive
                ? 'text-[#063B2A] font-extrabold'
                : 'text-[#8A9992] hover:text-[#2D3E35] font-medium'
            }`}
          >
            <div className="relative">
              <div
                className={`p-0.5 rounded-xl transition-transform ${
                  isActive ? 'scale-110 text-[#063B2A]' : 'text-[#8A9992]'
                }`}
              >
                {item.icon}
              </div>

              {/* Cart item badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#E11D48] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-2xs font-sans">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            <span
              className={`text-[10px] tracking-tight mt-1 leading-none ${
                isActive ? 'text-[#063B2A] font-black' : 'text-[#8A9992]'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
