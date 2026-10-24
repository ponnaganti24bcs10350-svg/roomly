import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Heart,
  MapPin,
  Bed,
  Train,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  isCompared?: boolean;
  onToggleCompare?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isCompared = false,
  onToggleCompare
}) => {
  const { toggleFavorite, isFavorited } = useAuth();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(isFavorited(property.id) || property.isFavorited || false);

  const images = property.images?.length > 0
    ? property.images
    : [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop' }];

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleFavorite(property.id);
    setIsLiked(result);
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const availableRoomsCount = property.rooms?.filter((r) => r.isAvailable).length || 0;
  const totalRoomsCount = property.rooms?.length || 1;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative">

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={images[activeImgIdx]?.url}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
              {property.propertyType.replace('_', ' ')}
            </span>
            {property.isVerified && (
              <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/90 backdrop-blur-md text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>

          <button
            onClick={handleFavoriteClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 ${
              isLiked
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
            title={isLiked ? 'Remove from saved' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePrevImg}
              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImg}
              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between z-10">
          {images.length > 1 ? (
            <div className="flex gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === activeImgIdx ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          ) : <div />}

          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/50 backdrop-blur-md text-white flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-300" /> {property.viewsCount || 12} views
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>

          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <span className="truncate">{property.neighborhood || property.city}, {property.city}</span>
          </div>

          <Link to={`/properties/${property.id}`} className="block group-hover:text-brand-700 transition-colors">
            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
              {property.title}
            </h3>
          </Link>

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-medium">
              <Bed className="w-3.5 h-3.5 text-slate-500" />
              {availableRoomsCount > 0 ? `${availableRoomsCount} / ${totalRoomsCount} Rooms Avail.` : `${totalRoomsCount} Rooms`}
            </span>

            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium capitalize">
              {property.furnishing.replace('_', ' ').toLowerCase()}
            </span>

            {property.distanceMetro && (
              <span className="flex items-center gap-1 text-slate-500">
                <Train className="w-3.5 h-3.5 text-indigo-500" />
                {property.distanceMetro} km metro
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-slate-900 font-display">
                {formatCurrency(property.rent, property.city)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            <p className="text-[10px] text-slate-400">Deposit: {formatCurrency(property.deposit, property.city)}</p>
          </div>

          <div className="flex items-center gap-2">
            {onToggleCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleCompare(property);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-colors ${
                  isCompared
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isCompared ? <Check className="w-3.5 h-3.5" /> : null}
                {isCompared ? 'Comparing' : 'Compare'}
              </button>
            )}

            <Link
              to={`/properties/${property.id}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-brand-600 text-white transition-colors shadow-sm"
            >
              View Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
