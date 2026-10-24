import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Amenity } from '../types';
import {
  Building,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Bed,
  Train,
  ChevronLeft,
  DollarSign
} from 'lucide-react';

export const AddPropertyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [furnishing, setFurnishing] = useState('FURNISHED');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [neighborhood, setNeighborhood] = useState('Koramangala');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [distanceMetro, setDistanceMetro] = useState('1.5');
  const [distanceTechPark, setDistanceTechPark] = useState('2.0');

  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&fit=crop'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [rooms, setRooms] = useState([
    { name: 'Master Bedroom', rent: 16000, deposit: 35000, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
    { name: 'Deluxe Room B', rent: 14000, deposit: 30000, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: false, hasBalcony: false, hasAC: true }
  ]);

  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: amenitiesData } = useQuery({
    queryKey: ['amenities-list'],
    queryFn: async () => {
      const res = await api.get('/properties/amenities');
      return res.data.amenities as Amenity[];
    }
  });

  const handleToggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        name: `Room ${prev.length + 1}`,
        rent: parseInt(rent, 10) ? Math.round(parseInt(rent, 10) / (prev.length + 1)) : 12000,
        deposit: 25000,
        totalBeds: 1,
        occupiedBeds: 0,
        isAvailable: true,
        hasEnsuiteBath: false,
        hasBalcony: false,
        hasAC: false
      }
    ]);
  };

  const handleRemoveRoom = (index: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRoom = (index: number, field: string, value: any) => {
    setRooms((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !address || !rent || !deposit) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        title,
        description,
        propertyType,
        furnishing,
        address,
        city,
        neighborhood,
        rent: parseInt(rent, 10),
        deposit: parseInt(deposit, 10),
        distanceMetro: parseFloat(distanceMetro) || null,
        distanceTechPark: parseFloat(distanceTechPark) || null,
        amenityIds: selectedAmenityIds,
        images: imageUrls.map((url) => ({ url, category: 'LIVING_ROOM' })),
        rooms
      };

      const res = await api.post('/properties', payload);
      navigate(`/properties/${res.data.property.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <Link
        to="/dashboard/landlord"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Landlord Dashboard
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-card space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Publish New Property Listing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fill in the details below to list your flat, rooms, and amenities on the Roomly marketplace.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              1. General Listing Info
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Property Headline / Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunlit 3BHK Penthouse with Private Balcony"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Detailed Description *</label>
              <textarea
                required
                rows={4}
                placeholder="Highlight key features, building amenities, nearby landmarks, and tenant expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium bg-white"
                >
                  <option value="APARTMENT">Apartment / Flat</option>
                  <option value="STUDIO">Studio Apartment</option>
                  <option value="PG">Co-living / PG</option>
                  <option value="HOUSE">Independent House</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Furnishing Level</label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium bg-white"
                >
                  <option value="FURNISHED">Fully Furnished</option>
                  <option value="SEMI_FURNISHED">Semi-Furnished</option>
                  <option value="UNFURNISHED">Unfurnished</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              2. Location & Commute
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium bg-white"
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Neighborhood / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Koramangala 4th Block"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Street Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 14th Main Road, Sector 3, HSR Layout"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Distance to Metro (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={distanceMetro}
                  onChange={(e) => setDistanceMetro(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Distance to Tech Park (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={distanceTechPark}
                  onChange={(e) => setDistanceTechPark(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              3. Financials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Monthly Rent (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 16500"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Security Deposit (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 35000"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Individual Rooms & Vacancy
              </h3>
              <button
                type="button"
                onClick={handleAddRoom}
                className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 font-bold text-xs flex items-center gap-1 hover:bg-brand-100"
              >
                <Plus className="w-3.5 h-3.5" /> Add Room
              </button>
            </div>

            <div className="space-y-3">
              {rooms.map((room, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => handleUpdateRoom(idx, 'name', e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 flex-1 bg-white"
                      placeholder="Room Name"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">₹</span>
                      <input
                        type="number"
                        value={room.rent}
                        onChange={(e) => handleUpdateRoom(idx, 'rent', Number(e.target.value))}
                        className="w-24 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                        placeholder="Rent"
                      />
                      {rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRoom(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={room.hasEnsuiteBath}
                        onChange={(e) => handleUpdateRoom(idx, 'hasEnsuiteBath', e.target.checked)}
                        className="rounded text-brand-600"
                      />
                      <span>Ensuite Bath</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={room.hasAC}
                        onChange={(e) => handleUpdateRoom(idx, 'hasAC', e.target.checked)}
                        className="rounded text-brand-600"
                      />
                      <span>Air Conditioning</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={room.hasBalcony}
                        onChange={(e) => handleUpdateRoom(idx, 'hasBalcony', e.target.checked)}
                        className="rounded text-brand-600"
                      />
                      <span>Balcony</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              5. Amenities & Facilities
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {amenitiesData?.map((a) => {
                const isChecked = selectedAmenityIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleToggleAmenity(a.id)}
                    className={`p-3 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                      isChecked
                        ? 'bg-brand-50 border-brand-500 text-brand-800'
                        : 'bg-slate-50 border-slate-200/70 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isChecked ? 'text-brand-600' : 'text-slate-300'}`} />
                    <span>{a.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              6. Photos & Exterior Views
            </h3>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste direct high-res image URL (Unsplash, CDN, etc.)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Add Photo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 group">
                  <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/dashboard/landlord"
              className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Listing...' : 'Publish Property to Marketplace'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
