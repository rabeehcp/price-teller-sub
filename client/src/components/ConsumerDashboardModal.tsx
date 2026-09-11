import React, { useState } from 'react';
import { User, ConsumerData, Product, ConsumerSavedList } from '../types';
import { ProductImage } from './ProductImage';
import {
  X,
  User as UserIcon,
  ShoppingBag,
  Heart,
  Clock,
  Trash2,
  Plus,
  ArrowRight,
  Mail,
  Phone,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ConsumerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  consumerData: ConsumerData | null;
  products: Product[];
  onLoadListIntoBasket: (list: ConsumerSavedList) => void;
  onDeleteList: (listId: string) => void;
  onAddFavoriteToBasket: (product: Product) => void;
  onRemoveFavorite: (productId: string) => void;
  onLogout: () => void;
  onOpenSaveCurrentBasketModal: () => void;
}

export const ConsumerDashboardModal: React.FC<ConsumerDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  consumerData,
  products,
  onLoadListIntoBasket,
  onDeleteList,
  onAddFavoriteToBasket,
  onRemoveFavorite,
  onLogout,
  onOpenSaveCurrentBasketModal,
}) => {
  const [activeTab, setActiveTab] = useState<'lists' | 'favorites' | 'history' | 'profile'>('lists');

  if (!isOpen) return null;

  const favoriteProducts = products.filter((p) =>
    consumerData?.favorites?.includes(p.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-surface-border overflow-hidden flex flex-col max-h-[92dvh]">
        
        {/* Modal Header & User Card */}
        <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-forest-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-800 text-brand-300 border border-brand-700 flex items-center justify-center text-xl sm:text-2xl font-black shadow-xs shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-bold text-white truncate">{user.name}</h2>
                <span className="bg-brand-800 text-brand-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-700 font-malayalam">
                  ഉപഭോക്താവ്
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-brand-100/80 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-3.5 h-3.5 opacity-75 shrink-0" />
                <span className="truncate">{user.email}</span>
                {user.phone && (
                  <>
                    <span>•</span>
                    <Phone className="w-3.5 h-3.5 opacity-75 shrink-0" />
                    <span>{user.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center font-malayalam">
            <div className="bg-white/10 rounded-xl py-1.5 px-2">
              <div className="text-sm sm:text-base font-black text-white font-sans">
                {consumerData?.savedLists?.length || 0}
              </div>
              <div className="text-[10px] text-brand-200 font-semibold">ലിസ്റ്റുകൾ</div>
            </div>

            <div className="bg-white/10 rounded-xl py-1.5 px-2">
              <div className="text-sm sm:text-base font-black text-white font-sans">
                {consumerData?.favorites?.length || 0}
              </div>
              <div className="text-[10px] text-brand-200 font-semibold">ഫേവറിറ്റുകൾ ❤️</div>
            </div>

            <div className="bg-white/10 rounded-xl py-1.5 px-2">
              <div className="text-sm sm:text-base font-black text-white font-sans">
                {consumerData?.tripHistory?.length || 0}
              </div>
              <div className="text-[10px] text-brand-200 font-semibold">ട്രിപ്പുകൾ</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-surface-subtle border-b border-surface-border px-3 sm:px-4 pt-2 gap-1 sm:gap-2 text-xs font-bold overflow-x-auto no-scrollbar shrink-0 font-malayalam">
          <button
            onClick={() => setActiveTab('lists')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'lists'
                ? 'border-brand-600 text-brand-700 font-black'
                : 'border-transparent text-slate-muted hover:text-slate-dark'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>സേവ് ചെയ്ത ലിസ്റ്റുകൾ ({consumerData?.savedLists?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'favorites'
                ? 'border-brand-600 text-brand-700 font-black'
                : 'border-transparent text-slate-muted hover:text-slate-dark'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>ഫേവറിറ്റുകൾ ({consumerData?.favorites?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'history'
                ? 'border-brand-600 text-brand-700 font-black'
                : 'border-transparent text-slate-muted hover:text-slate-dark'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>ട്രിപ്പ് ഹിസ്റ്ററി</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile'
                ? 'border-brand-600 text-brand-700 font-black'
                : 'border-transparent text-slate-muted hover:text-slate-dark'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>അക്കൗണ്ട് വിവരങ്ങൾ</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: SAVED LISTS */}
          {activeTab === 'lists' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-dark font-malayalam">സേവ് ചെയ്ത ലിസ്റ്റുകൾ</h3>
                  <p className="text-xs text-slate-muted font-malayalam">
                    നിങ്ങൾ സൂക്ഷിച്ച സ്ഥിരം ഷോപ്പിംഗ് ലിസ്റ്റുകൾ ഇവിടെ കാണാം.
                  </p>
                </div>

                <button
                  onClick={onOpenSaveCurrentBasketModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer font-malayalam"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ഈ ബാസ്ക്കറ്റ് സേവ് ചെയ്യുക</span>
                </button>
              </div>

              {(!consumerData?.savedLists || consumerData.savedLists.length === 0) ? (
                <div className="text-center py-10 bg-surface-subtle rounded-2xl border border-dashed border-surface-border">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-muted mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-dark font-malayalam">സേവ് ചെയ്ത ലിസ്റ്റുകൾ ഒന്നുമില്ല</p>
                  <p className="text-[11px] text-slate-muted mt-0.5 font-malayalam">ബാസ്ക്കറ്റിലെ സാധനങ്ങൾ പിന്നീട് ഉപയോഗിക്കാൻ സേവ് ചെയ്യാം.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {consumerData.savedLists.map((list) => (
                    <div
                      key={list.id}
                      className="p-3.5 bg-white border border-surface-border hover:border-brand-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <b className="text-sm font-bold text-slate-dark truncate font-malayalam">{list.name}</b>
                          <span className="text-[10px] bg-brand-50 text-brand-800 font-bold px-2 py-0.5 rounded-full font-sans">
                            {list.items.length} items
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-muted truncate mt-0.5 font-malayalam">
                          {list.items.map((it) => products.find((p) => p.id === it.productId)?.name || it.productId).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 font-malayalam">
                        <button
                          onClick={() => onLoadListIntoBasket(list)}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <span>ലോഡ് ചെയ്യുക</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteList(list.id)}
                          className="p-1.5 text-slate-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="ഡിലീറ്റ് ചെയ്യുക"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-3 font-malayalam">
              <div>
                <h3 className="text-sm font-bold text-slate-dark">പ്രിയപ്പെട്ട ഉൽപ്പന്നങ്ങൾ (Favorites ❤️)</h3>
                <p className="text-xs text-slate-muted">
                  നിങ്ങൾ ഫേവറിറ്റാക്കി വെച്ച ഉൽപ്പന്നങ്ങൾ ഒറ്റ ക്ലിക്കിൽ ബാസ്ക്കറ്റിൽ ചേർക്കാം.
                </p>
              </div>

              {favoriteProducts.length === 0 ? (
                <div className="text-center py-10 bg-surface-subtle rounded-2xl border border-dashed border-surface-border">
                  <Heart className="w-10 h-10 mx-auto text-slate-muted mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-dark">ഫേവറിറ്റുകൾ ഒന്നുമില്ല</p>
                  <p className="text-[11px] text-slate-muted mt-0.5">ഉൽപ്പന്ന കാർഡിലെ ❤️ ഐക്കൺ ടാപ്പ് ചെയ്ത് ഫേവറിറ്റാക്കാം.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {favoriteProducts.map((p) => {
                    const priceVals = Object.values(p.prices || {});
                    const minPrice = priceVals.length ? Math.min(...priceVals) : 0;
                    return (
                      <div
                        key={p.id}
                        className="p-3 bg-white border border-surface-border rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-surface-subtle p-1 border border-surface-border flex items-center justify-center shrink-0">
                            <ProductImage
                              productId={p.id}
                              image={p.image}
                              emoji={p.emoji}
                              alt={p.name}
                              className="w-full h-full"
                              imgClassName="w-full h-full object-contain"
                              fallbackEmojiClassName="text-base"
                            />
                          </div>
                          <div className="min-w-0">
                            <b className="text-xs font-bold text-slate-dark block truncate">{p.name}</b>
                            <span className="text-[10px] text-brand-700 font-bold font-sans">₹{minPrice} / {p.defaultUnit}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onAddFavoriteToBasket(p)}
                            className="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            title="ബാസ്ക്കറ്റിൽ ചേർക്കുക"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveFavorite(p.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="നീക്കം ചെയ്യുക"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRIP HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 font-malayalam">
              <div>
                <h3 className="text-sm font-bold text-slate-dark">ഷോപ്പിംഗ് ട്രിപ്പ് ചരിത്രം</h3>
                <p className="text-xs text-slate-muted">നിങ്ങൾ മുൻപ് പൂർത്തിയാക്കിയ താരതമ്യങ്ങളുടെ വിശദാംശങ്ങൾ.</p>
              </div>

              {(!consumerData?.tripHistory || consumerData.tripHistory.length === 0) ? (
                <div className="text-center py-10 bg-surface-subtle rounded-2xl border border-dashed border-surface-border">
                  <Clock className="w-10 h-10 mx-auto text-slate-muted mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-dark">മുൻകാല ട്രിപ്പുകൾ ലഭ്യമല്ല</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {consumerData.tripHistory.map((trip) => (
                    <div
                      key={trip.id}
                      className="p-3.5 bg-white border border-surface-border rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <b className="text-slate-dark block font-bold">{trip.shopName}</b>
                        <span className="text-slate-muted text-[11px] font-sans">{trip.date} • {trip.itemCount} items</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-brand-700 font-sans">₹{trip.totalAmount}</span>
                        {trip.totalSavings > 0 && (
                          <span className="text-[10px] text-emerald-700 block font-sans">Saved ₹{trip.totalSavings}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4 font-malayalam">
              <div>
                <h3 className="text-sm font-bold text-slate-dark">അക്കൗണ്ട് വിവരങ്ങൾ</h3>
                <p className="text-xs text-slate-muted">നിങ്ങളുടെ പ്രൊഫൈൽ വിവരങ്ങൾ.</p>
              </div>

              <div className="space-y-3 bg-surface-subtle p-4 rounded-2xl border border-surface-border text-xs">
                <div className="flex justify-between py-1 border-b border-surface-border">
                  <span className="text-slate-muted">പേര്:</span>
                  <b className="text-slate-dark">{user.name}</b>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border">
                  <span className="text-slate-muted">Email:</span>
                  <span className="text-slate-dark font-sans">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span className="text-slate-muted">Phone:</span>
                    <span className="text-slate-dark font-sans">{user.phone}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-muted">റോൾ:</span>
                  <span className="text-brand-800 font-bold uppercase font-sans">{user.role}</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>അക്കൗണ്ടിൽ നിന്ന് ലോഗൗട്ട് ചെയ്യുക</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
