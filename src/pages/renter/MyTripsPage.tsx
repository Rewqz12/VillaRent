import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ChevronRight, X, AlertCircle, Home } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, formatDate, slideUp, staggerContainer } from '@/lib/utils';
import type { Booking } from '@/types';

interface MyTripsPageProps {
  onNavigate: (page: any, villaId?: string) => void;
}

export default function MyTripsPage({ onNavigate }: MyTripsPageProps) {
  const { user } = useAuthStore();
  const { cancelBooking, getUpcomingBookings, getPastBookings } = useBookingStore();
  const [upcomingTrips, setUpcomingTrips] = useState<Booking[]>([]);
  const [pastTrips, setPastTrips] = useState<Booking[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      setUpcomingTrips(getUpcomingBookings(user.id, 'renter'));
      setPastTrips(getPastBookings(user.id, 'renter'));
    }
  }, [user]);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    setIsCancelling(true);
    await cancelBooking(selectedBooking.id);
    
    // Refresh trips
    if (user) {
      setUpcomingTrips(getUpcomingBookings(user.id, 'renter'));
      setPastTrips(getPastBookings(user.id, 'renter'));
    }
    
    setIsCancelling(false);
    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const TripCard = ({ booking, isUpcoming }: { booking: Booking; isUpcoming: boolean }) => (
    <motion.div
      variants={slideUp}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
            <img
              src={booking.villa?.images[0]}
              alt={booking.villa?.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content */}
          <CardContent className="flex-1 p-5">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getStatusBadge(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                  </span>
                </div>
                
                <h3 
                  className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer group-hover:text-orange-500 transition-colors"
                  onClick={() => onNavigate('villa-detail', booking.villaId)}
                >
                  {booking.villa?.title}
                </h3>
                
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {booking.villa?.location}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {booking.guests} guests
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                  <span className="text-sm text-gray-500"> total</span>
                </div>
                
                <div className="flex space-x-2">
                  {isUpcoming && booking.status !== 'cancelled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setCancelDialogOpen(true);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => onNavigate('villa-detail', booking.villaId)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    View
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );

  const EmptyState = ({ type }: { type: 'upcoming' | 'past' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {type === 'upcoming' ? (
          <Calendar className="w-10 h-10 text-gray-400" />
        ) : (
          <Home className="w-10 h-10 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type} trips
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {type === 'upcoming'
          ? "You don't have any upcoming trips. Start exploring and book your next adventure!"
          : "You haven't completed any trips yet."}
      </p>
      {type === 'upcoming' && (
        <Button
          onClick={() => onNavigate('listings')}
          className="bg-orange-500 hover:bg-orange-600"
        >
          Explore Villas
        </Button>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600 mt-2">Manage your bookings and view your trip history</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingTrips.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastTrips.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              {upcomingTrips.length === 0 ? (
                <EmptyState type="upcoming" />
              ) : (
                upcomingTrips.map((booking) => (
                  <TripCard key={booking.id} booking={booking} isUpcoming={true} />
                ))
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="past">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              {pastTrips.length === 0 ? (
                <EmptyState type="past" />
              ) : (
                pastTrips.map((booking) => (
                  <TripCard key={booking.id} booking={booking} isUpcoming={false} />
                ))
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking at {selectedBooking?.villa?.title}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
