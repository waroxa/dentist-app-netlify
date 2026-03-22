import { Upload, Sparkles, Video, Calendar, type LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function HowItWorks() {
  const steps: Step[] = [
    {
      icon: Upload,
      title: 'Upload Your Photo',
      description: 'Take a quick selfie or upload an existing photo showing your current smile.',
    },
    {
      icon: Sparkles,
      title: 'AI Analysis',
      description: 'Our advanced AI instantly analyzes and enhances your smile in seconds.',
    },
    {
      icon: Video,
      title: 'Watch AI Preview',
      description: 'See your AI-enhanced smile come to life with an animated video preview.',
    },
    {
      icon: Calendar,
      title: 'Book Free Consult',
      description: 'Love your AI preview? Schedule a free consultation with our expert team.',
    },
  ];

  return (
    <section id="how-it-works" className="bg-slate-50 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-cyan-200 rounded-full mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs font-semibold text-cyan-700">AI-Powered Process</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Get your AI-enhanced dream smile preview in 4 simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line (hidden on mobile, last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-slate-200 -z-10"></div>
                )}
                
                {/* Step Card */}
                <div className="relative bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 transition-all">
                  {/* Step Number */}
                  <div className="absolute -top-2.5 -left-2.5 w-7 h-7 bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-500 rounded-lg flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5 text-center">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-600 mb-3 font-medium">Ready to see your AI-enhanced smile?</p>
          <button
            onClick={() => {
              const section = document.getElementById('smile-transform');
              section?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-600 shadow-sm transition-all"
          >
            <span>Try AI Smile Preview Free</span>
            <Sparkles className="w-4 h-4" />
          </button>
          <p className="text-xs text-slate-500 mt-2">No credit card required</p>
        </div>
      </div>
    </section>
  );
}
