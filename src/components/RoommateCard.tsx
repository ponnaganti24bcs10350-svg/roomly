import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoommateCandidate } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { UserAvatar } from './UserAvatar';
import api from '../api/client';
import {
  Sparkles,
  MapPin,
  Briefcase,
  Moon,
  Sun,
  ShieldCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  PawPrint,
  Cigarette,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

interface RoommateCardProps {
  candidate: RoommateCandidate;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({ candidate }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const isOnline = isUserOnline(candidate.user.id);
  const comp = candidate.compatibility;
  const score = comp?.overallScore ?? null;

  const getScoreColor = (s: number) => {
    if (s >= 85) return 'from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50 border-emerald-200';
    if (s >= 70) return 'from-blue-500 to-cyan-600 text-blue-600 bg-blue-50 border-blue-200';
    if (s >= 50) return 'from-amber-500 to-orange-500 text-amber-600 bg-amber-50 border-amber-200';
    return 'from-slate-500 to-slate-700 text-slate-600 bg-slate-50 border-slate-200';
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (candidate.user.id === user.id) {
      return;
    }
    try {
      setIsStartingChat(true);
      const res = await api.post('/chat/conversations', {
        targetUserId: candidate.user.id
      });
      navigate(`/chat?conv=${res.data.conversation.id}`);
    } catch (err: any) {
      console.error(err);
      setIsStartingChat(false);
      alert(err.response?.data?.message || 'Failed to start conversation. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <UserAvatar
                avatar={candidate.user.avatar}
                name={`${candidate.user.firstName || ''} ${candidate.user.lastName || ''}`}
                size="lg"
                rounded="2xl"
              />
              {isOnline && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" title="Online now" />
              )}
              {candidate.user.isProfileVerified && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-3 h-3" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  {candidate.user.firstName} {candidate.user.lastName}
                </h3>
                {candidate.age && (
                  <span className="text-xs font-semibold text-slate-400">· {candidate.age} yrs</span>
                )}
                {isOnline && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Online
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[180px]">{candidate.occupation || 'Professional'}</span>
              </p>

              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>{candidate.preferredCity}</span>
              </p>
            </div>
          </div>

          {score !== null ? (
            <div className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center min-w-[84px] shadow-sm ${getScoreColor(score)}`}>
              <div className="flex items-center gap-0.5 text-base font-extrabold font-display">
                <Sparkles className="w-3.5 h-3.5" />
                {score}%
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Match</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-medium">
              Profile
            </div>
          )}

        </div>

        {candidate.bio && (
          <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 line-clamp-3">
            "{candidate.bio}"
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-600">
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 flex items-center gap-1">
            Budget: <strong className="text-slate-900 font-semibold">₹{(candidate.budgetMin / 1000).toFixed(0)}k–₹{(candidate.budgetMax / 1000).toFixed(0)}k</strong>
          </span>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 flex items-center gap-1">
            {candidate.sleepSchedule === 'NIGHT_OWL' ? <Moon className="w-3 h-3 text-indigo-500" /> : <Sun className="w-3 h-3 text-amber-500" />}
            {candidate.sleepSchedule === 'NIGHT_OWL' ? 'Night Owl' : candidate.sleepSchedule === 'EARLY_BIRD' ? 'Early Bird' : 'Flexible'}
          </span>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 flex items-center gap-1">
            <Utensils className="w-3 h-3 text-emerald-500" />
            {candidate.foodPreference}
          </span>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 flex items-center gap-1">
            <Cigarette className="w-3 h-3 text-slate-400" />
            {candidate.smoking.replace('_', ' ').toLowerCase()}
          </span>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 flex items-center gap-1">
            <PawPrint className="w-3 h-3 text-orange-500" />
            {candidate.pets === 'HAS_PETS' ? 'Has pets' : candidate.pets === 'LOVES_PETS' ? 'Loves pets' : 'No pets'}
          </span>
        </div>

        {comp && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="space-y-1.5">
              {comp.reasons.slice(0, showFullBreakdown ? comp.reasons.length : 2).map((r, i) => (
                <div
                  key={i}
                  className={`text-xs flex items-start gap-1.5 p-1.5 rounded-lg ${
                    r.type === 'positive'
                      ? 'text-emerald-800 bg-emerald-50/70'
                      : r.type === 'warning'
                      ? 'text-amber-800 bg-amber-50/70'
                      : 'text-slate-700 bg-slate-50'
                  }`}
                >
                  {r.type === 'positive' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : r.type === 'warning' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium">{r.text}</span>
                </div>
              ))}
            </div>

            {showFullBreakdown && (
              <div className="mt-3 pt-3 border-t border-dashed border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Budget Match</span>
                    <strong className="text-slate-900">{comp.breakdown.budget}/25</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(comp.breakdown.budget / 25) * 100}%` }} />
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Location Match</span>
                    <strong className="text-slate-900">{comp.breakdown.location}/25</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(comp.breakdown.location / 25) * 100}%` }} />
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Lifestyle Alignment</span>
                    <strong className="text-slate-900">{comp.breakdown.lifestyle}/30</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(comp.breakdown.lifestyle / 30) * 100}%` }} />
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Habits & Food</span>
                    <strong className="text-slate-900">{comp.breakdown.habits}/20</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(comp.breakdown.habits / 20) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}

            {comp.reasons.length > 2 && (
              <button
                onClick={() => setShowFullBreakdown(!showFullBreakdown)}
                className="mt-2 text-[11px] font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors"
              >
                {showFullBreakdown ? (
                  <>Show less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>View full compatibility breakdown ({comp.reasons.length} factors) <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          Seeking in {candidate.preferredLocations?.split(',')[0] || candidate.preferredCity}
        </span>

        {user && candidate.user.id === user.id ? (
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
            Your Profile
          </span>
        ) : (
          <button
            onClick={handleStartChat}
            disabled={isStartingChat}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {isStartingChat ? 'Connecting...' : 'Connect & Chat'}
          </button>
        )}
      </div>

    </div>
  );
};
