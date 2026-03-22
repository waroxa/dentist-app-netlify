import { motion } from 'motion/react';
import { Play, Sparkles } from 'lucide-react';

const EXAMPLE_VIDEOS = [
  {
    id: 1,
    videoUrl: 'https://pvophjpndtqxkoygposy.supabase.co/storage/v1/object/public/ai%20Videos/R0BPFcfU_zKvylZQP-oRK_output.mp4',
    title: 'Natural Smile Enhancement',
    description: 'See the transformation come to life',
  },
  {
    id: 2,
    videoUrl: 'https://pvophjpndtqxkoygposy.supabase.co/storage/v1/object/public/ai%20Videos/B1mMj15qALV62RoTfjk7l_output.mp4',
    title: 'Hollywood Smile Preview',
    description: 'Stunning results in seconds',
  },
];

export function VideoExamples() {
  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm" style={{ border: '1px solid #06b6d4', color: '#0e7490' }}>
            <Play className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">AI Video Examples</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            Watch Your Smile Come to Life
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            See how our AI creates stunning animated previews of your new smile
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXAMPLE_VIDEOS.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Video Header */}
              <div className="px-4 py-2.5" style={{ background: 'linear-gradient(to right, #0891b2, #06b6d4)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-white" />
                    <h3 className="text-sm font-semibold text-white">{example.title}</h3>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    AI Generated
                  </span>
                </div>
              </div>
              
              {/* Video Player */}
              <div className="p-4">
                <div className="relative h-[400px] overflow-hidden rounded-lg bg-slate-100">
                  <video
                    src={example.videoUrl}
                    className="h-full w-full object-cover object-top"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
                <p className="mt-3 text-xs text-slate-500 text-center">{example.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              const section = document.getElementById('smile-transform');
              section?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md transition-all"
            style={{ backgroundColor: '#0891b2' }}
          >
            <Sparkles className="h-4 w-4" />
            Create Your Own AI Video
          </button>
        </div>
      </div>
    </section>
  );
}
