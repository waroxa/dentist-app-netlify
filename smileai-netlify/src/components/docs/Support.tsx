import React, { useEffect } from 'react';
import { BookOpen, Clock3, Home, LifeBuoy, Mail, ShieldCheck } from 'lucide-react';

function SupportCard({
  icon: Icon,
  title,
  description,
  href,
  linkText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
          <Icon className="h-6 w-6 text-sky-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-slate-600">{description}</p>
          <a href={href} className="mt-4 inline-flex text-base font-semibold text-sky-600 hover:text-sky-700">
            {linkText}
          </a>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-base font-semibold text-slate-900">{question}</h3>
      <p className="mt-2 text-slate-600">{answer}</p>
    </div>
  );
}

export function Support() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Support - SmileVisionPro AI';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Support</p>
          <h1 className="text-4xl font-bold text-slate-900">Customer support and help center</h1>
          <p className="max-w-3xl text-lg text-slate-600">
            Need help with setup, account access, preview generation, or patient workflows? Use the resources below to
            get support quickly.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <SupportCard
            icon={Mail}
            title="Email Support"
            description="Contact the SmileVisionPro support team for setup, troubleshooting, and general product questions."
            href="mailto:support@smilevisionpro.ai"
            linkText="support@smilevisionpro.ai"
          />
          <SupportCard
            icon={BookOpen}
            title="Documentation"
            description="Review the setup guide and getting-started instructions for a clear overview of the live workflow."
            href="/setup-guide"
            linkText="Open Setup Guide"
          />
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Support hours</h2>
              <p className="mt-2 text-slate-700">Monday to Friday, 9:00 AM to 6:00 PM EST</p>
              <p className="text-slate-700">Saturday, 10:00 AM to 2:00 PM EST</p>
              <p className="text-slate-700">Sunday, closed</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Common questions</h2>
          <div className="mt-6 space-y-4">
            <FAQItem
              question="How do I configure the app?"
              answer="Start with the setup guide, then sign in to the private admin area to update branding, contact information, testimonials, and security settings."
            />
            <FAQItem
              question="Where are patient previews and videos stored?"
              answer="Preview images and generated videos are saved to the patient record so your team can review them and use them in follow-up workflows."
            />
            <FAQItem
              question="What should I do if a preview or video fails?"
              answer="Check that the uploaded image is clear and front-facing, then retry. If the issue continues, contact support and include the approximate time of the request."
            />
            <FAQItem
              question="Can I customize the public site?"
              answer="Yes. The admin settings let you update branding, colors, contact details, testimonials, and other visible content without editing code."
            />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-sky-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Privacy</h2>
                <p className="mt-2 text-slate-600">
                  Review the privacy notice and terms before completing your production launch.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/privacy-notice" className="font-semibold text-sky-600 hover:text-sky-700">
                    Privacy Notice
                  </a>
                  <a href="/terms" className="font-semibold text-sky-600 hover:text-sky-700">
                    Terms
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <Home className="mt-0.5 h-5 w-5 text-sky-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Back to app</h2>
                <p className="mt-2 text-slate-600">
                  Return to the live experience to test the patient journey and staff access flow.
                </p>
                <a href="/" className="mt-4 inline-flex font-semibold text-sky-600 hover:text-sky-700">
                  Open Homepage
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <LifeBuoy className="mt-0.5 h-5 w-5 text-sky-600" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Need priority help?</h2>
              <p className="mt-2 text-slate-700">
                For express support, email <strong>info@RewardLion.com</strong> with a short summary of the issue and
                the clinic name in the subject line.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
