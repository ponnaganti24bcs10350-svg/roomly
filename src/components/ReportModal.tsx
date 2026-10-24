import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { ShieldAlert, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportModalProps {
  targetType: 'PROPERTY' | 'USER';
  targetId: string;
  targetTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  targetTitle,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reason, setReason] = useState('Incorrect or misleading information');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reasons = [
    'Incorrect or misleading information',
    'Fake property or ghost listing',
    'Suspicious landlord or scam behavior',
    'Price discrepancy or hidden charges',
    'Inappropriate photos or language',
    'Other Trust & Safety violation'
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

      await api.post('/admin/reports', {
        targetType,
        targetPropertyId: targetType === 'PROPERTY' ? targetId : null,
        targetUserId: targetType === 'USER' ? targetId : null,
        reason,
        description: description.trim()
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-modal border border-slate-100 relative animate-in zoom-in-95 duration-200">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Report Submitted for Review
            </h3>
            <p className="text-xs text-slate-500">
              Our Trust & Safety moderation team will inspect this listing and take appropriate action.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-5 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Report {targetType === 'PROPERTY' ? 'Listing' : 'User'}
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[240px]">
                  {targetTitle || 'Help keep the community safe'}
                </p>
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason for report
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Additional Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe specifically what is wrong or misleading..."
                  required
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
