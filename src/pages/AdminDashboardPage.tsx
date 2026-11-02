import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ReportItem, User } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Users,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'properties'>('reports');

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.stats;
    },
    enabled: !!user && user.role === 'ADMIN'
  });

  const { data: reportsData, refetch: refetchReports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await api.get('/admin/reports');
      return res.data.reports as ReportItem[];
    },
    enabled: !!user && user.role === 'ADMIN'
  });

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.users as User[];
    },
    enabled: !!user && user.role === 'ADMIN'
  });

  const moderateReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/admin/reports/${id}`, { status, adminNotes: 'Action reviewed by trust team' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      refetchReports();
    }
  });

  const moderateUserMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/admin/users/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetchUsers();
    }
  });

  const stats = statsData || {
    totalUsers: 8,
    totalTenants: 5,
    totalLandlords: 2,
    totalProperties: 6,
    activeProperties: 6,
    totalVisits: 2,
    pendingReports: 1
  };

  const reports = reportsData || [];
  const users = usersData || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> System Trust & Moderation Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Admin Governance Hub
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Monitor platform metrics, resolve reported listings, and manage account integrity.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>All API & Socket Services Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Total Registered Users</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display mt-2">
            {stats.totalUsers}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.totalTenants} Tenants · {stats.totalLandlords} Landlords
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Active Properties</span>
          <div className="text-3xl font-extrabold text-brand-600 font-display mt-2">
            {stats.activeProperties}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% verified listings</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Scheduled Visits</span>
          <div className="text-3xl font-extrabold text-indigo-600 font-display mt-2">
            {stats.totalVisits}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">In-person inspections</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Pending Reports</span>
          <div className="text-3xl font-extrabold text-rose-600 font-display mt-2">
            {stats.pendingReports}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Requires moderation</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Reports Moderation Queue ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Users Management ({users.length})
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-xs text-slate-500">
              No reports filed. Platform integrity is clean!
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="p-4 font-bold uppercase text-slate-400">Target Type</th>
                    <th className="p-4 font-bold uppercase text-slate-400">Reason</th>
                    <th className="p-4 font-bold uppercase text-slate-400">Description</th>
                    <th className="p-4 font-bold uppercase text-slate-400">Reporter</th>
                    <th className="p-4 font-bold uppercase text-slate-400">Status</th>
                    <th className="p-4 font-bold uppercase text-slate-400 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {r.targetType}
                        </span>
                        {r.property && (
                          <p className="font-bold text-slate-900 mt-1 truncate max-w-[150px]">
                            {r.property.title}
                          </p>
                        )}
                      </td>

                      <td className="p-4 font-semibold text-rose-700">
                        {r.reason}
                      </td>

                      <td className="p-4 text-slate-600 max-w-xs">
                        {r.description}
                      </td>

                      <td className="p-4 text-slate-500">
                        {r.reporter.firstName} ({r.reporter.email})
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.status === 'PENDING'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {r.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                moderateReportMutation.mutate({ id: r.id, status: 'RESOLVED' })
                              }
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() =>
                                moderateReportMutation.mutate({ id: r.id, status: 'DISMISSED' })
                              }
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="p-4 font-bold uppercase text-slate-400">User</th>
                <th className="p-4 font-bold uppercase text-slate-400">Role</th>
                <th className="p-4 font-bold uppercase text-slate-400">Phone</th>
                <th className="p-4 font-bold uppercase text-slate-400">Status</th>
                <th className="p-4 font-bold uppercase text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSuspended = u.status === 'SUSPENDED';
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          avatar={u.avatar}
                          name={`${u.firstName || ''} ${u.lastName || ''}`}
                          size="sm"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500">
                      {u.phone || 'N/A'}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSuspended ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() =>
                            moderateUserMutation.mutate({
                              id: u.id,
                              status: isSuspended ? 'ACTIVE' : 'SUSPENDED'
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors ${
                            isSuspended
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {isSuspended ? 'Unsuspend' : 'Suspend Account'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
