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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100/90 py-1.5 px-2 shadow-[0_-3px_16px_rgba(0,0,0,0.03)] flex items-center justify-around font-malayalam select-none backdrop-blur-md">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-0.5 px-1.5 rounded-lg transition-all cursor-pointer relative ${
              isActive
                ? 'text-[#064E3B]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-105 text-[#0B8F68]' : 'text-slate-400'
                }`}
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: 'w-[18px] h-[18px]',
                })}
              </div>

              {/* Cart item badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#E11D48] text-white text-[8.5px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-2xs font-sans">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            <span
              className={`text-[9.5px] tracking-tight mt-0.5 leading-none ${
                isActive ? 'text-[#064E3B] font-black' : 'text-slate-400 font-bold'
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
