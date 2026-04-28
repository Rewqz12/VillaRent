import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Building2, ArrowLeft, Loader2, User, Home, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { slideUp, fadeIn } from '@/lib/utils';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['renter', 'owner', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

interface SignupPageProps {
  onNavigate: (page: any) => void;
}

export default function SignupPage({ onNavigate }: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const { signup, isLoading } = useAuthStore();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'renter',
    },
  });

  const onSubmit = async (data: SignupForm) => {
    setSignupError('');
    const result = await signup(data.name, data.email, data.password, data.role);
    
    if (result.success) {
      onNavigate('home');
    } else {
      setSignupError(result.error || 'Signup failed');
    }
  };

  const roleOptions: { value: UserRole; label: string; icon: any; description: string }[] = [
    { value: 'renter', label: 'Renter', icon: User, description: 'Book villas for your stays' },
    { value: 'owner', label: 'Owner', icon: Home, description: 'List and manage your villas' },
    { value: 'admin', label: 'Admin', icon: Shield, description: 'Manage the platform' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
        </div>
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-4"
          >
            Join VillaRent
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/80"
          >
            Create an account and start your journey to finding or listing the perfect villa.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 bg-white overflow-y-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full mx-auto py-8"
        >
          {/* Back Button */}
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => onNavigate('home')}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to home
          </motion.button>

          {/* Logo */}
          <motion.div
            variants={slideUp}
            className="flex items-center justify-center mb-6"
          >
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.div variants={slideUp} className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
            <p className="mt-2 text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Sign in
              </button>
            </p>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Role Selection */}
              <motion.div variants={slideUp}>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I want to</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-3">
                          {roleOptions.map((role) => (
                            <motion.button
                              key={role.value}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => field.onChange(role.value)}
                              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                                field.value === role.value
                                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
                              }`}
                            >
                              <role.icon className="w-6 h-6 mb-2" />
                              <span className="text-sm font-medium">{role.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={slideUp}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={slideUp}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={slideUp}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="h-12 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={slideUp}>
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="h-12 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {signupError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 text-red-600 text-sm rounded-lg"
                >
                  {signupError}
                </motion.div>
              )}

              <motion.div variants={slideUp}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </motion.div>

              <motion.p variants={slideUp} className="text-xs text-center text-gray-500">
                By signing up, you agree to our{' '}
                <a href="#" className="text-orange-500 hover:text-orange-600">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-orange-500 hover:text-orange-600">Privacy Policy</a>
              </motion.p>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
