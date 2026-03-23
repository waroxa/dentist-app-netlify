'use client';

import { ClinicBranding } from '../App';

interface HowItWorksProps {
  clinicBranding: ClinicBranding;
}

export function HowItWorks({ clinicBranding }: HowItWorksProps) {
  const primaryColor = clinicBranding.primaryColor;
  const accentColor = clinicBranding.accentColor || clinicBranding.primaryColor;

  return (
    <section id="how-it-works" className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full mb-4 shadow-sm" style={{ border: `1px solid ${accentColor}` }}>
            <svg className="w-4 h-4" fill="none" stroke={primaryColor} strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: primaryColor }}>AI-Powered Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            How It Works
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Get your AI-enhanced dream smile preview in 4 simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Step 1 - Upload */}
          <div className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all" style={{ borderColor: `${primaryColor}30` }}>
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: primaryColor }}>
              1
            </div>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md" style={{ backgroundColor: primaryColor }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
              Upload Your Photo
            </h3>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              Take a quick selfie or upload an existing photo showing your current smile.
            </p>
          </div>

          {/* Step 2 - AI Analysis */}
          <div className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all" style={{ borderColor: `${primaryColor}30` }}>
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: primaryColor }}>
              2
            </div>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md" style={{ backgroundColor: primaryColor }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
              AI Analysis
            </h3>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              Our advanced AI instantly analyzes and enhances your smile in seconds.
            </p>
          </div>

          {/* Step 3 - Video Preview */}
          <div className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all" style={{ borderColor: `${primaryColor}30` }}>
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: primaryColor }}>
              3
            </div>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md" style={{ backgroundColor: primaryColor }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
              Watch AI Preview
            </h3>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              See your AI-enhanced smile come to life with an animated video preview.
            </p>
          </div>

          {/* Step 4 - Book Consult */}
          <div className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all" style={{ borderColor: `${primaryColor}30` }}>
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: primaryColor }}>
              4
            </div>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md" style={{ backgroundColor: primaryColor }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
              Book Free Consult
            </h3>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              Love your AI preview? Schedule a free consultation with our expert team.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-base text-slate-700 mb-4 font-medium">Ready to see your AI-enhanced smile?</p>
          <button
            onClick={() => {
              const section = document.getElementById('smile-transform');
              section?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-lg shadow-md transition-all"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}
          >
            <span>Try AI Smile Preview Free</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </button>
          <p className="text-sm text-slate-500 mt-3">No credit card required</p>
        </div>
      </div>
    </section>
  );
}
