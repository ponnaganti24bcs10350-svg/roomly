import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { VisitRequest } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Building,
  User as UserIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const VisitsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted'>('all');
  const isLandlord = user?.role === 'LANDLORD';

  const endpoint = isLandlord ? '/visits/landlord/my' : '/visits/tenant/my';

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['visits', user?.id, isLandlord],
    queryFn: async () => {
      const res = await api.get(endpoint);
      return res.data.visits as VisitRequest[];
    },
    enabled: !!user
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      await api.patch(`/visits/${id}/status`, { status, landlordNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      refetch();
    }
  });

  const visits = data || [];

  const filteredVisits = visits.filter((v) => {
    if (activeTab === 'pending') return v.status === 'PENDING';
    if (activeTab === 'accepted') return v.status === 'ACCEPTED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Host Confirmation
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" /> In-Person Visits & Inspection
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {isLandlord ? 'Incoming Property Visit Requests' : 'My Scheduled Visits'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isLandlord
              ? 'Review tenant visit requests, confirm inspection slots, and communicate directions.'
              : 'Keep track of upcoming scheduled visits, inspection dates, and landlord notes.'}
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {(['all', 'pending', 'accepted'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">No scheduled visits found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore homes in Bangalore and request an in-person walkthrough slot.
          </p>
          <Link
            to="/properties"
            className="inline-block px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold"
          >
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >

              <div className="flex items-start sm:items-center gap-4 flex-1">
                <img
                  src={visit.property.images[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&fit=crop'}
                  alt={visit.property.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(visit.status)}
                    <span className="text-xs text-slate-400 font-medium">
                      Requested {new Date(visit.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/properties/${visit.propertyId}`}
                    className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors block"
                  >
                    {visit.property.title}
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {visit.property.address}, {visit.property.city}
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {new Date(visit.preferredDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {visit.preferredTimeSlot}
                    </span>
                  </div>

                  {visit.notes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1 max-w-xl">
                      "{visit.notes}"
                    </p>
                  )}

                  {visit.landlordNotes && (
                    <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-100 font-medium mt-1 max-w-xl">
                      Host Note: {visit.landlordNotes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                {isLandlord && visit.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: visit.id,
                          status: 'ACCEPTED',
                          notes: 'Confirmed! Looking forward to showing you around.'
                        })
                      }
                      className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      Accept Visit
                    </button>
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: visit.id,
                          status: 'REJECTED',
                          notes: 'Slot unavailable at this time.'
                        })
                      }
                      className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                ) : !isLandlord && visit.status === 'PENDING' ? (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: visit.id,
                        status: 'CANCELLED'
                      })
                    }
                    className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Cancel Request
                  </button>
                ) : (
                  <Link
                    to={`/properties/${visit.propertyId}`}
                    className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>View Property</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
