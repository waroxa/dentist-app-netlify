import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Download,
  ImagePlus,
  Loader2,
  PlayCircle,
  Save,
  Sparkles,
  Upload,
  Video,
  Wand2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type SmileStyle = 'subtle' | 'natural' | 'hollywood';
type VideoProvider = 'veo';
type FavoriteResult = 'original' | 'preview' | 'veo' | null;

interface VideoResult {
  provider: VideoProvider;
  assetUrl: string;
  jobId: string | null;
  model?: string | null;
  note?: string;
}

interface ProviderUiMessage {
  type: 'error' | 'success' | 'info';
  message: string;
}

interface PendingVideoJob {
  provider: VideoProvider;
  jobId: string;
  model?: string | null;
  note?: string;
}

const motivationalMessages = [
  '✨ Imagine waking up every day loving your smile...',
  '💫 A confident smile can transform your entire life',
  '🌟 Your dream smile is closer than you think',
  '💎 Invest in yourself - you deserve to feel amazing',
  '🎯 Confidence starts with a smile you are proud of',
  '🚀 Picture yourself smiling without hesitation',
] as const;

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Video API returned non-JSON response. Check backend route/rewrite. Non-JSON API response: ${text.slice(0, 300)}`);
  }
  return response.json();
}

function getVideoEndpoint(provider: VideoProvider) {
  return '/api/video/veo';
}

const STEP_LABELS = [
  'Upload Photo',
  'Choose Style',
  'AI Preview',
  'Create Video',
  'Compare',
] as const;

const STYLE_OPTIONS: Array<{ value: SmileStyle; label: string; helper: string; accent: string }> = [
  {
    value: 'subtle',
    label: 'Subtle',
    helper: 'Subtle: Gentle cosmetic refinement',
    accent: 'from-sky-50 via-white to-cyan-50',
  },
  {
    value: 'natural',
    label: 'Natural',
    helper: 'Natural: Balanced, realistic enhancement',
    accent: 'from-teal-50 via-white to-sky-50',
  },
  {
    value: 'hollywood',
    label: 'Hollywood',
    helper: 'Hollywood: Bright, high-impact smile makeover',
    accent: 'from-cyan-50 via-white to-blue-50',
  },
];

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getStepIndex(uploadedImage: string | null, previewImage: string | null, videoResults: Partial<Record<VideoProvider, VideoResult>>) {
  if (Object.keys(videoResults).length > 0) return 5;
  if (previewImage) return 4;
  if (uploadedImage) return 3;
  return 1;
}

export function SmileTransformationSection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewAssetUrl, setPreviewAssetUrl] = useState<string | null>(null);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [style, setStyle] = useState<SmileStyle>('natural');
  const [videoProvider, setVideoProvider] = useState<VideoProvider>('veo');
  const [videoResults, setVideoResults] = useState<Partial<Record<VideoProvider, VideoResult>>>({});
  const [pendingVideoJobs, setPendingVideoJobs] = useState<Partial<Record<VideoProvider, PendingVideoJob>>>({});
  const [processingPreview, setProcessingPreview] = useState(false);
  const [videoProcessing, setVideoProcessing] = useState<VideoProvider | null>(null);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [providerMessages, setProviderMessages] = useState<Partial<Record<VideoProvider, ProviderUiMessage>>>({});
  const [favoriteResult, setFavoriteResult] = useState<FavoriteResult>(null);
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentStep = getStepIndex(uploadedImage, previewImage, videoResults);
  const selectedStyle = useMemo(() => STYLE_OPTIONS.find((option) => option.value === style) ?? STYLE_OPTIONS[1], [style]);
  const canGeneratePreview = Boolean(uploadedImage) && !processingPreview;
  const canGenerateVideos = Boolean(previewImage) && !videoProcessing;

  function resetGeneratedAssets() {
    setPreviewImage(null);
    setPreviewAssetUrl(null);
    setPreviewJobId(null);
    setVideoResults({});
    setVideoError(null);
    setPreviewError(null);
    setSuccessMessage(null);
    setFavoriteResult(null);
    setFavoriteMessage(null);
    setProviderMessages({});
    setPendingVideoJobs({});
  }

  async function handleFile(file: File) {
    setPreviewError(null);
    setVideoError(null);
    setFavoriteMessage(null);
    setProviderMessages({});

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPreviewError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPreviewError('File size must be less than 10MB.');
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    resetGeneratedAssets();
    setUploadedImage(dataUrl);
    setSuccessMessage('Photo uploaded successfully. Choose a preview style to continue.');
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  }

  async function generatePreview() {
    if (!uploadedImage) return;

    setProcessingPreview(true);
    setPreviewError(null);
    setVideoError(null);
    setSuccessMessage(null);
    setVideoResults({});

    try {
      const res = await fetch('/api/smile-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: uploadedImage, intensity: style }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'We couldn\'t generate the smile preview right now. Please try again.');
      setPreviewImage(data.previewImageUrl);
      setPreviewAssetUrl(data.previewAssetUrl || data.previewImageUrl);
      setPreviewJobId(data.jobId || null);
      setSuccessMessage('Preview ready. You can now create your smile video.');
    } catch (error: any) {
      setPreviewError(error.message || 'We couldn\'t generate the smile preview right now. Please try again.');
    } finally {
      setProcessingPreview(false);
    }
  }

  async function startVideoJob(provider: VideoProvider) {
    if (!previewImage) return;

    const res = await fetch(getVideoEndpoint(provider), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: previewImage, provider }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.error || `Unable to start Veo video.`);
    if (!data.jobId) throw new Error(`Veo did not return a job ID.`);

    setPendingVideoJobs((current) => ({
      ...current,
      [provider]: {
        provider,
        jobId: data.jobId,
        model: data.model || null,
        note: data.note || 'Veo video generation started.',
      },
    }));
    setProviderMessages((current) => ({
      ...current,
      [provider]: {
        type: 'info',
        message: data.note || 'Veo video started. We will keep checking until it finishes.',
      },
    }));
  }

  async function generateSingleVideo(provider: VideoProvider) {
    if (!previewImage) return;

    setVideoProcessing(provider);
    setVideoProvider(provider);
    setVideoError(null);
    setSuccessMessage(null);
    setProviderMessages((current) => ({ ...current, [provider]: undefined }));

    try {
      await startVideoJob(provider);
      setSuccessMessage('Veo video started. You can stay on this page while we wait for the final result.');
    } catch (error: any) {
      const message = error.message || 'This video could not be generated yet. Please try again.';
      setProviderMessages((current) => ({
        ...current,
        [provider]: { type: 'error', message },
      }));
      setVideoError(message);
    } finally {
      setVideoProcessing(null);
    }
  }

  // Polling for video completion
  useEffect(() => {
    if (Object.keys(pendingVideoJobs).length === 0) return;

    const pollInterval = setInterval(async () => {
      const jobs = Object.entries(pendingVideoJobs);
      for (const [provider, job] of jobs) {
        try {
          const res = await fetch(`/api/video/veo/status?jobId=${job.jobId}`);
          const data = await parseJsonResponse(res);

          if (data.status === 'completed' && data.assetUrl) {
            setVideoResults((current) => ({
              ...current,
              [provider]: {
                provider: provider as VideoProvider,
                assetUrl: data.assetUrl,
                jobId: job.jobId,
                model: job.model,
                note: job.note,
              },
            }));
            setPendingVideoJobs((current) => {
              const updated = { ...current };
              delete updated[provider as VideoProvider];
              return updated;
            });
            setProviderMessages((current) => ({
              ...current,
              [provider]: { type: 'success', message: 'Video ready!' },
            }));
          } else if (data.status === 'failed') {
            setPendingVideoJobs((current) => {
              const updated = { ...current };
              delete updated[provider as VideoProvider];
              return updated;
            });
            setProviderMessages((current) => ({
              ...current,
              [provider]: { type: 'error', message: data.error || 'Video generation failed.' },
            }));
          }
        } catch (error: any) {
          console.error(`Error polling ${provider}:`, error);
        }
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [pendingVideoJobs]);

  // Rotating motivational messages
  useEffect(() => {
    if (videoProcessing) {
      const messageInterval = setInterval(() => {
        setWaitingMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
      }, 4000);
      return () => clearInterval(messageInterval);
    }
  }, [videoProcessing]);

  function renderDisabledHelper(message: string) {
    return <p className="mt-3 text-xs text-slate-500">{message}</p>;
  }

  function renderVideoCard(provider: VideoProvider, title: string) {
    const result = videoResults[provider];
    const pending = pendingVideoJobs[provider];
    const message = providerMessages[provider];

    return (
      <div key={provider} className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-xs font-bold text-slate-950 uppercase tracking-wider">{title}</p>
          </div>
          {result && <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-[10px]">Ready</Badge>}
          {pending && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]">Processing</Badge>}
        </div>
        <div className="aspect-square bg-slate-50">
          {result?.assetUrl ? (
            <video controls autoPlay loop muted playsInline preload="metadata" className="h-full w-full object-cover">
              <source src={result.assetUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : pending ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <p className="text-xs font-medium text-slate-700">Creating video...</p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
              <Video className="h-8 w-8 text-slate-300" />
              <p className="text-xs font-medium text-slate-700">Video will appear here</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section id="smile-transform" className="relative bg-white px-4 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Sleek Horizontal Step Indicator */}
        <div className="mb-16">
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-100" />
            <motion.div 
              className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-teal-500 to-cyan-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            <div className="relative flex justify-between">
              {STEP_LABELS.map((label, index) => {
                const stepNumber = index + 1;
                const isComplete = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;
                return (
                  <div key={label} className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isActive || isComplete ? '#0d9488' : '#f8fafc',
                        borderColor: isActive || isComplete ? '#0d9488' : '#e2e8f0',
                      }}
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 sm:h-12 sm:w-12`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                      ) : (
                        <span className={`text-sm font-bold sm:text-base ${isActive ? 'text-white' : 'text-slate-400'}`}>
                          {stepNumber}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="active-glow"
                          className="absolute -inset-2 rounded-full bg-teal-500/20 blur-md"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                    <div className="absolute mt-12 sm:mt-14">
                      <p className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-wider sm:text-xs ${isActive ? 'text-teal-600' : isComplete ? 'text-slate-600' : 'text-slate-400'}`}>
                        {label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-8 lg:grid-cols-12">
          {/* Left Side: Upload & Preview (Compact Side-by-Side) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Step 1: Upload */}
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
                <div className="border-b border-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-950">1. Upload Photo</h3>
                    <Badge className="bg-slate-950 text-white text-[10px]">Step 1</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div
                    className={`group relative aspect-[4/5] rounded-[24px] border-2 border-dashed transition-all ${dragActive ? 'border-teal-400 bg-teal-50' : 'border-slate-100 bg-slate-50/50 hover:border-teal-300 hover:bg-teal-50/30'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {uploadedImage ? (
                      <div className="relative h-full w-full overflow-hidden rounded-[22px]">
                        <img src={uploadedImage} alt="Original" className="h-full w-full object-cover" />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 text-slate-900 shadow-lg backdrop-blur-sm hover:bg-white"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-950">Click to upload</p>
                          <p className="text-xs text-slate-500">or drag and drop</p>
                        </div>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
                  </div>
                </div>
              </motion.div>

              {/* Step 2-3: AI Preview */}
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
                <div className="border-b border-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-950">2. AI Preview</h3>
                    <Badge className="bg-teal-600 text-white text-[10px]">Step 2-3</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative aspect-[4/5] rounded-[24px] bg-slate-50 overflow-hidden border border-slate-100">
                    {previewImage ? (
                      <img src={previewImage} alt="AI Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                        {processingPreview ? (
                          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                        ) : (
                          <Sparkles className="h-10 w-10 text-slate-200" />
                        )}
                        <p className="text-sm font-medium text-slate-700">
                          {processingPreview ? 'Creating preview...' : 'AI preview will appear here'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Style Selection & Generate Button (Compact) */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 grid grid-cols-3 gap-3 w-full">
                  {STYLE_OPTIONS.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input type="radio" name="previewStyle" value={option.value} checked={style === option.value} onChange={() => setStyle(option.value)} className="peer sr-only" />
                      <div className={`rounded-2xl border border-slate-100 p-3 text-center transition-all peer-checked:border-teal-500 peer-checked:bg-teal-50/50 ${option.accent}`}>
                        <p className="text-xs font-bold text-slate-950">{option.label}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <Button 
                  onClick={generatePreview} 
                  disabled={!canGeneratePreview} 
                  className="h-12 px-8 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20 hover:opacity-95 w-full md:w-auto"
                >
                  {processingPreview ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : 'Generate Preview'}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Video & Compare (Compact) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Step 4: Video */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-950">4. Video</h3>
                <Badge className="bg-cyan-600 text-white text-[10px]">Step 4</Badge>
              </div>
              <Button 
                onClick={() => generateSingleVideo('veo')} 
                disabled={!canGenerateVideos} 
                className="mb-4 h-11 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
              >
                {videoProcessing === 'veo' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Veo Video'}
              </Button>
              {renderVideoCard('veo', 'Veo Result')}
            </motion.div>

            {/* Step 5: Compare & Save */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-950">5. Compare</h3>
                <Badge className="bg-purple-600 text-white text-[10px]">Step 5</Badge>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'original', label: 'Original', ready: Boolean(uploadedImage) },
                  { key: 'preview', label: 'AI Preview', ready: Boolean(previewImage) },
                  { key: 'veo', label: 'Veo Video', ready: Boolean(videoResults.veo?.assetUrl) },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFavoriteResult(item.key as FavoriteResult)}
                    className={`w-full rounded-xl border p-3 text-left text-xs font-bold transition-all ${
                      favoriteResult === item.key
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                    } ${!item.ready ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={!item.ready}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {favoriteResult === item.key && <CheckCircle className="h-4 w-4" />}
                    </div>
                  </button>
                ))}
              </div>
              {favoriteResult && (
                <Button className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20">
                  <Save className="mr-2 h-4 w-4" /> Save Selection
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Error/Success Messages (Floating) */}
        <div className="fixed bottom-8 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 space-y-2">
          {successMessage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="rounded-2xl border border-teal-100 bg-white/90 p-4 text-sm text-teal-800 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600" />
                <p className="font-medium">{successMessage}</p>
              </div>
            </motion.div>
          )}
          {(previewError || videoError) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="rounded-2xl border border-red-100 bg-white/90 p-4 text-sm text-red-800 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-medium">{previewError || videoError}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
