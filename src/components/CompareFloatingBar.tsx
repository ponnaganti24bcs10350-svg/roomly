import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types';
import { Scale, X, ArrowRight } from 'lucide-react';

interface CompareFloatingBarProps {
  selectedProperties: Property[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  selectedProperties,
  onRemove,
  onClear
}) => {
  const navigate = useNavigate();

  if (selectedProperties.length === 0) return null;

  const handleCompareNow = () => {
    const ids = selectedProperties.map(p => p.id).join(',');
    navigate(`/compare?ids=${ids}`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 text-white rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-4">

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {selectedProperties.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs flex-shrink-0"
              >
                <img
                  src={p.images[0]?.url}
                  alt={p.title}
                  className="w-5 h-5 rounded-md object-cover"
                />
                <span className="font-semibold text-slate-200 max-w-[120px] truncate">{p.title}</span>
                <button
                  onClick={() => onRemove(p.id)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Clear
          </button>

          <button
            onClick={handleCompareNow}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            Compare ({selectedProperties.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
