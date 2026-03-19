import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Loader2, AlertCircle, Check, CheckCircle, User, Mail, Phone, FileText, Video, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AnimatedSmilePlayer } from './AnimatedSmilePlayer';
import { QuickTransformations } from './QuickTransformations';

interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  interestedIn: string;
  notes: string;
}

type SmileStyle = 'subtle' | 'natural' | 'bright';
type VideoProvider = 'fal' | 'veo';

const STYLE_OPTIONS: Array<{ value: SmileStyle; label: string; description: string }> = [
  { value: 'subtle', label: 'Very subtle', description: 'A gentle cleanup with natural whitening and alignment.' },
  { value: 'natural', label: 'Natural', description: 'Balanced cosmetic improvement for a polished, realistic smile.' },
  { value: 'bright', label: 'Hollywood smile', description: 'The brightest, most dramatic cosmetic preview.' },
];

const VIDEO_PROVIDERS: Array<{ value: VideoProvider; label: string; description: string }> = [
  { value: 'fal', label: 'FAL', description: 'Restore the original FAL image-to-video path.' },
  { value: 'veo', label: 'Veo', description: 'Generate a second real result with Google Veo.' },
];

const motivationalMessages = [
  '✨ Imagine waking up every day loving your smile...',
  '💫 A confident smile can transform your entire life',
  '🌟 Your dream smile is closer than you think',
  '💎 Invest in yourself - you deserve to feel amazing',
  '🎯 Confidence starts with a smile you are proud of',
  '🚀 Picture yourself smiling without hesitation',
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

export function SmileTransformationSection() {
  const [lead, setLead] = useState<LeadFormData>({ fullName: '', email: '', phone: '', interestedIn: '', notes: '' });
  const [formErrors, setFormErrors] = useState<Partial<LeadFormData>>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [videoAsset, setVideoAsset] = useState<string | null>(null);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [style, setStyle] = useState<SmileStyle>('natural');
  const [videoProvider, setVideoProvider] = useState<VideoProvider>('fal');
  const [videoProviderUsed, setVideoProviderUsed] = useState<VideoProvider | null>(null);
  const [videoStatus, setVideoStatus] = useState('');
  const [motivationalMessageIndex, setMotivationalMessageIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!videoProcessing) return;
    const interval = window.setInterval(() => {
      setMotivationalMessageIndex((index) => (index + 1) % motivationalMessages.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [videoProcessing]);

  const selectedStyle = useMemo(() => STYLE_OPTIONS.find((option) => option.value === style) || STYLE_OPTIONS[1], [style]);

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
      setSuccessMessage(data.message || 'Thanks! Your request has been received.');
    } catch (error: any) {
      setPreviewError(error.message || 'Unable to save your request.');
    } finally {
      setSubmittingLead(false);
    }
  }

  function resetDerivedResults() {
    setPreviewImage(null);
    setPreviewJobId(null);
    setVideoAsset(null);
    setVideoJobId(null);
    setVideoProviderUsed(null);
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
    setUploadedImage(dataUrl);
    resetDerivedResults();
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
    setVideoAsset(null);
    setVideoError(null);
    setVideoStatus('');
    setVideoProviderUsed(null);

    try {
      const res = await fetch('/api/smile-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, imageDataUrl: uploadedImage, intensity: style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to generate preview.');
      setPreviewImage(data.previewImageUrl);
      setPreviewJobId(data.jobId || null);
      setSuccessMessage(`Your ${selectedStyle.label.toLowerCase()} smile preview is ready.`);
    } catch (error: any) {
      setPreviewError(error.message || 'Unable to generate preview.');
    } finally {
      setProcessing(false);
    }
  }

  async function generateVideo() {
    if (!previewImage) return;
    setVideoProcessing(true);
    setVideoError(null);
    setSuccessMessage(null);
    setVideoAsset(null);
    setVideoStatus(`Creating your ${videoProvider.toUpperCase()} smile video...`);

    try {
      const res = await fetch('/api/video-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, imageUrl: previewImage, provider: videoProvider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to create video.');
      setVideoAsset(data.assetUrl);
      setVideoJobId(data.jobId || null);
      setVideoProviderUsed(data.provider || videoProvider);
      setVideoStatus(data.note || `Your ${String(data.provider || videoProvider).toUpperCase()} smile video is ready.`);
      setSuccessMessage(`Video created with ${String(data.provider || videoProvider).toUpperCase()}.`);
    } catch (error: any) {
      setVideoError(error.message || 'Unable to create video.');
      setVideoStatus('');
    } finally {
      setVideoProcessing(false);
    }
  }

  return (
    <section id="smile-transform" className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 lg:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm text-sky-700 mb-4">
            <Sparkles className="w-4 h-4" /> Smile preview workflow
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-3 sm:mb-4">
            {!leadCaptured ? 'Get Your Free Smile Preview' : 'Try Your New Smile in Seconds'}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {!leadCaptured
              ? 'Enter your information first, then upload a photo to generate a realistic before-and-after smile preview.'
              : 'Upload a photo, choose the preview style you want, then generate both the smile image and the smile video.'}
          </p>
        </div>

        {!leadCaptured && <QuickTransformations />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
            {!leadCaptured ? (
              <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={submitLead} className="space-y-5">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl text-gray-900 mb-2">Step 1: Enter Your Information</h3>
                  <p className="text-sm sm:text-base text-gray-600">We save your request first so every preview and video stays traceable.</p>
                </div>

                <div>
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-base font-medium text-gray-900 mb-2"><User className="w-4 h-4 text-gray-600" />Full Name *</Label>
                  <Input id="fullName" value={lead.fullName} onChange={(e) => { setLead({ ...lead, fullName: e.target.value }); setFormErrors({ ...formErrors, fullName: undefined }); }} placeholder="John Smith" className={`h-11 text-base ${formErrors.fullName ? 'border-red-500' : ''}`} />
                  {formErrors.fullName && <p className="text-sm text-red-600 mt-1.5">{formErrors.fullName}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium text-gray-900 mb-2"><Mail className="w-4 h-4 text-gray-600" />Email *</Label>
                  <Input id="email" type="email" value={lead.email} onChange={(e) => { setLead({ ...lead, email: e.target.value }); setFormErrors({ ...formErrors, email: undefined }); }} placeholder="john@example.com" className={`h-11 text-base ${formErrors.email ? 'border-red-500' : ''}`} />
                  {formErrors.email && <p className="text-sm text-red-600 mt-1.5">{formErrors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2 text-base font-medium text-gray-900 mb-2"><Phone className="w-4 h-4 text-gray-600" />Phone Number *</Label>
                  <Input id="phone" type="tel" value={lead.phone} maxLength={14} onChange={(e) => { setLead({ ...lead, phone: formatPhoneNumber(e.target.value) }); setFormErrors({ ...formErrors, phone: undefined }); }} placeholder="(555) 123-4567" className={`h-11 text-base ${formErrors.phone ? 'border-red-500' : ''}`} />
                  {formErrors.phone && <p className="text-sm text-red-600 mt-1.5">{formErrors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="interestedIn" className="text-base font-medium text-gray-900 mb-2 block">Interested In *</Label>
                  <select id="interestedIn" value={lead.interestedIn} onChange={(e) => { setLead({ ...lead, interestedIn: e.target.value }); setFormErrors({ ...formErrors, interestedIn: undefined }); }} className={`w-full h-11 text-base px-4 rounded-lg border bg-white ${formErrors.interestedIn ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                    <option value="">Select a service...</option>
                    <option value="Veneers">Veneers</option>
                    <option value="Invisalign">Invisalign</option>
                    <option value="Whitening">Whitening</option>
                    <option value="Smile Makeover">Smile Makeover</option>
                    <option value="Implants">Implants</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.interestedIn && <p className="text-sm text-red-600 mt-1.5">{formErrors.interestedIn}</p>}
                </div>

                <div>
                  <Label htmlFor="notes" className="flex items-center gap-2 text-base font-medium text-gray-900 mb-2"><FileText className="w-4 h-4 text-gray-600" />Optional Notes</Label>
                  <Textarea id="notes" value={lead.notes} onChange={(e) => setLead({ ...lead, notes: e.target.value })} placeholder="Tell us about your smile goals or any specific concerns..." rows={3} className="text-base resize-none" />
                </div>

                <Button type="submit" disabled={submittingLead} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                  {submittingLead ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</> : 'Continue to Smile Preview ✨'}
                </Button>

                <p className="text-xs text-center text-gray-500 pt-2">Your information stays secure. Smile previews and videos are generated through protected backend routes.</p>
              </motion.form>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg sm:text-xl text-gray-900">Step 2: Upload Your Photo</h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">Choose a preview style, generate the smile image, then create a real video with FAL or Veo.</p>
                </div>

                <AnimatePresence mode="wait">
                  {!uploadedImage ? (
                    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className={`relative border-2 border-dashed rounded-xl transition-all ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50/30'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                        <label className="flex flex-col items-center justify-center py-16 cursor-pointer">
                          <Upload className="w-12 h-12 text-teal-600 mb-4" />
                          <p className="text-gray-700 mb-1">Drag & drop a photo here</p>
                          <p className="text-gray-500 text-sm mb-4">or click to upload from your device</p>
                          <p className="text-gray-400 text-xs">JPG, PNG, WEBP - up to 10MB</p>
                          <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
                        </label>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="bg-white border border-gray-200 px-4 py-3 rounded-t-xl text-center"><p className="text-gray-900">Before</p></div>
                          <div className="border-2 border-gray-200 border-t-0 rounded-b-xl overflow-hidden shadow-md bg-white">
                            <img src={uploadedImage} alt="Before" className="w-full h-56 object-cover" />
                          </div>
                        </div>
                        <div>
                          <div className="bg-blue-600 px-4 py-3 rounded-t-xl text-center"><p className="text-white">After - AI Enhanced</p></div>
                          <div className="border-2 border-blue-600 border-t-0 rounded-b-xl overflow-hidden shadow-lg relative bg-white">
                            {previewImage ? <img src={previewImage} alt="After" className="w-full h-56 object-cover" /> : <div className="w-full h-56 flex items-center justify-center bg-gray-50"><p className="text-gray-400 text-sm px-4 text-center">Generate a preview to see your transformed smile.</p></div>}
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <Label className="text-gray-900 mb-3 block">Preview Style</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {STYLE_OPTIONS.map((option) => (
                            <label key={option.value} className="cursor-pointer">
                              <input type="radio" name="previewStyle" value={option.value} checked={style === option.value} onChange={() => setStyle(option.value)} className="peer sr-only" />
                              <div className="h-full border-2 border-gray-300 peer-checked:border-teal-600 peer-checked:bg-teal-50 rounded-lg p-3 transition-all">
                                <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                                <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">We only adjust the smile and teeth - not your face, hair, skin, or background.</p>
                      </div>

                      <div className="space-y-3">
                        <Button onClick={generatePreview} disabled={processing} className="w-full h-12 bg-teal-600 hover:bg-teal-700">
                          {processing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating your enhanced smile...</> : 'Generate Smile Preview'}
                        </Button>
                        <button type="button" onClick={() => setUploadedImage(null)} className="w-full text-center text-teal-600 hover:text-teal-700 text-sm underline">Upload a different photo</button>
                      </div>

                      {previewImage && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 rounded-t-xl">
                            <p className="text-white">Your Smile Video</p>
                          </div>
                          <div className="border-4 border-purple-600 border-t-0 rounded-b-xl overflow-hidden shadow-2xl bg-white">
                            {videoAsset ? (
                              videoAsset === 'ANIMATED' ? (
                                <AnimatedSmilePlayer beforeImage={uploadedImage} afterImage={previewImage} isPlaying={true} />
                              ) : videoAsset.startsWith('data:image') ? (
                                <img src={videoAsset} alt="AI Enhanced Smile" className="w-full rounded-lg" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                              ) : videoAsset.endsWith('.mp4') || videoAsset.startsWith('data:video') ? (
                                <video src={videoAsset} controls autoPlay loop muted className="w-full rounded-lg" style={{ maxHeight: '400px' }}>Your browser does not support the video tag.</video>
                              ) : (
                                <div className="p-6">
                                  <p className="text-sm text-gray-700 mb-3">Provider returned a non-inline asset URL:</p>
                                  <a href={videoAsset} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline break-all">{videoAsset}</a>
                                </div>
                              )
                            ) : (
                              <div className="w-full h-64 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                                {videoProcessing ? (
                                  <AnimatePresence mode="wait">
                                    <motion.div key={motivationalMessageIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }} className="text-center">
                                      <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                                      <p className="text-lg sm:text-xl text-gray-800 mb-2">{motivationalMessages[motivationalMessageIndex]}</p>
                                      <p className="text-sm text-gray-500">{videoStatus || 'Creating your video...'}</p>
                                    </motion.div>
                                  </AnimatePresence>
                                ) : (
                                  <>
                                    <p className="text-gray-400 text-sm mb-2">Generate a video to see yourself smiling</p>
                                    <p className="text-gray-400 text-xs text-center">Choose FAL or Veo below to compare real provider outputs.</p>
                                  </>
                                )}
                              </div>
                            )}

                            <div className="p-4 space-y-3">
                              <div>
                                <Label className="text-sm font-medium text-gray-900 mb-2 block">Video provider</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {VIDEO_PROVIDERS.map((option) => (
                                    <label key={option.value} className="cursor-pointer">
                                      <input type="radio" name="videoProvider" value={option.value} checked={videoProvider === option.value} onChange={() => setVideoProvider(option.value)} className="peer sr-only" />
                                      <div className="border-2 border-gray-300 peer-checked:border-purple-600 peer-checked:bg-purple-50 rounded-lg p-3 transition-all">
                                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                                        <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <Button onClick={generateVideo} disabled={videoProcessing} className="w-full h-12 bg-purple-600 hover:bg-purple-700">
                                {videoProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating your smile video...</> : <><Video className="w-5 h-5 mr-2" />Create Smile Video</>}
                              </Button>

                              {(videoStatus || videoProviderUsed || videoJobId) && (
                                <div className="text-sm text-center text-gray-600 space-y-1">
                                  {videoStatus && <p>{videoStatus}</p>}
                                  {videoProviderUsed && <p>Provider used: <span className="font-semibold uppercase">{videoProviderUsed}</span></p>}
                                  {videoJobId && <p className="text-xs text-gray-500">Job ID: {videoJobId}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {(successMessage || previewError || videoError) && (
              <div className="mt-4 space-y-3">
                {successMessage && <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{successMessage}</div>}
                {previewJobId && <p className="text-xs text-gray-500">Preview job ID: {previewJobId}</p>}
                {previewError && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{previewError}</div>}
                {videoError && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{videoError}</div>}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl text-gray-900 mb-3">{!leadCaptured ? 'Why Get Your Free Preview?' : 'What Happens Next?'}</h3>
            </div>

            {!leadCaptured ? (
              <div className="space-y-4">
                {[
                  ['See Your Potential', 'Visualize your smile transformation before committing to treatment.'],
                  ['Free and no obligation', 'Capture the lead first, then preview the smile securely through the backend.'],
                  ['Choose your style', 'Compare very subtle, natural, and Hollywood smile directions.'],
                  ['Bring it to life', 'After the image preview, create a real smile video with FAL or Veo.'],
                ].map(([title, body]) => (
                  <div key={title} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">{title}</p>
                      <p className="text-sm text-gray-600">{body}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                  <p className="text-sm text-gray-700 text-center"><strong>Lead capture, before/after preview, and video flow all stay intact.</strong><br />The only thing that changed is where the secrets live.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  ['1', 'Upload Your Photo', 'Upload a clear photo showing your smile and teeth.'],
                  ['2', 'Generate the Smile Preview', 'Use the original style-based flow to create your before/after result.'],
                  ['3', 'Create and Compare Videos', 'Run the real FAL or Veo provider path from the same generated preview image.'],
                ].map(([step, title, body], index) => (
                  <div key={step} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${index === 0 ? 'bg-green-100 text-green-600' : index === 1 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      <span className="font-bold">{step}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">{title}</p>
                      <p className="text-sm text-gray-600">{body}</p>
                    </div>
                  </div>
                ))}

                <div className="rounded-xl bg-white p-4 shadow-sm border border-white/50">
                  <p className="text-sm font-semibold text-gray-900">Current preview style</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedStyle.label} - {selectedStyle.description}</p>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm border border-white/50">
                  <p className="text-sm font-semibold text-gray-900">What remains secure</p>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600 list-disc pl-5">
                    <li>Lead submit stays backend-mediated.</li>
                    <li>Preview generation stays backend-mediated.</li>
                    <li>Video generation stays backend-mediated.</li>
                    <li>Provider secrets stay server-side only.</li>
                  </ul>
                </div>

                {previewImage && (
                  <div className="rounded-xl bg-white p-4 shadow-sm border border-white/50">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Instant comparison preview</p>
                    <AnimatedSmilePlayer beforeImage={uploadedImage || previewImage} afterImage={previewImage} isPlaying={true} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
