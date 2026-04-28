import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { slideUp, fadeIn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginPageProps {
  onNavigate: (page: any) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, isLoading } = useAuthStore();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoginError('');
    const result = await login(data.email, data.password);
    
    if (result.success) {
      onNavigate('home');
    } else {
      setLoginError(result.error || 'Login failed');
    }
  };

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
            backgroundImage: 'url(https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200)',
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
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/80"
          >
            Sign in to continue your journey to finding the perfect villa.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 bg-white">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full mx-auto"
        >
          {/* Back Button */}
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => onNavigate('home')}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to home
          </motion.button>

          {/* Logo */}
          <motion.div
            variants={slideUp}
            className="flex items-center justify-center mb-8"
          >
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.div variants={slideUp} className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
            <p className="mt-2 text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Sign up
              </button>
            </p>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <motion.div variants={slideUp} className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label className="text-sm text-gray-600 cursor-pointer">
                        Remember me
                      </Label>
                    </FormItem>
                  )}
                />
                <button
                  type="button"
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Forgot password?
                </button>
              </motion.div>

              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 text-red-600 text-sm rounded-lg"
                >
                  {loginError}
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
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>

          {/* Demo Accounts */}
          <motion.div variants={slideUp} className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Demo Accounts:</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Renter:</strong> john@gmail.com / any password</p>
              <p><strong>Owner:</strong> budi@villa.com / any password</p>
              <p><strong>Admin:</strong> admin@villarent.com / any password</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
