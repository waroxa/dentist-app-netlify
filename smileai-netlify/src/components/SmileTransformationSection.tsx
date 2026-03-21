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
  'Choose Preview Style',
  'Generate AI Preview',
  'Create Smile Video',
  'Compare Results',
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
      <div key={provider} className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">Veo-generated result</p>
          </div>
          {result && <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">Ready</Badge>}
          {pending && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Processing</Badge>}
        </div>
        <div className="aspect-square bg-slate-50">
          {result?.assetUrl ? (
            <video controls autoPlay loop muted playsInline preload="metadata" className="h-full w-full object-cover">
              <source src={result.assetUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : pending ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
              <p className="text-sm font-medium text-slate-700">Creating your smile video...</p>
              <p className="max-w-xs text-xs text-slate-500">{motivationalMessages[waitingMessageIndex]}</p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <Video className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">Video will appear here</p>
              <p className="max-w-xs text-xs text-slate-500">Generate your preview first, then create the video.</p>
            </div>
          )}
        </div>
        {result && (
          <div className="space-y-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            <a href={result.assetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-teal-700 hover:text-teal-800">
              <Download className="h-3.5 w-3.5" /> Download video
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <section id="smile-transform" className="relative bg-white px-4 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Step Indicator */}
        <div className="mb-8 grid gap-3 sm:mb-12 sm:grid-cols-5">
          {STEP_LABELS.map((label, stepNumber) => {
            const complete = stepNumber < currentStep;
            const active = stepNumber === currentStep;
            return (
              <div
                key={label}
                className={`rounded-[20px] border px-4 py-4 transition-all ${
                  active
                    ? 'border-sky-300 bg-sky-50 shadow-[0_12px_32px_rgba(56,189,248,0.12)]'
                    : complete
                      ? 'border-teal-200 bg-teal-50'
                      : 'border-slate-100 bg-white'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${active ? 'bg-sky-600 text-white' : complete ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{stepNumber + 1}</span>
                  {complete && <CheckCircle className="h-4 w-4 text-teal-600" />}
                </div>
                <p className="text-sm font-semibold text-slate-900">{stepNumber + 1}. {label}</p>
                <p className="mt-1 text-xs text-slate-500">{stepNumber === currentStep ? 'Current step' : complete ? 'Completed' : 'Up next'}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            {/* Step 1: Upload */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[32px] border border-white/80 bg-white/85 shadow-[0_28px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Badge className="mb-3 bg-slate-950 text-white hover:bg-slate-950">Step 1</Badge>
                    <h3 className="text-2xl font-semibold text-slate-950">Your Original Photo</h3>
                    <p className="mt-2 text-sm text-slate-600">Use a clear front-facing photo with your teeth visible.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div
                  className={`group rounded-[28px] border-2 border-dashed p-5 transition-all ${dragActive ? 'border-sky-400 bg-sky-50' : 'border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f3fbff_100%)] hover:border-sky-300 hover:bg-sky-50/60'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-4 py-10 text-center">
                    <div className="flex h-18 w-18 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#e0f2fe_0%,#ccfbf1_100%)] text-sky-700 shadow-inner">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-slate-950">Drag and drop a photo here</p>
                      <p className="text-sm text-slate-500">or click to upload from your device</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">JPG, PNG, WEBP up to 10MB</span>
                  </button>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fcff_100%)] shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Original</p>
                      <p className="text-xs text-slate-500">Upload preview</p>
                    </div>
                    <Badge variant="secondary">Before</Badge>
                  </div>
                  <div className="aspect-[4/5] bg-slate-50">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Original upload" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                        <ImagePlus className="h-10 w-10 text-slate-300" />
                        <p className="text-sm font-medium text-slate-700">Your uploaded photo will appear here.</p>
                        <p className="max-w-xs text-xs text-slate-500">This intentional empty state keeps the workflow clear before generation begins.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2-3: Preview */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_28px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3 bg-sky-100 text-sky-700 hover:bg-sky-100">Steps 2–3</Badge>
                  <h3 className="text-2xl font-semibold text-slate-950">AI Smile Preview</h3>
                  <p className="mt-2 text-sm text-slate-600">Your transformed smile will appear here.</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-5 rounded-[28px] border border-slate-100 bg-[linear-gradient(180deg,#fbfeff_0%,#f7fbff_100%)] p-5">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"><Wand2 className="h-4 w-4 text-sky-600" /> Preview Style</div>
                    <p className="text-sm text-slate-500">Subtle: Gentle cosmetic refinement<br />Natural: Balanced, realistic enhancement<br />Hollywood: Bright, high-impact smile makeover</p>
                  </div>

                  <div className="grid gap-3">
                    {STYLE_OPTIONS.map((option) => (
                      <label key={option.value} className="cursor-pointer">
                        <input type="radio" name="previewStyle" value={option.value} checked={style === option.value} onChange={() => setStyle(option.value)} className="peer sr-only" />
                        <div className={`rounded-[22px] border border-slate-200 bg-gradient-to-r p-4 transition-all peer-checked:border-sky-400 peer-checked:shadow-[0_12px_32px_rgba(56,189,248,0.16)] ${option.accent}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-base font-semibold text-slate-950">{option.label}</p>
                              <p className="mt-1 text-xs text-slate-600">{option.helper}</p>
                            </div>
                            {style === option.value && <CheckCircle className="mt-0.5 h-5 w-5 text-sky-600" />}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div>
                    <Button onClick={generatePreview} disabled={!canGeneratePreview} className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#0284c7_0%,#0ea5a5_100%)] text-white shadow-lg shadow-sky-500/20 hover:opacity-95">
                      {processingPreview ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Preview...</> : 'Generate Smile Preview'}
                    </Button>
                    {!uploadedImage && renderDisabledHelper('Upload a photo to enable Generate Smile Preview.')}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">AI Smile Preview</p>
                      <p className="text-xs text-slate-500">Gemini-generated result</p>
                    </div>
                    <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100">Gemini Preview</Badge>
                  </div>
                  <div className="aspect-[4/5] bg-[linear-gradient(180deg,#fbfdff_0%,#f2faff_100%)]">
                    {previewImage ? (
                      <img src={previewImage} alt="AI smile preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                        {processingPreview ? <Loader2 className="h-10 w-10 animate-spin text-sky-600" /> : <Sparkles className="h-10 w-10 text-sky-300" />}
                        <p className="text-sm font-medium text-slate-700">{processingPreview ? 'Creating your AI smile preview...' : 'Choose a style and generate your preview to continue.'}</p>
                        <p className="max-w-xs text-xs text-slate-500">{processingPreview ? 'Your AI smile preview is being prepared.' : 'The preview area stays active so the next step is always obvious.'}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
                    <p>{previewImage ? 'Preview ready. You can now create your smile video.' : 'Your transformed smile will appear here.'}</p>
                    {previewAssetUrl && <a href={previewAssetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-sky-700 hover:text-sky-800"><Download className="h-3.5 w-3.5" /> Open stored preview asset</a>}
                    {previewJobId && <p>Preview job ID: {previewJobId}</p>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 4: Video */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.95)_0%,rgba(240,249,255,0.95)_55%,rgba(236,254,255,0.95)_100%)] p-6 shadow-[0_28px_100px_rgba(14,116,144,0.1)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3 bg-teal-100 text-teal-700 hover:bg-teal-100">Step 4</Badge>
                  <h3 className="text-2xl font-semibold text-slate-950">Create Smile Video</h3>
                  <p className="mt-2 text-sm text-slate-600">Generate a premium video from your AI preview.</p>
                </div>
              </div>

              <div className="mb-5">
                <Button onClick={() => generateSingleVideo('veo')} disabled={!canGenerateVideos} className="h-12 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20 hover:opacity-95">
                  {videoProcessing === 'veo' ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Veo Video...</> : 'Generate Veo Video'}
                </Button>
                {!previewImage && renderDisabledHelper('Generate your preview first to enable video creation.')}
              </div>

              {renderVideoCard('veo', 'Veo Video Result')}
            </motion.div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {/* Messages */}
            {successMessage && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                  <p>{successMessage}</p>
                </div>
              </motion.div>
            )}
            {previewError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <p>{previewError}</p>
                </div>
              </motion.div>
            )}
            {videoError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <p>{videoError}</p>
                </div>
              </motion.div>
            )}

            {/* Step 5: Compare */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_28px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
              <Badge className="mb-3 bg-purple-100 text-purple-700 hover:bg-purple-100">Step 5</Badge>
              <h3 className="text-2xl font-semibold text-slate-950">Compare Results</h3>
              <p className="mt-2 text-sm text-slate-600">Review your results and save your favorite.</p>

              <div className="mt-6 space-y-3">
                {[
                  { key: 'original', label: 'Original Photo', ready: Boolean(uploadedImage), type: 'image', src: uploadedImage },
                  { key: 'preview', label: 'Gemini Preview', ready: Boolean(previewImage), type: 'image', src: previewImage },
                  { key: 'veo', label: 'Veo Video', ready: Boolean(videoResults.veo?.assetUrl), type: 'video', src: videoResults.veo?.assetUrl ?? null },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFavoriteResult(item.key as FavoriteResult)}
                    className={`w-full rounded-[18px] border-2 p-4 text-left transition-all ${
                      favoriteResult === item.key
                        ? 'border-teal-400 bg-teal-50 shadow-[0_12px_32px_rgba(20,184,166,0.12)]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    } ${!item.ready ? 'opacity-50' : ''}`}
                    disabled={!item.ready}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      {favoriteResult === item.key && <CheckCircle className="h-5 w-5 text-teal-600" />}
                    </div>
                  </button>
                ))}
              </div>

              {favoriteResult && (
                <Button className="mt-6 h-11 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:opacity-95">
                  <Save className="mr-2 h-4 w-4" /> Save {favoriteResult === 'original' ? 'Original' : favoriteResult === 'preview' ? 'Preview' : 'Video'}
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
