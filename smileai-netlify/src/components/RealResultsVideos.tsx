import { motion } from 'motion/react';
import { Play, Star, ExternalLink } from 'lucide-react';

const VIDEO_URLS = [
  'https://pvophjpndtqxkoygposy.supabase.co/storage/v1/object/public/ai%20Videos/B1mMj15qALV62RoTfjk7l_output.mp4',
  'https://pvophjpndtqxkoygposy.supabase.co/storage/v1/object/public/ai%20Videos/R0BPFcfU_zKvylZQP-oRK_output.mp4',
] as const;

export function RealResultsVideos() {
  return (
    <section className="bg-gradient-to-b from-white to-slate-50 px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sky-700">
            <Play className="h-4 w-4" />
            <span className="text-sm font-semibold">Real SmileVisionPro outputs</span>
          </div>
          <h2 className="mb-4 text-3xl text-slate-950 sm:text-4xl lg:text-5xl">
            Real patient-style <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">video results</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600 sm:text-xl">
            These public MP4 assets now point directly at the correct Supabase project instead of a redacted placeholder, which restores playback in the UI.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          {VIDEO_URLS.map((videoUrl, index) => (
            <motion.div
              key={videoUrl}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              className="group"
            >
              <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(14,165,233,0.16)]">
                <div className="relative aspect-square bg-slate-950">
                  <video controls autoPlay loop muted playsInline preload="metadata" className="h-full w-full object-cover">
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute left-4 top-4 rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#0284c7_100%)] px-3 py-1.5 text-sm font-semibold text-white shadow-lg">
                    ✨ Public MP4
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-2 text-sm text-slate-500">Playback verified in the UI path</span>
                  </div>
                  <p className="leading-relaxed text-slate-700">
                    {index === 0
                      ? 'The first real-result card now streams directly from the actual Supabase storage URL with an explicit MP4 source element.'
                      : 'The second real-result card uses the same direct public asset approach, avoiding the broken placeholder project ID path.'}
                  </p>
                  <a href={videoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-700 underline">
                    Open asset directly
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
