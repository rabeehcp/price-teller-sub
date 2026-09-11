import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Location, Shop } from '../types';
import {
  MapPin,
  Store,
  Navigation,
  Star,
  Clock,
  Phone,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Route,
  Compass,
} from 'lucide-react';
import {
  getShopCoordinates,
  calculateRoadDistanceKm,
  fetchRoadRoute,
  sanitizeOriginCoords,
  getGoogleMapsNavigationUrl,
} from '../services/locationService';

interface NearbyShopsMapViewProps {
  shops: Shop[];
  currentLocation: Location | null;
  customerCoords?: { lat: number; lng: number; name?: string } | null;
  onSelectShop: (shopName: string) => void;
  onOpenShopCatalogue?: (shopName: string) => void;
}

export const NearbyShopsMapView: React.FC<NearbyShopsMapViewProps> = ({
  shops,
  currentLocation,
  customerCoords,
  onSelectShop,
  onOpenShopCatalogue,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedShopId, setSelectedShopId] = useState<string>(shops[0]?.id || '');
  const [roadData, setRoadData] = useState<
    Record<string, { km: number; mins: number; geometry?: [number, number][] }>
  >({});

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Sanitize origin coordinates (prevents 10,841 km distant errors)
  const { lat: centerLat, lng: centerLng, isLiveGps } = useMemo(() => {
    return sanitizeOriginCoords(customerCoords, currentLocation);
  }, [customerCoords, currentLocation]);

  // Derive distinct, stable coordinates for all shops
  const shopCoordinatesMap = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; locationName: string }>();
    shops.forEach((shop, idx) => {
      map.set(
        shop.id,
        getShopCoordinates(shop, currentLocation ? [currentLocation] : [], idx)
      );
    });
    return map;
  }, [shops, currentLocation]);

  // Compute and fetch exact turn-by-turn road route & driving distances for all shops
  useEffect(() => {
    let isCancelled = false;
    shops.forEach(async (shop, idx) => {
      const shopCoords =
        shopCoordinatesMap.get(shop.id) ||
        getShopCoordinates(shop, currentLocation ? [currentLocation] : [], idx);

      const routeInfo = await fetchRoadRoute(
        centerLat,
        centerLng,
        shopCoords.lat,
        shopCoords.lng
      );

      if (!isCancelled) {
        setRoadData((prev) => ({
          ...prev,
          [shop.id]: {
            km: routeInfo.distanceKm,
            mins: routeInfo.durationMins,
            geometry: routeInfo.geometry,
          },
        }));
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [shops, centerLat, centerLng, shopCoordinatesMap, currentLocation]);

  const getShopRoadKm = (shop: Shop): number => {
    if (roadData[shop.id]?.km) {
      return roadData[shop.id].km;
    }
    const coords = shopCoordinatesMap.get(shop.id) || { lat: centerLat, lng: centerLng };
    return calculateRoadDistanceKm(centerLat, centerLng, coords.lat, coords.lng);
  };

  const getShopDriveMins = (shop: Shop): number => {
    if (roadData[shop.id]?.mins) {
      return roadData[shop.id].mins;
    }
    const km = getShopRoadKm(shop);
    return Math.max(1, Math.round(km * 2.5));
  };

  const filteredShops = shops.filter((s) => {
    const matchesType =
      selectedType === 'all' ||
      s.shopType === selectedType ||
      (selectedType === 'supermarket' &&
        (s.shopType === 'supermarket' || s.shopType === 'quick_commerce')) ||
      (selectedType === 'local' && s.shopType === 'local_mart') ||
      (selectedType === 'organic' && s.shopType === 'organic');

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q));

    return matchesType && matchesSearch;
  });

  const activeShop = shops.find((s) => s.id === selectedShopId) || filteredShops[0] || shops[0];
  const activeShopCoords = activeShop
    ? shopCoordinatesMap.get(activeShop.id) || { lat: centerLat + 0.008, lng: centerLng + 0.008, locationName: '' }
    : { lat: centerLat + 0.008, lng: centerLng + 0.008, locationName: '' };

  // Initialize and update Leaflet Map
  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      if (!(window as any).L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      if (!isMounted || !mapContainerRef.current) return;
      const L = (window as any).L;

      if (!leafletMapRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;
      if (!map) return;

      // Clear existing markers & route lines
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // 1. User Location Starting Pin
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:26px;height:26px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 3px 12px rgba(37,99,235,0.6);animation:pulse 2s infinite;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;">
              📍
            </div>
            <div style="position:absolute;top:-28px;background:#0f172a;color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:12px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);">
              ${isLiveGps ? 'നിങ്ങളുടെ ലൈവ് ലൊക്കേഷൻ' : `${currentLocation?.name || 'ടൗൺ'} സെന്റർ`}
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const userMarker = L.marker([centerLat, centerLng], { icon: userIcon }).addTo(map);
      markersRef.current.push(userMarker);

      // 2. Shop Destination Markers
      shops.forEach((shop, index) => {
        const coords = shopCoordinatesMap.get(shop.id) || {
          lat: centerLat + (index % 2 === 0 ? 0.007 : -0.007) * (index + 1),
          lng: centerLng + (index % 3 === 0 ? 0.008 : -0.008) * (index + 1),
        };

        const isSelected = shop.id === selectedShopId;
        const shopIcon = L.divIcon({
          className: 'custom-shop-marker',
          html: `
            <div style="position:relative;cursor:pointer;">
              <div style="width:${isSelected ? '42px' : '32px'};height:${isSelected ? '42px' : '32px'};border-radius:50%;background:${isSelected ? '#15803d' : '#ffffff'};border:3px solid ${isSelected ? '#ffffff' : '#16a34a'};color:${isSelected ? '#ffffff' : '#16a34a'};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${isSelected ? '16px' : '12px'};box-shadow:0 4px 14px rgba(0,0,0,0.3);transition:all 0.2s;">
                🏪
              </div>
              <div style="position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:#ffffff;color:#0f172a;font-size:10px;font-weight:800;padding:2px 7px;border-radius:8px;white-space:nowrap;border:1px solid #cbd5e1;box-shadow:0 2px 6px rgba(0,0,0,0.18);">
                ${shop.name}
              </div>
            </div>
          `,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon: shopIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedShopId(shop.id);
        });

        markersRef.current.push(marker);
      });

      // 3. Draw Authentic Driving Road Route (Google Maps Turn-by-Turn Road Line)
      if (activeShop) {
        const coords = shopCoordinatesMap.get(activeShop.id) || { lat: centerLat + 0.008, lng: centerLng + 0.008 };
        const routeGeometry = roadData[activeShop.id]?.geometry;

        const routePoints = routeGeometry && routeGeometry.length > 1
          ? routeGeometry
          : [
              [centerLat, centerLng],
              [coords.lat, coords.lng],
            ];

        // Road route outer casing (Google Maps style dark blue shadow)
        const roadCasing = L.polyline(routePoints, {
          color: '#1e3a8a',
          weight: 7,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Road route main highlighted driving lane
        const roadLane = L.polyline(routePoints, {
          color: '#3b82f6',
          weight: 4,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        markersRef.current.push(roadCasing, roadLane);

        // Fit map bounds smoothly so user can see both start and shop destination
        try {
          const bounds = L.latLngBounds([
            [centerLat, centerLng],
            [coords.lat, coords.lng],
          ]);
          map.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: 16,
            animate: true,
          });
        } catch {}
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [centerLat, centerLng, shops, selectedShopId, shopCoordinatesMap, roadData, currentLocation, isLiveGps]);

  return (
    <div className="bg-white rounded-3xl border border-surface-border shadow-xs overflow-hidden font-sans">
      
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-surface-border bg-gradient-to-r from-brand-950 via-slate-900 to-brand-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h2 className="text-lg sm:text-xl font-black font-malayalam tracking-tight text-white flex items-center gap-2">
              സമീപസ്ഥ കടകൾ (Nearby Shops & Navigation)
            </h2>
          </div>
          <p className="text-xs text-brand-200/80 font-malayalam mt-0.5 flex items-center gap-1.5">
            <span>{currentLocation?.name || 'നിങ്ങളുടെ പ്രദേശം'} കേന്ദ്രീകരിച്ചുള്ള സൂപ്പർമാർക്കറ്റുകൾ</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">🛣️ യഥാർത്ഥ റോഡ് നാവിഗേഷൻ റൂട്ട് ലഭ്യമാണ്</span>
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="കടയുടെ പേര് തിരയുക..."
            className="w-full pl-9 pr-4 py-2 bg-white/10 hover:bg-white/15 focus:bg-white focus:text-slate-900 text-white placeholder-brand-200/60 rounded-xl text-xs outline-none border border-white/20 transition-all font-malayalam"
          />
        </div>
      </div>

      {/* Main Split Layout: Left List vs Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        
        {/* Left Column: Stores List */}
        <div className="lg:col-span-5 p-4 border-r border-surface-border flex flex-col justify-between bg-[#fbfdfa]">
          
          <div>
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar font-malayalam">
              {[
                { id: 'all', label: 'എല്ലാം' },
                { id: 'supermarket', label: 'സൂപ്പർമാർക്കറ്റ്' },
                { id: 'local', label: 'ഹൈപ്പർ' },
                { id: 'organic', label: 'മാർക്കറ്റ്' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedType === tab.id
                      ? 'bg-brand-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-gray-100 border border-surface-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Store List */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredShops.map((shop) => {
                const isSelected = shop.id === selectedShopId;
                const coords = shopCoordinatesMap.get(shop.id) || { lat: centerLat, lng: centerLng };
                const km = getShopRoadKm(shop);
                const mins = getShopDriveMins(shop);

                return (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-brand-50/70 border-brand-500 shadow-xs ring-1 ring-brand-500/20'
                        : 'bg-white border-surface-border hover:border-brand-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-2xs"
                        style={{ backgroundColor: shop.color || '#15803d' }}
                      >
                        {shop.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <b className="text-xs font-bold text-slate-900 truncate">{shop.name}</b>
                          {shop.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          <span className="font-bold text-blue-700 flex items-center gap-0.5">
                            🚗 {km} km റോഡ് ദൂരം (~{mins} മിനിറ്റ്)
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 font-bold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {shop.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <a
                        href={getGoogleMapsNavigationUrl(centerLat, centerLng, coords.lat, coords.lng, shop.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Google Maps-ൽ വഴി കാണുക"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200/60"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </a>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-brand-700' : 'text-gray-300'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-slate-500 font-malayalam">
            <span>{filteredShops.length} കടകൾ ലഭ്യമാണ്</span>
            <span className="font-bold text-brand-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              റോഡ് നാവിഗേഷൻ ആക്റ്റീവ്
            </span>
          </div>
        </div>

        {/* Right Column: Leaflet Map */}
        <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[560px] bg-slate-100 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full min-h-[380px] lg:min-h-[560px] z-0" />

          {/* Active Store Popover Floating Card */}
          {activeShop && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[420px] z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-blue-200/90 animate-in fade-in slide-in-from-bottom duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-2xs"
                    style={{ backgroundColor: activeShop.color || '#15803d' }}
                  >
                    {activeShop.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-slate-900">{activeShop.name}</h4>
                      {activeShop.isVerified && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {activeShop.address}
                    </p>
                  </div>
                </div>

                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold shrink-0">
                  🚗 {getShopRoadKm(activeShop)} km
                </span>
              </div>

              {/* Road & Driving Route Info */}
              <div className="mt-2.5 py-2 px-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <span className="font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  ഡ്രൈവിംഗ് സമയം: <b>~{getShopDriveMins(activeShop)} മിനിറ്റ്</b>
                </span>
                <span className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                  <Route className="w-3 h-3 text-blue-600" />
                  റോഡ് റൂട്ട് മാപ്പിൽ വരച്ചിരിക്കുന്നു
                </span>
              </div>

              {/* Actions: Google Maps Navigation & Details */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-100 text-xs">
                <a
                  href={getGoogleMapsNavigationUrl(
                    centerLat,
                    centerLng,
                    activeShopCoords.lat,
                    activeShopCoords.lng,
                    activeShop.name
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps-ൽ വഴി കാണുക</span>
                </a>

                <button
                  onClick={() =>
                    onOpenShopCatalogue
                      ? onOpenShopCatalogue(activeShop.name)
                      : onSelectShop(activeShop.name)
                  }
                  className="px-3.5 py-2 bg-brand-700 hover:bg-brand-800 active:scale-95 text-white font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer font-malayalam"
                >
                  വിശദാംശങ്ങൾ
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
