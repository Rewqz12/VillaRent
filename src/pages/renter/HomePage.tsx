import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Loader2 } from 'lucide-react';
import { useVillaStore } from '@/stores/villaStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, slideUp, staggerContainer } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface HomePageProps {
  onNavigate: (page: any, villaId?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { featuredVillas, refreshVillas } = useVillaStore();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    refreshVillas();
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      onNavigate('listings');
    }, 500);
  };

  const locations = ['Bali', 'Bandung', 'Bogor', 'Yogyakarta', 'Lombok'];

  const amenities = [
    { icon: '🏊', label: 'Private Pool' },
    { icon: '🌊', label: 'Ocean View' },
    { icon: '🏖️', label: 'Beach Access' },
    { icon: '🏔️', label: 'Mountain View' },
    { icon: '📶', label: 'WiFi' },
    { icon: '❄️', label: 'AC' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h1
              variants={slideUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Find Your Perfect
              <span className="text-orange-400"> Villa Getaway</span>
            </motion.h1>
            <motion.p
              variants={slideUp}
              className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto"
            >
              Discover luxury villas across Indonesia's most beautiful destinations
            </motion.p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            variants={slideUp}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-orange-500" />
                      Location
                    </label>
                    <Input
                      placeholder="Where to?"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {/* Check In */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-orange-500" />
                      Check In
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-start text-left font-normal"
                        >
                          {checkIn ? format(checkIn, 'MMM dd') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={checkIn}
                          onSelect={setCheckIn}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Check Out */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-orange-500" />
                      Check Out
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-start text-left font-normal"
                        >
                          {checkOut ? format(checkOut, 'MMM dd') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => date <= (checkIn || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Guests & Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Users className="w-4 h-4 mr-1 text-orange-500" />
                      Guests
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="flex-1 h-12 px-3 border rounded-md text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} guest{n > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="h-12 px-6 bg-orange-500 hover:bg-orange-600"
                      >
                        {isSearching ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Search className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Locations */}
          <motion.div
            variants={slideUp}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {locations.map((loc) => (
              <motion.button
                key={loc}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation(loc)}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm hover:bg-white/30 transition-colors"
              >
                {loc}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Villas Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={slideUp} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Villas
            </motion.h2>
            <motion.p variants={slideUp} className="text-gray-600 max-w-2xl mx-auto">
              Handpicked luxury villas with exceptional ratings and reviews
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredVillas.slice(0, 6).map((villa) => (
              <motion.div
                key={villa.id}
                variants={slideUp}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-3">{villa.bedrooms} beds</span>
                        <span>{villa.bathrooms} baths</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-orange-600">
                          {formatCurrency(villa.pricePerNight)}
                        </span>
                        <span className="text-sm text-gray-500">/night</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => onNavigate('listings')}
              variant="outline"
              size="lg"
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              View All Villas
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={slideUp} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Premium Amenities
            </motion.h2>
            <motion.p variants={slideUp} className="text-gray-600 max-w-2xl mx-auto">
              All our villas come equipped with top-tier amenities for your comfort
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {amenities.map((amenity) => (
              <motion.div
                key={amenity.label}
                variants={slideUp}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-colors cursor-pointer"
              >
                <span className="text-4xl mb-3">{amenity.icon}</span>
                <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center text-white"
          >
            <motion.h2 variants={slideUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to List Your Villa?
            </motion.h2>
            <motion.p variants={slideUp} className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of villa owners earning extra income by renting their properties
            </motion.p>
            <motion.div variants={slideUp}>
              <Button
                onClick={() => onNavigate('signup')}
                size="lg"
                className="bg-white text-orange-500 hover:bg-gray-100"
              >
                Become a Host
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
