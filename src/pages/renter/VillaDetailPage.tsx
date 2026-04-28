import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Users, 
  Bed, 
  Bath, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Share,
  Check,
  Calendar,
  MessageSquare,
  Home,
  Shield,
  Sparkles
} from 'lucide-react';
import { useVillaStore } from '@/stores/villaStore';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, getInitials, calculateNights, slideUp, staggerContainer } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface VillaDetailPageProps {
  villaId: string | null;
  onNavigate: (page: any, villaId?: string) => void;
}

export default function VillaDetailPage({ villaId, onNavigate }: VillaDetailPageProps) {
  const { getVillaById } = useVillaStore();
  const { isAuthenticated, user } = useAuthStore();
  const { createConversation } = useChatStore();
  const [villa, setVilla] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    if (villaId) {
      const villaData = getVillaById(villaId);
      if (villaData) {
        // Get owner info
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const owner = users.find((u: any) => u.id === villaData.ownerId);
        setVilla({ ...villaData, owner });
      }
    }
  }, [villaId]);

  if (!villa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Villa not found</h2>
          <Button onClick={() => onNavigate('listings')} className="bg-orange-500 hover:bg-orange-600">
            Browse Villas
          </Button>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? calculateNights(checkIn.toISOString(), checkOut.toISOString()) : 0;
  const subtotal = nights * villa.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % villa.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + villa.images.length) % villa.images.length);
  };

  const handleContactOwner = async () => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    
    const result = await createConversation([user!.id, villa.ownerId]);
    if (result.success) {
      // Open chat widget or navigate to messages
      alert('Chat conversation created! Check the chat widget.');
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    onNavigate('booking', villa.id);
  };

  const amenityIcons: { [key: string]: string } = {
    'Private Pool': '🏊',
    'Ocean View': '🌊',
    'WiFi': '📶',
    'Air Conditioning': '❄️',
    'Kitchen': '🍳',
    'Parking': '🚗',
    'Garden': '🌳',
    'BBQ Grill': '🔥',
    'Beach Access': '🏖️',
    'Mountain View': '🏔️',
    'Fireplace': '🔥',
    'Hot Tub': '🛁',
    'Yoga Deck': '🧘',
    'Spa Room': '💆',
    'Rooftop Terrace': '🏢',
    'Butler Service': '🤵',
    'Private Chef': '👨‍🍳',
    'Golf Access': '⛳',
    'Surfboard Storage': '🏄',
    'Outdoor Shower': '🚿',
    'Playground': '🎪',
    'Bonfire Area': '🔥',
    'Traditional Architecture': '🏛️',
    'Cultural Shows': '🎭',
    'Batik Workshop': '🎨',
    'Palace Architecture': '👑',
    'Island Location': '🏝️',
    'Bicycles': '🚲',
    'Sun Deck': '☀️',
    'Snorkeling Gear': '🤿',
    'Beach Chairs': '🪑',
    'Highland View': '⛰️',
    'River View': '🌊',
    'Fishing Spot': '🎣',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="relative h-[50vh] lg:h-[60vh] bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            src={villa.images[currentImageIndex]}
            alt={villa.title}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        
        {/* Navigation Arrows */}
        {villa.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        
        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {villa.images.map((_img: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImageIndex ? 'w-8 bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        
        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex space-x-3">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => onNavigate('listings')}
          className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Header */}
              <motion.div variants={slideUp} className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{villa.title}</h1>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {villa.address}
                    </div>
                  </div>
                  <div className="flex items-center bg-orange-50 px-3 py-2 rounded-lg">
                    <Star className="w-5 h-5 text-orange-500 mr-1 fill-current" />
                    <span className="font-semibold text-gray-900">{villa.rating}</span>
                    <span className="text-gray-500 ml-1">({villa.reviewCount} reviews)</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={slideUp} className="flex flex-wrap gap-4 mb-6">
                <Badge variant="secondary" className="px-4 py-2">
                  <Bed className="w-4 h-4 mr-2" />
                  {villa.bedrooms} Bedrooms
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Bath className="w-4 h-4 mr-2" />
                  {villa.bathrooms} Bathrooms
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  Up to {villa.maxGuests} guests
                </Badge>
              </motion.div>

              <Separator className="my-6" />

              {/* Description */}
              <motion.div variants={slideUp} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this place</h2>
                <p className="text-gray-600 leading-relaxed">{villa.description}</p>
              </motion.div>

              <Separator className="my-6" />

              {/* Amenities */}
              <motion.div variants={slideUp} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 gap-4">
                  {(showAllAmenities ? villa.amenities : villa.amenities.slice(0, 6)).map((amenity: string) => (
                    <div key={amenity} className="flex items-center text-gray-700">
                      <span className="text-2xl mr-3">{amenityIcons[amenity] || '✨'}</span>
                      {amenity}
                    </div>
                  ))}
                </div>
                {villa.amenities.length > 6 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4"
                  >
                    {showAllAmenities ? 'Show less' : `Show all ${villa.amenities.length} amenities`}
                  </Button>
                )}
              </motion.div>

              <Separator className="my-6" />

              {/* House Rules */}
              <motion.div variants={slideUp} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">House Rules</h2>
                <ul className="space-y-3">
                  {villa.houseRules.map((rule: string, index: number) => (
                    <li key={index} className="flex items-start text-gray-600">
                      <Check className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <Separator className="my-6" />

              {/* Owner Info */}
              <motion.div variants={slideUp} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Hosted by {villa.owner?.name}</h2>
                <div className="flex items-center">
                  <Avatar className="w-16 h-16 mr-4">
                    <AvatarImage src={villa.owner?.avatar} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">
                      {getInitials(villa.owner?.name || 'H')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{villa.owner?.name}</p>
                    <p className="text-gray-500">Superhost • Joined {new Date(villa.owner?.createdAt).getFullYear()}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-orange-500 mr-1 fill-current" />
                      <span className="text-sm text-gray-600">{villa.rating} rating</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleContactOwner}
                    className="ml-auto"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(villa.pricePerNight)}
                      </span>
                      <span className="text-gray-500"> / night</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-orange-500 mr-1 fill-current" />
                      <span className="font-medium">{villa.rating}</span>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <Calendar className="w-4 h-4 mr-2" />
                            {checkIn ? format(checkIn, 'MMM dd') : 'Check in'}
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
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <Calendar className="w-4 h-4 mr-2" />
                            {checkOut ? format(checkOut, 'MMM dd') : 'Check out'}
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

                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full h-10 px-3 border rounded-md text-sm"
                    >
                      {Array.from({ length: villa.maxGuests }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} guest{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Breakdown */}
                  {nights > 0 && (
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {formatCurrency(villa.pricePerNight)} x {nights} nights
                        </span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service fee</span>
                        <span>{formatCurrency(serviceFee)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBookNow}
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  >
                    {isAuthenticated ? 'Book Now' : 'Sign in to Book'}
                  </Button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    You won't be charged yet
                  </p>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Verified
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Superhost
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
