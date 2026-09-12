import React from 'react';
import { Location, User } from '../types';
import {
  Store,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MapPin,
  TrendingDown,
  ShoppingBag,
  Percent,
} from 'lucide-react';

interface MalayalamOpeningPageProps {
  locations: Location[];
  currentLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  onEnterAsConsumer: () => void;
  onOpenConsumerLogin?: () => void;
  onOpenMerchantPortal: () => void;
  onOpenShopCatalogue?: (shopName?: string) => void;
  authUser?: User | null;
  onLogout?: () => void;
}

export const MalayalamOpeningPage: React.FC<MalayalamOpeningPageProps> = ({
  locations,
  currentLocation,
  onSelectLocation,
  onEnterAsConsumer,
  onOpenConsumerLogin,
  onOpenMerchantPortal,
  onOpenShopCatalogue,
  authUser,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-surface-bg text-slate-dark flex flex-col justify-between selection:bg-brand-500 selection:text-white font-sans">
      {/* Top Header Navigation */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-surface-border sticky top-0 z-30 px-3 sm:px-8 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-900 text-brand-300 flex items-center justify-center text-base sm:text-xl shadow-xs">
              🛒
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-dark">
                  Price<span className="text-brand-600">Teller</span>
                </span>
                <span className="font-malayalam text-[9px] sm:text-xs font-bold text-brand-800 bg-brand-50 border border-brand-200 px-1.5 sm:px-2 py-0.2 rounded-full">
                  കേരളം
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {onOpenShopCatalogue && (
              <button
                onClick={() => onOpenShopCatalogue()}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-900 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-2xs font-malayalam"
                title="കടകളുടെ വിലനിലവാരം കാണുക"
              >
                <Store className="w-3.5 h-3.5 text-brand-700" />
                <span>കടകളുടെ വിലനിലവാരം</span>
              </button>
            )}

            <button
              onClick={onOpenMerchantPortal}
              className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-body hover:text-brand-700 bg-white hover:bg-surface-subtle border border-surface-border px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer shadow-2xs font-malayalam"
            >
              <Store className="w-3.5 h-3.5 text-slate-muted" />
              <span>വ്യാപാരികൾക്കായി</span>
            </button>

            {authUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onEnterAsConsumer}
                  className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-[11px] sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer font-malayalam"
                >
                  <span>കടകളിലേക്ക്</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-surface-border px-2.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer font-malayalam"
                    title="ലോഗൗട്ട്"
                  >
                    <span>ലോഗൗട്ട്</span>
                  </button>
                )}
              </div>
            ) : (
              onOpenConsumerLogin && (
                <button
                  onClick={onOpenConsumerLogin}
                  className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-[11px] sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer font-malayalam"
                >
                  <span>പ്രവേശിക്കുക</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-6 flex flex-col justify-center">
        
        {/* Modern Kerala Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-forest-900 text-white p-3.5 sm:p-8 lg:p-10 shadow-xl border border-brand-800/60 mb-2.5 sm:mb-4">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center">
            
            {/* Left Headline & Action */}
            <div className="lg:col-span-7 space-y-2.5 sm:space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-800/80 border border-brand-700/60 text-brand-200 text-[10px] sm:text-xs font-bold font-malayalam shadow-2xs">
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span>തത്സമയ സൂപ്പർമാർക്കറ്റ് വിലനിലവാരം</span>
              </div>

              <h1 className="font-malayalam font-black text-xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.25] text-white">
                ഒരേ സാധനത്തിന് എവിടെയാണ് ഏറ്റവും കുറഞ്ഞ വില?
              </h1>

              <p className="font-malayalam text-xs sm:text-sm text-brand-100/90 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                നിങ്ങളുടെ പ്രദേശത്തെ സൂപ്പർമാർക്കറ്റുകളിലെ നിത്യോപയോഗ സാധനങ്ങളുടെ യഥാർത്ഥ വിലകൾ തത്സമയം താരതമ്യം ചെയ്ത് കൂടുതൽ ലാഭിക്കാം.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                <button
                  onClick={onOpenConsumerLogin || onEnterAsConsumer}
                  className="px-4 py-2 sm:px-6 sm:py-3.5 bg-brand-500 hover:bg-brand-400 active:scale-95 text-brand-950 font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer font-malayalam"
                >
                  <span>തുടങ്ങാം</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onOpenShopCatalogue && (
                  <button
                    onClick={() => onOpenShopCatalogue()}
                    className="px-3.5 py-2 sm:px-5 sm:py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer font-malayalam"
                  >
                    <span>കൂടുതൽ വിവരങ്ങൾ</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Live Comparison Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-slate-dark shadow-2xl border border-white/30 space-y-2 font-malayalam">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🍌</span>
                    <div>
                      <b className="text-xs font-black block leading-tight">നേന്ത്രപ്പഴം (ഏത്തക്ക)</b>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        1 കിലോഗ്രാം • {currentLocation?.name || 'പ്രാദേശിക'} വിപണി
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.2 rounded-full">
                    ഇന്ന് 24% ലാഭം!
                  </span>
                </div>

                {/* Sample Live Store Comparison List */}
                <div className="space-y-1.5">
                  <div className="p-2 bg-brand-50/70 border border-brand-600 rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        🏪
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <b className="text-xs text-slate-dark truncate">ഫ്രഷ്മാർട്ട് (FreshMart)</b>
                          <span className="text-[8px] font-black bg-brand-600 text-white px-1 py-0.2 rounded">
                            ഏറ്റവും കുറഞ്ഞത്
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-500">1.2 കി.മീ • സ്റ്റോക്കുണ്ട്</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-brand-700">₹79</span>
                      <span className="text-[9px] text-gray-400 block -mt-0.5">/കിലോ</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-black shrink-0">
                        🏬
                      </div>
                      <div className="min-w-0">
                        <b className="text-xs text-slate-dark truncate block">ലോക്കൽ സൂപ്പർമാർക്കറ്റ്</b>
                        <span className="text-[9px] text-gray-500">0.6 കി.മീ • സ്റ്റോക്കുണ്ട്</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-gray-700">₹89</span>
                      <span className="text-[9px] text-gray-400 block -mt-0.5">/കിലോ</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-black shrink-0">
                        🛒
                      </div>
                      <div className="min-w-0">
                        <b className="text-xs text-slate-dark truncate block">സിറ്റി ഹൈപ്പർമാർക്കറ്റ്</b>
                        <span className="text-[9px] text-gray-500">2.4 കി.മീ • സ്റ്റോക്കുണ്ട്</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-gray-700">₹94</span>
                      <span className="text-[9px] text-gray-400 block -mt-0.5">/കിലോ</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-brand-800">
                  <span>✨ 5 കടകളിൽ ലഭ്യമാണ്</span>
                  <span className="text-emerald-700">₹15 വരെ ലാഭിക്കാം</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Feature Badges in Standard Malayalam */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 font-malayalam">
          <div className="p-2 sm:p-2.5 bg-white border border-surface-border rounded-xl shadow-2xs flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
              ₹
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-dark block truncate">വില താരതമ്യം</span>
              <span className="text-[9px] text-slate-500 block truncate">തത്സമയ നിരക്കുകൾ</span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 bg-white border border-surface-border rounded-xl shadow-2xs flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-brand-700" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-dark block truncate">സമീപത്തെ കടകൾ</span>
              <span className="text-[9px] text-slate-500 block truncate">യഥാർത്ഥ റോഡ് ദൂരം</span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 bg-white border border-surface-border rounded-xl shadow-2xs flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-brand-700" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-dark block truncate">സ്മാർട്ട് ലാഭം</span>
              <span className="text-[9px] text-slate-500 block truncate">ബാസ്കറ്റ് ടോട്ടൽ ലാഭം</span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 bg-white border border-surface-border rounded-xl shadow-2xs flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-dark block truncate">100% വെരിഫൈഡ്</span>
              <span className="text-[9px] text-slate-500 block truncate">കൃത്യമായ വിലനിലവാരം</span>
            </div>
          </div>
        </div>

      </main>

      {/* Modern Clean Footer in Standard Malayalam */}
      <footer className="w-full bg-white border-t border-surface-border py-3 sm:py-4 px-4 text-xs text-slate-muted font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-dark text-xs">PriceTeller</span>
            <span>·</span>
            <span className="font-malayalam text-brand-800 font-semibold text-[11px] sm:text-xs">
              “വിലയറിയാം, വിവേകത്തോടെ വാങ്ങാം.”
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-medium text-slate-muted font-malayalam">
            <span>📍 അരീക്കോട്, തിരൂർ, മലപ്പുറം ഉൾപ്പെടെ കേരളത്തിലെ പ്രമുഖ സൂപ്പർമാർക്കറ്റുകൾ</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
