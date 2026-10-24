import React from 'react';
import { Home, ShieldCheck, Heart, Sparkles, MapPin, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-display text-white">
                Roomly<span className="text-brand-400">.</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The modern rental ecosystem combining verified homes, scientific roommate compatibility scoring, direct landlord communication, and instant visit scheduling.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Verified Listings
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" /> Real-time Matching
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Discovery</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/properties?city=Bangalore" className="hover:text-white transition-colors">Bangalore Rentals</Link></li>
              <li><Link to="/properties?propertyType=APARTMENT" className="hover:text-white transition-colors">Apartments & Flats</Link></li>
              <li><Link to="/properties?propertyType=PG" className="hover:text-white transition-colors">Co-living & PGs</Link></li>
              <li><Link to="/properties?propertyType=STUDIO" className="hover:text-white transition-colors">Private Studios</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/roommates" className="hover:text-white transition-colors">Find Compatible Flatmates</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Property Comparison Matrix</Link></li>
              <li><Link to="/calculator" className="hover:text-white transition-colors">Rent & Expense Calculator</Link></li>
              <li><Link to="/visits" className="hover:text-white transition-colors">Scheduled Visits</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Trust & Safety</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-400">Zero Brokerage Guarantee</li>
              <li className="text-slate-400">Identity Verification</li>
              <li className="text-slate-400">Scam Protection</li>
              <li className="text-slate-400">Dispute Moderation</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Roomly Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
