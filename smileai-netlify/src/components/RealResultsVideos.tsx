import { Play, Star } from 'lucide-react';
import beforeImage1 from 'figma:asset/c12aff1d63db36bbfabf3d6d639aac5a3ebb42d5.png';
import naturalImage1 from 'figma:asset/16a80c7d618612a3d58a9ccc7c531964213086a2.png';
import beforeImage2 from 'figma:asset/e48e1508ae690e5a9f1735226e02db94194bc3f0.png';
import naturalImage2 from 'figma:asset/05a9c44d915ba53264dcf88fa1ff97bfe86621e6.png';

const results = [
  {
    videoUrl: 'https://pvophjpndtqxkoygposy.supabase.co/storage/v1/object/public/ai%20Videos/B1mMj15qALV62RoTfjk7l_output.mp4',
    poster: naturalImage1,
    before: beforeImage1,
    quote: "I couldn't believe the transformation! My smile looks exactly like I always dreamed it would.",
  },
  {
    videoUrl: 'https://pvophjpndtqxkoygposy.supabase.co/storage/v1/object/public/ai%20Videos/R0BPFcfU_zKvylZQP-oRK_output.mp4',
    poster: naturalImage2,
    before: beforeImage2,
    quote: 'The preview showed me exactly what was possible. Now I can’t stop smiling!',
  },
] as const;

export function RealResultsVideos() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-5 py-3 text-base font-semibold text-violet-700">
            <Play className="h-5 w-5" />
            Real Transformations
          </div>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            See Real <span className="bg-gradient-to-r from-fuchsia-500 to-blue-600 bg-clip-text text-transparent">Smile Transformations</span>
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl">
            Watch actual patients show off their stunning new smiles. These are real results from people just like you.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {results.map((result, index) => (
            <article
              key={result.videoUrl}
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.08)]"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <div className="absolute left-6 top-6 z-10 rounded-full bg-gradient-to-r from-fuchsia-600 to-blue-600 px-5 py-3 text-xl font-semibold text-white shadow-lg">
                  ✨ Real Result
                </div>
                <video
                  className="h-full w-full object-cover"
                  controls
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={result.poster}
                >
                  <source src={result.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="grid min-h-[200px] grid-cols-1 border-t border-slate-100 md:grid-cols-2">
                <div className="border-b border-slate-100 bg-slate-50 md:border-b-0 md:border-r">
                  <img
                    src={result.before}
                    alt={`Before smile example ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="mb-5 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-6 w-6 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-2xl text-slate-500">(5.0)</span>
                  </div>
                  <p className="text-2xl leading-relaxed text-slate-700">"{result.quote}"</p>
                  <p className="mt-8 text-xl text-slate-500">- Happy Patient</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
