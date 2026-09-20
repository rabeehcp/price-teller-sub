import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  CreditCard,
  Phone,
  MessageCircle,
  Share2,
  Copy,
  Check,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  Bell,
  RefreshCw,
  Info,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { Location, User } from '../types';

// ==========================================================
// 1. SAVED ADDRESSES MODAL (എന്റെ വിലാസങ്ങൾ)
// ==========================================================
export interface SavedAddress {
  id: string;
  tag: 'home' | 'work' | 'other';
  title: string;
  houseDetails: string;
  street: string;
  locality: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: User | null;
  currentLocation?: Location | null;
}

const STORAGE_KEY_ADDRESSES = 'priceteller_saved_addresses_v1';

export const ConsumerAddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  authUser,
  currentLocation,
}) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ADDRESSES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    // Default initial address from user profile or current location
    return [
      {
        id: 'default_1',
        tag: 'home',
        title: 'വീട് (Home)',
        houseDetails: 'ബൈത്തുൽ ഹംദ്, മെയിൻ റോഡ്',
        street: 'ടൗൺ ജംഗ്ഷൻ',
        locality: currentLocation?.name || 'തിരൂർ (Tirur)',
        pincode: '676101',
        phone: authUser?.phone || '9847000000',
        isDefault: true,
      },
    ];
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [tag, setTag] = useState<'home' | 'work' | 'other'>('home');
  const [title, setTitle] = useState('');
  const [houseDetails, setHouseDetails] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState(currentLocation?.name || '');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState(authUser?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ADDRESSES, JSON.stringify(addresses));
    } catch {}
  }, [addresses]);

  if (!isOpen) return null;

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseDetails.trim() || !locality.trim()) return;

    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      tag,
      title: title.trim() || (tag === 'home' ? 'വീട് (Home)' : tag === 'work' ? 'ഓഫീസ് (Work)' : 'മറ്റുള്ളവ (Other)'),
      houseDetails: houseDetails.trim(),
      street: street.trim(),
      locality: locality.trim(),
      pincode: pincode.trim(),
      phone: phone.trim() || authUser?.phone || '',
      isDefault: addresses.length === 0,
    };

    setAddresses((prev) => [...prev, newAddr]);
    setIsAddingNew(false);
    // Reset form
    setTitle('');
    setHouseDetails('');
    setStreet('');
    setPincode('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#E3ECE7]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063B2A] to-[#084D37] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-malayalam leading-tight">എന്റെ വിലാസങ്ങൾ</h3>
              <p className="text-xs text-emerald-200/80 font-sans">Saved Delivery & Contact Addresses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Kerala Grocery Note */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 px-4 py-2.5 flex items-start gap-2.5 text-xs text-[#0D4A36]">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <p className="m-0 leading-relaxed font-malayalam">
            <span className="font-bold">എന്താണ് ഇതിന്റെ ആവശ്യം?</span> പലചരക്ക് സാധനങ്ങൾ WhatsApp വഴി ഓർഡർ ചെയ്യുമ്പോഴും കടയിൽ നിന്ന് നേരിട്ട് ഹോം ഡെലിവറി ആവശ്യപ്പെടുമ്പോഴും ഈ വിലാസം കടക്കാർക്ക് ഒറ്റ ക്ലിക്കിൽ ഷെയർ ചെയ്യാം.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5">
          {savedSuccess && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold p-3 rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>വിലാസം വിജയകരമായി സൂക്ഷിച്ചു! (Address saved successfully)</span>
            </div>
          )}

          {!isAddingNew ? (
            <>
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold font-malayalam">വിലാസങ്ങൾ ഒന്നും ചേർത്തിട്ടില്ല</p>
                  <p className="text-xs text-gray-400">താഴെയുള്ള ബട്ടൺ ക്ലിക്ക് ചെയ്ത് വിലാസം ചേർക്കാം</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        addr.isDefault
                          ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20 shadow-xs'
                          : 'border-[#E3ECE7] bg-white hover:border-[#CBDCD2]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#E8F5EE] text-[#0D4A36] font-malayalam uppercase">
                            {addr.tag === 'home' ? 'വീട്' : addr.tag === 'work' ? 'ഓഫീസ്' : 'മറ്റുള്ളവ'}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 font-sans">{addr.title}</h4>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(addr.id)}
                              className="text-[11px] text-emerald-700 hover:underline font-bold px-1.5 py-0.5"
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="ഡിലീറ്റ് ചെയ്യുക"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 mt-2 font-sans leading-relaxed">
                        {addr.houseDetails}, {addr.street && `${addr.street}, `}
                        <span className="font-bold text-gray-900">{addr.locality}</span>
                        {addr.pincode && ` - ${addr.pincode}`}
                      </p>

                      {addr.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-mono">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{addr.phone}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-3 bg-[#0D4A36] hover:bg-[#084D37] text-white rounded-2xl text-xs sm:text-sm font-bold font-malayalam flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer mt-3"
              >
                <Plus className="w-4 h-4" />
                <span>പുതിയ വിലാസം ചേർക്കുക (Add Address)</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleSaveNewAddress} className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setTag('home')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    tag === 'home'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  വീട് (Home)
                </button>
                <button
                  type="button"
                  onClick={() => setTag('work')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    tag === 'work'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  ഓഫീസ് (Work)
                </button>
                <button
                  type="button"
                  onClick={() => setTag('other')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    tag === 'other'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  മറ്റുള്ളവ
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  വീട്ടുപേര് / നമ്പർ (House Name / Flat / Building) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ഉദാ: മദീന മൻസിൽ, ഡോർ നം 4/12"
                  value={houseDetails}
                  onChange={(e) => setHouseDetails(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  റോഡ് / ലാൻഡ്മാർക്ക് (Street / Landmark)
                </label>
                <input
                  type="text"
                  placeholder="ഉദാ: ജുമാ മസ്ജിദിന് സമീപം"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">സ്ഥലം (Locality / Town) *</label>
                  <input
                    type="text"
                    required
                    placeholder="തിരൂർ / കോട്ടക്കൽ"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">പിൻകോഡ് (Pincode)</label>
                  <input
                    type="text"
                    placeholder="676101"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">ഫോൺ നമ്പർ (Phone)</label>
                <input
                  type="tel"
                  placeholder="9847000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  റദ്ദാക്കുക (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  സേവ് ചെയ്യുക (Save)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// 2. PAYMENT OPTIONS MODAL (പണമിടപാട് രീതികൾ)
// ==========================================================
interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsumerPaymentsModal: React.FC<PaymentsModalProps> = ({ isOpen, onClose }) => {
  const [upiId, setUpiId] = useState(() => localStorage.getItem('priceteller_saved_upi') || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('priceteller_saved_upi', upiId.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#E3ECE7]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063B2A] to-[#084D37] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-malayalam leading-tight">പണമിടപാട് രീതികൾ</h3>
              <p className="text-xs text-emerald-200/80 font-sans">Local Grocery Payment Options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="m-0 leading-relaxed font-malayalam">
              <span className="font-bold">സുരക്ഷിതം & സുതാര്യം:</span> EnteBazaar-ൽ സാധനങ്ങൾ മുൻകൂട്ടി ബുക്ക് ചെയ്യുമ്പോൾ അഡ്വാൻസ് പണം ഈടാക്കുന്നില്ല. സാധനം കടയിൽ നിന്ന് പരിശോധിച്ചു വാങ്ങിയ ശേഷം മാത്രം പണം നൽകിയാൽ മതിയാകും.
            </p>
          </div>

          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sans">ലഭ്യമായ രീതികൾ</h4>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                💵
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-gray-900 font-malayalam">കടയിൽ വെച്ച് നേരിട്ട് പണം നൽകുക (Cash on Pickup)</h5>
                <p className="text-[11px] text-gray-600 font-malayalam mt-0.5">
                  സാധനങ്ങൾ എടുക്കാൻ കടയിൽ എത്തുമ്പോൾ നേരിട്ട് പണം നൽകാം.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm shrink-0">
                📱
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-gray-900 font-malayalam">Google Pay / PhonePe / BHIM UPI</h5>
                <p className="text-[11px] text-gray-600 font-malayalam mt-0.5">
                  എല്ലാ കടകളിലും കൗണ്ടറിൽ വെച്ച് UPI QR കോഡ് സ്കാൻ ചെയ്തു പണം നൽകാം.
                </p>
              </div>
            </div>
          </div>

          {/* Optional Saved UPI ID */}
          <form onSubmit={handleSaveUpi} className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 mb-1 font-malayalam">
              നിങ്ങളുടെ UPI ID (ഓപ്ഷണൽ - WhatsApp ഓർഡറുകൾക്ക്):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="example@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#0D4A36] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {saved ? 'സേവ് ചെയ്തു!' : 'സേവ്'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// 3. INVITE FRIENDS MODAL (കൂട്ടുകാരെ ക്ഷണിക്കുക)
// ==========================================================
interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsumerInviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://entebazaar.vercel.app';
  const shareText = `നിങ്ങളുടെ പ്രദേശത്തെ പലചരക്ക് സാധനങ്ങളുടെ ഏറ്റവും കുറഞ്ഞ വില അറിയാനും താരതമ്യം ചെയ്യാനും EnteBazaar ആപ്പ് ഉപയോഗിക്കൂ: ${shareUrl}`;

  const handleShareWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'EnteBazaar - Grocery Price Comparison',
          text: shareText,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleShareWhatsApp();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#E3ECE7]">
        {/* Top Graphic Card */}
        <div className="bg-gradient-to-br from-[#063B2A] via-[#084D37] to-[#04261B] text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-3xl bg-white/15 border border-white/20 text-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            🎁
          </div>
          <h3 className="text-lg sm:text-xl font-black font-malayalam">കൂട്ടുകാരെ ക്ഷണിക്കൂ!</h3>
          <p className="text-xs text-emerald-200 mt-1 max-w-xs mx-auto font-malayalam leading-relaxed">
            വീട്ടിലേക്ക് ആവശ്യമുള്ള സാധനങ്ങൾ കുറഞ്ഞ വിലയിൽ വാങ്ങാൻ കൂട്ടുകാർക്കും കുടുംബത്തിനും EnteBazaar പരിചയപ്പെടുത്തൂ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-5 space-y-3">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer font-malayalam text-sm"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp വഴി അയക്കുക</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-3 px-4 bg-[#0D4A36] hover:bg-[#084D37] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer font-malayalam text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>മറ്റു ആപ്പുകൾ വഴി ഷെയർ ചെയ്യുക</span>
          </button>

          {/* Copy Link box */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl mt-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-xs text-gray-600 bg-transparent outline-none font-mono px-1"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">കോപ്പി ചെയ്തു</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// 4. HELP & SUPPORT MODAL (സഹായം & പിന്തുണ)
// ==========================================================
interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: User | null;
}

export const ConsumerSupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, authUser }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'വിലകൾ എങ്ങനെയാണ് താരതമ്യം ചെയ്യുന്നത്?',
      a: 'മലപ്പുറത്തെ തിരൂർ, കോട്ടക്കൽ തുടങ്ങിയ പ്രധാന ഹബ്ബുകളിലെ കടക്കാരുടെ ലൈവ് കാറ്റലോഗ് പരിശോധിച്ച് ഓരോ പലചരക്ക് സാധനത്തിനും ഏറ്റവും കുറഞ്ഞ വില നൽകുന്ന കട ആപ്പ് നിങ്ങൾക്ക് കാണിച്ചുതരുന്നു.',
    },
    {
      q: 'പ്രീ-ബുക്കിംഗ് ചെയ്താൽ എപ്പോഴാണ് എടുക്കേണ്ടത്?',
      a: 'നിങ്ങൾ സാധനം ബുക്ക് ചെയ്യുമ്പോൾ കടയിലേക്ക് അലർട്ട് എത്തും. കടക്കാർ സാധനങ്ങൾ പാക്ക് ചെയ്തു റെഡിയാക്കുമ്പോൾ ആപ്പിൽ ഓർഡർ സ്റ്റാറ്റസ് "Confirmed" ആയി മാറും. അപ്പോൾ പോയി സാധനങ്ങൾ എടുക്കാം.',
    },
    {
      q: 'ഹോം ഡെലിവറി ലഭ്യമാണോ?',
      a: 'നിങ്ങളുടെ അടുത്തുള്ള കടകളിലേക്ക് "Chat with Shops" അല്ലെങ്കിൽ WhatsApp വഴി നേരിട്ട് ബന്ധപ്പെട്ട് ഡെലിവറി ആവശ്യപ്പെടാം.',
    },
    {
      q: 'കടക്കാർ പുതിയ വിലകൾ എപ്പോഴാണ് ചേർക്കുന്നത്?',
      a: 'ദിവസേന രാവിലെ 8 മണി മുതൽ കടക്കാർ പുതിയ സ്റ്റോക്കുകളുടെയും പച്ചക്കറികളുടെയും വില അപ്ഡേറ്റ് ചെയ്യുന്നു.',
    },
  ];

  const handleOpenWhatsAppSupport = () => {
    const userNote = authUser ? ` (User: ${authUser.name || authUser.email})` : '';
    const text = `ഹലോ EnteBazaar സപ്പോർട്ട്, എനിക്ക് ആപ്പിൽ ഒരു സഹായം വേണമായിരുന്നു${userNote}`;
    window.open(`https://wa.me/919847000000?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#E3ECE7]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063B2A] to-[#084D37] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-malayalam leading-tight">സഹായം & പിന്തുണ</h3>
              <p className="text-xs text-emerald-200/80 font-sans">Customer Support & FAQs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Direct WhatsApp Helpline card */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-[#0D4A36] font-malayalam">നേരിട്ട് ചാറ്റ് ചെയ്യാം</h4>
              <p className="text-xs text-emerald-800 font-malayalam mt-0.5">
                എന്തെങ്കിലും സംശയങ്ങളോ പരാതികളോ ഉണ്ടെങ്കിൽ WhatsApp-ൽ മെസ്സേജ് അയക്കാം.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenWhatsAppSupport}
              className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* FAQs */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 font-sans">
              പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ (FAQ)
            </h4>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-3 text-left font-bold text-xs sm:text-sm text-gray-800 flex items-center justify-between gap-2 font-malayalam hover:bg-gray-50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="p-3 pt-0 text-xs text-gray-600 font-malayalam leading-relaxed border-t border-gray-100 bg-gray-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Send Feedback form */}
          <form onSubmit={handleSubmitFeedback} className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 font-malayalam mb-1">ആപ്പ് മെച്ചപ്പെടുത്താൻ അഭിപ്രായങ്ങൾ അറിയിക്കൂ:</h4>
            {feedbackSent ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-bold font-malayalam flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>നിങ്ങളുടെ വിലയേറിയ അഭിപ്രായത്തിന് നന്ദി!</span>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="നിങ്ങളുടെ നിർദ്ദേശങ്ങൾ ഇവിടെ എഴുതുക..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 font-sans"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#0D4A36] text-white rounded-xl text-xs font-bold font-malayalam flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>അഭിപ്രായം അയക്കുക</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// 5. SETTINGS MODAL (ക്രമീകരണങ്ങൾ)
// ==========================================================
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: Location | null;
  onOpenLocationModal?: () => void;
}

export const ConsumerSettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onOpenLocationModal,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [flashDealAlerts, setFlashDealAlerts] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    try {
      localStorage.removeItem('priceteller_cached_shops');
      localStorage.removeItem('priceteller_cached_products');
      sessionStorage.removeItem('priceteller_session_basket_v1');
    } catch {}
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#E3ECE7]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063B2A] to-[#084D37] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-malayalam leading-tight">Settings (ക്രമീകരണങ്ങൾ)</h3>
              <p className="text-xs text-emerald-200/80 font-sans">App Preferences & Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Current Location / Hub */}
          <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase font-sans">തിരഞ്ഞെടുത്ത പ്രദേശം (Current Hub)</span>
              <p className="text-sm font-black text-gray-900 font-malayalam mt-0.5">
                {currentLocation?.name || 'മലപ്പുറം (Malappuram)'}
              </p>
            </div>
            {onOpenLocationModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLocationModal();
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold font-malayalam cursor-pointer"
              >
                മാറ്റുക
              </button>
            )}
          </div>

          {/* Notifications toggles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sans">അറിയിപ്പുകൾ (Notifications)</h4>
            
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-gray-800 font-malayalam">വിലക്കുറവ് അറിയിപ്പുകൾ</h5>
                <p className="text-[11px] text-gray-500 font-malayalam">പ്രധാന സാധനങ്ങൾക്ക് വില കുറയുമ്പോൾ അറിയുക</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-gray-800 font-malayalam">ഫ്ലാഷ് ഡീലുകൾ (Flash Deals)</h5>
                <p className="text-[11px] text-gray-500 font-malayalam">സമീപത്തെ കടകളിലെ ഓഫറുകൾ</p>
              </div>
              <input
                type="checkbox"
                checked={flashDealAlerts}
                onChange={(e) => setFlashDealAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Cache & Data management */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sans">ഡാറ്റാ മാനേജ്മെന്റ്</h4>
            
            {cacheCleared && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-bold font-malayalam">
                താൽക്കാലിക ഫയലുകൾ ക്ലിയർ ചെയ്തു! (Cache Cleared)
              </div>
            )}

            <button
              type="button"
              onClick={handleClearCache}
              className="w-full py-2.5 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold font-malayalam flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ആപ്പ് കാഷെ ക്ലിയർ ചെയ്യുക (Clear Cache)</span>
            </button>
          </div>

          {/* App Info footer */}
          <div className="text-center pt-3 text-[11px] text-gray-400 font-sans border-t border-gray-100">
            <p className="font-bold text-gray-600">EnteBazaar (PriceTeller) v2.4.0</p>
            <p className="mt-0.5">കേരളത്തിലെ മികച്ച പലചരക്ക് വില താരതമ്യ പ്ലാറ്റ്‌ഫോം</p>
          </div>
        </div>
      </div>
    </div>
  );
};
