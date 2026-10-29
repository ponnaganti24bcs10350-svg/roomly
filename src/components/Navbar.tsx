import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { UserAvatar } from './UserAvatar';
import {
  Home,
  Users,
  Scale,
  Calculator,
  MessageSquare,
  Calendar,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Building,
  PlusCircle,
  Shield,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Browse Homes', path: '/properties', icon: Home },
    { label: 'Find Flatmates', path: '/roommates', icon: Users },
    { label: 'Compare', path: '/compare', icon: Scale },
    { label: 'Split Calculator', path: '/calculator', icon: Calculator },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
              Roomly
            </span>
            <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 rounded-md border border-brand-200">
              Verified
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>

              {user.role === 'LANDLORD' && (
                <Link
                  to="/dashboard/landlord/new"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>List Property</span>
                </Link>
              )}

              <Link
                to="/chat"
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-xl z-50 p-3 bg-white border border-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-900">Notifications</p>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-700 font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="mt-2 max-h-72 overflow-y-auto space-y-1.5">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) {
                                navigate(n.link);
                                setIsNotifOpen(false);
                              }
                            }}
                            className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                              n.isRead
                                ? 'hover:bg-slate-50 opacity-70'
                                : 'bg-brand-50/50 hover:bg-brand-50 border border-brand-100/60'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0 bg-brand-500" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                                <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                                <p className="text-[9px] text-slate-400 mt-1">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-all bg-white"
                >
                  <UserAvatar
                    avatar={user.avatar}
                    name={user.firstName}
                    size="xs"
                    className="w-7 h-7 text-xs"
                  />
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                    {user.firstName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel bg-white border border-slate-200 rounded-2xl p-2 z-50 shadow-xl">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-100 text-brand-800 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {user.role === 'TENANT' && (
                        <>
                          <Link
                            to="/dashboard/tenant"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-slate-500" />
                            Tenant Dashboard
                          </Link>
                          <Link
                            to="/visits"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-slate-500" />
                            My Scheduled Visits
                          </Link>
                        </>
                      )}

                      {user.role === 'LANDLORD' && (
                        <>
                          <Link
                            to="/dashboard/landlord"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <Building className="w-4 h-4 text-slate-500" />
                            Landlord Dashboard
                          </Link>
                          <Link
                            to="/dashboard/landlord/new"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full text-left px-3 py-2 text-xs text-brand-700 hover:bg-brand-50 rounded-xl flex items-center gap-2 font-medium transition-colors"
                          >
                            <PlusCircle className="w-4 h-4 text-brand-600" />
                            Add New Property
                          </Link>
                        </>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/dashboard/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 rounded-xl flex items-center gap-2 font-medium transition-colors"
                        >
                          <Shield className="w-4 h-4 text-purple-600" />
                          Admin Moderation Hub
                        </Link>
                      )}

                      <button
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
              >
                Register
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                  isActive ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
