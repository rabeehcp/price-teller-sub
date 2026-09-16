import React, { useState } from 'react';
import { MapPin, Navigation, X, Search, Check } from 'lucide-react';
import { Location } from '../types';

interface MobileLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllowLocation: () => void;
  isDetecting?: boolean;
  locations?: Location[];
  currentLocation?: Location | null;
  onSelectLocation?: (loc: Location) => void;
}

export const MobileLocationModal: React.FC<MobileLocationModalProps> = ({
  isOpen,
  onClose,
  onAllowLocation,
  isDetecting = false,
  locations = [],
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLocations = locations.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      loc.name.toLowerCase().includes(q) ||
      (loc.subArea && loc.subArea.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 font-sans max-h-[90dvh] flex flex-col">
        
        {/* Close Button & Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#0B8F68]" />
            </div>
            <span className="text-sm font-black text-slate-900 font-malayalam">
              പ്രദേശം തിരഞ്ഞെടുക്കുക
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="py-2 shrink-0">
          <button
            onClick={onAllowLocation}
            disabled={isDetecting}
            className="w-full py-2.5 px-4 bg-[#E8F5EE] hover:bg-[#D4EEDE] text-[#064E3B] text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam border border-[#BBD8C8]"
          >
            <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'സ്ഥാനം കണ്ടെത്തുന്നു...' : 'എന്റെ ലൊക്കേഷൻ കണ്ടെത്തുക (GPS)'}</span>
          </button>
        </div>

        {/* Search Bar for Locations */}
        <div className="relative my-1 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="സ്ഥലം തിരയുക / Search town (e.g. Manjeri, Tirur)..."
            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0B8F68] rounded-xl pl-8.5 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all font-malayalam"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Locations List */}
        {locations.length > 0 && onSelectLocation && (
          <div className="flex-1 overflow-y-auto min-h-0 space-y-1 py-1 mt-1">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-malayalam">
                &ldquo;{searchQuery}&rdquo; എന്ന പേരിൽ സ്ഥലം കണ്ടെത്താനായില്ല.
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = currentLocation?.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                        : 'bg-slate-50/80 hover:bg-[#E8F5EE] text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate">{loc.name}</div>
                      {loc.subArea && (
                        <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {loc.subArea}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-white ml-2" />}
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
