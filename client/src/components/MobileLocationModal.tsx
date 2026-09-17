import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, X, Search, Check, AlertTriangle } from 'lucide-react';
import { Location } from '../types';

export interface GpsDebugDetails {
  lat: number;
  lng: number;
  accuracyMeters: number | string;
  isFreshGps?: boolean;
  isAcceptableAccuracy?: boolean;
  statusText?: string;
  locality: string;
  townCity: string;
  district: string;
  displayName?: string;
}

interface MobileLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllowLocation: () => void;
  isDetecting?: boolean;
  gpsFeedback?: { text: string; isWarning?: boolean } | null;
  gpsDebugDetails?: GpsDebugDetails | null;
  locations?: Location[];
  currentLocation?: Location | null;
  onSelectLocation?: (loc: Location) => void;
}

export const MobileLocationModal: React.FC<MobileLocationModalProps> = ({
  isOpen,
  onClose,
  onAllowLocation,
  isDetecting = false,
  gpsFeedback,
  locations = [],
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = useMemo(() => {
    if (!locations || !Array.isArray(locations)) return [];
    if (!searchQuery.trim()) return locations;
    const q = searchQuery.toLowerCase().trim();
    return locations.filter((loc) => {
      if (!loc) return false;
      const nameMatch = loc.name ? loc.name.toLowerCase().includes(q) : false;
      const subAreaMatch = loc.subArea ? loc.subArea.toLowerCase().includes(q) : false;
      const idMatch = loc.id ? loc.id.toLowerCase().includes(q) : false;
      return nameMatch || subAreaMatch || idMatch;
    });
  }, [locations, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 font-sans max-h-[88dvh] flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
              <MapPin className="w-4 h-4 text-[#0B8F68]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 font-malayalam leading-tight m-0">
                പ്രദേശം തിരഞ്ഞെടുക്കുക
              </h3>
              <p className="text-[10px] text-slate-500 font-malayalam leading-tight m-0">
                സമീപത്തെ കടകളും മികച്ച വിലകളും കണ്ടെത്താൻ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="py-2.5 shrink-0 space-y-2">
          <button
            type="button"
            onClick={onAllowLocation}
            disabled={isDetecting}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#E8F5EE] via-[#D8F0E3] to-[#E8F5EE] hover:from-[#D4EEDE] hover:to-[#D4EEDE] text-[#064E3B] text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam border border-[#BBD8C8] shadow-2xs active:scale-98 disabled:opacity-60"
          >
            <Navigation className={`w-4 h-4 text-[#0B8F68] ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'സ്ഥാനം കണ്ടെത്തുന്നു (GPS)...' : 'എന്റെ സ്ഥലം സ്വയം കണ്ടെത്തുക (GPS)'}</span>
          </button>

          {/* User GPS Alert Banner */}
          {gpsFeedback && (
            <div className={`p-3 rounded-2xl text-xs font-bold font-malayalam flex items-start gap-2.5 shadow-2xs ${
              gpsFeedback.isWarning
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span className="leading-relaxed">{gpsFeedback.text}</span>
            </div>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="relative shrink-0 mb-2">
          <div className="relative flex items-center bg-slate-50 hover:bg-white focus-within:bg-white border border-slate-200 focus-within:border-[#0B8F68] focus-within:ring-2 focus-within:ring-[#0B8F68]/20 rounded-2xl transition-all shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="സ്ഥലം തിരയുക (ഉദാ: മഞ്ചേരി, തിരൂർ, അരീക്കോട്)..."
              className="w-full pl-10 pr-9 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 bg-transparent outline-none font-malayalam"
              autoFocus
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Popular Quick Town Selector Chips */}
        {!searchQuery && (
          <div className="py-1 shrink-0">
            <div className="text-[10px] font-bold text-slate-500 font-malayalam mb-1.5 flex items-center justify-between">
              <span>പ്രധാന മലപ്പുറം പട്ടണങ്ങൾ:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 font-malayalam">
              {['areekode', 'malappuram', 'manjeri', 'tirur', 'kottakkal', 'nilambur', 'kondotty', 'kizhisseri', 'perinthalmanna'].map((townId) => {
                const loc = (locations || []).find((l) => l && l.id === townId);
                if (!loc) return null;
                const isSelected = loc.id === currentLocation?.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      if (onSelectLocation) onSelectLocation(loc);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-[#0D4A36] text-white border-[#0D4A36] shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px]">📍</span>
                    <span>{loc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Locations List */}
        {locations.length > 0 && onSelectLocation && (
          <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 py-1 mt-1 font-malayalam pr-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between px-1">
              <span>എല്ലാ പ്രദേശങ്ങളും</span>
              <span className="font-mono text-slate-500">({filteredLocations.length})</span>
            </div>

            {filteredLocations.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-malayalam bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-2xl">🔍</div>
                <div className="font-bold text-slate-700">&ldquo;{searchQuery}&rdquo; എന്ന സ്ഥലം കണ്ടെത്താനായില്ല</div>
                <div className="text-[10px] text-slate-400">മറ്റൊരു സ്ഥലം തിരഞ്ഞു നോക്കൂ</div>
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = currentLocation?.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-2xl text-xs flex items-center justify-between transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#063B2A] text-white border-[#063B2A] font-black shadow-xs'
                        : 'bg-slate-50/80 hover:bg-[#E8F5EE] border-slate-100 hover:border-[#C3EEDC] text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-[#0B8F68]'
                      }`}>
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm truncate leading-snug">{loc.name}</div>
                        {loc.subArea && (
                          <div className={`text-[10px] truncate leading-tight ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                            {loc.subArea}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="shrink-0 bg-white/20 p-1 rounded-full text-white ml-2">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};
