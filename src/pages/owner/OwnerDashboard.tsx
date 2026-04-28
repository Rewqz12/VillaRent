import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Home, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useVillaStore } from '@/stores/villaStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, slideUp, staggerContainer } from '@/lib/utils';

interface OwnerDashboardProps {
  onNavigate: (page: any) => void;
}

export default function OwnerDashboard({ onNavigate }: OwnerDashboardProps) {
  const { user } = useAuthStore();
  const { getOwnerStats, getBookingsByOwner } = useBookingStore();
  const { getVillasByOwner } = useVillaStore();
  
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalBookings: 0,
    occupancyRate: 0,
    upcomingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [villas, setVillas] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setStats(getOwnerStats(user.id));
      setRecentBookings(getBookingsByOwner(user.id).slice(0, 5));
      setVillas(getVillasByOwner(user.id));
    }
  }, [user]);

  const statCards = [
    {
      title: 'Total Earnings',
      value: formatCurrency(stats.totalEarnings),
      icon: DollarSign,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'bg-green-500',
    },
    {
      title: 'Monthly Earnings',
      value: formatCurrency(stats.monthlyEarnings),
      icon: TrendingUp,
      change: '+8%',
      changeType: 'positive' as const,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings.toString(),
      icon: Calendar,
      change: '+5',
      changeType: 'positive' as const,
      color: 'bg-orange-500',
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: Home,
      change: '+3%',
      changeType: 'positive' as const,
      color: 'bg-purple-500',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's what's happening with your properties.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat) => (
            <motion.div key={stat.title} variants={slideUp}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <div className={`flex items-center mt-2 text-sm ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'positive' ? (
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                        )}
                        {stat.change} from last month
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('booking-requests')}
                  className="text-orange-500"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        variants={slideUp}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <img
                          src={booking.villa?.images[0]}
                          alt={booking.villa?.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{booking.villa?.title}</h4>
                            <Badge className={getStatusBadge(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {booking.renter?.name} • {booking.guests} guests
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(booking.totalPrice)} • {booking.checkIn} to {booking.checkOut}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => onNavigate('manage-villas')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Manage Villas
                </Button>
                <Button
                  onClick={() => onNavigate('booking-requests')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Bookings
                </Button>
              </CardContent>
            </Card>

            {/* My Villas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Villas</CardTitle>
                <span className="text-sm text-gray-500">{villas.length} total</span>
              </CardHeader>
              <CardContent>
                {villas.length === 0 ? (
                  <div className="text-center py-6">
                    <Home className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">No villas listed yet</p>
                    <Button
                      onClick={() => onNavigate('manage-villas')}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Add Villa
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {villas.slice(0, 3).map((villa) => (
                      <div
                        key={villa.id}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={villa.images[0]}
                          alt={villa.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-sm text-gray-900 line-clamp-1">{villa.title}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="w-3 h-3 mr-1 text-orange-500 fill-current" />
                            {villa.rating} ({villa.reviewCount} reviews)
                          </div>
                        </div>
                      </div>
                    ))}
                    {villas.length > 3 && (
                      <Button
                        variant="ghost"
                        onClick={() => onNavigate('manage-villas')}
                        className="w-full text-orange-500"
                      >
                        View all {villas.length} villas
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Upcoming bookings</span>
                  <span className="font-semibold text-gray-900">{stats.upcomingBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expected earnings</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(stats.monthlyEarnings)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
