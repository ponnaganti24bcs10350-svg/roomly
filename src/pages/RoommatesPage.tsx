import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { RoommateCard } from '../components/RoommateCard';
import { RoommateCandidate } from '../types';
import {
  Users,
  Sparkles,
  SlidersHorizontal,
  Edit3,
  Moon,
  Sun,
  Utensils,
  PawPrint,
  Cigarette,
  CheckCircle2,
  X,
  RotateCcw,
  ShieldCheck,
  Search
} from 'lucide-react';

export const RoommatesPage: React.FC = () => {
  const { user, updateRoommateProfile } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const otherOnlineUsers = onlineUsers.filter((u) => u.userId !== user?.id);

  const handleStartChatWithUser = async (targetUserId: string) => {
    try {
      const res = await api.post('/chat/conversations', { targetUserId });
      navigate(`/chat?conv=${res.data.conversation.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not start conversation');
    }
  };

  const [city, setCity] = useState('All');
  const [food, setFood] = useState('All');
  const [smoking, setSmoking] = useState('All');
  const [sleep, setSleep] = useState('All');
  const [maxBudget, setMaxBudget] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    budgetMin: user?.roommateProfile?.budgetMin || 10000,
    budgetMax: user?.roommateProfile?.budgetMax || 18000,
    preferredCity: user?.roommateProfile?.preferredCity || 'Bangalore',
    preferredLocations: user?.roommateProfile?.preferredLocations || 'Koramangala, HSR Layout, Indiranagar',
    occupation: user?.roommateProfile?.occupation || 'Software Engineer',
    companyOrCollege: user?.roommateProfile?.companyOrCollege || 'Tech Company',
    age: user?.roommateProfile?.age || 24,
    sleepSchedule: user?.roommateProfile?.sleepSchedule || 'NIGHT_OWL',
    foodPreference: user?.roommateProfile?.foodPreference || 'VEG',
    cleanliness: user?.roommateProfile?.cleanliness || 4,
    smoking: user?.roommateProfile?.smoking || 'NON_SMOKER',
    pets: user?.roommateProfile?.pets || 'LOVES_PETS',
    socialLevel: user?.roommateProfile?.socialLevel || 3,
    guests: user?.roommateProfile?.guests || 'SOMETIMES',
    noiseTolerance: user?.roommateProfile?.noiseTolerance || 3,
    bio: user?.roommateProfile?.bio || 'Looking for a clean, friendly flatmate!'
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['roommates', city, food, smoking, sleep, maxBudget, user?.roommateProfile],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city && city !== 'All') params.set('city', city);
      if (food && food !== 'All') params.set('food', food);
      if (smoking && smoking !== 'All') params.set('smoking', smoking);
      if (sleep && sleep !== 'All') params.set('sleep', sleep);
      if (maxBudget) params.set('maxBudget', maxBudget);

      const res = await api.get(`/roommates?${params.toString()}`);
      return res.data.roommates as RoommateCandidate[];
    }
  });

  const { data: citiesData } = useQuery({
    queryKey: ['available-cities'],
    queryFn: async () => {
      const res = await api.get('/properties/cities');
      return res.data.cities as string[];
    }
  });

  const availableCities = citiesData && citiesData.length > 0
    ? citiesData
    : ['Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai', 'Delhi', 'Noida', 'Gurgaon'];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRoommateProfile(editFormData);
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['roommates'] });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const roommates = data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Rule-Based Roommate Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Compatible Flatmate Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Our engine compares your budget, sleep habits, cleanliness, and dietary choices against other verified tenants to calculate scientific compatibility scores.
          </p>
        </div>

        {user && user.role === 'TENANT' && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs border border-brand-200 flex items-center gap-2 transition-all active:scale-95 flex-shrink-0 shadow-2xs"
          >
            <Edit3 className="w-4 h-4 text-brand-600" />
            <span>Edit My Lifestyle & Budget</span>
          </button>
        )}
      </div>

      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-3xl p-5 border border-emerald-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
            <span className="w-3 h-3 rounded-full bg-white animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Live Active Community ({onlineUsers.length} Online Now)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Real-Time WebSocket
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {otherOnlineUsers.length > 0
                ? `${otherOnlineUsers.length} other verified user(s) currently logged in and ready for instant chatting.`
                : `You are logged in as ${user?.firstName || 'User'}. When another person logs in, they will appear here live so you can chat in real-time.`}
            </p>
          </div>
        </div>

        {otherOnlineUsers.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {otherOnlineUsers.map((ou) => (
              <button
                key={ou.userId}
                onClick={() => handleStartChatWithUser(ou.userId)}
                className="px-3.5 py-2 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-500 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all active:scale-95"
              >
                <div className="relative">
                  <img src={ou.avatar} alt={ou.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                </div>
                <span>Chat Live with {ou.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/login', '_blank')}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-all"
            >
              Open 2nd Account to Chat (New Tab)
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-2 flex-wrap">

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={food}
              onChange={(e) => setFood(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">Any Food Preference</option>
              <option value="VEG">Vegetarian Only</option>
              <option value="NON_VEG">Non-Veg</option>
              <option value="VEGAN">Vegan</option>
              <option value="FLEXIBLE">Flexible</option>
            </select>

            <select
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">Any Sleep Schedule</option>
              <option value="NIGHT_OWL">Night Owls Only</option>
              <option value="EARLY_BIRD">Early Birds Only</option>
              <option value="FLEXIBLE">Flexible Hours</option>
            </select>

            <select
              value={smoking}
              onChange={(e) => setSmoking(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">Any Smoking Habit</option>
              <option value="NON_SMOKER">Non-Smoker Only</option>
              <option value="OUTSIDE_ONLY">Balcony / Outside</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Found <strong className="text-slate-900">{roommates.length}</strong> candidates
            </span>
          </div>

        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : roommates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {city !== 'All' || food !== 'All' || smoking !== 'All' || sleep !== 'All'
              ? 'No registered flatmates match these filters'
              : 'No other flatmates registered yet'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {city !== 'All' || food !== 'All' || smoking !== 'All' || sleep !== 'All'
              ? 'Try resetting your lifestyle filters to view all registered flatmates.'
              : 'As new people sign up and log in, their verified profiles will appear here for you to connect and chat in real-time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roommates.map((candidate) => (
            <RoommateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-modal border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">

            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Update Your Lifestyle & Matching Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Your answers calibrate the real-time roommate compatibility scores
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Monthly Rent Budget Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Min Budget</span>
                    <input
                      type="number"
                      value={editFormData.budgetMin}
                      onChange={(e) => setEditFormData({ ...editFormData, budgetMin: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Max Budget</span>
                    <input
                      type="number"
                      value={editFormData.budgetMax}
                      onChange={(e) => setEditFormData({ ...editFormData, budgetMax: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred City</label>
                  <select
                    value={editFormData.preferredCity}
                    onChange={(e) => setEditFormData({ ...editFormData, preferredCity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none bg-white"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Localities (comma-separated)</label>
                  <input
                    type="text"
                    value={editFormData.preferredLocations}
                    onChange={(e) => setEditFormData({ ...editFormData, preferredLocations: e.target.value })}
                    placeholder="e.g. Koramangala, Indiranagar"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Occupation / Major</label>
                  <input
                    type="text"
                    value={editFormData.occupation}
                    onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Company / College</label>
                  <input
                    type="text"
                    value={editFormData.companyOrCollege}
                    onChange={(e) => setEditFormData({ ...editFormData, companyOrCollege: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Sleep Schedule</label>
                  <select
                    value={editFormData.sleepSchedule}
                    onChange={(e) => setEditFormData({ ...editFormData, sleepSchedule: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                  >
                    <option value="NIGHT_OWL">Night Owl (Late nights)</option>
                    <option value="EARLY_BIRD">Early Bird (Early mornings)</option>
                    <option value="FLEXIBLE">Flexible / Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Food Preference</label>
                  <select
                    value={editFormData.foodPreference}
                    onChange={(e) => setEditFormData({ ...editFormData, foodPreference: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                  >
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="FLEXIBLE">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Smoking Preference</label>
                  <select
                    value={editFormData.smoking}
                    onChange={(e) => setEditFormData({ ...editFormData, smoking: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                  >
                    <option value="NON_SMOKER">Strict Non-Smoker</option>
                    <option value="OUTSIDE_ONLY">Balcony / Outside Only</option>
                    <option value="SMOKER">Smoker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pet Policy</label>
                  <select
                    value={editFormData.pets}
                    onChange={(e) => setEditFormData({ ...editFormData, pets: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                  >
                    <option value="LOVES_PETS">Pet Lover (No pet currently)</option>
                    <option value="HAS_PETS">I Have a Pet</option>
                    <option value="NO_PETS">Prefer No Pets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cleanliness & Orderliness (1 to 5 scale): <strong className="text-brand-600">{editFormData.cleanliness} / 5</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={editFormData.cleanliness}
                  onChange={(e) => setEditFormData({ ...editFormData, cleanliness: Number(e.target.value) })}
                  className="w-full accent-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Bio / Flatmate Intro</label>
                <textarea
                  rows={3}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  placeholder="Tell potential roommates about your hobbies, routine, and ideal home environment..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 resize-none focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all active:scale-95"
                >
                  Save & Update Scores
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
