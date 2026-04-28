import { create } from 'zustand';
import type { Booking, BookingStatus } from '@/types';
import { initializeMockData } from '@/data/mockData';

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; booking?: Booking }>;
  getBookingsByRenter: (renterId: string) => Booking[];
  getBookingsByOwner: (ownerId: string) => Booking[];
  getAllBookings: () => Booking[];
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<{ success: boolean }>;
  cancelBooking: (id: string) => Promise<{ success: boolean }>;
  getUpcomingBookings: (userId: string, role: 'renter' | 'owner') => Booking[];
  getPastBookings: (userId: string, role: 'renter' | 'owner') => Booking[];
  getOwnerStats: (ownerId: string) => {
    totalEarnings: number;
    monthlyEarnings: number;
    totalBookings: number;
    occupancyRate: number;
    upcomingBookings: number;
  };
  getAdminStats: () => {
    totalUsers: number;
    totalVillas: number;
    totalBookings: number;
    totalRevenue: number;
    pendingApprovals: number;
  };
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  isLoading: false,

  createBooking: async (bookingData) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000));

    initializeMockData();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    
    const newBooking: Booking = {
      ...bookingData,
      id: `booking_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    set({ isLoading: false });
    return { success: true, booking: newBooking };
  },

  getBookingsByRenter: (renterId: string) => {
    initializeMockData();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as any[];
    const users = JSON.parse(localStorage.getItem('users') || '[]') as any[];
    
    return bookings
      .filter(b => b.renterId === renterId)
      .map(b => ({
        ...b,
        villa: villas.find(v => v.id === b.villaId),
        renter: users.find(u => u.id === b.renterId),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getBookingsByOwner: (ownerId: string) => {
    initializeMockData();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as any[];
    const users = JSON.parse(localStorage.getItem('users') || '[]') as any[];
    
    return bookings
      .filter(b => b.ownerId === ownerId)
      .map(b => ({
        ...b,
        villa: villas.find(v => v.id === b.villaId),
        renter: users.find(u => u.id === b.renterId),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAllBookings: () => {
    initializeMockData();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as any[];
    const users = JSON.parse(localStorage.getItem('users') || '[]') as any[];
    
    return bookings.map(b => ({
      ...b,
      villa: villas.find(v => v.id === b.villaId),
      renter: users.find(u => u.id === b.renterId),
    }));
  },

  updateBookingStatus: async (id, status) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 600));

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    const index = bookings.findIndex(b => b.id === id);
    
    if (index === -1) {
      set({ isLoading: false });
      return { success: false };
    }

    bookings[index].status = status;
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    set({ isLoading: false });
    return { success: true };
  },

  cancelBooking: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 600));

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    const index = bookings.findIndex(b => b.id === id);
    
    if (index === -1) {
      set({ isLoading: false });
      return { success: false };
    }

    bookings[index].status = 'cancelled';
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    set({ isLoading: false });
    return { success: true };
  },

  getUpcomingBookings: (userId, role) => {
    const bookings = role === 'renter' 
      ? get().getBookingsByRenter(userId)
      : get().getBookingsByOwner(userId);
    
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.checkIn >= today && b.status !== 'cancelled');
  },

  getPastBookings: (userId, role) => {
    const bookings = role === 'renter' 
      ? get().getBookingsByRenter(userId)
      : get().getBookingsByOwner(userId);
    
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => b.checkOut < today || b.status === 'cancelled');
  },

  getOwnerStats: (ownerId) => {
    const bookings = get().getBookingsByOwner(ownerId);
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as any[];
    const ownerVillas = villas.filter(v => v.ownerId === ownerId);
    
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const totalEarnings = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    const currentMonth = new Date().getMonth();
    const monthlyEarnings = confirmedBookings
      .filter(b => new Date(b.createdAt).getMonth() === currentMonth)
      .reduce((sum, b) => sum + b.totalPrice, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const upcomingBookings = bookings.filter(b => b.checkIn >= today && b.status === 'confirmed').length;
    
    // Calculate occupancy rate (simplified)
    const totalDays = ownerVillas.length * 30; // Approximate
    const bookedDays = confirmedBookings.reduce((sum, b) => {
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    const occupancyRate = totalDays > 0 ? Math.round((bookedDays / totalDays) * 100) : 0;
    
    return {
      totalEarnings,
      monthlyEarnings,
      totalBookings: confirmedBookings.length,
      occupancyRate,
      upcomingBookings,
    };
  },

  getAdminStats: () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as any[];
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as any[];
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const pendingApprovals = villas.filter(v => !v.isApproved).length;
    
    return {
      totalUsers: users.length,
      totalVillas: villas.length,
      totalBookings: bookings.length,
      totalRevenue,
      pendingApprovals,
    };
  },
}));
