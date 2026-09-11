import React from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 font-sans max-h-[90dvh] overflow-y-auto">
        
        {/* Close Button */}
        <div className="flex justify-end -mt-1 -mr-1">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pin Graphic matching Screen 10 */}
        <div className="flex flex-col items-center text-center -mt-2">
          <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner mb-4 relative">
            <div className="absolute inset-2 rounded-full bg-emerald-100/50 animate-ping opacity-30" />
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <MapPin className="w-7 h-7 fill-white" />
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-900 font-malayalam tracking-tight mb-2">
            നിങ്ങളുടെ സ്ഥാനം അനുവദിക്കൂ
          </h3>

          <p className="text-xs text-slate-600 font-malayalam leading-relaxed px-4 mb-6">
            അടുത്തുള്ള കടകളുടെ വിലയും ദൂരവും കൃത്യമായി കാണാൻ നിങ്ങളുടെ സ്ഥാനം ഉപയോഗിക്കുന്നു.
          </p>
        </div>

        {/* Action Buttons matching Screen 10 */}
        <div className="space-y-2.5">
          <button
            onClick={onAllowLocation}
            disabled={isDetecting}
            className="w-full py-3.5 px-4 bg-[#064e3b] hover:bg-[#043d2e] active:scale-98 text-white text-sm font-black rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'സ്ഥാനം കണ്ടെത്തുന്നു...' : 'സ്ഥാനം അനുവദിക്കുക'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-transparent hover:bg-slate-50 active:scale-98 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 transition-all cursor-pointer font-malayalam"
          >
            <span>ഇപ്പോൾ വേണ്ട</span>
          </button>
        </div>

        {/* Quick Hub Chooser */}
        {locations.length > 0 && onSelectLocation && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-malayalam text-center">
              അല്ലെങ്കിൽ പ്രദേശം നേരിട്ട് തിരഞ്ഞെടുക്കുക:
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 max-h-32 overflow-y-auto no-scrollbar py-1">
              {locations.map((loc) => {
                const isSelected = currentLocation?.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {loc.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
