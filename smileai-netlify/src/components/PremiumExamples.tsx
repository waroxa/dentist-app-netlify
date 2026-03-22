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
    initialState: 'before' as SmileState,
    images: {
      before: beforeImage1,
      natural: naturalImage1,
      hollywood: hollywoodImage1,
    },
  },
  {
    id: 1,
    initialState: 'natural' as SmileState,
    images: {
      before: beforeImage2,
      natural: naturalImage2,
      hollywood: hollywoodImage2,
    },
  },
  {
    id: 2,
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
    <section className="relative overflow-hidden bg-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-8 max-w-3xl text-center sm:mb-10"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm" style={{ border: '1px solid #06b6d4', color: '#0e7490' }}>
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Real Transformations</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            See What&apos;s Possible{' '}
            <span style={{ color: '#0891b2' }}>In Under 30 Seconds</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Explore real smile transformations with before, natural, and Hollywood options. Every image is watermarked with your practice logo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {EXAMPLES.map((example, index) => {
            const selectedState = selectedStates[example.id];
            const selectedImage = example.images[selectedState];

            return (
              <motion.article
                key={example.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="px-4 py-2.5 text-center" style={{ background: 'linear-gradient(to right, #0891b2, #06b6d4)' }}>
                  <p className="text-sm font-semibold text-white">AI Enhanced Smile</p>
                </div>

                <div className="border-x border-b border-cyan-200 bg-slate-50">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${example.id}-${selectedState}`}
                      src={selectedImage}
                      alt={`AI enhanced smile ${example.id + 1} ${selectedState} preview`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-48 sm:h-56 md:h-52 lg:h-60 object-cover object-top"
                    />
                  </AnimatePresence>
                </div>

                <div className="flex flex-col p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-slate-900">Smile Intensity</p>
                    <p className="text-xs text-slate-500">Select a state to preview</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {STATE_OPTIONS.map((option) => {
                      const isActive = selectedState === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectState(example.id, option.id)}
                          className={`rounded-lg border-2 px-2 py-2 text-xs font-medium transition-all ${
                            isActive
                              ? 'border-transparent text-white'
                              : 'border-slate-200 bg-white text-slate-600'
                          }`}
                          style={isActive ? { backgroundColor: '#0891b2', borderColor: '#0891b2' } : {}}
                          aria-pressed={isActive}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#0891b2' }} />
                    <p className="text-xs text-slate-500">
                      We only adjust teeth and smile - not the face.
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
