import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Home, 
  Calendar, 
  DollarSign, 
  Shield, 
  Check, 
  Ban,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useVillaStore } from '@/stores/villaStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, getInitials, slideUp, staggerContainer } from '@/lib/utils';
import type { User, Villa } from '@/types';

export default function AdminPanel() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user: _user } = useAuthStore();
  const { getAdminStats } = useBookingStore();
  const { approveVilla } = useVillaStore();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVillas: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [actionDialog, setActionDialog] = useState<{ 
    open: boolean; 
    type: 'approve' | 'suspend' | 'activate' | null; 
    item: User | Villa | null;
    itemType: 'user' | 'villa' | null;
  }>({
    open: false,
    type: null,
    item: null,
    itemType: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load stats
    setStats(getAdminStats());
    
    // Load users
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers.filter((u: User) => u.role !== 'admin'));
    
    // Load villas
    const storedVillas = JSON.parse(localStorage.getItem('villas') || '[]');
    setVillas(storedVillas);
  }, []);

  const handleAction = async () => {
    if (!actionDialog.item || !actionDialog.type || !actionDialog.itemType) return;
    
    setIsProcessing(true);
    
    if (actionDialog.itemType === 'villa' && actionDialog.type === 'approve') {
      await approveVilla(actionDialog.item.id);
      const storedVillas = JSON.parse(localStorage.getItem('villas') || '[]');
      setVillas(storedVillas);
    } else if (actionDialog.itemType === 'user') {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const index = storedUsers.findIndex((u: User) => u.id === actionDialog.item!.id);
      if (index !== -1) {
        storedUsers[index].isActive = actionDialog.type === 'activate';
        localStorage.setItem('users', JSON.stringify(storedUsers));
        setUsers(storedUsers.filter((u: User) => u.role !== 'admin'));
      }
    }
    
    // Refresh stats
    setStats(getAdminStats());
    
    setIsProcessing(false);
    setActionDialog({ open: false, type: null, item: null, itemType: null });
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Villas',
      value: stats.totalVillas.toString(),
      icon: Home,
      color: 'bg-green-500',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings.toString(),
      icon: Calendar,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ];

  const pendingVillas = villas.filter(v => !v.isApproved);
  const approvedVillas = villas.filter(v => v.isApproved);
  const activeUsers = users.filter(u => u.isActive);
  const suspendedUsers = users.filter(u => !u.isActive);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage users, villas, and platform settings</p>
            </div>
          </div>
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

        {/* Pending Approvals Alert */}
        {stats.pendingApprovals > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 flex items-center">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {stats.pendingApprovals} villa{stats.pendingApprovals > 1 ? 's' : ''} pending approval
                  </p>
                  <p className="text-sm text-yellow-600">
                    Review and approve new villa listings
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="villas" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="villas">Villas ({villas.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          </TabsList>

          {/* Villas Tab */}
          <TabsContent value="villas">
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending ({pendingVillas.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedVillas.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {pendingVillas.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <Check className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900">No pending approvals</h3>
                      <p className="text-gray-600">All villas have been reviewed</p>
                    </div>
                  ) : (
                    pendingVillas.map((villa) => (
                      <motion.div key={villa.id} variants={slideUp}>
                        <Card className="overflow-hidden">
                          <div className="relative h-48">
                            <img
                              src={villa.images[0]}
                              alt={villa.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-yellow-500">Pending</Badge>
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <h3 className="font-semibold text-gray-900 mb-1">{villa.title}</h3>
                            <p className="text-sm text-gray-500 mb-3">{villa.location}</p>
                            <p className="text-lg font-bold text-orange-600 mb-4">
                              {formatCurrency(villa.pricePerNight)}
                              <span className="text-sm text-gray-500 font-normal">/night</span>
                            </p>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => setActionDialog({ 
                                  open: true, 
                                  type: 'approve', 
                                  item: villa,
                                  itemType: 'villa'
                                })}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="approved">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {approvedVillas.map((villa) => (
                    <motion.div key={villa.id} variants={slideUp}>
                      <Card className="overflow-hidden">
                        <div className="relative h-48">
                          <img
                            src={villa.images[0]}
                            alt={villa.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-green-500">Approved</Badge>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-gray-900 mb-1">{villa.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{villa.location}</p>
                          <p className="text-lg font-bold text-orange-600">
                            {formatCurrency(villa.pricePerNight)}
                            <span className="text-sm text-gray-500 font-normal">/night</span>
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">
                  Active ({activeUsers.length})
                </TabsTrigger>
                <TabsTrigger value="suspended">
                  Suspended ({suspendedUsers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="space-y-4"
                >
                  {activeUsers.map((userItem) => (
                    <motion.div key={userItem.id} variants={slideUp}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={userItem.avatar} />
                                <AvatarFallback className="bg-orange-100 text-orange-600">
                                  {getInitials(userItem.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <h4 className="font-medium text-gray-900">{userItem.name}</h4>
                                <p className="text-sm text-gray-500">{userItem.email}</p>
                                <Badge variant="secondary" className="mt-1 capitalize">
                                  {userItem.role}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => setActionDialog({ 
                                open: true, 
                                type: 'suspend', 
                                item: userItem,
                                itemType: 'user'
                              })}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Suspend
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="suspended">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="space-y-4"
                >
                  {suspendedUsers.length === 0 ? (
                    <div className="text-center py-16">
                      <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900">No suspended users</h3>
                      <p className="text-gray-600">All users are in good standing</p>
                    </div>
                  ) : (
                    suspendedUsers.map((userItem) => (
                      <motion.div key={userItem.id} variants={slideUp}>
                        <Card className="bg-red-50">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={userItem.avatar} />
                                  <AvatarFallback className="bg-red-100 text-red-600">
                                    {getInitials(userItem.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-4">
                                  <h4 className="font-medium text-gray-900">{userItem.name}</h4>
                                  <p className="text-sm text-gray-500">{userItem.email}</p>
                                  <Badge className="mt-1 bg-red-100 text-red-800">
                                    Suspended
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                onClick={() => setActionDialog({ 
                                  open: true, 
                                  type: 'activate', 
                                  item: userItem,
                                  itemType: 'user'
                                })}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Activate
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approve' && 'Approve Villa'}
              {actionDialog.type === 'suspend' && 'Suspend User'}
              {actionDialog.type === 'activate' && 'Activate User'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {actionDialog.type === 'approve' && actionDialog.itemType === 'villa' && `Are you sure you want to approve "${(actionDialog.item as Villa)?.title}"? This villa will be visible to all users.`}
            {actionDialog.type === 'suspend' && actionDialog.itemType === 'user' && `Are you sure you want to suspend ${(actionDialog.item as User)?.name}? They will not be able to log in.`}
            {actionDialog.type === 'activate' && actionDialog.itemType === 'user' && `Are you sure you want to activate ${(actionDialog.item as User)?.name}? They will be able to log in again.`}
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: null, item: null, itemType: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isProcessing}
              className={
                actionDialog.type === 'approve' || actionDialog.type === 'activate'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
