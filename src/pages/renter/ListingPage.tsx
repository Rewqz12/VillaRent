import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Filter, Grid3X3, Map as MapIcon } from 'lucide-react';
import { useVillaStore } from '@/stores/villaStore';
import type { Villa, VillaFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatCurrency } from '@/lib/utils';
import VillaMap from '@/components/map/VillaMap';

interface ListingPageProps {
  onNavigate: (page: any, villaId?: string) => void;
}

export default function ListingPage({ onNavigate }: ListingPageProps) {
  const { searchVillas } = useVillaStore();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState<VillaFilters>({
    location: '',
    minPrice: 0,
    maxPrice: 10000000,
    bedrooms: 0,
    amenities: [],
    minRating: 0,
  });

  const [priceRange, setPriceRange] = useState([0, 10000000]);

  const amenitiesList = [
    'Private Pool',
    'Ocean View',
    'WiFi',
    'Air Conditioning',
    'Kitchen',
    'Parking',
    'Garden',
    'BBQ Grill',
    'Beach Access',
    'Mountain View',
  ];

  const locations = ['All', 'Bali', 'Bandung', 'Bogor', 'Yogyakarta', 'Lombok'];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const results = searchVillas(filters);
      setVillas(results);
      setIsLoading(false);
    }, 500);
  }, [filters]);

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setFilters({ ...filters, minPrice: value[0], maxPrice: value[1] });
  };

  const handleAmenityToggle = (amenity: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    setFilters({ ...filters, amenities: updated });
  };

  const handleLocationSelect = (location: string) => {
    setFilters({ ...filters, location: location === 'All' ? '' : location });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: 0,
      maxPrice: 10000000,
      bedrooms: 0,
      amenities: [],
      minRating: 0,
    });
    setPriceRange([0, 10000000]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={handlePriceChange}
          max={10000000}
          step={100000}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Bedrooms</h4>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setFilters({ ...filters, bedrooms: num })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.bedrooms === num
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {num}+ beds
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Rating</h4>
        <div className="flex flex-wrap gap-2">
          {[4.5, 4.0, 3.5].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters({ ...filters, minRating: rating })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                filters.minRating === rating
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4 mr-1 fill-current" />
              {rating}+
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Amenities</h4>
        <div className="space-y-2">
          {amenitiesList.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <Checkbox
                checked={filters.amenities?.includes(amenity)}
                onCheckedChange={() => handleAmenityToggle(amenity)}
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by location or villa name..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="pl-10 h-12"
              />
            </div>

            {/* View Toggle & Filters */}
            <div className="flex items-center space-x-3">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Location Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => handleLocationSelect(location)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (location === 'All' && !filters.location) || filters.location === location
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-36 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Clear
                </button>
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {isLoading ? (
                  'Loading...'
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">{villas.length}</span> villas found
                  </>
                )}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {isLoading ? (
                    // Skeleton loaders
                    Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="h-64 bg-gray-200 animate-pulse" />
                        <CardContent className="p-5">
                          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
                          <div className="flex justify-between">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : villas.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No villas found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your filters to see more results
                      </p>
                      <Button onClick={clearFilters} variant="outline">
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    villas.map((villa, index) => (
                      <motion.div
                        key={villa.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8 }}
                        className="group cursor-pointer"
                        onClick={() => onNavigate('villa-detail', villa.id)}
                      >
                        <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                          <div className="relative h-64 overflow-hidden">
                            <img
                              src={villa.images[0]}
                              alt={villa.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-orange-500 text-white">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                {villa.rating}
                              </Badge>
                            </div>
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-white/90 text-gray-900">
                                {villa.location}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                              {villa.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                              {villa.description}
                            </p>
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <span className="mr-3">{villa.bedrooms} beds</span>
                              <span>{villa.bathrooms} baths</span>
                              <span className="mx-2">•</span>
                              <span>Up to {villa.maxGuests} guests</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {villa.amenities.slice(0, 3).map((amenity) => (
                                <span
                                  key={amenity}
                                  className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {villa.amenities.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                  +{villa.amenities.length - 3}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div>
                                <span className="text-lg font-bold text-orange-600">
                                  {formatCurrency(villa.pricePerNight)}
                                </span>
                                <span className="text-sm text-gray-500">/night</span>
                              </div>
                              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[calc(100vh-280px)] rounded-xl overflow-hidden shadow-lg"
                >
                  <VillaMap
                    villas={villas}
                    onVillaClick={(villaId: string) => onNavigate('villa-detail', villaId)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
