import React from 'react';
import { X, Smartphone, Share2, PlusSquare, Download, CheckCircle2, Monitor } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIos: boolean;
  isAndroid: boolean;
  canInstallDirectly: boolean;
  onTriggerInstall: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  isIos,
  isAndroid,
  canInstallDirectly,
  onTriggerInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#D5E5DC] relative animate-in zoom-in-95 duration-200 text-[#17221D] font-sans"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <img
            src="/pwa-192x192.png"
            alt="EnteBazaar Logo"
            className="w-14 h-14 rounded-2xl shadow-md border border-[#E3ECE7] object-cover shrink-0"
          />
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0B3D2D] leading-tight font-malayalam">
              EnteBazaar ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക
            </h3>
            <p className="text-xs text-[#526B60] font-medium mt-0.5">
              Install EnteBazaar on your device
            </p>
          </div>
        </div>

        {/* Value Proposition Pills */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-[#E8F5EE] rounded-xl p-2.5 text-center">
            <span className="block text-xs font-bold text-[#0D4A36] font-malayalam">⚡ അതിവേഗം തുറക്കൂ</span>
            <span className="text-[10px] text-[#4A6458]">Instant access</span>
          </div>
          <div className="bg-[#E8F5EE] rounded-xl p-2.5 text-center">
            <span className="block text-xs font-bold text-[#0D4A36] font-malayalam">📦 വില താരതമ്യം</span>
            <span className="text-[10px] text-[#4A6458]">Best local rates</span>
          </div>
        </div>

        {/* Direct One-Click Install Button if supported */}
        {canInstallDirectly && (
          <div className="mb-5">
            <button
              type="button"
              onClick={() => {
                onTriggerInstall();
                onClose();
              }}
              className="w-full py-3 px-4 bg-[#0D4A36] hover:bg-[#073626] active:scale-98 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-malayalam text-sm sm:text-base"
            >
              <Download className="w-5 h-5 shrink-0" />
              <span>ഇപ്പോൾ ഇൻസ്റ്റാൾ ചെയ്യുക (Install Now)</span>
            </button>
            <div className="text-center mt-2 text-[11px] text-gray-400">അല്ലെങ്കിൽ താഴെയുള്ള ഘട്ടങ്ങൾ പാലിക്കുക</div>
          </div>
        )}

        {/* Instructions by Platform */}
        {isIos ? (
          /* iOS Safari Guide */
          <div className="space-y-3 bg-[#F4F8F5] rounded-2xl p-4 border border-[#DCEFE5]">
            <div className="text-xs font-black text-[#0D4A36] flex items-center gap-1.5 font-malayalam">
              <Smartphone className="w-4 h-4 text-[#0D4A36]" />
              <span>iPhone / iPad-ൽ ഇൻസ്റ്റാൾ ചെയ്യാനുള്ള വഴികൾ:</span>
            </div>

            <ol className="space-y-2.5 text-xs text-[#2C4238] font-malayalam">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D4A36] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Safari ബ്രൗസറിന്റെ താഴെയുള്ള <strong>Share</strong> ചിഹ്നത്തിൽ (<Share2 className="inline w-3.5 h-3.5 text-[#0D4A36] -mt-0.5" />) അമർത്തുക.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D4A36] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  താഴേക്ക് സ്ക്രോൾ ചെയ്ത് <strong>'Add to Home Screen'</strong> (<PlusSquare className="inline w-3.5 h-3.5 text-[#0D4A36] -mt-0.5" />) തിരഞ്ഞെടുക്കുക.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D4A36] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  മുകളിൽ വലതുവശത്തുള്ള <strong>'Add'</strong> അമർത്തുക. ആപ്പ് നിങ്ങളുടെ ഹോം സ്ക്രീനിൽ റെഡിയാകും!
                </span>
              </li>
            </ol>
          </div>
        ) : isAndroid ? (
          /* Android Chrome / Edge Guide */
          <div className="space-y-3 bg-[#F4F8F5] rounded-2xl p-4 border border-[#DCEFE5]">
            <div className="text-xs font-black text-[#0D4A36] flex items-center gap-1.5 font-malayalam">
              <Smartphone className="w-4 h-4 text-[#0D4A36]" />
              <span>Android ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്യാനുള്ള വഴികൾ:</span>
            </div>

            <ol className="space-y-2.5 text-xs text-[#2C4238] font-malayalam">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D4A36] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  ബ്രൗസറിന്റെ മുകളിൽ വലതുഭാഗത്തുള്ള <strong>മൂന്ന് ഡോട്ടുകൾ (⋮)</strong> അമർത്തുക.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D4A36] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>'Install app'</strong> അല്ലെങ്കിൽ <strong>'Add to Home screen'</strong> തിരഞ്ഞെടുക്കുക.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D4A36] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>'Install'</strong> കൺഫേം ചെയ്യുക. EnteBazaar ആപ്പ് നിങ്ങളുടെ ഫോണിൽ ഇൻസ്റ്റാൾ ആകും!
                </span>
              </li>
            </ol>
          </div>
        ) : (
          /* Desktop (Chrome / Edge / Windows / Mac) Guide */
          <div className="space-y-3 bg-[#F4F8F5] rounded-2xl p-4 border border-[#DCEFE5]">
            <div className="text-xs font-black text-[#0D4A36] flex items-center gap-1.5 font-malayalam">
              <Monitor className="w-4 h-4 text-[#0D4A36]" />
              <span>കമ്പ്യൂട്ടറിൽ (Laptop / Desktop) ഇൻസ്റ്റാൾ ചെയ്യാൻ:</span>
            </div>

            <ol className="space-y-2.5 text-xs text-[#2C4238] font-malayalam">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D4A36] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  ബ്രൗസറിന്റെ അഡ്രസ്സ് ബാറിൽ വലതുവശത്തുള്ള <strong>Install ചിഹ്നത്തിൽ (⊕ അല്ലെങ്കിൽ 💻)</strong> ക്ലിക്ക് ചെയ്യുക.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D4A36] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  അല്ലെങ്കിൽ ബ്രൗസർ മെനു (⋮) തുറന്ന് <strong>'Install EnteBazaar'</strong> ക്ലിക്ക് ചെയ്യുക.
                </span>
              </li>
            </ol>
          </div>
        )}

        {/* Done / Close Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#E8F5EE] hover:bg-[#D4EEDE] text-[#0D4A36] font-bold rounded-xl transition-colors cursor-pointer text-xs sm:text-sm font-malayalam"
          >
            ശരി, മനസ്സിലായി (Got It)
          </button>
        </div>
      </div>
    </div>
  );
};
