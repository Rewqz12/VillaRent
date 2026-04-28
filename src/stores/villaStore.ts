import { create } from 'zustand';
import type { Villa, VillaFilters } from '@/types';
import { initializeMockData } from '@/data/mockData';

interface VillaState {
  villas: Villa[];
  featuredVillas: Villa[];
  selectedVilla: Villa | null;
  isLoading: boolean;
  searchVillas: (filters: VillaFilters) => Villa[];
  getVillaById: (id: string) => Villa | null;
  getVillasByOwner: (ownerId: string) => Villa[];
  addVilla: (villa: Omit<Villa, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => Promise<{ success: boolean; villa?: Villa }>;
  updateVilla: (id: string, villaData: Partial<Villa>) => Promise<{ success: boolean }>;
  deleteVilla: (id: string) => Promise<{ success: boolean }>;
  approveVilla: (id: string) => Promise<{ success: boolean }>;
  setSelectedVilla: (villa: Villa | null) => void;
  refreshVillas: () => void;
}

export const useVillaStore = create<VillaState>((set) => ({
  villas: [],
  featuredVillas: [],
  selectedVilla: null,
  isLoading: false,

  refreshVillas: () => {
    initializeMockData();
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as Villa[];
    const approvedVillas = villas.filter(v => v.isApproved && v.isActive);
    const featured = approvedVillas
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
    set({ villas: approvedVillas, featuredVillas: featured });
  },

  searchVillas: (filters: VillaFilters) => {
    initializeMockData();
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as Villa[];
    let results = villas.filter(v => v.isApproved && v.isActive);

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      results = results.filter(v => 
        v.location.toLowerCase().includes(locationLower) ||
        v.address.toLowerCase().includes(locationLower) ||
        v.title.toLowerCase().includes(locationLower)
      );
    }

    if (filters.minPrice !== undefined) {
      results = results.filter(v => v.pricePerNight >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter(v => v.pricePerNight <= filters.maxPrice!);
    }

    if (filters.bedrooms) {
      results = results.filter(v => v.bedrooms >= filters.bedrooms!);
    }

    if (filters.amenities && filters.amenities.length > 0) {
      results = results.filter(v => 
        filters.amenities!.every(amenity => v.amenities.includes(amenity))
      );
    }

    if (filters.minRating) {
      results = results.filter(v => v.rating >= filters.minRating!);
    }

    return results;
  },

  getVillaById: (id: string) => {
    initializeMockData();
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as Villa[];
    return villas.find(v => v.id === id) || null;
  },

  getVillasByOwner: (ownerId: string) => {
    initializeMockData();
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as Villa[];
    return villas.filter(v => v.ownerId === ownerId);
  },

  addVilla: async (villaData) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));

    initializeMockData();
    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as Villa[];
    
    const newVilla: Villa = {
      ...villaData,
      id: `villa_${Date.now()}`,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    villas.push(newVilla);
    localStorage.setItem('villas', JSON.stringify(villas));
    
    set({ isLoading: false });
    return { success: true, villa: newVilla };
  },

  updateVilla: async (id, villaData) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 600));

    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as Villa[];
    const index = villas.findIndex(v => v.id === id);
    
    if (index === -1) {
      set({ isLoading: false });
      return { success: false };
    }

    villas[index] = { ...villas[index], ...villaData };
    localStorage.setItem('villas', JSON.stringify(villas));
    
    set({ isLoading: false });
    return { success: true };
  },

  deleteVilla: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 600));

    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as Villa[];
    const filtered = villas.filter(v => v.id !== id);
    localStorage.setItem('villas', JSON.stringify(filtered));
    
    set({ isLoading: false });
    return { success: true };
  },

  approveVilla: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 600));

    const villas = JSON.parse(localStorage.getItem('villas') || '[]') as Villa[];
    const index = villas.findIndex(v => v.id === id);
    
    if (index === -1) {
      set({ isLoading: false });
      return { success: false };
    }

    villas[index].isApproved = true;
    localStorage.setItem('villas', JSON.stringify(villas));
    
    set({ isLoading: false });
    return { success: true };
  },

  setSelectedVilla: (villa) => {
    set({ selectedVilla: villa });
  },
}));
