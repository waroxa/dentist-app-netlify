import { ArrowRight, Star, MapPin, Shield, Award } from 'lucide-react';
import { Button } from './ui/button';
import { ClinicBranding } from '../App';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

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
    <section className="relative overflow-hidden bg-white">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-100/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-cyan-100/20 to-transparent blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-100/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            {clinicBranding.logo ? (
              <img 
                src={clinicBranding.logo} 
                alt={clinicBranding.clinicName}
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg"
              />
            ) : (
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600">
                <span className="text-lg sm:text-xl">✨</span>
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-950">{clinicBranding.clinicName}</h1>
              <p className="text-xs text-slate-500 hidden sm:block">AI Smile Preview Platform</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-teal-600" />
              <span>Premium AI Smile Preview</span>
            </div>
            <Button 
              onClick={scrollToTransform}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-6 font-semibold shadow-lg shadow-teal-500/20"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs sm:text-sm font-medium text-slate-700">Trusted by 1000+ dental professionals</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-950 mb-6 leading-tight">
              See Your Dream Smile
              <span className="block bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent mt-2">
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
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg shadow-xl shadow-teal-500/30 font-semibold w-full sm:w-auto"
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
                  className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-2 border-slate-300 font-semibold hover:bg-slate-50 w-full sm:w-auto"
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
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-950">100% Secure</p>
                <p className="text-xs text-slate-500">Your privacy protected</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center lg:text-left"
              >
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-950">AI Powered</p>
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
                <p className="text-xs sm:text-sm font-bold text-slate-950">4.9/5 Rating</p>
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
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-slate-100">
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
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg sm:text-xl">✨</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-950 truncate">AI Preview Ready</p>
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
              className="hidden sm:block absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-white rounded-2xl shadow-xl p-4 sm:p-5 border border-slate-100"
            >
              <p className="text-2xl sm:text-3xl font-bold text-teal-600">{stats.previews}+</p>
              <p className="text-xs sm:text-sm text-slate-600">AI Previews</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="hidden sm:block absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-white rounded-2xl shadow-xl p-4 sm:p-5 border border-slate-100"
            >
              <p className="text-2xl sm:text-3xl font-bold text-cyan-600">100%</p>
              <p className="text-xs sm:text-sm text-slate-600">Free Preview</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
