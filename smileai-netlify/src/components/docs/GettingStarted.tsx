import React, { useEffect } from 'react';

export function GettingStarted() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Getting Started - SmileVisionPro AI';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-3xl bg-gradient-to-r from-slate-900 via-sky-700 to-cyan-500 px-8 py-12 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Getting started</p>
          <h1 className="mt-3 text-4xl font-bold">Start using SmileVisionPro AI in a few simple steps.</h1>
          <p className="mt-4 max-w-2xl text-lg text-sky-50">
            SmileVisionPro AI helps clinics and patients visualize cosmetic smile improvements from a single photo. The
            live flow keeps lead capture, image preview generation, before-and-after comparison, and smile video
            generation in one streamlined experience.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {[
            ['1. Create your request', 'Enter your name, email, phone number, and the treatment you want to explore.'],
            ['2. Upload a clear photo', 'Use a front-facing image with teeth visible, even lighting, and minimal blur.'],
            ['3. Generate your preview', 'Choose a Very subtle, Natural, or Hollywood smile style and let the app create the result.'],
            ['4. Create your smile video', 'Generate a short smile video from the approved preview image to help visualize the transformation.'],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              <p className="mt-3 text-slate-600">{body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">What results should you expect?</h2>
          <ul className="mt-4 space-y-3 text-slate-600 list-disc pl-6">
            <li>A smile preview is a visual estimate designed to support treatment conversations, not a guarantee of final clinical outcomes.</li>
            <li>Best results come from well-lit photos where the front teeth and gum line are visible.</li>
            <li>Smile videos are visual demonstrations intended to support treatment conversations and should be reviewed by the clinic before being shared widely.</li>
          </ul>
        </section>

        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Need help?</h2>
          <p className="mt-4 text-slate-600">
            Visit <a className="text-sky-600 underline" href="/setup-guide">Setup Guide</a> for production setup and
            troubleshooting, or contact <a className="text-sky-600 underline" href="mailto:support@smilevisionpro.ai">support@smilevisionpro.ai</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
