import React from 'react';
import { Home, Zap, Scale, ShoppingBag, User as UserIcon } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: 'home' | 'search' | 'compare' | 'cart' | 'orders' | 'profile' | 'deals') => void;
  basketCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  basketCount,
}) => {
  const navItems: Array<{
    id: 'home' | 'deals' | 'compare' | 'cart' | 'profile';
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
      id: 'deals',
      label: 'ഓഫറുകൾ',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: 'compare',
      label: 'കടകൾ',
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
      label: 'അക്കൗണ്ട്',
      icon: <UserIcon className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#E3ECE7] py-2 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] flex items-center justify-around font-malayalam select-none backdrop-blur-md">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-xl transition-all cursor-pointer relative ${
              isActive
                ? 'text-[#0D6344]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? 'scale-110 text-[#0D6344]' : 'text-slate-400'
                }`}
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: 'w-[20px] h-[20px]',
                })}
              </div>

              {/* Cart item badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#E11D48] text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-2xs font-sans">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            <span
              className={`text-[10px] tracking-tight mt-0.5 leading-none ${
                isActive ? 'text-[#0D6344] font-black' : 'text-slate-500 font-bold'
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
