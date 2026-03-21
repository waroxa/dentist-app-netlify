import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Loader2,
  Mail,
  Phone,
  Save,
  Sparkles,
  Upload,
  User,
  Video,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

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

interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  interestedIn: string;
  notes: string;
}

interface LeadFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  interestedIn?: string;
}

const motivationalMessages = [
  '✨ Imagine waking up every day loving your smile...',
  '💫 A confident smile can transform your entire life',
  '🌟 Your dream smile is closer than you think',
  '💎 Invest in yourself - you deserve to feel amazing',
  '🎯 Confidence starts with a smile you are proud of',
  '🚀 Picture yourself smiling without hesitation',
] as const;

const INTEREST_OPTIONS = ['Veneers', 'Invisalign', 'Whitening', 'Smile Makeover', 'Other'] as const;

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

const STEP_LABELS = ['Lead Form', 'Upload Photo', 'Choose Style', 'AI Preview', 'Create Video', 'Compare'] as const;

// Clean Blue/White color scheme like professional dental websites
const BRAND_BLUE = '#2563eb';

const STYLE_OPTIONS: Array<{ value: SmileStyle; label: string; helper: string; accent: string }> = [
  {
    value: 'subtle',
    label: 'Subtle',
    helper: 'Gentle cosmetic refinement',
    accent: 'from-sky-50 via-white to-blue-50',
  },
  {
    value: 'natural',
    label: 'Natural',
    helper: 'Natural: Balanced, realistic enhancement',
    accent: 'from-blue-50 via-white to-sky-50',
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

function getStepIndex(isLeadCaptured: boolean, uploadedImage: string | null, previewImage: string | null, videoResults: Partial<Record<VideoProvider, VideoResult>>) {
  if (!isLeadCaptured) return 1;
  if (Object.keys(videoResults).length > 0) return 6;
  if (previewImage) return 5;
  if (uploadedImage) return 3;
  return 2;
}

export function SmileTransformationSection() {
  const [leadForm, setLeadForm] = useState<LeadFormData>({
    fullName: '',
    email: '',
    phone: '',
    interestedIn: '',
    notes: '',
  });
  const [leadErrors, setLeadErrors] = useState<LeadFormErrors>({});
  const [isLeadCaptured, setIsLeadCaptured] = useState(false);
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

  const currentStep = getStepIndex(isLeadCaptured, uploadedImage, previewImage, videoResults);
  const selectedStyle = useMemo(() => STYLE_OPTIONS.find((option) => option.value === style) ?? STYLE_OPTIONS[1], [style]);
  const canGeneratePreview = isLeadCaptured && Boolean(uploadedImage) && !processingPreview;
  const canGenerateVideos = isLeadCaptured && Boolean(previewImage) && !videoProcessing;

  function formatPhoneNumber(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone: string) {
    return phone.replace(/\D/g, '').length === 10;
  }

  function validateLeadForm() {
    const nextErrors: LeadFormErrors = {};

    if (!leadForm.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!leadForm.email.trim()) nextErrors.email = 'Email is required';
    else if (!validateEmail(leadForm.email)) nextErrors.email = 'Please enter a valid email';
    if (!leadForm.phone.trim()) nextErrors.phone = 'Phone number is required';
    else if (!validatePhone(leadForm.phone)) nextErrors.phone = 'Please enter a valid 10-digit phone number';
    if (!leadForm.interestedIn) nextErrors.interestedIn = 'Please select a service';

    setLeadErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateLeadForm()) return;
    setIsLeadCaptured(true);
    setSuccessMessage('Thanks! Your preview form is saved — now upload a photo to continue.');
    requestAnimationFrame(() => {
      document.getElementById('smile-upload-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

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
    if (!res.ok) throw new Error(data.error || `Unable to start AI Video.`);
    if (!data.jobId) throw new Error(`Veo did not return a job ID.`);

    setPendingVideoJobs((current) => ({
      ...current,
      [provider]: {
        provider,
        jobId: data.jobId,
        model: data.model || null,
        note: data.note || 'AI video generation started.',
      },
    }));
    setProviderMessages((current) => ({
      ...current,
      [provider]: {
        type: 'info',
        message: data.note || 'AI video started. We will keep checking until it finishes.',
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
      setSuccessMessage('AI video started. You can stay on this page while we wait for the final result.');
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

  useEffect(() => {
    if (videoProcessing) {
      const messageInterval = setInterval(() => {
        setWaitingMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
      }, 4000);
      return () => clearInterval(messageInterval);
    }
  }, [videoProcessing]);

  function renderInfoBanner() {
    if (videoProcessing) {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-blue-700">Working on your video:</span> {motivationalMessages[waitingMessageIndex]}
        </div>
      );
    }

    if (!isLeadCaptured) {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-blue-700">Step 1 first:</span> enter patient info to unlock photo upload and preview tools.
        </div>
      );
    }

    return null;
  }

  function renderVideoCard(provider: VideoProvider, title: string) {
    const result = videoResults[provider];
    const pending = pendingVideoJobs[provider];
    const message = providerMessages[provider];

    return (
      <div key={provider} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">{title}</p>
          </div>
          {result && <Badge className="bg-green-100 text-[10px] text-green-700">Ready</Badge>}
          {pending && <Badge className="bg-amber-100 text-[10px] text-amber-700">Processing</Badge>}
        </div>
        <div className="aspect-[4/3] bg-slate-50">
          {result?.assetUrl ? (
            <video controls autoPlay loop muted playsInline preload="metadata" className="h-full w-full object-contain bg-slate-950">
              <source src={result.assetUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : pending ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium text-slate-700">Creating video...</p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
              <Video className="h-8 w-8 text-slate-300" />
              <p className="text-xs font-medium text-slate-700">Video will appear here</p>
            </div>
          )}
        </div>
        {message && (
          <div className={`border-t px-4 py-3 text-xs ${message.type === 'error' ? 'border-red-100 bg-red-50 text-red-700' : message.type === 'success' ? 'border-green-100 bg-green-50 text-green-700' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>
            {message.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <section id="smile-transform" className="relative bg-slate-50 px-4 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 sm:mb-10">
          <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
            <div className="relative">
              <div className="absolute left-0 right-0 top-5 hidden h-0.5 bg-slate-200 sm:block" />
              <motion.div
                className="absolute left-0 top-5 hidden h-0.5 sm:block"
                style={{ backgroundColor: BRAND_BLUE }}
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
                {STEP_LABELS.map((label, index) => {
                  const stepNumber = index + 1;
                  const isComplete = stepNumber < currentStep;
                  const isActive = stepNumber === currentStep;
                  const isHighlighted = isActive || isComplete;
                  return (
                    <div key={label} className="relative flex flex-col items-center text-center">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isActive ? 1.05 : 1,
                          backgroundColor: isHighlighted ? BRAND_BLUE : '#ffffff',
                          borderColor: isHighlighted ? BRAND_BLUE : '#e2e8f0',
                        }}
                        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm transition-colors duration-300 sm:h-11 sm:w-11"
                      >
                        {isComplete ? (
                          <CheckCircle className="h-5 w-5 text-white sm:h-5 sm:w-5" />
                        ) : (
                          <span className={`text-sm font-semibold ${isHighlighted ? 'text-white' : 'text-slate-700'}`}>
                            {stepNumber}
                          </span>
                        )}
                      </motion.div>
                      <p className={`mt-2.5 text-[10px] font-semibold uppercase tracking-wider sm:text-xs ${isHighlighted ? 'text-slate-900' : 'text-slate-500'}`}>
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-8">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="px-6 py-5" style={{ backgroundColor: BRAND_BLUE }}>
                <h3 className="text-xl font-semibold text-white">Step 1: Enter Your Information</h3>
                <p className="mt-1 text-sm text-white/80">We&apos;ll create your personalized smile preview in the next step</p>
              </div>
              <form onSubmit={handleLeadSubmit} className="space-y-5 px-6 py-6 sm:px-8">
                <div>
                  <Label htmlFor="lead-fullName" className="mb-2 flex items-center gap-2 text-base font-medium text-slate-900">
                    <User className="h-4 w-4 text-slate-500" />
                    Full Name *
                  </Label>
                  <Input
                    id="lead-fullName"
                    value={leadForm.fullName}
                    onChange={(e) => {
                      setLeadForm((current) => ({ ...current, fullName: e.target.value }));
                      if (leadErrors.fullName) setLeadErrors((current) => ({ ...current, fullName: undefined }));
                    }}
                    placeholder="John Smith"
                    className={`h-12 text-base ${leadErrors.fullName ? 'border-red-500' : ''}`}
                  />
                  {leadErrors.fullName && <p className="mt-1.5 text-sm text-red-600">{leadErrors.fullName}</p>}
                </div>

                <div>
                  <Label htmlFor="lead-email" className="mb-2 flex items-center gap-2 text-base font-medium text-slate-900">
                    <Mail className="h-4 w-4 text-slate-500" />
                    Email *
                  </Label>
                  <Input
                    id="lead-email"
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => {
                      setLeadForm((current) => ({ ...current, email: e.target.value }));
                      if (leadErrors.email) setLeadErrors((current) => ({ ...current, email: undefined }));
                    }}
                    placeholder="john@example.com"
                    className={`h-12 text-base ${leadErrors.email ? 'border-red-500' : ''}`}
                  />
                  {leadErrors.email && <p className="mt-1.5 text-sm text-red-600">{leadErrors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="lead-phone" className="mb-2 flex items-center gap-2 text-base font-medium text-slate-900">
                    <Phone className="h-4 w-4 text-slate-500" />
                    Phone Number *
                  </Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => {
                      setLeadForm((current) => ({ ...current, phone: formatPhoneNumber(e.target.value) }));
                      if (leadErrors.phone) setLeadErrors((current) => ({ ...current, phone: undefined }));
                    }}
                    placeholder="(555) 123-4567"
                    className={`h-12 text-base ${leadErrors.phone ? 'border-red-500' : ''}`}
                  />
                  {leadErrors.phone && <p className="mt-1.5 text-sm text-red-600">{leadErrors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="lead-interest" className="mb-2 block text-base font-medium text-slate-900">Interested In *</Label>
                  <div className="relative">
                    <select
                      id="lead-interest"
                      value={leadForm.interestedIn}
                      onChange={(e) => {
                        setLeadForm((current) => ({ ...current, interestedIn: e.target.value }));
                        if (leadErrors.interestedIn) setLeadErrors((current) => ({ ...current, interestedIn: undefined }));
                      }}
                      className={`h-12 w-full appearance-none rounded-md border bg-background px-3 py-2 pr-10 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${leadErrors.interestedIn ? 'border-red-500' : 'border-input'}`}
                    >
                      <option value="">Select a service...</option>
                      {INTEREST_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                  {leadErrors.interestedIn && <p className="mt-1.5 text-sm text-red-600">{leadErrors.interestedIn}</p>}
                </div>

                <div>
                  <Label htmlFor="lead-notes" className="mb-2 block text-base font-medium text-slate-900">Optional Notes</Label>
                  <Textarea
                    id="lead-notes"
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm((current) => ({ ...current, notes: e.target.value }))}
                    placeholder="Tell us about your smile goals or any specific concerns..."
                    className="min-h-[120px] text-base"
                  />
                </div>

                <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold text-white shadow-lg hover:opacity-90" style={{ backgroundColor: BRAND_BLUE }}>
                  {isLeadCaptured ? 'Update & Continue' : 'Get Started Free'}
                </Button>

                <div className="space-y-4 pt-1 text-center text-sm text-slate-500">
                  <p>By continuing, you agree to be contacted about your smile transformation. Your information is secure and will never be shared.</p>
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-blue-600">
                    <span>✓ Secure &amp; Confidential</span>
                    <span>✓ Get Results in 24 Hours</span>
                  </div>
                </div>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900">Why Get Your Free Preview?</h3>
              <div className="mt-6 space-y-4">
                {[
                  ['See Your Potential', 'Visualize your smile transformation before committing to treatment'],
                  ['100% Free & No Obligation', 'Get your AI smile preview instantly - no payment required'],
                  ['Personalized Consultation', 'Our team will review your preview and provide expert recommendations'],
                  ['Fast Results', 'Get your AI-generated smile transformation in under 30 seconds'],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-slate-900">{title}</p>
                        <p className="mt-0.5 text-sm text-slate-600">{body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-green-50 px-5 py-4 text-center border border-green-100">
                <p className="text-lg font-semibold text-slate-900">Over 10,000+ smiles transformed!</p>
                <p className="mt-0.5 text-sm text-slate-600">Join thousands who&apos;ve discovered their dream smile.</p>
              </div>
            </motion.div>
          </div>

          {renderInfoBanner()}

          <div className={`transition-all duration-300 ${isLeadCaptured ? 'opacity-100' : 'pointer-events-none opacity-40'}`}>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <motion.div id="smile-upload-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 px-6 py-4" style={{ backgroundColor: BRAND_BLUE }}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">2. Upload Photo</h3>
                        <Badge className="bg-white/20 text-[10px] text-white">Step 2</Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div
                        className={`group relative aspect-[4/5] rounded-xl border-2 border-dashed transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/50'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        {uploadedImage ? (
                          <div className="relative h-full w-full overflow-hidden rounded-lg">
                            <img src={uploadedImage} alt="Original" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 text-slate-900 shadow-lg backdrop-blur-sm hover:bg-white"
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <Upload className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Click to upload</p>
                              <p className="text-xs text-slate-500">or drag and drop</p>
                            </div>
                          </button>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 px-6 py-4" style={{ backgroundColor: BRAND_BLUE }}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">4. AI Preview</h3>
                        <Badge className="bg-white/20 text-[10px] text-white">Step 4</Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        {previewImage ? (
                          <img src={previewImage} alt="AI Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                            {processingPreview ? (
                              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
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

                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
                    <div className="grid w-full flex-1 gap-3 sm:grid-cols-3">
                      {STYLE_OPTIONS.map((option) => (
                        <label key={option.value} className="cursor-pointer">
                          <input type="radio" name="previewStyle" value={option.value} checked={style === option.value} onChange={() => setStyle(option.value)} className="peer sr-only" />
                          <div className={`rounded-xl border-2 p-4 text-center transition-all ${style === option.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                            <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                            <p className="mt-1 text-xs text-slate-500">{option.helper}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <Button onClick={generatePreview} disabled={!canGeneratePreview} className="h-12 w-full rounded-xl text-white shadow-lg hover:opacity-90 xl:w-auto xl:min-w-[200px]" style={{ backgroundColor: BRAND_BLUE }}>
                      {processingPreview ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : 'Generate Preview'}
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span>Selected style: <strong className="text-slate-900">{selectedStyle.label}</strong></span>
                    <span className="hidden sm:inline">Step 3 unlocks the preview</span>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">5. Video</h3>
                    <Badge className="text-[10px] text-white" style={{ backgroundColor: BRAND_BLUE }}>Step 5</Badge>
                  </div>
                  <Button onClick={() => generateSingleVideo('veo')} disabled={!canGenerateVideos} className="mb-4 h-11 w-full rounded-xl text-white hover:opacity-90" style={{ backgroundColor: BRAND_BLUE }}>
                    {videoProcessing === 'veo' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create AI Video'}
                  </Button>
                  {renderVideoCard('veo', 'AI Video Result')}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">6. Compare</h3>
                    <Badge className="text-[10px] text-white" style={{ backgroundColor: BRAND_BLUE }}>Step 6</Badge>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'original', label: 'Original', ready: Boolean(uploadedImage) },
                      { key: 'preview', label: 'AI Preview', ready: Boolean(previewImage) },
                      { key: 'veo', label: `${videoProvider.toUpperCase()} Video`, ready: Boolean(videoResults.veo?.assetUrl) },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => setFavoriteResult(item.key as FavoriteResult)}
                        className={`w-full rounded-xl border-2 p-3 text-left text-xs font-semibold transition-all ${!item.ready ? 'cursor-not-allowed opacity-40' : ''} ${favoriteResult === item.key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}
                        disabled={!item.ready}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.label}</span>
                          {favoriteResult === item.key && <CheckCircle className="h-4 w-4 text-blue-600" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  {favoriteResult && (
                    <Button type="button" onClick={() => setFavoriteMessage(`Saved ${favoriteResult === 'veo' ? `${videoProvider.toUpperCase()} video` : favoriteResult} as your preferred result.`)} className="mt-4 h-11 w-full rounded-xl text-white shadow-lg hover:opacity-90" style={{ backgroundColor: BRAND_BLUE }}>
                      <Save className="mr-2 h-4 w-4" /> Save Selection
                    </Button>
                  )}
                  {favoriteMessage && <p className="mt-3 text-sm text-green-600">{favoriteMessage}</p>}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 z-50 w-full max-w-md -translate-x-1/2 space-y-2 px-4">
          {successMessage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="rounded-xl border border-blue-200 bg-white/95 p-4 text-sm shadow-2xl backdrop-blur-md text-blue-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <p className="font-medium">{successMessage}</p>
              </div>
            </motion.div>
          )}
          {(previewError || videoError) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="rounded-xl border border-red-200 bg-white/95 p-4 text-sm text-red-800 shadow-2xl backdrop-blur-md">
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
