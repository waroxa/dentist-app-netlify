import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Loader2, AlertCircle, CheckCircle, User, Mail, Phone, FileText, Video, Sparkles, Wand2, ArrowRight, ShieldCheck, ImagePlus, ScanSearch } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  interestedIn: string;
  notes: string;
}

type SmileStyle = 'subtle' | 'natural' | 'bright';
type VideoProvider = 'fal' | 'veo';

type StepKey = 'lead' | 'upload' | 'preview' | 'video' | 'compare';

interface VideoResult {
  provider: VideoProvider;
  assetUrl: string;
  jobId: string | null;
  model?: string | null;
  note?: string;
}

const STYLE_OPTIONS: Array<{ value: SmileStyle; label: string; description: string; accent: string }> = [
  { value: 'subtle', label: 'Very subtle', description: 'A gentle cleanup with natural whitening and minimal cosmetic lift.', accent: 'from-sky-200 via-cyan-200 to-white' },
  { value: 'natural', label: 'Natural signature', description: 'Balanced cosmetic improvement for a polished, believable smile.', accent: 'from-teal-200 via-cyan-200 to-white' },
  { value: 'bright', label: 'Hollywood glow', description: 'A brighter, higher-impact cosmetic reveal for premium cases.', accent: 'from-blue-200 via-indigo-200 to-white' },
];

const VIDEO_PROVIDERS: Array<{ value: VideoProvider; label: string; description: string }> = [
  { value: 'fal', label: 'FAL', description: 'Fast production-ready image-to-video generation.' },
  { value: 'veo', label: 'Veo', description: 'Google Veo render for side-by-side provider comparison.' },
];

const FLOW_STEPS: Array<{ key: StepKey; title: string; subtitle: string }> = [
  { key: 'lead', title: 'Request accepted', subtitle: 'Secure lead capture' },
  { key: 'upload', title: 'Upload photo', subtitle: 'Face + smile intake' },
  { key: 'preview', title: 'Generate preview', subtitle: 'Gemini smile render' },
  { key: 'video', title: 'Generate videos', subtitle: 'FAL + Veo outputs' },
  { key: 'compare', title: 'Compare results', subtitle: 'Image + motion review' },
];

const motivationalMessages = [
  'Analyzing dental landmarks and smile geometry…',
  'Preparing your premium smile visualization…',
  'Generating cinematic provider outputs for side-by-side review…',
  'Refining the before/after story for your consultation…',
];

