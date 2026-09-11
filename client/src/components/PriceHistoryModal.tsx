import React, { useEffect, useState } from 'react';
import { Product, PriceHistoryPoint } from '../types';
import { fetchProductHistory } from '../services/api';
import { X, TrendingDown, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface PriceHistoryModalProps {
  product: Product | null;
  onClose: () => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({ product, onClose }) => {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!product) return;
    setIsLoading(true);
    fetchProductHistory(product.id)
      .then((data) => {
        setHistory(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [product]);

  if (!product) return null;

  const validHistory = history.filter((h) => h.price > 0);
  const latestPrice = validHistory.length > 0 ? validHistory[validHistory.length - 1].price : 0;
  const oldestPrice = validHistory.length > 0 ? validHistory[0].price : latestPrice;
  const priceChange = latestPrice - oldestPrice;
  const isDrop = priceChange < 0;

  const minPrice = validHistory.length > 0 ? Math.min(...validHistory.map((h) => h.price)) : 0;
  const maxPrice = validHistory.length > 0 ? Math.max(...validHistory.map((h) => h.price)) : 0;

  // SVG Chart Dimensions
  const svgWidth = 480;
  const svgHeight = 180;
  const padding = 35;

  const chartPoints = validHistory.map((pt, i) => {
    const x = padding + (i / Math.max(validHistory.length - 1, 1)) * (svgWidth - padding * 2);
    const range = maxPrice - minPrice || 10;
    const y = svgHeight - padding - ((pt.price - minPrice) / range) * (svgHeight - padding * 2);
    return { x, y, ...pt };
  });

  const polylineStr = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-gray-100 relative max-h-[94dvh] sm:max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 shrink-0 p-1.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center">
            <ProductImage
              productId={product.id}
              image={product.image}
              emoji={product.emoji}
              alt={product.name}
              className="w-full h-full"
              imgClassName="w-full h-full object-contain"
              fallbackEmojiClassName="text-3xl"
            />
          </div>
          <div>
            <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">വില ട്രെൻഡ് • Price History</div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">{product.name}</h3>
            <span className="text-xs text-gray-500 font-semibold">
              കഴിഞ്ഞ 30 ദിവസത്തെ വിലനിലവാരം · {product.defaultUnit}
            </span>
          </div>
        </div>

        {/* Price Stats Cards */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-extrabold text-brand-800 tracking-wider block">
              ഇപ്പോഴത്തെ മികച്ച വില
            </span>
            <b className="text-xl font-black text-brand-900">₹{latestPrice}</b>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-extrabold text-gray-500 tracking-wider block">
              30 ദിവസത്തെ കുറഞ്ഞ വില
            </span>
            <b className="text-xl font-black text-slate-900">₹{minPrice}</b>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-extrabold text-gray-500 tracking-wider block">
              30 ദിവസത്തെ ഉയർന്ന വില
            </span>
            <b className="text-xl font-black text-slate-900">₹{maxPrice}</b>
          </div>
        </div>

        {/* Trend Indicator */}
        <div
          className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold mb-4 border ${
            isDrop
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {isDrop ? (
            <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>
            {isDrop
              ? `കഴിഞ്ഞ ഒരു മാസത്തിനിടെ വിലയിൽ ₹${Math.abs(priceChange)} കുറവുണ്ടായി. ഇപ്പോൾ വാങ്ങുന്നത് ലാഭകരമാണ്!`
              : `വിലയിൽ ചെറിയ വർദ്ധനവ് രേഖപ്പെടുത്തിയിട്ടുണ്ട് (+₹${priceChange}).`}
          </span>
        </div>

        {/* SVG Interactive Line Chart */}
        <div className="bg-[#fcfdfa] border border-gray-200 rounded-2xl p-3 relative overflow-hidden">
          <div className="text-[11px] font-bold text-gray-500 flex items-center gap-1 mb-1">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>കഴിഞ്ഞ 30 ദിവസങ്ങൾ (ആഴ്ച തിരിച്ചുള്ള വിവരങ്ങൾ)</span>
          </div>

          {isLoading ? (
            <div className="h-44 flex items-center justify-center text-xs text-gray-400">
              വില വിവരങ്ങൾ ലഭ്യമാക്കുന്നു...
            </div>
          ) : (
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 overflow-visible">
              {/* Background horizontal grid lines */}
              <line
                x1={padding}
                y1={padding}
                x2={svgWidth - padding}
                y2={padding}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <line
                x1={padding}
                y1={svgHeight - padding}
                x2={svgWidth - padding}
                y2={svgHeight - padding}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />

              {/* Connected Line */}
              <polyline
                fill="none"
                stroke="#249044"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />

              {/* Data points */}
              {chartPoints.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#249044" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className="text-[11px] font-extrabold fill-slate-800"
                  >
                    ₹{pt.price}
                  </text>
                  <text
                    x={pt.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className="text-[9px] font-semibold fill-gray-400"
                  >
                    {pt.date.slice(5)}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
            <span>Prices aggregated across local verified stores</span>
          </span>
          <button
            onClick={onClose}
            className="font-bold text-brand-700 hover:text-brand-900 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
