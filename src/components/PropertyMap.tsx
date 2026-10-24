import React, { useState } from 'react';
import { Property } from '../types';
import { Link } from 'react-router-dom';
import { formatCurrency, getCurrencySymbol } from '../utils/formatCurrency';
import { MapPin, Navigation, Building2, Train, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onSelectProperty?: (property: Property) => void;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty: externalSelected,
  onSelectProperty
}) => {
  const [activePin, setActivePin] = useState<Property | null>(externalSelected || null);

  const minLat = 12.89;
  const maxLat = 13.01;
  const minLng = 77.56;
  const maxLng = 77.75;

  const getCoordinates = (lat: number, lng: number) => {
    const y = ((maxLat - lat) / (maxLat - minLat)) * 80 + 10;
    const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
    return {
      top: `${Math.min(90, Math.max(10, y))}%`,
      left: `${Math.min(90, Math.max(10, x))}%`
    };
  };

  const handlePinClick = (p: Property) => {
    setActivePin(p);
    if (onSelectProperty) onSelectProperty(p);
  };

  return (
    <div className="relative w-full h-[600px] lg:h-full min-h-[500px] bg-[#eef2f6] rounded-3xl border border-slate-200 overflow-hidden shadow-inner flex flex-col justify-between">

      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <svg className="absolute inset-0 w-full h-full stroke-slate-300/70 stroke-[2] fill-none pointer-events-none">
        <path d="M 0 150 Q 300 200 800 120" />
        <path d="M 100 0 Q 250 400 350 800" />
        <path d="M 0 450 Q 400 380 900 520" />
        <path d="M 550 0 Q 600 300 700 800" />
      </svg>

      <div className="absolute top-[35%] left-[45%] pointer-events-none text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200">
          Koramangala Tech Hub
        </span>
      </div>
      <div className="absolute top-[20%] left-[55%] pointer-events-none text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200">
          Indiranagar 100ft
        </span>
      </div>
      <div className="absolute top-[65%] left-[52%] pointer-events-none text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200">
          HSR Sector 2
        </span>
      </div>
      <div className="absolute top-[25%] left-[80%] pointer-events-none text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200">
          Whitefield ITPL
        </span>
      </div>

      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-card border border-slate-200 text-xs font-bold text-slate-800">
        <Navigation className="w-4 h-4 text-brand-600 animate-pulse" />
        <span>Live Interactive Property Radar</span>
        <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px]">
          {properties.length} Active Pins
        </span>
      </div>

      <div className="absolute inset-0">
        {properties.map((property) => {
          const coords = getCoordinates(property.latitude, property.longitude);
          const isSelected = activePin?.id === property.id;

          return (
            <div
              key={property.id}
              style={{ top: coords.top, left: coords.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                onClick={() => handlePinClick(property)}
                className={`group px-3 py-1.5 rounded-full text-xs font-extrabold shadow-lg transition-all duration-300 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white scale-125 ring-4 ring-brand-500/40 z-30'
                    : 'bg-white text-slate-900 hover:bg-brand-600 hover:text-white border border-slate-200 hover:scale-110'
                }`}
              >
                <span className="text-brand-500 group-hover:text-white font-bold">{getCurrencySymbol(property.city)}</span>
                <span>{property.rent >= 1000 ? `${(property.rent / 1000).toFixed(property.rent % 1000 === 0 ? 0 : 1)}k` : property.rent}</span>
              </button>
            </div>
          );
        })}
      </div>

      {activePin && (
        <div className="absolute bottom-4 left-4 right-4 z-30 max-w-md mx-auto animate-in slide-in-from-bottom-3 fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-modal border border-slate-200 flex gap-4 relative">
            <button
              onClick={() => setActivePin(null)}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={activePin.images[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&fit=crop'}
              alt={activePin.title}
              className="w-28 h-28 rounded-2xl object-cover flex-shrink-0"
            />

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <MapPin className="w-3 h-3 text-brand-600" />
                <span className="truncate">{activePin.neighborhood || activePin.city}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {activePin.title}
              </h4>

              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-base font-extrabold text-slate-900 font-display">
                  {formatCurrency(activePin.rent, activePin.city)}
                </span>
                <span className="text-[10px] text-slate-500">/ mo</span>
              </div>

              {activePin.distanceMetro && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                  <Train className="w-3 h-3" /> {activePin.distanceMetro} km to Metro
                </div>
              )}

              <Link
                to={`/properties/${activePin.id}`}
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                View full property details <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
