import React, { useState } from 'react';
import { BasketItem, FullComparisonResponse } from '../types';
import { X, Copy, Check, Share2, Printer } from 'lucide-react';

interface WhatsAppExportModalProps {
  basketItems: BasketItem[];
  comparison: FullComparisonResponse | null;
  locationName: string;
  onClose: () => void;
}

export const WhatsAppExportModal: React.FC<WhatsAppExportModalProps> = ({
  basketItems,
  comparison,
  locationName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const bestShop = comparison?.shops[0];
  const dateStr = new Date().toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Generate formatted WhatsApp message text
  const generateWhatsAppMessage = (): string => {
    let msg = `🛒 *PriceTeller Smart Shopping List*\n`;
    msg += `📍 Location: ${locationName} · ${dateStr}\n`;
    if (bestShop) {
      msg += `🏆 Recommended Shop: *${bestShop.shopName}* (Lowest total: ₹${bestShop.total})\n`;
    }
    msg += `--------------------------------\n`;

    basketItems.forEach((item, idx) => {
      const prod = item.product;
      const multiplier = prod.unitMultiplier[item.selectedUnit] ?? 1;
      const minBase = Math.min(...Object.values(prod.prices));
      const lineCost = Math.round(minBase * multiplier) * item.quantity;
      msg += `[ ] ${prod.emoji} *${prod.name}*\n     Qty: ${item.quantity} × ${item.selectedUnit} (~₹${lineCost})\n`;
    });

    msg += `--------------------------------\n`;
    msg += `💰 *Est. Total: ₹${bestShop?.total || 0}*\n`;
    if (comparison && comparison.maxSavings > 0) {
      msg += `✨ Saved ₹${comparison.maxSavings} comparing across ${comparison.shops.length} shops!\n`;
    }
    msg += `\nShared via PriceTeller · Smart Basket Comparison`;
    return msg;
  };

  const messageText = generateWhatsAppMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-gray-100 relative max-h-[94dvh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">പങ്കുവെക്കുക • Share & Export</div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              ഷോപ്പിംഗ് ലിസ്റ്റ് ഷെയർ ചെയ്യാം
            </h3>
            <p className="text-xs text-gray-500 font-semibold">
              WhatsApp വഴി അയക്കാനും പ്രിന്റ് ചെയ്യാനും എളുപ്പമാണ്
            </p>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="bg-[#f8faf7] border border-gray-200 rounded-2xl p-4 my-4 font-mono text-xs text-slate-900 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
          {messageText}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="sm:col-span-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp-ൽ അയക്കുക (Share)</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'കോപ്പി ചെയ്തു!' : 'കോപ്പി ചെയ്യുക (Copy)'}</span>
          </button>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={handlePrint}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>പ്രിന്റ് ലിസ്റ്റ് (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
