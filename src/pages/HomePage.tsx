import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { PropertyCard } from '../components/PropertyCard';
import { Property, RoommateCandidate } from '../types';
import { getCurrencySymbol } from '../utils/formatCurrency';
import { UserAvatar } from '../components/UserAvatar';
import {
  Search,
  MapPin,
  Home,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Compass,
  Building,
  Heart,
  Calendar,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [searchCity, setSearchCity] = useState('Bangalore');
  const [propertyType, setPropertyType] = useState('All');
  const [maxRent, setMaxRent] = useState('');

  const { data: propData, isLoading: propsLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      const res = await api.get('/properties?limit=6');
      return res.data.properties as Property[];
    }
  });

  const { data: mateData, isLoading: matesLoading } = useQuery({
    queryKey: ['top-roommates'],
    queryFn: async () => {
      const res = await api.get('/roommates');
      return res.data.roommates as RoommateCandidate[];
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity && searchCity !== 'All') params.set('city', searchCity);
    if (propertyType && propertyType !== 'All') params.set('propertyType', propertyType);
    if (maxRent) params.set('maxRent', maxRent);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-16">

      <section className="relative pt-12 pb-20 overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-5">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>Smart Rentals & Scientific Roommate Compatibility Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.12]">
              Find your next home & <br />
              <span className="bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                the perfect flatmate
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Explore verified properties, match with roommates sharing your lifestyle and budget, schedule visits with one click, and chat directly with hosts.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 p-3.5 sm:p-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col md:flex-row items-center gap-3 text-left"
            >

              <div className="w-full md:w-1/3 px-3 py-1.5 border-b md:border-b-0 md:border-r border-slate-100">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Target City
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="New York">New York, USA</option>
                    <option value="London">London, UK</option>
                    <option value="San Francisco">San Francisco, USA</option>
                    <option value="Dubai">Dubai, UAE</option>
                    <option value="Tokyo">Tokyo, Japan</option>
                    <option value="Paris">Paris, France</option>
                    <option value="Sydney">Sydney, Australia</option>
                    <option value="Bangalore">Bangalore, India</option>
                    <option value="Mumbai">Mumbai, India</option>
                  </select>
                </div>
              </div>

              <div className="w-full md:w-1/3 px-3 py-1.5 border-b md:border-b-0 md:border-r border-slate-100">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Property Type
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <Home className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Homes & Rooms</option>
                    <option value="APARTMENT">Apartment / Flat</option>
                    <option value="PG">Co-living / PG</option>
                    <option value="STUDIO">Private Studio</option>
                    <option value="HOUSE">Independent House</option>
                  </select>
                </div>
              </div>

              <div className="w-full md:w-1/4 px-3 py-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Max Budget
                </label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-bold text-slate-400">{getCurrencySymbol(searchCity)}</span>
                  <input
                    type="number"
                    placeholder="e.g. 18000"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-semibold text-slate-600">Global destinations:</span>
              <button
                onClick={() => navigate('/properties?city=New York')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs font-medium"
              >
                🗽 New York
              </button>
              <button
                onClick={() => navigate('/properties?city=London')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs font-medium"
              >
                🇬🇧 London
              </button>
              <button
                onClick={() => navigate('/properties?city=Dubai')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs font-medium"
              >
                🏙️ Dubai
              </button>
              <button
                onClick={() => navigate('/properties?city=Tokyo')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs font-medium"
              >
                🗼 Tokyo
              </button>
              <button
                onClick={() => navigate('/properties?city=San Francisco')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs font-medium"
              >
                🌉 San Francisco
              </button>
              <button
                onClick={() => navigate('/properties?city=Paris')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs font-medium"
              >
                🥐 Paris
              </button>
              <button
                onClick={() => navigate('/properties?city=Bangalore')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs font-medium"
              >
                🇮🇳 Bangalore
              </button>
            </div>

          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Home className="w-4 h-4" /> Handpicked Rentals
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Featured Verified Listings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Zero brokerage, furnished flats, and co-living spaces with immediate availability
            </p>
          </div>

          <Link
            to="/properties"
            className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors"
          >
            <span>View all properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {propsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propData?.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">

          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Rule-Based Compatibility Algorithm
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
                Stop gambling on roommates. <br />
                <span className="text-brand-400">Match with compatible people.</span>
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Roomly analyzes 4 weighted lifestyle vectors (Budget 25%, Location 25%, Sleep & Cleanliness 30%, Diet & Habits 20%) to show you transparent reasons why you’ll live well together.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-brand-400 font-bold mb-1">✓ Synchronized Schedules</div>
                  <p className="text-slate-400">Avoid morning clashes and mismatched quiet hours.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-amber-400 font-bold mb-1">✓ Budget Overlap Match</div>
                  <p className="text-slate-400">Target exact same rent brackets and area hubs.</p>
                </div>
              </div>

              <Link
                to="/roommates"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
              >
                <span>Find Compatible Roommates</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-6 space-y-3">
              {matesLoading ? (
                <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
              ) : (
                mateData?.slice(0, 2).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-4 hover:bg-white/15 transition-colors cursor-pointer"
                    onClick={() => navigate('/roommates')}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        avatar={candidate.user.avatar}
                        name={`${candidate.user.firstName || ''} ${candidate.user.lastName || ''}`}
                        size="lg"
                        rounded="xl"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {candidate.user.firstName} {candidate.user.lastName}
                          {candidate.user.isProfileVerified && <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />}
                        </h4>
                        <p className="text-xs text-slate-300">{candidate.occupation || 'Professional'}</p>
                        <p className="text-[11px] text-slate-400">Budget: ₹{(candidate.budgetMin/1000).toFixed(0)}k-₹{(candidate.budgetMax/1000).toFixed(0)}k · {candidate.preferredCity}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        85%+
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            The Complete Rental Journey in One Place
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Everything you need from initial search to move-in day
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Explore & Filter</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Filter by budget, room vacancy, amenities, distance to metro/colleges, and compare properties side-by-side.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Match Flatmates</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Take the guesswork out with rule-based lifestyle compatibility scores and transparent reasons.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Schedule In-Person Visits</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Choose date and time slots without tedious back-and-forth messaging. Landlords accept with 1-click.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Real-Time Chat</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Communicate securely with Socket.IO real-time messages, typing indicators, and shared property previews.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
