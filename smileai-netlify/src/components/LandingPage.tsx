import React from 'react';
import { ArrowRight, Check, ChevronRight, CirclePlay, Clock3, ShieldCheck, Sparkles, Stethoscope, Star, TrendingUp, Upload, Wand2 } from 'lucide-react';

const painPoints = [
  {
    title: 'Time-consuming manual designs',
    description: 'Reduce back-and-forth mockups with a guided AI workflow that keeps consults moving.',
    icon: Clock3,
  },
  {
    title: 'Missed conditions',
    description: 'Surface high-clarity visual insights that help teams explain what patients need with confidence.',
    icon: Stethoscope,
  },
  {
    title: 'Low case acceptance',
    description: 'Turn uncertainty into motivation with a polished preview patients can immediately understand.',
    icon: TrendingUp,
  },
];

const steps = [
  {
    title: 'Upload Patient Photo',
    description: 'Securely import a smile photo in seconds.',
    icon: Upload,
  },
  {
    title: 'AI Instantly Analyzes & Enhances',
    description: 'Highlight opportunities with calm, clinically clear guidance.',
    icon: Wand2,
  },
  {
    title: 'Present Cinematic Smile Preview',
    description: 'Show an HD motion render that makes treatment value obvious.',
    icon: CirclePlay,
  },
];

const outcomes = [
  'Save 2+ Hours Per Day on Consultations.',
  'Increase Case Acceptance by 40%.',
  'Improve Diagnostic Accuracy & Patient Trust.',
];

