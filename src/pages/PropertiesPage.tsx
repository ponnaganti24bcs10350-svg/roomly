import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyMap } from '../components/PropertyMap';
import { CompareFloatingBar } from '../components/CompareFloatingBar';
import { Property, Amenity } from '../types';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Home,
  Map,
  LayoutGrid,
  X,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const PropertiesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'Bangalore');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || 'All');
  const [furnishing, setFurnishing] = useState(searchParams.get('furnishing') || 'All');
  const [minRent, setMinRent] = useState(searchParams.get('minRent') || '');
  const [maxRent, setMaxRent] = useState(searchParams.get('maxRent') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : []
  );
  const [page, setPage] = useState(1);

  const [viewMode, setViewMode] = useState<'grid' | 'split' | 'map'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [compareList, setCompareList] = useState<Property[]>([]);

  const { data: amenitiesData } = useQuery({
    queryKey: ['amenities-list'],
    queryFn: async () => {
      const res = await api.get('/properties/amenities');
      return res.data.amenities as Amenity[];
    }
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['properties', search, city, propertyType, furnishing, minRent, maxRent, sortBy, selectedAmenities, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city && city !== 'All') params.set('city', city);
      if (propertyType && propertyType !== 'All') params.set('propertyType', propertyType);
      if (furnishing && furnishing !== 'All') params.set('furnishing', furnishing);
      if (minRent) params.set('minRent', minRent);
      if (maxRent) params.set('maxRent', maxRent);
      if (sortBy) params.set('sortBy', sortBy);
      if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await api.get(`/properties?${params.toString()}`);
      return res.data as {
        properties: Property[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    }
  });

  const handleToggleAmenity = (slug: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const handleToggleCompare = (property: Property) => {
    setCompareList((prev) => {
      if (prev.some((p) => p.id === property.id)) {
        return prev.filter((p) => p.id !== property.id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 properties at a time.');
        return prev;
      }
      return [...prev, property];
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCity('All');
    setPropertyType('All');
    setFurnishing('All');
    setMinRent('');
    setMaxRent('');
    setSortBy('newest');
    setSelectedAmenities([]);
    setPage(1);
  };

  const properties = data?.properties || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search any city or address worldwide (e.g. London, New York, Tokyo)..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'New York', 'London', 'San Francisco', 'Dubai', 'Tokyo', 'Paris', 'Sydney', 'Bangalore', 'Mumbai'].map((c) => (
            <button
              key={c}
              onClick={() => { setCity(c); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                city === c
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Split Grid & Map"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Split</span>
            </button>
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden px-3 py-2 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <aside className={`lg:col-span-3 space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-card space-y-6">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                Refine Search
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Property Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'All Types', val: 'All' },
                  { label: 'Apartment', val: 'APARTMENT' },
                  { label: 'Co-living PG', val: 'PG' },
                  { label: 'Studio', val: 'STUDIO' },
                  { label: 'House', val: 'HOUSE' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => { setPropertyType(item.val); setPage(1); }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                      propertyType === item.val
                        ? 'bg-brand-50 border-brand-500 text-brand-800'
                        : 'bg-slate-50/70 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Rent Range (₹ / Month)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Min</span>
                  <input
                    type="number"
                    placeholder="₹ Min"
                    value={minRent}
                    onChange={(e) => { setMinRent(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Max</span>
                  <input
                    type="number"
                    placeholder="₹ Max"
                    value={maxRent}
                    onChange={(e) => { setMaxRent(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Furnishing
              </label>
              <select
                value={furnishing}
                onChange={(e) => { setFurnishing(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none bg-white"
              >
                <option value="All">Any Furnishing</option>
                <option value="FURNISHED">Fully Furnished</option>
                <option value="SEMI_FURNISHED">Semi-Furnished</option>
                <option value="UNFURNISHED">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none bg-white"
              >
                <option value="newest">Newest Listed First</option>
                <option value="rent_asc">Rent: Low to High</option>
                <option value="rent_desc">Rent: High to Low</option>
                <option value="views">Most Popular / Viewed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Amenities & Facilities
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {amenitiesData?.map((a) => {
                  const isChecked = selectedAmenities.includes(a.slug);
                  return (
                    <label
                      key={a.id}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleAmenity(a.slug)}
                        className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                      />
                      <span>{a.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>
        </aside>

        <main className={`${viewMode === 'split' ? 'lg:col-span-9' : 'lg:col-span-9'} space-y-6`}>

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Showing <span className="font-bold text-slate-900">{properties.length}</span> properties in <span className="text-brand-700 font-bold">{city}</span>
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Home className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No properties match your exact filters</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your budget range or clearing some amenity filters to discover more homes.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'split' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4 max-h-[850px] overflow-y-auto pr-2">
                {properties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    isCompared={compareList.some((cp) => cp.id === p.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
              <div className="sticky top-20 h-[850px]">
                <PropertyMap properties={properties} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  isCompared={compareList.some((cp) => cp.id === p.id)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="pt-6 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-700 px-3 py-2 bg-white rounded-xl border border-slate-200">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>
      </div>

      <CompareFloatingBar
        selectedProperties={compareList}
        onRemove={(id) => setCompareList((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setCompareList([])}
      />

    </div>
  );
};
