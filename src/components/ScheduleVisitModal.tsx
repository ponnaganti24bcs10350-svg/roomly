import React, { useState } from 'react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../api/client';
import {
  Calendar as CalendarIcon,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScheduleVisitModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>('11:00 AM - 01:00 PM');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const timeSlots = [
    '10:00 AM - 12:00 PM (Morning)',
    '11:00 AM - 01:00 PM (Midday)',
    '02:00 PM - 04:00 PM (Afternoon)',
    '04:00 PM - 06:00 PM (Late Afternoon)',
    '06:00 PM - 08:00 PM (Evening)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await api.post('/visits/request', {
        propertyId: property.id,
        preferredDate: date,
        preferredTimeSlot: timeSlot,
        notes: notes.trim()
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit visit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-modal border border-slate-100 relative animate-in zoom-in-95 duration-200">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-slate-900">
                Visit Request Sent! 🎉
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                The landlord ({property.landlord?.firstName || 'Host'}) has been notified. You can track this in your Scheduled Visits hub.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => { onClose(); navigate('/visits'); }}
                className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Go to My Visits
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Schedule In-Person Visit
                </h3>
                <p className="text-xs text-slate-500">
                  Pick a convenient slot to inspect the property
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center gap-3 mb-5">
              <img
                src={property.images[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&fit=crop'}
                alt={property.title}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 truncate">{property.title}</h4>
                <p className="text-[11px] text-slate-500">{property.neighborhood || property.city}</p>
                <p className="text-xs font-extrabold text-brand-700">{formatCurrency(property.rent, property.city)}/mo</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Select Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Intro Note or Specific Questions (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Hi Rajesh, I work at Microsoft and would love to inspect the master bedroom and Wi-Fi speed."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Visit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