const trustStats = [
  { value: '98.5%', label: 'Accuracy' },
  { value: '15+ Years', label: 'Experience' },
  { value: '4.9/5', label: 'Rating' },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'For solo providers exploring AI consults.',
    features: ['Smile preview generation', 'Secure patient uploads', 'Basic consult workflow'],
    cta: 'Get Started Free',
    featured: false,
  },
  {
    name: 'Growth',
    price: '$299',
    description: 'For modern dental teams focused on conversion.',
    features: ['Everything in Starter', 'Cinematic Smile Preview', 'Priority onboarding'],
    cta: 'Start Free',
    featured: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    description: 'For multi-location groups and premium brands.',
    features: ['Advanced team controls', 'White-glove launch support', 'Custom reporting'],
    cta: 'Talk to Sales',
    featured: false,
  },
];

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{description}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.14),_transparent_24%),linear-gradient(180deg,_#08101d_0%,_#07111f_45%,_#020817_100%)]" />
      <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#07111f]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_30px_rgba(45,212,191,0.18)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white/90 uppercase">SmileVisionPro.ai</p>
              <p className="text-xs text-slate-400">AI consult previews for dental teams</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#solution" className="transition hover:text-white">How it works</a>
            <a href="#benefits" className="transition hover:text-white">Outcomes</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <a href="#trust" className="transition hover:text-white">Trust</a>
          </nav>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-200/60 hover:bg-white/15"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main>
        <section className="px-6 pb-20 pt-16 sm:pt-24 lg:px-8 lg:pb-28">
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                HIPAA-first workflow for premium patient consultations
              </div>
              <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                See Your Patient&apos;s Dream Smile in 30 Seconds
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                The world&apos;s most advanced AI-powered cosmetic preview platform for modern dental teams.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 px-6 py-3.5 text-base font-semibold text-slate-950 shadow-[0_20px_80px_rgba(45,212,191,0.35)] transition hover:scale-[1.02]"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  <CirclePlay className="h-4 w-4" />
                  See Demo
                </a>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {trustStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
                    <div className="text-2xl font-semibold text-white">{stat.value}</div>
                    <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div id="demo" className="relative">
              <div className="absolute -inset-8 rounded-[40px] bg-cyan-400/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/8 p-4 shadow-[0_30px_120px_rgba(8,15,30,0.75)] backdrop-blur-xl sm:p-6">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/85 p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm font-semibold text-white">AI Smile Console</p>
                      <p className="mt-1 text-xs text-slate-400">Preview-ready in under 30 seconds</p>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                      Secure session
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,36,0.92),rgba(2,6,23,0.96))] p-4">
                      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                        <span>Patient smile preview</span>
                        <span>HD Motion Render</span>
                      </div>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] border border-cyan-300/10 bg-[radial-gradient(circle_at_50%_10%,rgba(125,211,252,0.18),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(8,15,30,0.98))]">
                        <div className="absolute inset-x-10 top-10 h-24 rounded-full bg-slate-200/90 blur-[2px]" />
                        <div className="absolute inset-x-14 top-24 h-6 rounded-full bg-slate-950/60" />
                        <div className="absolute inset-x-12 bottom-20 h-28 rounded-[40px] bg-gradient-to-b from-slate-100 to-white shadow-[0_0_40px_rgba(255,255,255,0.2)]" />
                        <div className="absolute inset-x-16 bottom-28 grid grid-cols-8 gap-1">
                          {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="h-10 rounded-b-xl rounded-t-md bg-white shadow-[inset_0_-2px_8px_rgba(148,163,184,0.25)]" />
                          ))}
                        </div>
                        <div className="absolute left-6 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100 backdrop-blur-md">
                          <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
                          Shade correction complete
                        </div>
                        <div className="absolute bottom-6 right-6 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-xs text-slate-200 backdrop-blur-md">
                          Natural contour + symmetry boost
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Analysis</p>
                        <div className="mt-4 space-y-3">
                          {['Alignment opportunity detected', 'Whitening simulation calibrated', 'Patient-ready presentation prepared'].map((item) => (
                            <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-slate-900/70 p-3">
                              <div className="mt-0.5 rounded-full bg-cyan-400/15 p-1 text-cyan-200">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                              <p className="text-sm text-slate-200">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[24px] border border-teal-300/15 bg-gradient-to-br from-teal-300/10 to-cyan-400/5 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">Consultation outcome</p>
                            <p className="mt-1 text-xs text-slate-300">Patient trust reinforced through clear visuals</p>
                          </div>
                          <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-teal-100">Ready</div>
                        </div>
                        <div className="mt-4 rounded-2xl bg-slate-950/60 p-4">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-3xl font-semibold text-white">+40%</p>
                              <p className="text-sm text-slate-400">higher case acceptance</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-cyan-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="The problem"
              title="Dental teams need clarity, not clutter."
              description="Every consult should feel premium, fast, and trustworthy. SmileVisionPro removes friction so your team can focus on patient confidence."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {painPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/8">
                    <div className="mb-6 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="solution" className="px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="The solution"
              title="A simple 3-step workflow built for modern consults."
              description="No noisy dashboards. No technical overwhelm. Just a polished flow your front desk and clinicians can use immediately."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-medium text-slate-500">0{index + 1}</div>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="benefits" className="px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <TrendingUp className="h-3.5 w-3.5" />
                Outcomes, not features
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Designed to improve revenue, speed, and patient confidence.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
                Every screen is optimized to help dentists present treatment plans with more precision, less friction, and stronger conversion momentum.
              </p>
            </div>
            <div className="grid gap-4">
              {outcomes.map((outcome) => (
                <div key={outcome} className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-slate-950/60 p-5 transition hover:border-cyan-300/25 hover:bg-slate-950/80">
                  <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 p-2 text-emerald-200">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-medium text-white">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="trust" className="px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Trust-first"
              title="Clinically credible, secure, and presentation-ready."
              description="Trust is built before the first click. SmileVisionPro communicates patient safety, premium care, and disciplined execution from the first impression."
            />
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-6 sm:grid-cols-3">
                {trustStats.map((stat) => (
                  <div key={stat.label} className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
                    <p className="text-4xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-[28px] border border-cyan-300/15 bg-gradient-to-br from-cyan-400/10 via-white/5 to-teal-300/10 p-6 backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { icon: ShieldCheck, label: 'HIPAA Ready' },
                    { icon: Star, label: 'Premium UX' },
                    { icon: Check, label: 'Patient Safe Messaging' },
                  ].map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div key={badge.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-slate-100">
                        <Icon className="h-4 w-4 text-cyan-200" />
                        {badge.label}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-6 text-lg leading-8 text-slate-200">
                  A restrained visual system, calm spacing, and secure-by-design presentation create instant confidence for both dental teams and patients.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Pricing"
              title="Simple plans for practices at every stage."
              description="Clear options, minimal copy, and a highlighted growth plan to help teams get started without hesitation."
            />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-[30px] border p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${
                    plan.featured
                      ? 'border-cyan-300/30 bg-gradient-to-b from-cyan-400/15 to-slate-950/70 shadow-[0_24px_80px_rgba(34,211,238,0.18)]'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    {plan.featured && (
                      <span className="rounded-full border border-cyan-200/30 bg-cyan-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-4xl font-semibold text-white">{plan.price}<span className="ml-1 text-sm font-normal text-slate-400">{plan.price === '$299' ? '/mo' : ''}</span></p>
                  <p className="mt-3 min-h-12 text-sm leading-7 text-slate-300">{plan.description}</p>
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                        <div className="rounded-full bg-emerald-300/10 p-1 text-emerald-200">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <a
                    href="#"
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold transition ${
                      plan.featured
                        ? 'bg-gradient-to-r from-cyan-300 to-teal-300 text-slate-950 hover:opacity-95'
                        : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 pt-8 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-5xl rounded-[36px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(7,17,31,0.95))] p-8 text-center shadow-[0_30px_120px_rgba(34,211,238,0.14)] backdrop-blur-xl sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure onboarding for modern dental teams
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Turn more consultations into confident yes decisions.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Start free, present treatment with greater clarity, and give patients a premium preview experience they trust immediately.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
              >
                See Demo
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-300">HIPAA-first handling. Clear patient communication. Premium clinical presentation.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
