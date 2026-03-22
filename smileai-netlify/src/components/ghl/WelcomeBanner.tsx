import React from 'react';
import { X, Sparkles, Palette, Users, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

interface WelcomeBannerProps {
  onClose: () => void;
}

export function WelcomeBanner({ onClose }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 text-white rounded-xl shadow-lg relative overflow-hidden"
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative p-5 sm:p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5 pr-8">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">Welcome to SmileVisionPro</h2>
            <p className="text-cyan-100 text-sm">
              Your AI-powered dental transformation suite
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3.5 border border-white/10">
            <Palette className="w-5 h-5 mb-2 text-cyan-200" />
            <h3 className="font-medium text-sm mb-0.5">White-Label Ready</h3>
            <p className="text-xs text-cyan-100 leading-relaxed">
              Custom branding for your clinic
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3.5 border border-white/10">
            <Users className="w-5 h-5 mb-2 text-cyan-200" />
            <h3 className="font-medium text-sm mb-0.5">Patient CRM</h3>
            <p className="text-xs text-cyan-100 leading-relaxed">
              Track leads and conversions
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3.5 border border-white/10">
            <Zap className="w-5 h-5 mb-2 text-cyan-200" />
            <h3 className="font-medium text-sm mb-0.5">AI Smile Preview</h3>
            <p className="text-xs text-cyan-100 leading-relaxed">
              Instant smile transformations
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            onClick={onClose}
            className="bg-white text-cyan-700 hover:bg-cyan-50 shadow-sm font-medium"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-sm text-cyan-100">
            Configure your settings to customize the experience
          </p>
        </div>
      </div>
    </motion.div>
  );
}
