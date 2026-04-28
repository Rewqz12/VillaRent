// User Types
export type UserRole = 'renter' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
}

// Villa Types
export interface Villa {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  ownerId: string;
  isApproved: boolean;
  isActive: boolean;
  availability: {
    startDate: string;
    endDate: string;
  }[];
  houseRules: string[];
  createdAt: string;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  villaId: string;
  renterId: string;
  ownerId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  villa?: Villa;
  renter?: User;
}

// Chat Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  otherUser?: User;
}

// Filter Types
export interface VillaFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
  minRating?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

// Search Params
export interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

// Stats Types
export interface OwnerStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalBookings: number;
  occupancyRate: number;
  upcomingBookings: number;
}

export interface AdminStats {
  totalUsers: number;
  totalVillas: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
}
