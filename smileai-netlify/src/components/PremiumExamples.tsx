import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import beforeImage1 from 'figma:asset/e48e1508ae690e5a9f1735226e02db94194bc3f0.png';
import naturalImage1 from 'figma:asset/05a9c44d915ba53264dcf88fa1ff97bfe86621e6.png';
import hollywoodImage1 from 'figma:asset/ba88f5071e0e5b56767bf8cea28598b75d5eaf55.png';
import beforeImage2 from 'figma:asset/5e0c2f0e653e36e8b3c861194ace748aeb9fd03c.png';
import naturalImage2 from 'figma:asset/ec1dad070976983db727150abe4e0283213dc7cc.png';
import hollywoodImage2 from 'figma:asset/5667734a38eb1b644cf323309c5e73c4a65ce4f6.png';
import beforeImage3 from 'figma:asset/c12aff1d63db36bbfabf3d6d639aac5a3ebb42d5.png';
import naturalImage3 from 'figma:asset/16a80c7d618612a3d58a9ccc7c531964213086a2.png';
import hollywoodImage3 from 'figma:asset/87d6c1ab1b01ef75b0860c9653a9c13a4a2d97d9.png';

type SmileState = 'before' | 'natural' | 'hollywood';

const STATE_OPTIONS: Array<{ id: SmileState; label: string }> = [
  { id: 'before', label: 'Before' },
  { id: 'natural', label: 'Natural' },
  { id: 'hollywood', label: 'Hollywood' },
];

const EXAMPLES = [
  {
    id: 0,
    patient: 'Example 01',
    initialState: 'before' as SmileState,
    images: {
      before: beforeImage1,
      natural: naturalImage1,
      hollywood: hollywoodImage1,
    },
  },
  {
    id: 1,
    patient: 'Example 02',
    initialState: 'natural' as SmileState,
    images: {
      before: beforeImage2,
      natural: naturalImage2,
      hollywood: hollywoodImage2,
    },
  },
  {
    id: 2,
    patient: 'Example 03',
    initialState: 'hollywood' as SmileState,
    images: {
      before: beforeImage3,
      natural: naturalImage3,
      hollywood: hollywoodImage3,
    },
  },
];

export function PremiumExamples() {
  const [selectedStates, setSelectedStates] = useState<Record<number, SmileState>>(
    EXAMPLES.reduce((acc, example) => {
      acc[example.id] = example.initialState;
      return acc;
    }, {} as Record<number, SmileState>)
  );

  const handleSelectState = (exampleId: number, state: SmileState) => {
    setSelectedStates((current) => ({
      ...current,
      [exampleId]: state,
    }));
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-blue-100/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-4xl text-center sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-teal-700 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Real Transformations Gallery</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            See What&apos;s Possible{' '}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              In Under 30 Seconds
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Explore three smile-preview examples using the same before, natural, and Hollywood states available in your image set. The styling now matches the hero and footer instead of repeating the old duplicate cards section.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {EXAMPLES.map((example, index) => {
            const selectedState = selectedStates[example.id];
            const selectedImage = example.images[selectedState];

            return (
              <motion.article
                key={example.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
              >
                <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-6 py-4 text-center">
                  <p className="text-xl font-bold text-white">AI Enhanced Smile</p>
                </div>

                <div className="border-x-2 border-b-2 border-teal-500/90 bg-slate-100">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${example.id}-${selectedState}`}
                      src={selectedImage}
                      alt={`${example.patient} ${selectedState} smile preview`}
                      initial={{ opacity: 0.15, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.15, scale: 1.015 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="aspect-[4/4.2] w-full object-cover"
                    />
                  </AnimatePresence>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">Smile Intensity</p>
                      <p className="text-sm text-slate-500">Select a state to preview the result.</p>
                    </div>
                    <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {example.patient}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {STATE_OPTIONS.map((option) => {
                      const isActive = selectedState === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectState(example.id, option.id)}
                          className={`rounded-2xl border-2 px-3 py-4 text-sm font-semibold transition-all duration-200 sm:text-base ${
                            isActive
                              ? 'border-transparent bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-slate-950'
                          }`}
                          aria-pressed={isActive}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                    <p className="text-sm leading-relaxed text-slate-600">
                      We only adjust teeth and smile — we don&apos;t change the patient&apos;s face.
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
