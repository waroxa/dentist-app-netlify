import React, { useEffect } from 'react';

export function SetupGuide() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Setup Guide - SmileVisionPro AI';
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl bg-slate-900 px-8 py-12 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Setup guide</p>
          <h1 className="mt-3 text-4xl font-bold">Production setup for SmileVisionPro AI</h1>
          <p className="mt-4 max-w-3xl text-slate-200">Use this page to prepare account access, image standards, provider configuration, workflow setup, privacy expectations, and support procedures. This guide is intentionally white-label and suitable for public documentation.</p>
        </header>

        <section className="rounded-2xl border p-8">
          <h2 className="text-2xl font-semibold">1. Account setup</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-6 text-slate-600">
            <li>Deploy the site and backend functions with your environment variables in place.</li>
            <li>Set the private administrator password and session secret before inviting staff into the admin area.</li>
            <li>Connect any optional CRM workspace from the private admin route only.</li>
          </ol>
        </section>

        <section className="rounded-2xl border p-8">
          <h2 className="text-2xl font-semibold">2. Image upload requirements</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-slate-600">
            <li>Supported formats for preview generation: JPG, PNG, or WEBP.</li>
            <li>Recommended size: under 10 MB.</li>
            <li>Use a straight-on photo with teeth visible, natural lighting, and minimal filters.</li>
            <li>Avoid screenshots, heavy shadows, obstructed lips, or multiple faces in frame.</li>
          </ul>
        </section>

        <section className="rounded-2xl border p-8">
          <h2 className="text-2xl font-semibold">3. Video provider setup</h2>
          <div className="mt-4 space-y-5 text-slate-600">
            <div>
              <h3 className="font-semibold text-slate-900">Shared controls</h3>
              <ul className="mt-2 list-disc space-y-2 pl-6">
                <li><code>VIDEO_PROVIDER_DEFAULT</code> = <code>fal</code> or <code>veo</code>.</li>
                <li>The selected provider is stored with the smile job for traceability.</li>
                <li>The frontend labels the completed result with the provider used.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">FAL configuration</h3>
              <ul className="mt-2 list-disc space-y-2 pl-6">
                <li><code>FAL_ENABLED=true</code></li>
                <li><code>FAL_API_KEY</code></li>
                <li><code>FAL_VIDEO_MODEL</code> (optional override)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Google Veo configuration</h3>
              <ul className="mt-2 list-disc space-y-2 pl-6">
                <li><code>VEO_ENABLED=true</code></li>
                <li><code>GOOGLE_CLOUD_PROJECT_ID</code></li>
                <li><code>GOOGLE_CLOUD_LOCATION</code> (typically <code>us-central1</code>)</li>
                <li><code>GOOGLE_APPLICATION_CREDENTIALS_JSON</code> stored only on the server</li>
                <li><code>VEO_MODEL=veo-3.1-generate-001</code></li>
                <li><code>VEO_FAST_MODEL</code> (optional secondary config)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-8">
          <h2 className="text-2xl font-semibold">4. Workflow setup</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-slate-600">
            <li>Capture lead details first so each preview request is traceable.</li>
            <li>Request an AI smile preview after the upload is validated.</li>
            <li>Offer FAL and Veo as real video providers from the generated preview image.</li>
            <li>Have your team review generated content before making treatment promises.</li>
          </ul>
        </section>

        <section className="rounded-2xl border p-8">
          <h2 className="text-2xl font-semibold">5. Troubleshooting</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-slate-600">
            <li>If lead forms fail, confirm your database credentials and backend logs.</li>
            <li>If previews fail, verify the Gemini API key, image format, upload size, and backend function logs.</li>
            <li>If a video provider fails, the UI should show the real provider error so you know whether FAL or Veo needs attention.</li>
            <li>If CRM sync fails, the lead should still save locally so you can retry safely.</li>
          </ul>
        </section>

        <section className="rounded-2xl border p-8">
          <h2 className="text-2xl font-semibold">6. Privacy and security overview</h2>
          <p className="mt-4 text-slate-600">SmileVisionPro AI sends privileged requests through backend endpoints only, stores integration tokens encrypted server-side, logs admin actions for audit purposes, and avoids shipping private credentials to the browser bundle.</p>
          <p className="mt-3 text-slate-600">For help, email <a href="mailto:support@smilevisionpro.ai" className="text-sky-600 underline">support@smilevisionpro.ai</a> or visit <a href="/support" className="text-sky-600 underline">Support</a>.</p>
        </section>
      </div>
    </div>
  );
}
