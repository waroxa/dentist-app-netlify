'use client';

import { Upload, Sparkles, Video, Calendar } from 'lucide-react';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-cyan-200 rounded-full mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-semibold text-cyan-700">AI-Powered Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            How It Works
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Get your AI-enhanced dream smile preview in 4 simple steps
          </p>
        </div>

        {/* Steps Grid - Explicit rendering for reliability */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Step 1 */}
          <div className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-cyan-300 transition-all">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              1
            </div>
            <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md">
              <Upload className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
              Upload Your Photo
            </h3>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              Take a quick selfie or upload an existing photo showing your current smile.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-cyan-300 transition-all">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              2
            </div>
            <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md">
              <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
              AI Analysis
            </h3>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              Our advanced AI instantly analyzes and enhances your smile in seconds.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-cyan-300 transition-all">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              3
            </div>
            <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md">
              <Video className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
              Watch AI Preview
            </h3>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              See your AI-enhanced smile come to life with an animated video preview.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-cyan-300 transition-all">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              4
            </div>
            <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md">
              <Calendar className="w-8 h-8 text-white" strokeWidth={2} />
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
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 shadow-md transition-all"
          >
            <span>Try AI Smile Preview Free</span>
            <Sparkles className="w-5 h-5" />
          </button>
          <p className="text-sm text-slate-500 mt-3">No credit card required</p>
        </div>
      </div>
    </section>
  );
}
