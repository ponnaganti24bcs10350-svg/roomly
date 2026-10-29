export type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isProfileVerified: boolean;
  createdAt: string;
  roommateProfile?: RoommateProfile | null;
  favoritePropertyIds?: string[];
}

export interface RoommateProfile {
  id: string;
  userId: string;
  budgetMin: number;
  budgetMax: number;
  preferredCity: string;
  preferredLocations?: string | null;
  occupation?: string | null;
  companyOrCollege?: string | null;
  age?: number | null;
  gender?: string | null;
  sleepSchedule: 'EARLY_BIRD' | 'NIGHT_OWL' | 'FLEXIBLE' | string;
  foodPreference: 'VEG' | 'NON_VEG' | 'VEGAN' | 'FLEXIBLE' | string;
  cleanliness: number;
  smoking: 'SMOKER' | 'NON_SMOKER' | 'OUTSIDE_ONLY' | string;
  pets: 'HAS_PETS' | 'LOVES_PETS' | 'NO_PETS' | string;
  socialLevel: number;
  guests: 'RARELY' | 'SOMETIMES' | 'FREQUENTLY' | string;
  noiseTolerance: number;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompatibilityReason {
  type: 'positive' | 'warning' | 'info';
  category: 'budget' | 'location' | 'lifestyle' | 'habits';
  text: string;
}

export interface CompatibilityResult {
  overallScore: number;
  breakdown: {
    budget: number;
    location: number;
    lifestyle: number;
    habits: number;
  };
  reasons: CompatibilityReason[];
}

export interface RoommateCandidate extends RoommateProfile {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    isProfileVerified: boolean;
    createdAt: string;
  };
  compatibility?: CompatibilityResult | null;
}

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  caption?: string | null;
  category: string;
  displayOrder: number;
  isCover: boolean;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  rent: number;
  deposit: number;
  totalBeds: number;
  occupiedBeds: number;
  isAvailable: boolean;
  hasEnsuiteBath?: boolean;
  hasBalcony?: boolean;
  hasAC?: boolean;
}

export interface Property {
  id: string;
  landlordId: string;
  landlord?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
    isProfileVerified?: boolean;
    createdAt?: string;
  };
  title: string;
  description: string;
  propertyType: 'APARTMENT' | 'HOUSE' | 'PG' | 'HOSTEL' | 'STUDIO' | 'SHARED_ROOM' | string;
  furnishing: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED' | string;
  address: string;
  city: string;
  neighborhood?: string | null;
  latitude: number;
  longitude: number;
  rent: number;
  deposit: number;
  availableFrom: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW' | string;
  isVerified: boolean;
  featured: boolean;
  viewsCount: number;
  distanceMetro?: number | null;
  distanceCollege?: number | null;
  distanceTechPark?: number | null;
  distanceHospital?: number | null;
  images: PropertyImage[];
  amenities: { amenity: Amenity }[];
  rooms: Room[];
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VisitRequest {
  id: string;
  tenantId: string;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    isProfileVerified?: boolean;
    roommateProfile?: RoommateProfile | null;
  };
  propertyId: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    rent?: number;
    images: { url: string }[];
    landlord?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      avatar?: string | null;
    };
  };
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  landlordNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    avatar?: string | null;
    role?: string;
  };
  property?: {
    id: string;
    title: string;
    rent: number;
    city: string;
    images: { url: string }[];
  } | null;
  lastMessage?: Message | null;
  lastMessageAt: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  targetType: 'PROPERTY' | 'USER';
  targetPropertyId?: string | null;
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    status: string;
  } | null;
  targetUserId?: string | null;
  targetUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  } | null;
  reason: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}
