import { motion } from 'motion/react';
import { Star, Play, Sparkles } from 'lucide-react';

const EXAMPLES = [
  {
    id: 1,
    before: 'https://images.unsplash.com/photo-1607746882042-f3978ccb8fe5?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1609618668553-1d3c2e4b0f5a?w=500&q=80',
    video: 'https://pvophjpndtqxkoygposy.supabase.co/storage/v1/object/public/ai%20Videos/B1mMj15qALV62RoTfjk7l_output.mp4',
    title: 'Natural Enhancement',
    description: 'Subtle refinement for a naturally beautiful smile',
    rating: 5,
    style: 'Natural',
  },
  {
    id: 2,
    before: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1609618668553-1d3c2e4b0f5a?w=500&q=80',
    video: 'https://pvophjpndtqxkoygposy.supabase.co/storage/v1/object/public/ai%20Videos/R0BPFcfU_zKvylZQP-oRK_output.mp4',
    title: 'Hollywood Transformation',
    description: 'Bright, high-impact smile makeover for maximum confidence',
    rating: 5,
    style: 'Hollywood',
  },
  {
    id: 3,
    before: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1609618668553-1d3c2e4b0f5a?w=500&q=80',
    video: 'https://pvophjpndtqxkoygposy.supabase.co/storage/v1/object/public/ai%20Videos/B1mMj15qALV62RoTfjk7l_output.mp4',
    title: 'Subtle Refinement',
    description: 'Gentle cosmetic enhancement for a refined look',
    rating: 5,
    style: 'Subtle',
  },
];

export function PremiumExamples() {
  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-teal-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Real Results Gallery</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-slate-950 sm:text-5xl lg:text-6xl">
            See Your <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">Dream Smile</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600 sm:text-xl">
            Explore real before-and-after transformations powered by AI. Each example showcases different smile enhancement styles.
          </p>
        </motion.div>

        {/* Examples Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {EXAMPLES.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10">
                {/* Before/After Toggle */}
                <div className="relative h-[300px] overflow-hidden bg-slate-100">
                  {/* Before Image */}
                  <motion.img
                    src={example.before}
                    alt="Before"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* After Image */}
                  <img
                    src={example.after}
                    alt="After"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  
                  {/* Overlay Labels */}
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-xs font-semibold text-white">Hover to compare</span>
                  </div>

                  {/* Style Badge */}
                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg backdrop-blur-sm">
                    {example.style}
                  </div>

                  {/* Play Button for Video */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <a
                      href={example.video}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform duration-300 hover:scale-110"
                    >
                      <Play className="h-6 w-6 fill-teal-600 text-teal-600" />
                    </a>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-1">
                    {[...Array(example.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-950">{example.title}</h3>
                  <p className="mb-4 text-sm text-slate-600">{example.description}</p>
                  
                  <div className="flex gap-2">
                    <a
                      href={example.video}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-center text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30"
                    >
                      Watch Video
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 rounded-[32px] border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-8 text-center sm:p-12"
        >
          <h3 className="mb-3 text-3xl font-bold text-slate-950">Ready to See Your Smile?</h3>
          <p className="mb-6 text-lg text-slate-600">
            Upload your photo and get your personalized AI smile preview in seconds.
          </p>
          <a
            href="#smile-transform"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-teal-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/40"
          >
            Try AI Preview Free
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
