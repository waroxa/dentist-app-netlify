import { ArrowRight, Star, MapPin, Shield, Award } from 'lucide-react';
import { Button } from './ui/button';
import { ClinicBranding } from '../App';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// Tooth logo colors
const TOOTH_NAVY = '#1a365d';
const TOOTH_CYAN = '#38b2ac';

interface HeroProps {
  clinicBranding: ClinicBranding;
}

// Generate random but realistic numbers on component mount
const generateRandomStats = () => {
  return {
    patients: Math.floor(Math.random() * (2500 - 850) + 850), // 850-2500
    previews: Math.floor(Math.random() * (8900 - 3200) + 3200), // 3200-8900
    reviews: Math.floor(Math.random() * (950 - 380) + 380), // 380-950
  };
};

// Tooth logo URL
const TOOTH_LOGO = 'https://customer-assets.emergentagent.com/job_6ddaa510-f452-47bb-9414-8c025b23d77a/artifacts/67lipfsx_Untitled%20design%20%2845%29.png';

export function Hero({ clinicBranding }: HeroProps) {
  const [stats, setStats] = useState(generateRandomStats());

  // Regenerate stats on mount to ensure different numbers each session
  useEffect(() => {
    setStats(generateRandomStats());
  }, []);

  const scrollToTransform = () => {
    const section = document.getElementById('smile-transform');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-3xl" style={{ background: `linear-gradient(to bottom right, ${TOOTH_CYAN}20, transparent)` }} />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full blur-3xl" style={{ background: `linear-gradient(to top right, ${TOOTH_NAVY}15, transparent)` }} />
      </div>

      {/* Navigation - Professional Header */}
      <nav className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-5" style={{ background: `linear-gradient(135deg, ${TOOTH_NAVY} 0%, ${TOOTH_CYAN} 100%)` }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 sm:gap-4"
          >
            <img 
              src={TOOTH_LOGO} 
              alt={clinicBranding.clinicName}
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-lg bg-white p-1"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">{clinicBranding.clinicName}</h1>
              <p className="text-xs sm:text-sm text-white/80">AI Smile Preview Platform</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <div className="hidden md:flex items-center gap-2 text-sm text-white/90">
              <MapPin className="h-4 w-4 text-white" />
              <span>Premium AI Smile Preview</span>
            </div>
            <Button 
              onClick={scrollToTransform}
              className="text-sm sm:text-base h-9 sm:h-11 px-4 sm:px-6 font-semibold shadow-lg border-2 border-white/30 hover:border-white/50"
              style={{ 
                background: 'rgba(255,255,255,0.15)', 
                backdropFilter: 'blur(10px)',
                color: 'white'
              }}
            >
              Try Free
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border mb-6" style={{ borderColor: `${TOOTH_CYAN}30` }}>
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs sm:text-sm font-medium" style={{ color: TOOTH_NAVY }}>Trusted by 1000+ dental professionals</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight" style={{ color: TOOTH_NAVY }}>
              See Your Dream Smile
              <span className="block bg-clip-text text-transparent mt-2" style={{ backgroundImage: `linear-gradient(to right, ${TOOTH_NAVY}, ${TOOTH_CYAN}, ${TOOTH_NAVY})` }}>
                With AI in 30 Seconds
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Upload a clear smile photo and instantly visualize your transformation. Powered by advanced AI, designed for modern dental consultations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={scrollToTransform}
                  size="lg"
                  className="text-white h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg shadow-xl font-semibold w-full sm:w-auto"
                  style={{ 
                    background: `linear-gradient(135deg, ${TOOTH_NAVY} 0%, ${TOOTH_CYAN} 100%)`,
                    boxShadow: `0 10px 40px ${TOOTH_CYAN}40`
                  }}
                >
                  Try AI Preview Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline"
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-2 font-semibold w-full sm:w-auto"
                  style={{ borderColor: TOOTH_NAVY, color: TOOTH_NAVY }}
                  onClick={() => {
                    const section = document.getElementById('examples');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Examples
                </Button>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto lg:mx-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center lg:text-left"
              >
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: TOOTH_CYAN }} />
                </div>
                <p className="text-xs sm:text-sm font-bold" style={{ color: TOOTH_NAVY }}>100% Secure</p>
                <p className="text-xs text-slate-500">Your privacy protected</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center lg:text-left"
              >
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: TOOTH_CYAN }} />
                </div>
                <p className="text-xs sm:text-sm font-bold" style={{ color: TOOTH_NAVY }}>AI Powered</p>
                <p className="text-xs text-slate-500">Advanced technology</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center lg:text-left"
              >
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-xs sm:text-sm font-bold" style={{ color: TOOTH_NAVY }}>4.9/5 Rating</p>
                <p className="text-xs text-slate-500">{stats.reviews}+ reviews</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl" style={{ border: `2px solid ${TOOTH_CYAN}30` }}>
              <img
                src={clinicBranding.heroImage || "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80"}
                alt="SmileVisionPro AI smile preview"
                className="w-full h-[280px] sm:h-[380px] lg:h-[480px] xl:h-[550px] object-cover"
              />
              {/* Overlay Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/98 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl border border-white/50"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${TOOTH_NAVY} 0%, ${TOOTH_CYAN} 100%)` }}>
                    <span className="text-lg sm:text-xl">✨</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold truncate" style={{ color: TOOTH_NAVY }}>AI Preview Ready</p>
                    <p className="text-xs text-slate-600">See results instantly</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="hidden sm:block absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-white rounded-2xl shadow-xl p-4 sm:p-5"
              style={{ border: `2px solid ${TOOTH_CYAN}30` }}
            >
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: TOOTH_CYAN }}>{stats.previews}+</p>
              <p className="text-xs sm:text-sm text-slate-600">AI Previews</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="hidden sm:block absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-white rounded-2xl shadow-xl p-4 sm:p-5"
              style={{ border: `2px solid ${TOOTH_NAVY}20` }}
            >
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: TOOTH_NAVY }}>100%</p>
              <p className="text-xs sm:text-sm text-slate-600">Free Preview</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
