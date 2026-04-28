import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Calendar, 
  Users, 
  CreditCard, 
  Check, 
  Shield,
  Lock,
  Star,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useVillaStore } from '@/stores/villaStore';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
// Badge import removed - not used
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency, calculateNights, slideUp, staggerContainer } from '@/lib/utils';

interface BookingPageProps {
  villaId: string | null;
  onNavigate: (page: any, villaId?: string) => void;
}

export default function BookingPage({ villaId, onNavigate }: BookingPageProps) {
  const { getVillaById } = useVillaStore();
  const { user } = useAuthStore();
  const { createBooking } = useBookingStore();
  
  const [villa, setVilla] = useState<any>(null);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Booking details from URL or state
  const [checkIn] = useState(new Date());
  const [checkOut] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [guests] = useState(2);
  
  // Payment form
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (villaId) {
      const villaData = getVillaById(villaId);
      if (villaData) {
        setVilla(villaData);
      }
    }
  }, [villaId]);

  if (!villa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const nights = calculateNights(checkIn.toISOString(), checkOut.toISOString());
  const subtotal = nights * villa.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await createBooking({
      villaId: villa.id,
      renterId: user!.id,
      ownerId: villa.ownerId,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      guests,
      totalPrice: total,
    });
    
    if (result.success) {
      setStep('success');
    }
    
    setIsProcessing(false);
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={() => onNavigate('villa-detail', villa.id)}
            className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'success' ? 'Booking Confirmed!' : 'Confirm and Pay'}
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your booking is confirmed!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We've sent a confirmation email to {user?.email}. 
                You can view your booking details in My Trips.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => onNavigate('my-trips')}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  View My Trips
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('home')}
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Forms */}
              <motion.div
                key="forms"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                variants={staggerContainer}
              >
                {/* Trip Details */}
                <motion.div variants={slideUp}>
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Trip</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">Dates</p>
                              <p className="text-sm text-gray-500">
                                {checkIn.toLocaleDateString()} - {checkOut.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                            Edit
                          </button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 mr-3 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">Guests</p>
                              <p className="text-sm text-gray-500">{guests} guests</p>
                            </div>
                          </div>
                          <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                            Edit
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Payment Method */}
                <motion.div variants={slideUp}>
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Pay with</h2>
                      
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="credit-card" id="credit-card" />
                            <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                              <div className="flex items-center">
                                <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
                                <div>
                                  <p className="font-medium text-gray-900">Credit or Debit Card</p>
                                  <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                                </div>
                              </div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                            <Label htmlFor="bank-transfer" className="flex-1 cursor-pointer">
                              <div className="flex items-center">
                                <div className="w-5 h-5 mr-3 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                                  BT
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Bank Transfer</p>
                                  <p className="text-sm text-gray-500">Direct bank transfer</p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>

                      {paymentMethod === 'credit-card' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-6 space-y-4"
                        >
                          <div>
                            <Label htmlFor="card-number">Card Number</Label>
                            <Input
                              id="card-number"
                              placeholder="0000 0000 0000 0000"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="card-name">Cardholder Name</Label>
                            <Input
                              id="card-name"
                              placeholder="John Doe"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiry">Expiry Date</Label>
                              <Input
                                id="expiry"
                                placeholder="MM/YY"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Required Info */}
                <motion.div variants={slideUp}>
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Required for your trip</h2>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Phone number</p>
                          <p className="text-sm text-gray-500">Required by the host</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Cancellation Policy */}
                <motion.div variants={slideUp} className="mt-6">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Cancellation policy</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Free cancellation for 48 hours. Cancel before check-in for a partial refund.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Ground Rules */}
                <motion.div variants={slideUp} className="mt-6">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Ground rules</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        We ask every guest to remember a few simple things about what makes a great guest.
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          Follow the house rules
                        </li>
                        <li className="flex items-center">
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          Treat your host's home like your own
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column - Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="sticky top-24">
                  <Card>
                    <CardContent className="p-6">
                      {/* Villa Preview */}
                      <div className="flex items-start space-x-4 mb-6">
                        <img
                          src={villa.images[0]}
                          alt={villa.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm text-gray-500">{villa.location}</p>
                          <h3 className="font-medium text-gray-900 line-clamp-2">{villa.title}</h3>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-orange-500 mr-1 fill-current" />
                            <span className="text-sm">{villa.rating}</span>
                            <span className="text-sm text-gray-500 ml-1">({villa.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Price Details */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Price details</h3>
                      <div className="space-y-3 text-sm">
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
                          <span>Total (IDR)</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Security Info */}
                      <div className="flex items-center text-sm text-gray-500 mb-6">
                        <Shield className="w-4 h-4 mr-2" />
                        <span>Your booking is protected by VillaRent</span>
                      </div>

                      {/* Pay Button */}
                      <Button
                        onClick={handleConfirmBooking}
                        disabled={isProcessing || (paymentMethod === 'credit-card' && (!cardNumber || !cardName))}
                        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Confirm and Pay
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