function formatPhoneNumber(value: string) {
  const phone = value.replace(/\D/g, '');
  if (phone.length <= 3) return phone;
  if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  return phone.replace(/\D/g, '').length === 10;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getCurrentStep({ leadCaptured, uploadedImage, previewImage, videoResults }: { leadCaptured: boolean; uploadedImage: string | null; previewImage: string | null; videoResults: Partial<Record<VideoProvider, VideoResult>>; }): StepKey {
  const generatedVideos = Object.keys(videoResults).length;
  if (generatedVideos >= 2) return 'compare';
  if (previewImage) return 'video';
  if (uploadedImage) return 'preview';
  if (leadCaptured) return 'upload';
  return 'lead';
}

export function SmileTransformationSection() {
  const [lead, setLead] = useState<LeadFormData>({ fullName: '', email: '', phone: '', interestedIn: '', notes: '' });
  const [formErrors, setFormErrors] = useState<Partial<LeadFormData>>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewAssetUrl, setPreviewAssetUrl] = useState<string | null>(null);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [videoProcessing, setVideoProcessing] = useState<VideoProvider | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [style, setStyle] = useState<SmileStyle>('natural');
  const [videoProvider, setVideoProvider] = useState<VideoProvider>('fal');
  const [videoResults, setVideoResults] = useState<Partial<Record<VideoProvider, VideoResult>>>({});
  const [videoStatus, setVideoStatus] = useState('');
  const [motivationalMessageIndex, setMotivationalMessageIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const uploadPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!videoProcessing) return;
    const interval = window.setInterval(() => {
      setMotivationalMessageIndex((index) => (index + 1) % motivationalMessages.length);
    }, 2500);
    return () => window.clearInterval(interval);
  }, [videoProcessing]);

  useEffect(() => {
    if (leadCaptured && uploadPanelRef.current) {
      uploadPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [leadCaptured]);

  const selectedStyle = useMemo(() => STYLE_OPTIONS.find((option) => option.value === style) || STYLE_OPTIONS[1], [style]);
  const currentStep = getCurrentStep({ leadCaptured, uploadedImage, previewImage, videoResults });
  const completedVideos = Object.keys(videoResults).length;

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    const errors: Partial<LeadFormData> = {};
    if (!lead.fullName.trim()) errors.fullName = 'Full name is required';
    if (!lead.email.trim()) errors.email = 'Email is required';
    else if (!validateEmail(lead.email)) errors.email = 'Please enter a valid email';
    if (!lead.phone.trim()) errors.phone = 'Phone number is required';
    else if (!validatePhone(lead.phone)) errors.phone = 'Please enter a valid 10-digit phone number';
    if (!lead.interestedIn.trim()) errors.interestedIn = 'Please select a service';
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmittingLead(true);
    setSuccessMessage(null);
    setPreviewError(null);
    try {
      const res = await fetch('/api/lead-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details?.join(' ') || data.error || 'Unable to save your request.');
      setLeadId(data.leadId);
      setLeadCaptured(true);
      setSuccessMessage('Request accepted. Upload a smile photo to continue into the live preview flow.');
    } catch (error: any) {
      setPreviewError(error.message || 'Unable to save your request.');
    } finally {
      setSubmittingLead(false);
    }
  }

  function resetDerivedResults() {
    setPreviewImage(null);
    setPreviewAssetUrl(null);
    setPreviewJobId(null);
    setVideoResults({});
    setVideoError(null);
    setVideoStatus('');
    setPreviewError(null);
    setSuccessMessage(null);
  }

  async function handleFile(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPreviewError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPreviewError('File size must be less than 10MB.');
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    resetDerivedResults();
    setUploadedImage(dataUrl);
    setSuccessMessage('Photo uploaded. Choose a preview style and generate your Gemini smile render.');
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFile(file);
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
    setProcessing(true);
    setPreviewError(null);
    setSuccessMessage(null);
    setVideoResults({});
    setVideoError(null);
    setVideoStatus('');

    try {
      const res = await fetch('/api/smile-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, imageDataUrl: uploadedImage, intensity: style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to generate preview.');
      setPreviewImage(data.previewImageUrl);
      setPreviewAssetUrl(data.previewAssetUrl || data.previewImageUrl);
      setPreviewJobId(data.jobId || null);
      setSuccessMessage(`Gemini preview ready. Next, choose a provider and create FAL and Veo videos for comparison.`);
    } catch (error: any) {
      setPreviewError(error.message || 'Unable to generate preview.');
    } finally {
      setProcessing(false);
    }
  }

  async function generateVideo(provider: VideoProvider) {
    if (!previewImage) return;
    setVideoProvider(provider);
    setVideoProcessing(provider);
    setVideoError(null);
    setSuccessMessage(null);
    setVideoStatus(`Creating your ${provider.toUpperCase()} smile video…`);

    try {
      const res = await fetch('/api/video-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, imageUrl: previewImage, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to create video.');
      setVideoResults((current) => ({
        ...current,
        [provider]: {
          provider,
          assetUrl: data.assetUrl,
          jobId: data.jobId || null,
          model: data.model || null,
          note: data.note,
        },
      }));
      setVideoStatus(data.note || `${provider.toUpperCase()} video ready.`);
      setSuccessMessage(completedVideos === 0 ? `${provider.toUpperCase()} video created. Generate the second provider to compare outputs.` : 'Both provider outputs are ready to compare.');
    } catch (error: any) {
      setVideoError(error.message || 'Unable to create video.');
      setVideoStatus('');
    } finally {
      setVideoProcessing(null);
    }
  }

  function renderVideoCard(provider: VideoProvider) {
    const result = videoResults[provider];
    const providerLabel = provider.toUpperCase();
    return (
      <div className="rounded-[28px] border border-white/70 bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{providerLabel} video</p>
            <p className="text-xs text-slate-500">{result?.model || 'Ready for generation'}</p>
          </div>
          <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">{providerLabel}</Badge>
        </div>
        <div className="aspect-video bg-slate-950">
          {result?.assetUrl ? (
            <video controls playsInline className="h-full w-full object-cover">
              <source src={result.assetUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.18),_transparent_55%),linear-gradient(180deg,_#f8fbff_0%,_#eff6ff_100%)] px-6 text-center">
              {videoProcessing === provider ? <Loader2 className="h-10 w-10 animate-spin text-sky-600" /> : <Video className="h-10 w-10 text-slate-300" />}
              <p className="text-sm font-medium text-slate-700">{videoProcessing === provider ? motivationalMessages[motivationalMessageIndex] : `Generate a ${providerLabel} render from the Gemini preview.`}</p>
            </div>
          )}
        </div>
        <div className="space-y-3 px-5 py-4">
          <p className="text-xs text-slate-500">{result?.jobId ? `Job ${result.jobId}` : 'No output yet.'}</p>
          <Button onClick={() => generateVideo(provider)} disabled={!previewImage || videoProcessing !== null} className="w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
            {videoProcessing === provider ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating {providerLabel}…</> : <>Generate {providerLabel} video</>}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section id="smile-transform" className="relative overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_45%,#edf7fb_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.12),_transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-4 py-2 text-sm text-sky-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" /> SmileVisionPro AI workflow
          </div>
          <h2 className="mx-auto max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Premium dental visualization from lead capture to AI smile comparison.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:text-lg">
            Submit your request, upload a patient photo, generate a Gemini cosmetic preview, then compare motion results from FAL and Google Veo in one guided experience.
          </p>
        </div>

        <div className="mb-8 grid gap-3 rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-[0_20px_70px_rgba(14,165,233,0.08)] backdrop-blur-xl md:grid-cols-5">
          {FLOW_STEPS.map((step, index) => {
            const stepIndex = FLOW_STEPS.findIndex((item) => item.key === currentStep);
            const isActive = step.key === currentStep;
            const isComplete = index < stepIndex;
            return (
              <div key={step.key} className={`rounded-2xl border px-4 py-4 transition-all ${isActive ? 'border-sky-300 bg-sky-50 shadow-sm' : isComplete ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-100 bg-white/70'}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${isActive ? 'bg-sky-600 text-white' : isComplete ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                  {isComplete && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                </div>
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs text-slate-500">{step.subtitle}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div ref={uploadPanelRef} className="rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            {!leadCaptured ? (
              <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={submitLead} className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="mb-3 bg-slate-900 text-white hover:bg-slate-900">Step 1</Badge>
                    <h3 className="text-2xl font-semibold text-slate-950">Capture the consultation lead</h3>
                    <p className="mt-2 text-sm text-slate-600">Once the request is accepted, the experience advances straight into photo upload so the patient never feels stuck.</p>
                  </div>
                  <ShieldCheck className="hidden h-10 w-10 text-sky-500 sm:block" />
                </div>

                <div>
                  <Label htmlFor="fullName" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900"><User className="h-4 w-4 text-slate-500" />Full Name *</Label>
                  <Input id="fullName" value={lead.fullName} onChange={(e) => { setLead({ ...lead, fullName: e.target.value }); setFormErrors({ ...formErrors, fullName: undefined }); }} placeholder="Jordan Smith" className={`h-12 rounded-2xl border-slate-200 ${formErrors.fullName ? 'border-red-500' : ''}`} />
                  {formErrors.fullName && <p className="mt-1.5 text-sm text-red-600">{formErrors.fullName}</p>}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900"><Mail className="h-4 w-4 text-slate-500" />Email *</Label>
                    <Input id="email" type="email" value={lead.email} onChange={(e) => { setLead({ ...lead, email: e.target.value }); setFormErrors({ ...formErrors, email: undefined }); }} placeholder="jordan@example.com" className={`h-12 rounded-2xl border-slate-200 ${formErrors.email ? 'border-red-500' : ''}`} />
                    {formErrors.email && <p className="mt-1.5 text-sm text-red-600">{formErrors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900"><Phone className="h-4 w-4 text-slate-500" />Phone *</Label>
                    <Input id="phone" type="tel" value={lead.phone} maxLength={14} onChange={(e) => { setLead({ ...lead, phone: formatPhoneNumber(e.target.value) }); setFormErrors({ ...formErrors, phone: undefined }); }} placeholder="(555) 123-4567" className={`h-12 rounded-2xl border-slate-200 ${formErrors.phone ? 'border-red-500' : ''}`} />
                    {formErrors.phone && <p className="mt-1.5 text-sm text-red-600">{formErrors.phone}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="interestedIn" className="mb-2 block text-sm font-medium text-slate-900">Interested In *</Label>
                  <select id="interestedIn" value={lead.interestedIn} onChange={(e) => { setLead({ ...lead, interestedIn: e.target.value }); setFormErrors({ ...formErrors, interestedIn: undefined }); }} className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm ${formErrors.interestedIn ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-sky-400`}>
                    <option value="">Select a service...</option>
                    <option value="Veneers">Veneers</option>
                    <option value="Invisalign">Invisalign</option>
                    <option value="Whitening">Whitening</option>
                    <option value="Smile Makeover">Smile Makeover</option>
                    <option value="Implants">Implants</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.interestedIn && <p className="mt-1.5 text-sm text-red-600">{formErrors.interestedIn}</p>}
                </div>

                <div>
                  <Label htmlFor="notes" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900"><FileText className="h-4 w-4 text-slate-500" />Smile goals</Label>
                  <Textarea id="notes" value={lead.notes} onChange={(e) => setLead({ ...lead, notes: e.target.value })} placeholder="Tell us what the patient wants to improve most…" rows={4} className="resize-none rounded-2xl border-slate-200" />
                </div>

                <Button type="submit" disabled={submittingLead} className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#0369a1_50%,#0d9488_100%)] text-white shadow-lg shadow-sky-500/20 hover:opacity-95">
                  {submittingLead ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting secure request…</> : <>Continue to photo upload <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
                <p className="text-center text-xs text-slate-500">Lead capture, Gemini rendering, FAL generation, and Veo generation all stay on protected backend routes.</p>
              </motion.form>
            ) : (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Badge className="mb-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Lead accepted</Badge>
                    <h3 className="text-2xl font-semibold text-slate-950">Guided smile-generation workspace</h3>
                    <p className="mt-2 text-sm text-slate-600">Upload a patient photo, choose a cosmetic direction, generate the Gemini preview, then run both video providers for comparison.</p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    <p className="font-semibold">Lead ID</p>
                    <p className="text-xs break-all">{leadId}</p>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-4">
                    <div className={`rounded-[28px] border-2 border-dashed p-5 transition-all ${dragActive ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 py-10 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-700"><Upload className="h-8 w-8" /></div>
                        <div>
                          <p className="text-base font-semibold text-slate-900">Step 2 — Upload a smile photo</p>
                          <p className="mt-1 text-sm text-slate-500">JPG, PNG, or WEBP up to 10MB. A clear, front-facing smile works best.</p>
                        </div>
                        <span className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600">Choose photo</span>
                        <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
                      </label>
                    </div>

                    <div className="rounded-[28px] border border-slate-100 bg-[linear-gradient(180deg,#fbfeff_0%,#f8fafc_100%)] p-5">
                      <div className="mb-4 flex items-center gap-2 text-slate-900"><Wand2 className="h-4 w-4 text-sky-600" /><span className="text-sm font-semibold">Step 3 — Preview style</span></div>
                      <div className="grid gap-3">
                        {STYLE_OPTIONS.map((option) => (
                          <label key={option.value} className="cursor-pointer">
                            <input type="radio" name="previewStyle" value={option.value} checked={style === option.value} onChange={() => setStyle(option.value)} className="peer sr-only" />
                            <div className={`rounded-2xl border border-slate-200 bg-gradient-to-r p-4 transition-all peer-checked:border-sky-400 peer-checked:shadow-md ${option.accent}`}>
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-950">{option.label}</p>
                                  <p className="mt-1 text-xs text-slate-600">{option.description}</p>
                                </div>
                                {style === option.value && <CheckCircle className="h-5 w-5 text-sky-600" />}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <Button onClick={generatePreview} disabled={!uploadedImage || processing} className="mt-4 h-12 w-full rounded-2xl bg-sky-600 text-white hover:bg-sky-700">
                        {processing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Gemini preview…</> : <>Generate Gemini smile preview</>}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Original photo</p>
                          <p className="text-xs text-slate-500">Consultation intake image</p>
                        </div>
                        <Badge variant="secondary" className="rounded-full">Input</Badge>
                      </div>
                      <div className="aspect-[4/5] bg-slate-50">
                        {uploadedImage ? <img src={uploadedImage} alt="Original smile" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">Upload a patient photo to begin the live workflow.</div>}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Gemini preview</p>
                          <p className="text-xs text-slate-500">Style-aware smile render</p>
                        </div>
                        <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100">Gemini</Badge>
                      </div>
                      <div className="aspect-[4/5] bg-slate-50">
                        {previewImage ? <img src={previewImage} alt="Gemini smile preview" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-slate-400">{processing ? <Loader2 className="h-10 w-10 animate-spin text-sky-600" /> : <ImagePlus className="h-10 w-10 text-slate-300" />}Generate the smile preview to unlock the video stage.</div>}
                      </div>
                      <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
                        {previewAssetUrl ? <a href={previewAssetUrl} target="_blank" rel="noreferrer" className="text-sky-600 underline">Open stored preview asset</a> : 'The backend stores a reusable preview asset for video providers.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-[linear-gradient(135deg,#ffffff_0%,#f2fbff_45%,#eff6ff_100%)] p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Step 4 — Generate and compare videos</p>
                      <p className="text-xs text-slate-500">Both providers use the same Gemini-generated preview image.</p>
                    </div>
                    <div className="flex gap-2">
                      {VIDEO_PROVIDERS.map((option) => (
                        <button key={option.value} type="button" onClick={() => setVideoProvider(option.value)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${videoProvider === option.value ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4 grid gap-4 lg:grid-cols-2">
                    {renderVideoCard('fal')}
                    {renderVideoCard('veo')}
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm text-slate-600">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span>{videoStatus || 'Generate one or both providers to compare motion outputs.'}</span>
                      <span className="font-medium text-slate-900">Selected provider: {videoProvider.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(successMessage || previewError || videoError || previewJobId) && (
              <div className="mt-5 space-y-3">
                {successMessage && <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />{successMessage}</div>}
                {previewJobId && <p className="text-xs text-slate-500">Preview job ID: {previewJobId}</p>}
                {previewError && <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />{previewError}</div>}
                {videoError && <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />{videoError}</div>}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.92)_0%,rgba(240,249,255,0.92)_55%,rgba(236,253,245,0.92)_100%)] p-6 shadow-[0_30px_90px_rgba(8,47,73,0.08)] backdrop-blur-xl sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><ScanSearch className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Live demo narrative</p>
                  <h3 className="text-2xl font-semibold text-slate-950">What the patient sees next</h3>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ['Lead accepted', 'The secure intake is recorded before any AI generation starts, so the flow is traceable end to end.'],
                  ['Gemini preview', 'The uploaded image becomes a style-aware cosmetic render focused only on the smile.'],
                  ['Provider comparison', 'FAL and Veo generate videos from the same preview asset so clinicians can compare quality.'],
                  ['Consultation ready', 'The original image, preview image, and both videos present a premium before/after story.'],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-sm text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-100 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Comparison desk</p>
                  <p className="text-xs text-slate-500">Premium consultation-ready result cards</p>
                </div>
                <Badge className="bg-slate-900 text-white hover:bg-slate-900">{completedVideos}/2 videos</Badge>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Original photo</span>
                    <Badge variant="secondary">Before</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{uploadedImage ? 'Patient upload received and ready for consultation review.' : 'Waiting for photo upload.'}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Gemini preview</span>
                    <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100">AI</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{previewImage ? `${selectedStyle.label} style generated and ready for motion rendering.` : 'Choose a style and generate the preview.'}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {VIDEO_PROVIDERS.map((provider) => (
                    <div key={provider.value} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{provider.label} video</span>
                        <Badge variant="secondary">{videoResults[provider.value] ? 'Ready' : 'Pending'}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{videoResults[provider.value]?.note || provider.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
