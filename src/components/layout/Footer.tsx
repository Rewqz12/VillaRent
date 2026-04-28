import { motion } from 'framer-motion';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const footerLinks = {
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    support: [
      { label: 'Help Center', href: '#' },
      { label: 'Safety Information', href: '#' },
      { label: 'Cancellation Options', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
    legal: [
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Sitemap', href: '#' },
    ],
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center cursor-pointer mb-4"
              onClick={() => onNavigate('home')}
            >
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-3">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VillaRent</span>
            </motion.div>
            <p className="text-gray-600 text-sm mb-6 max-w-sm">
              Discover and book the perfect villa for your next vacation. 
              From beachfront paradise to mountain retreats, find your dream stay with us.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-orange-500" />
                support@villarent.com
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-3 text-orange-500" />
                +62 21 1234 5678
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-3 text-orange-500" />
                Jakarta, Indonesia
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">
            © 2024 VillaRent. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors shadow-sm"
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
