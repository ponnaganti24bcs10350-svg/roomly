import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import { RoommateCard } from '../components/RoommateCard';
import { Property, RoommateCandidate, VisitRequest } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { Link } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  DollarSign
} from 'lucide-react';

export const TenantDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: favsData } = useQuery({
    queryKey: ['my-favorites', user?.id],
    queryFn: async () => {
      const res = await api.get('/properties/favorites/my');
      return res.data.favorites as Property[];
    },
    enabled: !!user
  });

  const { data: visitsData } = useQuery({
    queryKey: ['my-visits', user?.id],
    queryFn: async () => {
      const res = await api.get('/visits/tenant/my');
      return res.data.visits as VisitRequest[];
    },
    enabled: !!user
  });

  const { data: matesData } = useQuery({
    queryKey: ['roommates-tenant-dash', user?.id],
    queryFn: async () => {
      const res = await api.get('/roommates');
      return res.data.roommates as RoommateCandidate[];
    },
    enabled: !!user
  });

  const favorites = favsData || [];
  const visits = visitsData || [];
  const topMates = matesData?.slice(0, 3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <UserAvatar
            avatar={user?.avatar}
            name={user?.firstName}
            size="xl"
            rounded="2xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-white">
                Welcome back, {user?.firstName}! 👋
              </h1>
              {user?.isProfileVerified && (
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Tenant Dashboard · {user?.roommateProfile?.occupation || 'Member'} · {user?.roommateProfile?.preferredCity || 'Bangalore'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/roommates"
            className="px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Find Roommates
          </Link>
          <Link
            to="/properties"
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
          >
            Explore Properties
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">{favorites.length}</div>
            <p className="text-xs text-slate-500 font-medium">Saved Properties</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              {visits.filter((v) => v.status === 'ACCEPTED').length}
            </div>
            <p className="text-xs text-slate-500 font-medium">Confirmed Visits</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              {topMates.filter((m) => (m.compatibility?.overallScore || 0) >= 80).length}
            </div>
            <p className="text-xs text-slate-500 font-medium">High Match Roommates (80%+)</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Scheduled Property Visits
          </h2>
          <Link to="/visits" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View all visits →
          </Link>
        </div>

        {visits.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-500">
            No visits scheduled yet. Request a walkthrough from any property details page!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visits.slice(0, 2).map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-card flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={v.property.images[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=150&fit=crop'}
                    alt={v.property.title}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                      {v.property.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {new Date(v.preferredDate).toLocaleDateString()} · {v.preferredTimeSlot}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {v.status}
                    </span>
                  </div>
                </div>

                <Link
                  to="/visits"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            My Saved Properties ({favorites.length})
          </h2>
          <Link to="/properties" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            Discover more →
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-500">
            You have not saved any properties yet. Tap the heart icon on any listing to save it here!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Recommended Flatmates Based On Your Profile
          </h2>
          <Link to="/roommates" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View all roommate matches →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topMates.map((m) => (
            <RoommateCard key={m.id} candidate={m} />
          ))}
        </div>
      </div>

    </div>
  );
};
