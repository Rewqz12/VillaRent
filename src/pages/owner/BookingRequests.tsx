import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Check, 
  X, 
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, formatDate, getInitials, slideUp, staggerContainer } from '@/lib/utils';
import type { Booking } from '@/types';

export default function BookingRequests() {
  const { user } = useAuthStore();
  const { getBookingsByOwner, updateBookingStatus } = useBookingStore();
  const { createConversation } = useChatStore();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; type: 'accept' | 'reject' | null; booking: Booking | null }>({
    open: false,
    type: null,
    booking: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      setBookings(getBookingsByOwner(user.id));
    }
  }, [user]);

  const handleAction = async () => {
    if (!actionDialog.booking || !actionDialog.type) return;
    
    setIsProcessing(true);
    
    const newStatus = actionDialog.type === 'accept' ? 'confirmed' : 'cancelled';
    await updateBookingStatus(actionDialog.booking.id, newStatus);
    
    // Refresh bookings
    if (user) {
      setBookings(getBookingsByOwner(user.id));
    }
    
    setIsProcessing(false);
    setActionDialog({ open: false, type: null, booking: null });
  };

  const handleContactGuest = async (booking: Booking) => {
    const result = await createConversation([user!.id, booking.renterId]);
    if (result.success) {
      alert('Chat conversation created! Check the chat widget.');
    }
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

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <motion.div variants={slideUp}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Villa Image */}
            <img
              src={booking.villa?.images[0]}
              alt={booking.villa?.title}
              className="w-full lg:w-48 h-48 lg:h-32 rounded-lg object-cover"
            />
            
            {/* Booking Details */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusBadge(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Booked {formatDate(booking.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.villa?.title}</h3>
                  <p className="text-gray-500 text-sm">{booking.villa?.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
              
              {/* Guest Info */}
              <div className="flex items-center mt-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={booking.renter?.avatar} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(booking.renter?.name || 'G')}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">{booking.renter?.name}</p>
                  <p className="text-sm text-gray-500">{booking.guests} guests</p>
                </div>
              </div>
              
              {/* Dates */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Check-in: {formatDate(booking.checkIn)}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Check-out: {formatDate(booking.checkOut)}
                </div>
              </div>
              
              {/* Actions */}
              {booking.status === 'pending' && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button
                    onClick={() => setActionDialog({ open: true, type: 'accept', booking })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActionDialog({ open: true, type: 'reject', booking })}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleContactGuest(booking)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Guest
                  </Button>
                </div>
              )}
              
              {booking.status === 'confirmed' && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => handleContactGuest(booking)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Guest
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
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
          <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
          <p className="text-gray-600 mt-2">Manage and respond to booking requests</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total', count: bookings.length, color: 'bg-gray-500' },
            { label: 'Pending', count: pendingCount, color: 'bg-yellow-500' },
            { label: 'Confirmed', count: confirmedCount, color: 'bg-green-500' },
            { label: 'Completed', count: completedCount, color: 'bg-blue-500' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={slideUp}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" onClick={() => setFilterStatus('all')}>
              All ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setFilterStatus('pending')}>
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="confirmed" onClick={() => setFilterStatus('confirmed')}>
              Confirmed ({confirmedCount})
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setFilterStatus('completed')}>
              Completed ({completedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-4"
            >
              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600">Booking requests will appear here</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="pending">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-4"
            >
              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <Check className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-600">You're all caught up!</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="confirmed">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-4"
            >
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="completed">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-4"
            >
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={actionDialog.type === 'accept' ? 'text-green-600' : 'text-red-600'}>
              {actionDialog.type === 'accept' ? 'Accept Booking' : 'Decline Booking'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to {actionDialog.type} this booking from {actionDialog.booking?.renter?.name}?
            {actionDialog.type === 'accept' && ' The guest will be notified and payment will be processed.'}
            {actionDialog.type === 'reject' && ' This action cannot be undone.'}
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: null, booking: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isProcessing}
              className={actionDialog.type === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isProcessing ? 'Processing...' : actionDialog.type === 'accept' ? 'Accept' : 'Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
