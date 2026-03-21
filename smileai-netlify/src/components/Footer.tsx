import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useState } from 'react';
import { ClinicBranding } from '../App';
import { StaffLoginModal } from './StaffLoginModal';

// Tooth logo colors
const TOOTH_NAVY = '#1a365d';
const TOOTH_CYAN = '#38b2ac';
const TOOTH_LOGO = 'https://customer-assets.emergentagent.com/job_6ddaa510-f452-47bb-9414-8c025b23d77a/artifacts/67lipfsx_Untitled%20design%20%2845%29.png';

// TikTok icon (Lucide doesn't have it, so we'll create a simple SVG)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

interface FooterProps {
  clinicBranding?: ClinicBranding;
}

export function Footer({ clinicBranding }: FooterProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleStaffLogin = () => {
    // Show login modal
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Reload the page to show the staff dashboard
    window.location.reload();
  };

  const clinicName = clinicBranding?.clinicName || 'SmileAI Miami';
  const contactInfo = clinicBranding?.contactInfo || {};
  const socialMedia = clinicBranding?.socialMedia || {};

  // Social media items - only show if link is provided
  const socialItems = [
    { name: 'Facebook', icon: Facebook, url: socialMedia.facebook },
    { name: 'Instagram', icon: Instagram, url: socialMedia.instagram },
    { name: 'TikTok', icon: TikTokIcon, url: socialMedia.tiktok },
    { name: 'LinkedIn', icon: Linkedin, url: socialMedia.linkedin },
    { name: 'YouTube', icon: Youtube, url: socialMedia.youtube },
  ].filter(item => item.url && item.url.trim() !== '');

  return (
    <footer style={{ background: `linear-gradient(180deg, ${TOOTH_NAVY} 0%, #0f172a 100%)` }} className="text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={TOOTH_LOGO} 
                alt={clinicName}
                className="w-12 h-12 object-contain rounded-lg bg-white p-1"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{clinicName}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Transform your smile with AI-powered previews and expert dental care.
            </p>
            {socialItems.length > 0 && (
              <div className="flex gap-3">
                {socialItems.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = `linear-gradient(135deg, ${TOOTH_NAVY}, ${TOOTH_CYAN})`}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" style={{ }} onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Dental Implants
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Veneers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Teeth Whitening
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Smile Makeover
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Invisalign
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Our Team
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Before & After
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Patient Reviews
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              {contactInfo.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: TOOTH_CYAN }} />
                  <span className="text-gray-300" style={{ whiteSpace: 'pre-line' }}>
                    {contactInfo.address}
                  </span>
                </li>
              )}
              {contactInfo.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: TOOTH_CYAN }} />
                  <a href={`tel:${contactInfo.phone.replace(/\D/g, '')}`} className="text-gray-300 transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                    {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo.email && (
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: TOOTH_CYAN }} />
                  <a href={`mailto:${contactInfo.email}`} className="text-gray-300 transition-colors duration-200 break-all" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}>
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {!contactInfo.address && !contactInfo.phone && !contactInfo.email && (
                <li className="text-gray-500 text-xs italic">
                  Contact information can be set in Settings
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: `1px solid ${TOOTH_NAVY}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              © 2026 {clinicName}. All rights reserved. HIPAA compliant and regulated by the United States of America.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400 justify-center">
              <a href="#privacy-policy" className="transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}>
                Privacy Policy
              </a>
              <a href="#terms-of-service" className="transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}>
                Terms of Service
              </a>
              <a href="#hipaa-notice" className="transition-colors duration-200" onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN} onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}>
                HIPAA Notice
              </a>
              {/* Subtle Admin Access Link */}
              <button
                onClick={handleStaffLogin}
                className="transition-colors duration-200 cursor-pointer"
                onMouseOver={(e) => e.currentTarget.style.color = TOOTH_CYAN}
                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                Staff Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Login Modal */}
      <StaffLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </footer>
  );
}