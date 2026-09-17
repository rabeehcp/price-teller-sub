import React from 'react';
import { FullComparisonResponse } from '../types';
import { X, Award, Check } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface ItemizedMatrixModalProps {
  comparison: FullComparisonResponse | null;
  onClose: () => void;
}

export const ItemizedMatrixModal: React.FC<ItemizedMatrixModalProps> = ({
  comparison,
  onClose,
}) => {
  if (!comparison || comparison.itemizedMatrix.length === 0) return null;

  const shopNames = comparison.shops.map((s) => s.shopName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-gray-100 relative max-h-[94dvh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div>
            <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">ഇനം തിരിച്ചുള്ള വിലവിവരം • Price Matrix</div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              ഓരോ സാധനത്തിന്റെയും താരതമ്യ പട്ടിക
            </h3>
            <p className="text-xs text-gray-500 font-semibold">
              ബാസ്കറ്റിലെ ഓരോ സാധനത്തിനും സമീപത്തെ വിവിധ കടകളിലെ വിലവിവരം
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Table Matrix */}
        <div className="overflow-auto my-4 flex-1">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-slate-900">
                <th className="py-3 px-3 rounded-l-xl font-extrabold">സാധനം / അളവ് (Product & Qty)</th>
                {shopNames.map((name, i) => (
                  <th
                    key={name}
                    className={`py-3 px-3 text-center font-extrabold ${
                      i === 0 ? 'text-brand-800 bg-brand-50/70' : ''
                    }`}
                  >
                    <div className="truncate">{name}</div>
                    {i === 0 && (
                      <span className="inline-block text-[9px] bg-brand-700 text-white px-1.5 py-0.2 rounded-full font-bold">
                        ഏറ്റവും കുറഞ്ഞത്
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comparison.itemizedMatrix.map((row) => (
                <tr key={row.productId} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 shrink-0 p-0.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                        <ProductImage
                          productId={row.productId}
                          emoji={row.emoji}
                          alt={row.productName}
                          className="w-full h-full"
                          imgClassName="w-full h-full object-contain"
                          fallbackEmojiClassName="text-base"
                        />
                      </div>
                      <div>
                        <div className="font-bold">{row.productName}</div>
                        <div className="text-[10px] text-gray-500">
                          {row.quantity} × {row.unit}
                        </div>
                      </div>
                    </div>
                  </td>

                  {shopNames.map((name, i) => {
                    const priceInfo = row.pricesByShop[name];
                    if (!priceInfo) return <td key={name} className="py-3 px-3 text-center text-gray-400">-</td>;
                    const isOutOfStock = priceInfo.stockStatus === 'out_of_stock';
                    const isLowest = priceInfo.isLowest;

                    return (
                      <td
                        key={name}
                        className={`py-3 px-3 text-center ${
                          i === 0 ? 'bg-brand-50/30' : ''
                        }`}
                      >
                        {isOutOfStock ? (
                          <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                            🔴 സ്റ്റോക്കില്ല (Out of Stock)
                          </span>
                        ) : (
                          <>
                            <div
                              className={`inline-block px-2.5 py-1 rounded-xl font-extrabold ${
                                isLowest
                                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                  : 'text-slate-900'
                              }`}
                            >
                              ₹{Math.round(priceInfo.lineTotal)}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              ₹{Math.round(priceInfo.unitPrice)}/{row.unit}
                            </div>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50 text-slate-900 font-black text-sm">
                <td className="py-3.5 px-3">ആകെ തുക (Total Cost)</td>
                {comparison.shops.map((s, i) => (
                  <td
                    key={s.shopName}
                    className={`py-3.5 px-3 text-center ${
                      i === 0 ? 'text-emerald-800 bg-brand-50/70' : 'text-slate-900'
                    }`}
                  >
                    <div className="text-base font-black">₹{Math.round(s.total)}</div>
                    {i === 0 ? (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-0.5">
                        <Award className="w-3 h-3" /> മികച്ച വില (Best)
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-medium">
                        +₹{Math.round(s.differenceVsBest)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>ഹൈലൈറ്റ് ചെയ്ത ബോക്സുകൾ ആ ഇനത്തിന്റെ ഏറ്റവും കുറഞ്ഞ വിലയെ സൂചിപ്പിക്കുന്നു</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer transition-colors"
          >
            ശരി (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
