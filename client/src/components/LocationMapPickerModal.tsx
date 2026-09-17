import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Crosshair,
  Search,
  X,
  Check,
  Navigation,
  Globe,
  Loader2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Layers,
} from 'lucide-react';
import { reverseGeocode, searchAddressNominatim, requestBrowserGps } from '../services/locationService';

interface LocationMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coords: { lat: number; lng: number; address?: string; radiusKm?: number }) => void;
  initialLat?: number;
  initialLng?: number;
  initialRadiusKm?: number;
  initialAddress?: string;
  title?: string;
  subtitle?: string;
  isHubMode?: boolean; // If true, shows radius coverage adjuster
  confirmButtonText?: string;
}

export const LocationMapPickerModal: React.FC<LocationMapPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLat = 10.9155, // Default Kerala / Tirur
  initialLng = 75.9238,
  initialRadiusKm = 15,
  initialAddress = '',
  title = 'Pinpoint Exact Location on Map',
  subtitle = 'Click on the map, search a place, or use your live GPS to set the exact coordinates.',
  isHubMode = false,
  confirmButtonText = 'Save Coordinates',
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [zoom, setZoom] = useState<number>(14);
  const [radiusKm, setRadiusKm] = useState<number>(initialRadiusKm);
  const [address, setAddress] = useState<string>(initialAddress);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: number; lng: number }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      const validLat = initialLat && !isNaN(initialLat) ? Number(initialLat) : 10.9155;
      const validLng = initialLng && !isNaN(initialLng) ? Number(initialLng) : 75.9238;
      setLat(validLat);
      setLng(validLng);
      setRadiusKm(initialRadiusKm || 15);
      setAddress(initialAddress || '');
      setGpsError(null);
      setSearchResults([]);
    }
  }, [isOpen, initialLat, initialLng, initialRadiusKm, initialAddress]);

  // Dynamically load Leaflet for smooth native mapping
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadLeaflet = async () => {
      // Ensure Leaflet CSS is in document
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Ensure Leaflet JS is loaded
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Leaflet map library'));
          document.body.appendChild(script);
        });
      }

      if (!isMounted || !mapContainerRef.current) return;

      const L = (window as any).L;
      if (!L) return;

      // Initialize map instance if not already created
      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: zoom,
          zoomControl: false,
        });

        const primaryTileLayer = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            subdomains: 'abc',
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ).addTo(map);

        primaryTileLayer.on('tileerror', (error: any) => {
          if (error.tile) {
            const z = error.coords.z;
            const x = error.coords.x;
            const y = error.coords.y;
            error.tile.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
          }
        });

        // Custom pinpoint icon
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              width: 38px;
              height: 38px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #16a34a;
              color: white;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              font-size: 18px;
              transform: translate(-50%, -100%);
              cursor: grab;
            ">
              📍
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        // Add draggable marker
        const marker = L.marker([lat, lng], {
          icon: customIcon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', async (e: any) => {
          const pos = e.target.getLatLng();
          setLat(pos.lat);
          setLng(pos.lng);
          updateReverseAddress(pos.lat, pos.lng);
        });

        // Click anywhere to relocate marker
        map.on('click', async (e: any) => {
          const { lat: clickedLat, lng: clickedLng } = e.latlng;
          setLat(clickedLat);
          setLng(clickedLng);
          marker.setLatLng([clickedLat, clickedLng]);
          updateReverseAddress(clickedLat, clickedLng);
        });

        if (isHubMode) {
          const circle = L.circle([lat, lng], {
            color: '#16a34a',
            fillColor: '#22c55e',
            fillOpacity: 0.15,
            radius: radiusKm * 1000,
          }).addTo(map);
          circleRef.current = circle;
        }

        leafletMapRef.current = map;
        markerRef.current = marker;

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } else {
        leafletMapRef.current.setView([lat, lng], zoom);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        if (circleRef.current && isHubMode) {
          circleRef.current.setLatLng([lat, lng]);
          circleRef.current.setRadius(radiusKm * 1000);
        }
      }
    };

    loadLeaflet().catch((err) => {
      console.warn('Map loader warning:', err);
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, [isOpen]);

  // Update map view when coordinates or radius change
  useEffect(() => {
    if (leafletMapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      leafletMapRef.current.panTo([lat, lng]);
    }
    if (circleRef.current && isHubMode) {
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(radiusKm * 1000);
    }
  }, [lat, lng, radiusKm, isHubMode]);

  const updateReverseAddress = async (targetLat: number, targetLng: number) => {
    setIsGeocoding(true);
    try {
      const detected = await reverseGeocode(targetLat, targetLng);
      if (detected) {
        setAddress(detected);
      }
    } catch {}
    setIsGeocoding(false);
  };

  const handleUseCurrentLocation = () => {
    setGpsError(null);
    setIsDetectingGps(true);
    requestBrowserGps(
      (pos) => {
        const curLat = pos.lat;
        const curLng = pos.lng;
        setLat(curLat);
        setLng(curLng);
        setZoom(16);

        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([curLat, curLng], 16);
          markerRef.current.setLatLng([curLat, curLng]);
        }

        setIsDetectingGps(false);
        updateReverseAddress(curLat, curLng);
      },
      (errorMsg) => {
        setIsDetectingGps(false);
        setGpsError(errorMsg);
      }
    );
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    const results = await searchAddressNominatim(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectSearchResult = (result: { display_name: string; lat: number; lng: number }) => {
    setLat(result.lat);
    setLng(result.lng);
    setAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery('');
    setZoom(15);
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView([result.lat, result.lng], 15);
      markerRef.current.setLatLng([result.lat, result.lng]);
    }
  };

  const handleZoomIn = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
      setZoom(leafletMapRef.current.getZoom());
    }
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
      setZoom(leafletMapRef.current.getZoom());
    }
  };

  const handleConfirm = () => {
    onConfirm({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      address: address.trim(),
      radiusKm: isHubMode ? radiusKm : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E3ECE7] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E3ECE7] flex items-center justify-between bg-[#F5F8F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#DDF5EA] text-[#063B2A] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-[#0B8F68]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-dark leading-tight">{title}</h3>
              <p className="text-[11px] sm:text-xs text-[#66756E] font-medium">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar: Search & GPS Button */}
        <div className="p-3 sm:p-4 bg-white border-b border-[#E3ECE7] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search street, town, market, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold bg-transparent outline-none text-slate-dark placeholder-gray-400"
              />
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
              ) : (
                <button
                  type="submit"
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg shrink-0 cursor-pointer"
                >
                  Find
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-gray-100">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 transition-colors flex items-start gap-2 text-slate-dark"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Use Current GPS Location Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetectingGps}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
            title="Locate device coordinates automatically via GPS"
          >
            {isDetectingGps ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4 text-white" />
            )}
            <span>Use Current Location (GPS)</span>
          </button>
        </div>

        {/* GPS / Location Error Notice */}
        {gpsError && (
          <div className="mx-4 mt-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Interactive Map Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[300px] sm:min-h-[360px] z-10" />

          {/* Map Floating Tool Controls */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-2xl border border-gray-200 shadow-md">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Map Center Instruction Banner */}
          <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
            <div className="bg-slate-900/80 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-bold mx-auto w-fit shadow-lg flex items-center gap-1.5 pointer-events-auto">
              <span>👉 Click anywhere on map or drag marker to pinpoint</span>
            </div>
          </div>
        </div>

        {/* Hub Radius Slider (Only shown in Hub mode) */}
        {isHubMode && (
          <div className="px-5 py-3 bg-emerald-50/60 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left">
              <label className="block text-xs font-extrabold text-emerald-950">
                Hub Coverage Area Radius: <span className="text-emerald-700">{radiusKm} km</span>
              </label>
              <p className="text-[10px] text-emerald-800 font-medium">
                Customers within {radiusKm} km will be automatically connected to this hub.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-56">
              <span className="text-[10px] font-bold text-gray-500">5km</span>
              <input
                type="range"
                min={3}
                max={50}
                step={1}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-[10px] font-bold text-gray-500">50km</span>
            </div>
          </div>
        )}

        {/* Selected Coordinates & Address Summary Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                Selected GPS:
              </span>
              <span className="font-mono text-xs font-bold text-slate-dark bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </span>
              {isGeocoding && <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />}
            </div>

            <div className="mt-1">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Identified street address / landmark..."
                className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-2.5 py-1 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{confirmButtonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
