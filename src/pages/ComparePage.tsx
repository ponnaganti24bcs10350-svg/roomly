import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Property } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Scale,
  Check,
  X,
  Bed,
  Train,
  GraduationCap,
  Briefcase,
  MapPin,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawIds = searchParams.get('ids');

  const { data: allPropsData } = useQuery({
    queryKey: ['all-properties-for-compare'],
    queryFn: async () => {
      const res = await api.get('/properties?limit=20');
      return res.data.properties as Property[];
    }
  });

  const propertyIds = rawIds ? rawIds.split(',').filter(Boolean) : [];

  const { data: comparedProperties, isLoading } = useQuery({
    queryKey: ['compare-properties', rawIds],
    queryFn: async () => {
      if (!rawIds) return [];
      const res = await api.get(`/properties/compare?ids=${rawIds}`);
      return res.data.properties as Property[];
    },
    enabled: propertyIds.length > 0
  });

  const handleRemove = (idToRemove: string) => {
    const updated = propertyIds.filter((id) => id !== idToRemove);
    setSearchParams({ ids: updated.join(',') });
  };

  const handleAdd = (idToAdd: string) => {
    if (propertyIds.includes(idToAdd)) return;
    if (propertyIds.length >= 4) {
      alert('You can compare up to 4 properties at a time.');
      return;
    }
    const updated = [...propertyIds, idToAdd];
    setSearchParams({ ids: updated.join(',') });
  };

  const properties = comparedProperties || [];

  const standardAmenities = [
    { slug: 'wifi', name: 'High-Speed Wi-Fi' },
    { slug: 'ac', name: 'Air Conditioning' },
    { slug: 'parking', name: 'Car Parking' },
    { slug: 'washing-machine', name: 'Washing Machine' },
    { slug: 'power-backup', name: 'Power Backup' },
    { slug: 'gym', name: 'Gym / Fitness' },
    { slug: 'security', name: '24/7 Security' },
    { slug: 'housekeeping', name: 'Housekeeping' },
    { slug: 'balcony', name: 'Balcony View' },
    { slug: 'pet-friendly', name: 'Pet Friendly' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" /> Side-by-Side Evaluator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Compare Properties
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluate rent, room occupancy, distances, and amenities without flipping between multiple browser tabs.
          </p>
        </div>

        {allPropsData && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAdd(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>+ Add property to compare...</option>
              {allPropsData
                .filter((p) => !propertyIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({formatCurrency(p.rent, p.city)}/mo)
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-card space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Scale className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              No Properties Selected for Comparison
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select properties from the marketplace or pick from our top recommended rentals below to compare specs side by side.
            </p>
          </div>

          {allPropsData && allPropsData.length >= 2 && (
            <button
              onClick={() => {
                const sampleIds = allPropsData.slice(0, 3).map((p) => p.id).join(',');
                setSearchParams({ ids: sampleIds });
              }}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Compare 3 Sample Bangalore Properties
            </button>
          )}
        </div>
      ) : (

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-6 text-xs font-bold uppercase tracking-wider text-slate-400 w-52 bg-slate-50/50">
                  Specification
                </th>
                {properties.map((p) => (
                  <th key={p.id} className="p-6 min-w-[260px] max-w-[320px] align-top">
                    <div className="space-y-3">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={p.images[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&fit=crop'}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemove(p.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-600" />
                          {p.neighborhood || p.city}
                        </p>
                      </div>

                      <Link
                        to={`/properties/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                      >
                        View Full Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">

              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Monthly Rent</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-extrabold text-base text-slate-900 font-display">
                    {formatCurrency(p.rent, p.city)}<span className="text-xs font-normal text-slate-500"> / mo</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Security Deposit</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-slate-800">
                    {formatCurrency(p.deposit, p.city)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Property Type</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-slate-800 uppercase">
                    {p.propertyType.replace('_', ' ')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Furnishing Level</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-slate-800 capitalize">
                    {p.furnishing.replace('_', ' ').toLowerCase()}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Rooms Available</td>
                {properties.map((p) => {
                  const avail = p.rooms?.filter((r) => r.isAvailable).length || 0;
                  const total = p.rooms?.length || 1;
                  return (
                    <td key={p.id} className="p-4 font-semibold text-slate-800">
                      {avail} / {total} Vacant
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Metro Proximity</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 text-slate-700 font-medium">
                    {p.distanceMetro ? `${p.distanceMetro} km` : 'N/A'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Tech Park Proximity</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 text-slate-700 font-medium">
                    {p.distanceTechPark ? `${p.distanceTechPark} km` : 'N/A'}
                  </td>
                ))}
              </tr>

              {standardAmenities.map((amenity) => (
                <tr key={amenity.slug}>
                  <td className="p-4 font-medium text-slate-600 bg-slate-50/50">
                    {amenity.name}
                  </td>
                  {properties.map((p) => {
                    const hasAmenity = p.amenities?.some((a) => a.amenity.slug === amenity.slug);
                    return (
                      <td key={p.id} className="p-4">
                        {hasAmenity ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
