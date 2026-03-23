import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ClinicBranding } from '../App';
import { builtInTestimonials } from '../data/testimonials';

interface TestimonialsProps {
  clinicBranding?: ClinicBranding;
}

export function Testimonials({ clinicBranding }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = clinicBranding?.testimonials && clinicBranding.testimonials.length > 0
    ? clinicBranding.testimonials
    : builtInTestimonials;

  const googleReviewsScript = clinicBranding?.googleReviewsScript;

  // Inject Google Reviews script if provided
  useEffect(() => {
    if (googleReviewsScript && googleReviewsScript.trim() !== '') {
      const scriptContainer = document.getElementById('google-reviews-container');
      if (scriptContainer) {
        scriptContainer.innerHTML = googleReviewsScript;
        
        // Execute any scripts in the HTML
        const scripts = scriptContainer.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          const newScript = document.createElement('script');
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          script.parentNode?.replaceChild(newScript, script);
        }
      }
    }
  }, [googleReviewsScript]);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  // Get visible testimonials based on screen size
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push({ ...testimonials[index], displayIndex: i });
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-cyan-200 rounded-full mb-3 shadow-sm">
            <Star className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs font-semibold text-cyan-700">Real Patient Results</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            What Our Patients Say
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Join hundreds of satisfied patients who transformed their smiles with AI-powered previews
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          {/* Navigation Arrows - Only show if more than 3 testimonials */}
          {testimonials.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg items-center justify-center shadow-sm transition-all hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={nextSlide}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg items-center justify-center shadow-sm transition-all hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </>
          )}

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTestimonials.map((testimonial, idx) => (
              <div
                key={`${testimonial.id}-${idx}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 transition-all relative"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-slate-200">
                  <Quote className="w-7 h-7" />
                </div>

                {/* Rating */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-sm text-slate-600 mb-4 leading-relaxed min-h-[80px]">
                  "{testimonial.text}"
                </p>

                {/* Patient Info */}
                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {testimonial.city}
                    </p>
                    <p className="text-xs font-medium text-cyan-600">{testimonial.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Navigation - Only show if more than 3 testimonials */}
          {testimonials.length > 3 && (
            <div className="flex justify-center gap-1.5 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                    index === currentIndex
                      ? 'w-6 bg-cyan-600'
                      : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-slate-700">
              <strong>4.9/5</strong> Average Rating from 500+ Reviews
            </span>
          </div>
        </div>

        {/* Google Reviews Integration */}
        {googleReviewsScript && googleReviewsScript.trim() !== '' && (
          <div className="mt-8">
            <div id="google-reviews-container" className="max-w-4xl mx-auto"></div>
          </div>
        )}
      </div>
    </section>
  );
}
