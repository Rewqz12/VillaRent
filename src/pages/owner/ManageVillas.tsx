import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Star, 
  Home,
  Check,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useVillaStore } from '@/stores/villaStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, slideUp, staggerContainer } from '@/lib/utils';
import type { Villa } from '@/types';

export default function ManageVillas() {
  const { user } = useAuthStore();
  const { getVillasByOwner, addVilla, updateVilla, deleteVilla } = useVillaStore();
  
  const [villas, setVillas] = useState<Villa[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    pricePerNight: '',
    bedrooms: '',
    bathrooms: '',
    maxGuests: '',
    amenities: [] as string[],
    images: [] as string[],
    houseRules: [] as string[],
    coordinates: { lat: '', lng: '' },
  });

  const amenitiesList = [
    'Private Pool', 'Ocean View', 'WiFi', 'Air Conditioning', 'Kitchen',
    'Parking', 'Garden', 'BBQ Grill', 'Beach Access', 'Mountain View',
    'Fireplace', 'Hot Tub', 'Yoga Deck', 'Spa Room', 'Rooftop Terrace',
  ];

  useEffect(() => {
    if (user) {
      setVillas(getVillasByOwner(user.id));
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      address: '',
      pricePerNight: '',
      bedrooms: '',
      bathrooms: '',
      maxGuests: '',
      amenities: [],
      images: [],
      houseRules: [],
      coordinates: { lat: '', lng: '' },
    });
  };

  const handleAddVilla = async () => {
    setIsSubmitting(true);
    
    const result = await addVilla({
      title: formData.title,
      description: formData.description,
      location: formData.location,
      address: formData.address,
      pricePerNight: Number(formData.pricePerNight),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      maxGuests: Number(formData.maxGuests),
      amenities: formData.amenities,
      images: formData.images.length > 0 ? formData.images : [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      ],
      coordinates: {
        lat: Number(formData.coordinates.lat) || -6.2088,
        lng: Number(formData.coordinates.lng) || 106.8456,
      },
      ownerId: user!.id,
      isApproved: false,
      isActive: true,
      availability: [{ startDate: '2024-01-01', endDate: '2024-12-31' }],
      houseRules: formData.houseRules.length > 0 ? formData.houseRules : ['No smoking', 'No parties'],
    });

    if (result.success) {
      setVillas(getVillasByOwner(user!.id));
      setIsAddDialogOpen(false);
      resetForm();
    }
    
    setIsSubmitting(false);
  };

  const handleEditVilla = async () => {
    if (!selectedVilla) return;
    
    setIsSubmitting(true);
    
    await updateVilla(selectedVilla.id, {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      address: formData.address,
      pricePerNight: Number(formData.pricePerNight),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      maxGuests: Number(formData.maxGuests),
      amenities: formData.amenities,
    });

    setVillas(getVillasByOwner(user!.id));
    setIsEditDialogOpen(false);
    setSelectedVilla(null);
    setIsSubmitting(false);
  };

  const handleDeleteVilla = async () => {
    if (!selectedVilla) return;
    
    setIsSubmitting(true);
    await deleteVilla(selectedVilla.id);
    setVillas(getVillasByOwner(user!.id));
    setIsDeleteDialogOpen(false);
    setSelectedVilla(null);
    setIsSubmitting(false);
  };

  const openEditDialog = (villa: Villa) => {
    setSelectedVilla(villa);
    setFormData({
      title: villa.title,
      description: villa.description,
      location: villa.location,
      address: villa.address,
      pricePerNight: villa.pricePerNight.toString(),
      bedrooms: villa.bedrooms.toString(),
      bathrooms: villa.bathrooms.toString(),
      maxGuests: villa.maxGuests.toString(),
      amenities: villa.amenities,
      images: villa.images,
      houseRules: villa.houseRules,
      coordinates: { lat: villa.coordinates.lat.toString(), lng: villa.coordinates.lng.toString() },
    });
    setIsEditDialogOpen(true);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const VillaForm = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div>
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Luxury Beachfront Villa"
        />
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your villa..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Bali"
          />
        </div>
        <div>
          <Label>Address</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Full address"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price per Night (IDR)</Label>
          <Input
            type="number"
            value={formData.pricePerNight}
            onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
            placeholder="2500000"
          />
        </div>
        <div>
          <Label>Max Guests</Label>
          <Input
            type="number"
            value={formData.maxGuests}
            onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
            placeholder="8"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Bedrooms</Label>
          <Input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            placeholder="4"
          />
        </div>
        <div>
          <Label>Bathrooms</Label>
          <Input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            placeholder="3"
          />
        </div>
      </div>
      
      <div>
        <Label>Amenities</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {amenitiesList.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.amenities.includes(amenity)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {formData.amenities.includes(amenity) && <Check className="w-3 h-3 inline mr-1" />}
              {amenity}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Villas</h1>
            <p className="text-gray-600 mt-2">Manage your villa listings</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
            className="mt-4 sm:mt-0 bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Villa
          </Button>
        </motion.div>

        {/* Villas Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {villas.length === 0 ? (
            <motion.div variants={slideUp} className="col-span-full">
              <Card className="text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No villas yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first villa listing</p>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Villa
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            villas.map((villa) => (
              <motion.div
                key={villa.id}
                variants={slideUp}
                whileHover={{ y: -4 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={villa.images[0]}
                      alt={villa.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={villa.isApproved ? 'bg-green-500' : 'bg-yellow-500'}>
                        {villa.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{villa.title}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-orange-500 mr-1 fill-current" />
                        <span className="text-sm">{villa.rating || 'New'}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {villa.location}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-orange-600">
                        {formatCurrency(villa.pricePerNight)}
                      </span>
                      <span className="text-sm text-gray-500">/night</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(villa)}
                        className="flex-1"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVilla(villa);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Villa</DialogTitle>
          </DialogHeader>
          <VillaForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddVilla}
              disabled={isSubmitting || !formData.title || !formData.pricePerNight}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Villa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Villa</DialogTitle>
          </DialogHeader>
          <VillaForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditVilla}
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Villa</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete "{selectedVilla?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteVilla}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
