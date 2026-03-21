import { CheckCircle2 } from 'lucide-react';
import { QuickTransformations } from './QuickTransformations';
import { PatientIntakeFormSection } from './PatientIntakeFormSection';

const previewBenefits = [
  {
    title: 'See Your Potential',
    description: 'Visualize your smile transformation before committing to treatment',
  },
  {
    title: '100% Free & No Obligation',
    description: 'Get your AI smile preview instantly - no payment required',
  },
  {
    title: 'Personalized Consultation',
    description: 'Our team will review your preview and provide expert recommendations',
  },
  {
    title: 'Fast Results',
    description: 'Get your AI-generated smile transformation in under 30 seconds',
  },
];

export function SmileTransformationSection() {
  return (
    <section id="smile-transform" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Get Your Free Smile Preview
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Enter your info and see what&apos;s possible with an AI-enhanced smile preview. No commitment required.
          </p>
        </div>

        <div className="mt-14">
          <QuickTransformations />
        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-8">
              <h3 className="text-3xl font-semibold tracking-tight text-slate-950">
                Step 1: Enter Your Information
              </h3>
              <p className="mt-3 text-lg text-slate-600">
                We&apos;ll create your personalized smile preview in the next step
              </p>
            </div>

            <PatientIntakeFormSection compact />
          </div>

          <div className="rounded-[30px] border border-blue-100 bg-[linear-gradient(180deg,#f3f7ff_0%,#f7fbff_55%,#f1fdfb_100%)] p-6 shadow-[0_18px_60px_rgba(14,165,233,0.08)] sm:p-8">
            <h3 className="text-3xl font-semibold tracking-tight text-slate-950">
              Why Get Your Free Preview?
            </h3>

            <div className="mt-8 space-y-5">
              {previewBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-slate-950">{benefit.title}</p>
                      <p className="mt-2 text-lg leading-relaxed text-slate-600">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[22px] border border-teal-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.75),rgba(239,246,255,0.75))] px-6 py-7 text-center">
              <p className="text-2xl font-semibold text-slate-950">Over 10,000+ smiles transformed!</p>
              <p className="mt-2 text-lg text-slate-600">
                Join thousands who&apos;ve discovered their dream smile.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500 sm:text-base">
          Your photos are processed securely and privately. We only adjust your smile, not your identity.
        </p>
      </div>
    </section>
  );
}
