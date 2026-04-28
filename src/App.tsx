import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useVillaStore } from '@/stores/villaStore';
import { initializeMockData } from '@/data/mockData';
import { fadeIn } from '@/lib/utils';

// Layout Components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Auth Pages
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

// Renter Pages
import HomePage from '@/pages/renter/HomePage';
import ListingPage from '@/pages/renter/ListingPage';
import VillaDetailPage from '@/pages/renter/VillaDetailPage';
import BookingPage from '@/pages/renter/BookingPage';
import MyTripsPage from '@/pages/renter/MyTripsPage';

// Owner Pages
import OwnerDashboard from '@/pages/owner/OwnerDashboard';
import ManageVillas from '@/pages/owner/ManageVillas';
import BookingRequests from '@/pages/owner/BookingRequests';

// Admin Pages
import AdminPanel from '@/pages/admin/AdminPanel';

// Shared Components
import ChatWidget from '@/components/chat/ChatWidget';

type Page = 
  | 'login' | 'signup'
  | 'home' | 'listings' | 'villa-detail' | 'booking' | 'my-trips'
  | 'owner-dashboard' | 'manage-villas' | 'booking-requests'
  | 'admin-panel';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedVillaId, setSelectedVillaId] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { refreshVillas } = useVillaStore();

  useEffect(() => {
    initializeMockData();
    refreshVillas();
  }, []);

  const navigateTo = (page: Page, villaId?: string) => {
    setCurrentPage(page);
    if (villaId) {
      setSelectedVillaId(villaId);
    }
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={navigateTo} />;
      case 'signup':
        return <SignupPage onNavigate={navigateTo} />;
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'listings':
        return <ListingPage onNavigate={navigateTo} />;
      case 'villa-detail':
        return <VillaDetailPage villaId={selectedVillaId} onNavigate={navigateTo} />;
      case 'booking':
        return <BookingPage villaId={selectedVillaId} onNavigate={navigateTo} />;
      case 'my-trips':
        return <MyTripsPage onNavigate={navigateTo} />;
      case 'owner-dashboard':
        return <OwnerDashboard onNavigate={navigateTo} />;
      case 'manage-villas':
        return <ManageVillas />;
      case 'booking-requests':
        return <BookingRequests />;
      case 'admin-panel':
        return <AdminPanel />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  const showNavbar = !['login', 'signup'].includes(currentPage);
  const showFooter = !['login', 'signup'].includes(currentPage);
  const showChat = isAuthenticated && ['home', 'listings', 'villa-detail', 'my-trips', 'owner-dashboard', 'manage-villas', 'booking-requests'].includes(currentPage);

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {showNavbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Navbar 
              onNavigate={navigateTo} 
              currentPage={currentPage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={showNavbar ? 'pt-16' : ''}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showFooter && <Footer onNavigate={navigateTo} />}
      {showChat && <ChatWidget />}
    </div>
  );
}

export default App;
