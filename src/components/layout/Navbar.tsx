import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Menu, 
  X, 
  LogOut, 
  Home, 
  Calendar, 
  Building2, 
  LayoutDashboard,
  Shield,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';

interface NavbarProps {
  onNavigate: (page: any, villaId?: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const navLinks = [
    { label: 'Home', page: 'home', icon: Home },
    { label: 'Explore', page: 'listings', icon: Search },
  ];

  const renterLinks = [
    { label: 'My Trips', page: 'my-trips', icon: Calendar },
  ];

  const ownerLinks = [
    { label: 'Dashboard', page: 'owner-dashboard', icon: LayoutDashboard },
    { label: 'My Villas', page: 'manage-villas', icon: Building2 },
    { label: 'Bookings', page: 'booking-requests', icon: Calendar },
  ];

  const adminLinks = [
    { label: 'Admin Panel', page: 'admin-panel', icon: Shield },
  ];

  const getRoleLinks = () => {
    if (user?.role === 'renter') return renterLinks;
    if (user?.role === 'owner') return ownerLinks;
    if (user?.role === 'admin') return adminLinks;
    return [];
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-3">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">VillaRent</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <motion.button
                key={link.page}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </motion.button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Messages Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg hidden sm:flex"
                >
                  <MessageSquare className="w-5 h-5" />
                </motion.button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {getInitials(user?.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {user?.name}
                      </span>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-orange-500 capitalize mt-1">{user?.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {getRoleLinks().map((link) => (
                      <DropdownMenuItem
                        key={link.page}
                        onClick={() => onNavigate(link.page)}
                        className="cursor-pointer"
                      >
                        <link.icon className="w-4 h-4 mr-2" />
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('login')}
                  className="text-gray-600"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => onNavigate('signup')}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => {
                    onNavigate(link.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                    currentPage === link.page
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.label}
                </button>
              ))}
              
              {isAuthenticated && getRoleLinks().map((link) => (
                <button
                  key={link.page}
                  onClick={() => {
                    onNavigate(link.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                    currentPage === link.page
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.label}
                </button>
              ))}

              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onNavigate('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={() => {
                      onNavigate('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
