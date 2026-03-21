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
type VideoProvider = 'fal' | 'veo';
type FavoriteResult = 'original' | 'preview' | 'fal' | 'veo' | null;

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
  return provider === 'fal' ? '/api/video/fal' : '/api/video/veo';
}

const STEP_LABELS = [
  'Upload Photo',
  'Choose Preview Style',
  'Generate AI Preview',
  'Create Smile Videos',
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

const PROVIDERS: Array<{ value: VideoProvider; label: string; button: string }> = [
  { value: 'fal', label: 'FAL', button: 'Generate FAL Video' },
  { value: 'veo', label: 'Veo', button: 'Generate Veo Video' },
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
  const [videoProvider, setVideoProvider] = useState<VideoProvider>('fal');
  const [videoResults, setVideoResults] = useState<Partial<Record<VideoProvider, VideoResult>>>({});
  const [pendingVideoJobs, setPendingVideoJobs] = useState<Partial<Record<VideoProvider, PendingVideoJob>>>({});
  const [processingPreview, setProcessingPreview] = useState(false);
  const [videoProcessing, setVideoProcessing] = useState<VideoProvider | 'both' | null>(null);
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
      if (!res.ok) throw new Error(data.error || 'We couldn’t generate the smile preview right now. Please try again.');
      setPreviewImage(data.previewImageUrl);
      setPreviewAssetUrl(data.previewAssetUrl || data.previewImageUrl);
      setPreviewJobId(data.jobId || null);
      setSuccessMessage('Preview ready. You can now create one or more smile videos.');
    } catch (error: any) {
      setPreviewError(error.message || 'We couldn’t generate the smile preview right now. Please try again.');
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
    if (!res.ok) throw new Error(data.error || `Unable to start ${provider.toUpperCase()} video.`);
    if (!data.jobId) throw new Error(`${provider.toUpperCase()} did not return a job ID.`);

    setPendingVideoJobs((current) => ({
      ...current,
      [provider]: {
        provider,
        jobId: data.jobId,
        model: data.model || null,
        note: data.note || `${provider.toUpperCase()} video generation started.`,
      },
    }));
    setProviderMessages((current) => ({
      ...current,
      [provider]: {
        type: 'info',
        message: data.note || `${provider.toUpperCase()} video started. We will keep checking until it finishes.`,
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
      setSuccessMessage(`${provider === 'fal' ? 'FAL' : 'Veo'} video started. You can stay on this page while we wait for the final result.`);
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

  async function generateBothVideos() {
    if (!previewImage) return;

    setVideoProcessing('both');
    setVideoError(null);
    setSuccessMessage(null);
    setProviderMessages({});

    try {
      const providers: VideoProvider[] = ['fal', 'veo'];
      const results = await Promise.allSettled(providers.map((provider) => startVideoJob(provider)));
      const failures: string[] = [];

      results.forEach((result, index) => {
        const provider = providers[index];
        if (result.status === 'rejected') {
          const message = result.reason?.message || `Unable to start ${provider.toUpperCase()} video.`;
          setProviderMessages((current) => ({
            ...current,
            [provider]: { type: 'error', message },
          }));
          failures.push(`${provider === 'fal' ? 'FAL' : 'Veo'}: ${message}`);
        }
      });

      if (failures.length === 0) {
        setSuccessMessage('Both videos started. Keep this page open while we wait for the final renders.');
      } else if (failures.length === 1) {
        setSuccessMessage('One provider started successfully. Review the provider-specific status below.');
        setVideoError(failures.join(' '));
      } else {
        setVideoError(failures.join(' '));
      }
    } finally {
      setVideoProcessing(null);
    }
  }

  useEffect(() => {
    const activeJobs = Object.values(pendingVideoJobs).filter(Boolean) as PendingVideoJob[];
    if (!activeJobs.length) return undefined;

    const interval = window.setInterval(() => {
      setWaitingMessageIndex((index) => (index + 1) % motivationalMessages.length);
    }, 3000);

    let cancelled = false;

    const poll = async () => {
      const results = await Promise.allSettled(activeJobs.map(async (job) => {
        const res = await fetch(`/api/video-status?jobId=${encodeURIComponent(job.jobId)}`);
        const data = await parseJsonResponse(res);
        if (!res.ok) throw new Error(data.error || `Unable to check ${job.provider.toUpperCase()} status.`);
        return { job, data };
      }));

      if (cancelled) return;

      results.forEach((result) => {
        if (result.status === 'rejected') {
          const message = result.reason?.message || 'Unable to check video status.';
          setVideoError(message);
          return;
        }

        const { job, data } = result.value;
        const providerLabel = job.provider === 'fal' ? 'FAL' : 'Veo';

        if (data.status === 'completed' && data.assetUrl) {
          setPendingVideoJobs((current) => {
            const next = { ...current };
            delete next[job.provider];
            return next;
          });
          setVideoResults((current) => ({
            ...current,
            [job.provider]: {
              provider: job.provider,
              assetUrl: data.assetUrl,
              jobId: data.jobId || job.jobId,
              model: data.model || job.model || null,
              note: data.note || `${providerLabel} video ready.`,
            },
          }));
          setProviderMessages((current) => ({
            ...current,
            [job.provider]: { type: 'success', message: `${providerLabel} video ready.` },
          }));
          setSuccessMessage(`${providerLabel} video ready. Continue comparing results or start the other provider.`);
          return;
        }

        if (data.status === 'failed') {
          setPendingVideoJobs((current) => {
            const next = { ...current };
            delete next[job.provider];
            return next;
          });
          const message = data.error || `${providerLabel} video failed.`;
          setProviderMessages((current) => ({
            ...current,
            [job.provider]: { type: 'error', message },
          }));
          setVideoError(message);
          return;
        }

        setProviderMessages((current) => ({
          ...current,
          [job.provider]: {
            type: 'info',
            message: data.queueNote || data.note || `${providerLabel} is still processing.`,
          },
        }));
      });
    };

    void poll();
    const pollInterval = window.setInterval(() => {
      void poll();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearInterval(pollInterval);
    };
  }, [pendingVideoJobs]);

  function saveFavorite() {
    if (!favoriteResult) {
      setFavoriteMessage('Select a result card first, then save your favorite.');
      return;
    }
    setFavoriteMessage('Favorite saved for your consultation review.');
  }

  function renderDisabledHelper(message: string) {
    return <p className="mt-2 text-xs text-slate-500">{message}</p>;
  }

  function renderVideoCard(provider: VideoProvider, title: string) {
    const result = videoResults[provider];
    const pendingJob = pendingVideoJobs[provider];
    const isLoading = videoProcessing === provider || videoProcessing === 'both' || Boolean(pendingJob);

    return (
      <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(14,116,144,0.12)] backdrop-blur-xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-slate-950">{title}</h4>
              <p className="text-sm text-slate-500">Generated from your AI smile preview</p>
            </div>
            <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">{provider === 'fal' ? 'FAL' : 'Veo'}</Badge>
          </div>
        </div>

        <div className="aspect-video bg-[linear-gradient(180deg,#f8fdff_0%,#eef8ff_100%)]">
          {result?.assetUrl ? (
            <video controls playsInline className="h-full w-full object-cover">
              <source src={result.assetUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              {isLoading ? <Loader2 className="h-10 w-10 animate-spin text-sky-600" /> : <Video className="h-10 w-10 text-sky-300" />}
              <p className="text-sm font-medium text-slate-700">{isLoading ? 'Waiting for the final rendered video...' : 'Generate a video to compare movement, realism, and polish.'}</p>
              <p className="max-w-xs text-xs text-slate-500">{pendingJob?.note || result?.note || 'This result card stays visible so the next action is always obvious.'}</p>
            </div>
          )}
        </div>

        <div className="space-y-3 px-6 py-5">
          <Button
            onClick={() => generateSingleVideo(provider)}
            disabled={!previewImage || Boolean(videoProcessing) || Boolean(pendingJob)}
            className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
          >
            {videoProcessing === provider
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{provider === 'fal' ? 'Generating FAL Video...' : 'Generating Veo Video...'}</>
              : provider === 'fal' ? 'Generate FAL Video' : 'Generate Veo Video'}
          </Button>
          {!previewImage && renderDisabledHelper('Generate your AI smile preview first to unlock video creation.')}
          {providerMessages[provider] && (
            <div className={`rounded-2xl border px-3 py-2 text-xs ${providerMessages[provider]?.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : providerMessages[provider]?.type === 'info' ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {providerMessages[provider]?.message}
            </div>
          )}
          {(pendingJob?.jobId || result?.jobId) && <p className="text-xs text-slate-500">Job ID: {pendingJob?.jobId || result?.jobId}</p>}
          {result?.assetUrl && (
            <a href={result.assetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-sky-700 hover:text-sky-800">
              <Download className="h-3.5 w-3.5" /> Open video asset
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <section id="smile-transform" className="relative overflow-hidden bg-[linear-gradient(180deg,#f9fdff_0%,#f4fbff_28%,#ffffff_52%,#f2fbfb_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(191,219,254,0.18),_transparent_26%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-sky-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" /> Premium dental AI workflow
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Smile Preview Studio</h2>
          <p className="mt-4 text-lg text-slate-600">
            Upload a photo, generate your AI smile preview, then compare video results from multiple providers.
          </p>
        </div>

        <div className="mb-8 grid gap-3 rounded-[30px] border border-white/80 bg-white/70 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl md:grid-cols-5">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === currentStep;
            const complete = stepNumber < currentStep;
            return (
              <div
                key={label}
                className={`rounded-[22px] border px-4 py-4 transition-all ${active ? 'border-sky-300 bg-[linear-gradient(135deg,rgba(240,249,255,1),rgba(236,254,255,1))] shadow-sm' : complete ? 'border-teal-200 bg-teal-50/70' : 'border-slate-100 bg-white/80'}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${active ? 'bg-sky-600 text-white' : complete ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{stepNumber}</span>
                  {complete && <CheckCircle className="h-4 w-4 text-teal-600" />}
                </div>
                <p className="text-sm font-semibold text-slate-900">{stepNumber}. {label}</p>
                <p className="mt-1 text-xs text-slate-500">{stepNumber === currentStep ? 'Current step' : complete ? 'Completed' : 'Up next'}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[32px] border border-white/80 bg-white/85 shadow-[0_28px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Badge className="mb-3 bg-slate-950 text-white hover:bg-slate-950">Step 1</Badge>
                    <h3 className="text-2xl font-semibold text-slate-950">Your Original Photo</h3>
                    <p className="mt-2 text-sm text-slate-600">Use a clear front-facing photo with your teeth visible.</p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-700">
                    <p className="font-semibold">Workflow status</p>
                    <p className="text-xs">As soon as you upload, the preview generation controls appear below.</p>
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

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_28px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3 bg-sky-100 text-sky-700 hover:bg-sky-100">Steps 2–3</Badge>
                  <h3 className="text-2xl font-semibold text-slate-950">AI Smile Preview</h3>
                  <p className="mt-2 text-sm text-slate-600">Your transformed smile will appear here.</p>
                </div>
                <div className="max-w-sm rounded-2xl border border-cyan-100 bg-[linear-gradient(135deg,rgba(240,249,255,0.95),rgba(236,254,255,0.95))] px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Next action</p>
                  <p>{uploadedImage ? 'Choose your preview style, then click Generate Smile Preview.' : 'Upload a photo first to reveal the preview generation path.'}</p>
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
                    <p>{previewImage ? 'Preview ready. You can now create one or more smile videos.' : 'Your transformed smile will appear here.'}</p>
                    {previewAssetUrl && <a href={previewAssetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-sky-700 hover:text-sky-800"><Download className="h-3.5 w-3.5" /> Open stored preview asset</a>}
                    {previewJobId && <p>Preview job ID: {previewJobId}</p>}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.95)_0%,rgba(240,249,255,0.95)_55%,rgba(236,254,255,0.95)_100%)] p-6 shadow-[0_28px_100px_rgba(14,116,144,0.1)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3 bg-teal-100 text-teal-700 hover:bg-teal-100">Step 4</Badge>
                  <h3 className="text-2xl font-semibold text-slate-950">Create Smile Videos</h3>
                  <p className="mt-2 text-sm text-slate-600">Generate videos from your AI preview and compare the results side by side.</p>
                </div>
                <div className="max-w-sm rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
                  <p className="font-semibold text-slate-900">Choose Video Provider</p>
                  <p>Start FAL or Veo, wait while it renders, then review the finished video here.</p>
                </div>
              </div>

              <div className="mb-5 grid gap-3 md:grid-cols-2">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.value}
                    type="button"
                    onClick={() => setVideoProvider(provider.value)}
                    className={`rounded-[22px] border px-4 py-4 text-left transition ${videoProvider === provider.value ? 'border-sky-300 bg-white shadow-[0_14px_30px_rgba(14,116,144,0.14)]' : 'border-white/80 bg-white/70 hover:border-sky-200'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-950">{provider.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{provider.value === 'fal' ? 'Fast production-ready image-to-video generation.' : 'Google Veo render for side-by-side provider comparison.'}</p>
                      </div>
                      {videoProvider === provider.value && <CheckCircle className="h-5 w-5 text-sky-600" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-6 flex flex-col gap-3 lg:flex-row">
                <Button onClick={() => generateSingleVideo('fal')} disabled={!canGenerateVideos} className="h-12 flex-1 rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                  {videoProcessing === 'fal' ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating FAL Video...</> : 'Generate FAL Video'}
                </Button>
                <Button onClick={() => generateSingleVideo('veo')} disabled={!canGenerateVideos} className="h-12 flex-1 rounded-2xl bg-white text-slate-950 border border-slate-200 hover:bg-slate-50">
                  {videoProcessing === 'veo' ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Veo Video...</> : 'Generate Veo Video'}
                </Button>
                <Button onClick={generateBothVideos} disabled={!canGenerateVideos} className="h-12 flex-1 rounded-2xl bg-[linear-gradient(135deg,#0284c7_0%,#0ea5a5_100%)] text-white hover:opacity-95">
                  {videoProcessing === 'both' ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Videos...</> : 'Generate Both Videos'}
                </Button>
              </div>
              {!previewImage && renderDisabledHelper('Generate your AI smile preview first to unlock video creation.')}
              {Object.keys(pendingVideoJobs).length > 0 && (
                <div className="mb-6 rounded-[28px] border border-sky-100 bg-[linear-gradient(135deg,rgba(240,249,255,0.92),rgba(236,254,255,0.92))] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Video generation in progress</p>
                      <p className="text-sm text-slate-600">{motivationalMessages[waitingMessageIndex]}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-5 lg:grid-cols-2">
                {renderVideoCard('fal', 'FAL Video Result')}
                {renderVideoCard('veo', 'Veo Video Result')}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_28px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#0284c7_100%)] text-white shadow-lg shadow-sky-500/20">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div>
                  <Badge className="mb-2 bg-slate-100 text-slate-700 hover:bg-slate-100">Step 5</Badge>
                  <h3 className="text-2xl font-semibold text-slate-950">Compare Your Results</h3>
                  <p className="mt-1 text-sm text-slate-600">Review your original image, AI preview, and video results to decide which look you like best.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: 'original', label: 'Original', ready: Boolean(uploadedImage), type: 'image', src: uploadedImage },
                  { key: 'preview', label: 'Gemini Preview', ready: Boolean(previewImage), type: 'image', src: previewImage },
                  { key: 'fal', label: 'FAL Video', ready: Boolean(videoResults.fal?.assetUrl), type: 'video', src: videoResults.fal?.assetUrl ?? null },
                  { key: 'veo', label: 'Veo Video', ready: Boolean(videoResults.veo?.assetUrl), type: 'video', src: videoResults.veo?.assetUrl ?? null },
                ].map((item) => {
                  const selected = favoriteResult === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => item.ready && setFavoriteResult(item.key as FavoriteResult)}
                      className={`overflow-hidden rounded-[24px] border text-left transition ${selected ? 'border-sky-300 bg-sky-50/70 shadow-[0_12px_30px_rgba(14,116,144,0.15)]' : 'border-slate-100 bg-slate-50/70'} ${item.ready ? 'hover:border-sky-200' : 'opacity-100'}`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                        <Badge variant="secondary">{item.ready ? 'Ready' : 'Waiting'}</Badge>
                      </div>
                      <div className="aspect-[4/3] bg-white">
                        {item.src ? (
                          item.type === 'image' ? (
                            <img src={item.src} alt={item.label} className="h-full w-full object-cover" />
                          ) : (
                            <video controls playsInline className="h-full w-full object-cover">
                              <source src={item.src} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
                            <Video className="h-8 w-8 text-slate-300" />
                            <p className="text-sm font-medium text-slate-700">Result pending</p>
                            <p className="text-xs text-slate-500">A clear action remains nearby so this area never feels blank or dead.</p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[28px] border border-sky-100 bg-[linear-gradient(135deg,rgba(240,249,255,0.95),rgba(236,254,255,0.95))] p-5">
                <p className="text-base font-semibold text-slate-950">Which result feels most like your ideal smile?</p>
                <p className="mt-1 text-sm text-slate-600">Save your favorite and bring it to your consultation.</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={saveFavorite} className="h-11 flex-1 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"><Save className="mr-2 h-4 w-4" />Save Favorite Result</Button>
                  <Button className="h-11 flex-1 rounded-2xl bg-white text-sky-700 border border-sky-200 hover:bg-sky-50">Use This for My Consultation <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
                {favoriteResult === null && renderDisabledHelper('Select Original, Gemini Preview, FAL Video, or Veo Video to choose your favorite.')}
                {favoriteMessage && <p className="mt-3 text-sm font-medium text-teal-700">{favoriteMessage}</p>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.92)_0%,rgba(239,246,255,0.92)_48%,rgba(240,253,250,0.92)_100%)] p-6 shadow-[0_28px_90px_rgba(8,47,73,0.08)] backdrop-blur-xl sm:p-8">
              <h3 className="text-xl font-semibold text-slate-950">Premium guided flow</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-white/80 bg-white/70 p-4">
                  <p className="font-semibold text-slate-900">Always show the next action clearly.</p>
                  <p className="mt-1">The primary preview button appears immediately after upload, and the video actions stay visible as soon as the preview is ready.</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/70 p-4">
                  <p className="font-semibold text-slate-900">Intentional empty states.</p>
                  <p className="mt-1">Every result panel explains what will appear there and what to do next, so the user never wonders what to click.</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/70 p-4">
                  <p className="font-semibold text-slate-900">Secure backend-mediated generation.</p>
                  <p className="mt-1">Gemini preview generation and FAL/Veo video requests still run through protected API routes.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {(successMessage || previewError || videoError) && (
          <div className="mt-6 space-y-3">
            {successMessage && <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />{successMessage}</div>}
            {previewError && <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />{previewError === 'Unable to generate preview.' ? 'We couldn’t generate the smile preview right now. Please try again.' : previewError}</div>}
            {videoError && <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />{videoError}</div>}
          </div>
        )}
      </div>
    </section>
  );
}
