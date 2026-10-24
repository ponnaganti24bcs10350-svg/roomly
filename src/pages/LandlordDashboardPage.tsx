import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Property, VisitRequest } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building,
  PlusCircle,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Power
} from 'lucide-react';

export const LandlordDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: propsData, refetch: refetchProps } = useQuery({
    queryKey: ['landlord-properties', user?.id],
    queryFn: async () => {
      const res = await api.get('/properties/my-listings');
      return (res.data.listings || []) as Property[];
    },
    enabled: !!user
  });

  const { data: visitsData, refetch: refetchVisits } = useQuery({
    queryKey: ['landlord-visits', user?.id],
    queryFn: async () => {
      const res = await api.get('/visits/landlord/my');
      return res.data.visits as VisitRequest[];
    },
    enabled: !!user
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/properties/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-properties'] });
      refetchProps();
    }
  });

  const updateVisitMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      await api.patch(`/visits/${id}/status`, { status, landlordNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-visits'] });
      refetchVisits();
    }
  });

  const properties = propsData || [];
  const visits = visitsData || [];
  const pendingVisits = visits.filter((v) => v.status === 'PENDING');

  const totalViews = properties.reduce((acc, p) => acc + (p.viewsCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <UserAvatar
            avatar={user?.avatar}
            name={`${user?.firstName || ''} ${user?.lastName || ''}`}
            size="xl"
            rounded="2xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-white">
                Landlord Portal · {user?.firstName} {user?.lastName}
              </h1>
              {user?.isProfileVerified && (
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Direct Property Management & Tenant Inquiries · Zero Commission
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/landlord/new"
          className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Properties Listed</span>
            <Building className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display mt-2">
            {properties.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active on marketplace</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Visits</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display mt-2">
            {pendingVisits.length}
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Requires your confirmation</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Visits</span>
            <Calendar className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display mt-2">
            {visits.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled walkthroughs</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Listing Impressions</span>
            <Eye className="w-5 h-5 text-teal-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display mt-2">
            {totalViews}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tenant profile views</p>
        </div>
      </div>

      {pendingVisits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Incoming Visit Requests ({pendingVisits.length})
            </h2>
          </div>

          <div className="space-y-3">
            {pendingVisits.map((v) => (
              <div
                key={v.id}
                className="bg-amber-50/50 border border-amber-200/80 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatar={v.tenant.avatar}
                    name={`${v.tenant.firstName || ''} ${v.tenant.lastName || ''}`}
                    size="lg"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {v.tenant.firstName} {v.tenant.lastName} ({v.tenant.roommateProfile?.occupation || 'Tenant'})
                    </h4>
                    <p className="text-xs text-slate-600">
                      Property: <strong>{v.property.title}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Slot: {new Date(v.preferredDate).toLocaleDateString()} · {v.preferredTimeSlot}
                    </p>
                    {v.notes && <p className="text-[11px] text-slate-700 italic mt-0.5">"{v.notes}"</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() =>
                      updateVisitMutation.mutate({
                        id: v.id,
                        status: 'ACCEPTED',
                        notes: 'Confirmed! I will be at the property.'
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    Approve Slot
                  </button>
                  <button
                    onClick={() =>
                      updateVisitMutation.mutate({
                        id: v.id,
                        status: 'REJECTED',
                        notes: 'Unavailable at this time slot.'
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-600" />
            My Managed Properties ({properties.length})
          </h2>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-card space-y-3">
            <Building className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No properties listed under your account</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first apartment, studio, or co-living flat to start receiving verified tenant inquiries.
            </p>
            <Link
              to="/dashboard/landlord/new"
              className="inline-block px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold"
            >
              Add Property Now
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="p-4 font-bold uppercase text-slate-400">Property</th>
                  <th className="p-4 font-bold uppercase text-slate-400">Type</th>
                  <th className="p-4 font-bold uppercase text-slate-400">Monthly Rent</th>
                  <th className="p-4 font-bold uppercase text-slate-400">Rooms & Vacancy</th>
                  <th className="p-4 font-bold uppercase text-slate-400">Views</th>
                  <th className="p-4 font-bold uppercase text-slate-400">Status</th>
                  <th className="p-4 font-bold uppercase text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((p) => {
                  const avail = p.rooms?.filter((r) => r.isAvailable).length || 0;
                  const total = p.rooms?.length || 1;
                  const isActive = p.status === 'ACTIVE';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&fit=crop'}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <Link to={`/properties/${p.id}`} className="font-bold text-slate-900 hover:text-brand-600 block">
                              {p.title}
                            </Link>
                            <p className="text-slate-400 text-[11px]">{p.neighborhood || p.city}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-700 uppercase">{p.propertyType}</td>

                      <td className="p-4 font-extrabold text-slate-900 font-display">
                        ₹{p.rent.toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 font-semibold text-slate-700">
                        {avail} / {total} Vacant
                      </td>

                      <td className="p-4 text-slate-600 font-medium">
                        {p.viewsCount || 0} views
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: p.id,
                                status: isActive ? 'INACTIVE' : 'ACTIVE'
                              })
                            }
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            title={isActive ? 'Deactivate listing' : 'Activate listing'}
                          >
                            <Power className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                          </button>
                          <Link
                            to={`/properties/${p.id}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-brand-600 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
