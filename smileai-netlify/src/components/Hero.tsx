import { ArrowRight, Star, MapPin, Shield, Award } from 'lucide-react';
import { Button } from './ui/button';
import { ClinicBranding } from '../App';
import { motion } from 'motion/react';

// Professional cyan color scheme
const BRAND_PRIMARY = '#0891b2';

interface HeroProps {
  clinicBranding: ClinicBranding;
}

// Tooth logo URL
const TOOTH_LOGO = 'https://customer-assets.emergentagent.com/job_6ddaa510-f452-47bb-9414-8c025b23d77a/artifacts/67lipfsx_Untitled%20design%20%2845%29.png';

export function Hero({ clinicBranding }: HeroProps) {
  const scrollToTransform = () => {
    const section = document.getElementById('smile-transform');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Navigation - Logo Left, Buttons Right */}
      <nav className="relative z-20 px-4 py-3 sm:px-6 sm:py-4 lg:px-8" style={{ backgroundColor: BRAND_PRIMARY }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo - Left */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <img 
              src={TOOTH_LOGO} 
              alt={clinicBranding.clinicName}
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-lg bg-white p-1"
            />
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-white">{clinicBranding.clinicName}</h1>
              <p className="text-xs text-white">AI Smile Preview Platform</p>
            </div>
          </motion.div>

          {/* Buttons - Right */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white">
              <MapPin className="h-3.5 w-3.5" />
              <span className="font-medium">Premium AI Smile Preview</span>
            </div>
            <Button 
              onClick={scrollToTransform}
              className="text-sm h-9 px-4 font-semibold bg-white hover:bg-slate-50"
              style={{ color: BRAND_PRIMARY }}
            >
              Try Free
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section - Image with Overlay Content */}
      <div className="relative">
        {/* Hero Image - Full Width Background */}
        <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
          <img
            src={clinicBranding.heroImage || "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1600&q=80"}
            alt="SmileVisionPro AI dental consultation"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          
          {/* Overlay Content - Left Side */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-xl"
              >
                {/* Trust Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs sm:text-sm font-medium text-white">Trusted by 1000+ dental professionals</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
                  See Your Dream Smile
                  <span className="block mt-1" style={{ color: '#06b6d4' }}>
                    With AI in 30 Seconds
                  </span>
                </h1>
                
                <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 max-w-lg leading-relaxed">
                  Upload a clear smile photo and instantly visualize your transformation. Powered by advanced AI, designed for modern dental consultations.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button 
                      onClick={scrollToTransform}
                      size="lg"
                      className="text-white h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base shadow-lg font-semibold w-full sm:w-auto"
                      style={{ backgroundColor: BRAND_PRIMARY }}
                    >
                      Try AI Preview Free
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button 
                      variant="outline"
                      size="lg"
                      className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 w-full sm:w-auto"
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
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                    <span className="text-xs sm:text-sm font-medium text-white">100% Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                    <span className="text-xs sm:text-sm font-medium text-white">AI Powered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs sm:text-sm font-medium text-white">4.9/5 Rating</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Floating Badge - Bottom Right */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8"
          >
            <div className="flex items-center gap-3 rounded-xl bg-white p-3 sm:p-4 shadow-xl">
              <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BRAND_PRIMARY }}>
                <span className="text-lg text-white">✨</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">100% Free AI Preview</p>
                <p className="text-xs text-slate-500">See your new smile instantly</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
