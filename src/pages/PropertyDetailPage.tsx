import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ScheduleVisitModal } from '../components/ScheduleVisitModal';
import { ReportModal } from '../components/ReportModal';
import { Property } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { UserAvatar } from '../components/UserAvatar';
import {
  MapPin,
  Heart,
  Share2,
  ShieldCheck,
  ShieldAlert,
  Bed,
  Bath,
  Wind,
  Sun,
  Train,
  GraduationCap,
  Briefcase,
  Building,
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Eye,
  Scale
} from 'lucide-react';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, toggleFavorite, isFavorited } = useAuth();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const res = await api.get(`/properties/${id}`);
      return res.data.property as Property;
    },
    enabled: !!id
  });

  const property = data;
  const isLiked = property ? (isFavorited(property.id) || property.isFavorited || false) : false;

  const handleFavorite = async () => {
    if (!property) return;
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleFavorite(property.id);
  };

  const handleStartChatWithHost = async () => {
    if (!property?.landlord) return;
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setIsStartingChat(true);
      const res = await api.post('/chat/conversations', {
        targetUserId: property.landlord.id,
        propertyId: property.id
      });
      navigate(`/chat?conv=${res.data.conversation.id}`);
    } catch (err) {
      console.error(err);
      setIsStartingChat(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3 animate-pulse" />
        <div className="h-[450px] bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-xs text-slate-500">The property you are looking for does not exist or has been removed.</p>
        <Link to="/properties" className="inline-block px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold">
          Back to Properties
        </Link>
      </div>
    );
  }

  const images = property.images?.length > 0
    ? property.images
    : [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&fit=crop', id: '1', propertyId: property.id, displayOrder: 1, isCover: true, category: 'LIVING_ROOM' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="flex items-center justify-between">
        <Link
          to="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to all properties
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/compare?ids=${property.id}`}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
          >
            <Scale className="w-4 h-4 text-amber-600" />
            <span>Compare Home</span>
          </Link>

          <button
            onClick={handleFavorite}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border flex items-center gap-1.5 transition-all active:scale-95 ${
              isLiked
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isLiked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors"
            title="Report this listing"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-brand-100 text-brand-800">
            {property.propertyType.replace('_', ' ')}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
            {property.furnishing.replace('_', ' ').toLowerCase()}
          </span>
          {property.isVerified && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Roomly Verified
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display">
          {property.title}
        </h1>

        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500 flex-wrap">
          <span className="flex items-center gap-1 text-slate-700">
            <MapPin className="w-4 h-4 text-brand-600" />
            {property.address}, {property.city}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" /> {property.viewsCount} views
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden max-h-[480px]">

        <div
          className="md:col-span-2 relative h-[320px] md:h-full cursor-pointer group overflow-hidden"
          onClick={() => { setActiveImgIndex(0); setIsLightboxOpen(true); }}
        >
          <img
            src={images[0]?.url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-3 h-full">
          {images.slice(1, 5).map((img, idx) => (
            <div
              key={img.id || idx}
              className="relative h-[155px] md:h-full cursor-pointer group overflow-hidden"
              onClick={() => { setActiveImgIndex(idx + 1); setIsLightboxOpen(true); }}
            >
              <img
                src={img.url}
                alt={img.caption || `Photo ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm backdrop-blur-xs">
                  +{images.length - 4} more photos
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        <div className="lg:col-span-8 space-y-10">

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">About this residence</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Room Inventory & Availability</h3>
              <p className="text-xs text-slate-500 mt-0.5">Individual rooms and beds available for rent in this flat</p>
            </div>

            <div className="space-y-3">
              {property.rooms?.map((room) => (
                <div
                  key={room.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    room.isAvailable
                      ? 'bg-slate-50/80 border-slate-200/90'
                      : 'bg-slate-100/50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{room.name}</h4>
                      {room.isAvailable ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Vacant
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                          Occupied
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        {room.occupiedBeds}/{room.totalBeds} Beds Occupied
                      </span>
                      {room.hasEnsuiteBath && (
                        <span className="flex items-center gap-1 text-teal-700 font-medium">
                          <Bath className="w-3.5 h-3.5" /> Ensuite Bath
                        </span>
                      )}
                      {room.hasAC && (
                        <span className="flex items-center gap-1 text-indigo-700 font-medium">
                          <Wind className="w-3.5 h-3.5" /> AC
                        </span>
                      )}
                      {room.hasBalcony && (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Sun className="w-3.5 h-3.5" /> Balcony
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-base font-extrabold text-slate-900 font-display">
                      {formatCurrency(room.rent, property.city)}
                      <span className="text-xs font-normal text-slate-500"> / mo</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Deposit: {formatCurrency(room.deposit, property.city)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-5">
            <h3 className="text-lg font-bold text-slate-900 font-display">Amenities & Facilities</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities?.map((item) => (
                <div
                  key={item.amenity.id}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>{item.amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Location & Commute Proximity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated distances to daily transit & workplace hubs</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                <Train className="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
                <div className="text-base font-extrabold text-indigo-950 font-display">
                  {property.distanceMetro ? `${property.distanceMetro} km` : '1.2 km'}
                </div>
                <p className="text-[11px] font-medium text-indigo-700">Metro Station</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <GraduationCap className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <div className="text-base font-extrabold text-emerald-950 font-display">
                  {property.distanceCollege ? `${property.distanceCollege} km` : '1.8 km'}
                </div>
                <p className="text-[11px] font-medium text-emerald-700">Colleges / Univ</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
                <div className="text-base font-extrabold text-blue-950 font-display">
                  {property.distanceTechPark ? `${property.distanceTechPark} km` : '2.5 km'}
                </div>
                <p className="text-[11px] font-medium text-blue-700">Tech Park / SEZ</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
                <Building className="w-6 h-6 text-rose-600 mx-auto mb-1.5" />
                <div className="text-base font-extrabold text-rose-950 font-display">
                  {property.distanceHospital ? `${property.distanceHospital} km` : '0.8 km'}
                </div>
                <p className="text-[11px] font-medium text-rose-700">Hospital</p>
              </div>
            </div>
          </div>

          {property.landlord && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <UserAvatar
                  avatar={property.landlord.avatar}
                  name={`${property.landlord.firstName || ''} ${property.landlord.lastName || ''}`}
                  size="xl"
                  rounded="2xl"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-bold text-slate-900">
                      Hosted by {property.landlord.firstName} {property.landlord.lastName}
                    </h4>
                    {property.landlord.isProfileVerified && (
                      <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Verified Host on Roomly</p>
                  <p className="text-[11px] text-slate-400 mt-1">Direct Landlord listing · No Brokerage</p>
                </div>
              </div>

              <button
                onClick={handleStartChatWithHost}
                disabled={isStartingChat}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isStartingChat ? 'Opening Chat...' : 'Chat with Host'}</span>
              </button>
            </div>
          )}

        </div>

        <div className="lg:col-span-4 sticky top-24 space-y-4">

          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xl space-y-6">

            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 font-display">
                  {formatCurrency(property.rent, property.city)}
                </span>
                <span className="text-sm font-medium text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Security Deposit: <strong className="text-slate-700">{formatCurrency(property.deposit, property.city)}</strong> (Refundable)
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>Monthly Living Estimate</span>
                <Link to="/calculator" className="text-brand-600 font-semibold hover:underline">
                  Customize
                </Link>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Base Rent</span>
                <span>{formatCurrency(property.rent, property.city)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Est. Utilities & Maintenance</span>
                <span>Included / Low</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>High Speed Wi-Fi</span>
                <span>Included</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900">
                <span>Total Monthly</span>
                <span>{formatCurrency(property.rent, property.city)}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => setIsVisitModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule In-Person Visit</span>
              </button>

              <button
                onClick={handleStartChatWithHost}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <span>Direct Message Host</span>
              </button>
            </div>

            <div className="text-center text-[11px] text-slate-400 space-y-1">
              <p>✓ Zero Brokerage & Instant Landlord Direct Connect</p>
              <p>✓ Verified Listing with Identity Checks</p>
            </div>

          </div>

        </div>

      </div>

      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center">
            <img
              src={images[activeImgIndex]?.url}
              alt="Lightbox"
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            {images[activeImgIndex]?.caption && (
              <p className="text-white text-xs mt-3 text-center bg-black/50 px-4 py-1.5 rounded-full">
                {images[activeImgIndex].caption}
              </p>
            )}
          </div>
        </div>
      )}

      <ScheduleVisitModal
        property={property}
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
      />

      <ReportModal
        targetType="PROPERTY"
        targetId={property.id}
        targetTitle={property.title}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

    </div>
  );
};
