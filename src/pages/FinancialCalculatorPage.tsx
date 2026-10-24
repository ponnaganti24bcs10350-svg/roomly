import React, { useState } from 'react';
import {
  Calculator,
  PieChart,
  Users,
  DollarSign,
  Sparkles,
  Zap,
  Wifi,
  Shirt,
  Utensils,
  Home,
  CheckCircle2
} from 'lucide-react';

export const FinancialCalculatorPage: React.FC = () => {

  const [baseRent, setBaseRent] = useState(32000);
  const [electricity, setElectricity] = useState(2500);
  const [wifi, setWifi] = useState(1000);
  const [housekeeping, setHousekeeping] = useState(3000);
  const [groceries, setGroceries] = useState(8000);
  const [maintenance, setMaintenance] = useState(2000);

  const [numRoommates, setNumRoommates] = useState(3);
  const [splitMode, setSplitMode] = useState<'equal' | 'weighted'>('equal');

  const [room1Weight, setRoom1Weight] = useState(40);
  const [room2Weight, setRoom2Weight] = useState(32);
  const [room3Weight, setRoom3Weight] = useState(28);

  const totalMonthlyExpenses =
    baseRent + electricity + wifi + housekeeping + groceries + maintenance;

  const perPersonEqual = Math.round(totalMonthlyExpenses / (numRoommates || 1));
  const perPersonEqualRentOnly = Math.round(baseRent / (numRoommates || 1));

  const room1Rent = Math.round(baseRent * (room1Weight / 100));
  const room2Rent = Math.round(baseRent * (room2Weight / 100));
  const room3Rent = Math.round(baseRent * (room3Weight / 100));

  const utilitiesPerPerson = Math.round(
    (electricity + wifi + housekeeping + groceries + maintenance) / 3
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
          <Calculator className="w-4 h-4" /> Financial Planning & Expense Sharing
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Rental & Roommate Budget Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Estimate realistic total monthly living costs and calculate transparent, fair roommate expense splits based on room size and amenities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <div className="lg:col-span-7 space-y-6">

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Home className="w-5 h-5 text-brand-600" />
              Monthly Flat Expenses
            </h3>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Total Apartment Rent</span>
                <span className="text-brand-600 font-extrabold text-sm">₹{baseRent.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="1000"
                value={baseRent}
                onChange={(e) => setBaseRent(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Electricity, Water & Gas</span>
                <span className="text-slate-900 font-bold">₹{electricity.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={electricity}
                onChange={(e) => setElectricity(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-indigo-500" /> High-Speed Internet / Wi-Fi</span>
                <span className="text-slate-900 font-bold">₹{wifi.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="300"
                max="3000"
                step="100"
                value={wifi}
                onChange={(e) => setWifi(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Shirt className="w-3.5 h-3.5 text-teal-500" /> Maid / Cook Housekeeping</span>
                <span className="text-slate-900 font-bold">₹{housekeeping.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="12000"
                step="500"
                value={housekeeping}
                onChange={(e) => setHousekeeping(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5 text-rose-500" /> Shared Kitchen & Groceries</span>
                <span className="text-slate-900 font-bold">₹{groceries.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25000"
                step="500"
                value={groceries}
                onChange={(e) => setGroceries(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Society Maintenance Charge</span>
                <span className="text-slate-900 font-bold">₹{maintenance.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={maintenance}
                onChange={(e) => setMaintenance(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-5">
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Roommate Split Model
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSplitMode('equal')}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                  splitMode === 'equal'
                    ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Equal Even Split
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('weighted')}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                  splitMode === 'weighted'
                    ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Weighted by Room Size & Balcony
              </button>
            </div>

            {splitMode === 'weighted' && (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-slate-500">
                  Adjust percentage of rent assigned to each bedroom according to amenities (master bath, private balcony, square footage):
                </p>

                <div className="space-y-3 text-xs font-medium">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Master Bedroom (Private Bath & Balcony): <strong>{room1Weight}%</strong></span>
                      <span className="font-bold text-slate-900">₹{room1Rent.toLocaleString('en-IN')} rent</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      value={room1Weight}
                      onChange={(e) => setRoom1Weight(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Deluxe Bedroom 2: <strong>{room2Weight}%</strong></span>
                      <span className="font-bold text-slate-900">₹{room2Rent.toLocaleString('en-IN')} rent</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="50"
                      value={room2Weight}
                      onChange={(e) => setRoom2Weight(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Standard Bedroom 3: <strong>{room3Weight}%</strong></span>
                      <span className="font-bold text-slate-900">₹{room3Rent.toLocaleString('en-IN')} rent</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="40"
                      value={room3Weight}
                      onChange={(e) => setRoom3Weight(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="lg:col-span-5 sticky top-24 space-y-6">

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Monthly Flat Outlay
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-display text-emerald-400 mt-1">
                ₹{totalMonthlyExpenses.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Base Rent (₹{baseRent.toLocaleString()}) + Utilities (₹{(totalMonthlyExpenses - baseRent).toLocaleString()})
              </p>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Individual Share Breakdown
              </h4>

              {splitMode === 'equal' ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-white">Each Flatmate Pays:</span>
                    <span className="text-xl font-extrabold text-brand-400 font-display">
                      ₹{perPersonEqual.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ mo</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Rent: ₹{perPersonEqualRentOnly.toLocaleString()} + Shared Bills: ₹{(perPersonEqual - perPersonEqualRentOnly).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">Master Bedroom Flatmate</p>
                      <p className="text-[10px] text-slate-400">Rent ₹{room1Rent.toLocaleString()} + Bills ₹{utilitiesPerPerson.toLocaleString()}</p>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 font-display">
                      ₹{(room1Rent + utilitiesPerPerson).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">Deluxe Room 2 Flatmate</p>
                      <p className="text-[10px] text-slate-400">Rent ₹{room2Rent.toLocaleString()} + Bills ₹{utilitiesPerPerson.toLocaleString()}</p>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 font-display">
                      ₹{(room2Rent + utilitiesPerPerson).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">Standard Room 3 Flatmate</p>
                      <p className="text-[10px] text-slate-400">Rent ₹{room3Rent.toLocaleString()} + Bills ₹{utilitiesPerPerson.toLocaleString()}</p>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 font-display">
                      ₹{(room3Rent + utilitiesPerPerson).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Realistic estimates based on Bangalore & tier-1 city averages</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
