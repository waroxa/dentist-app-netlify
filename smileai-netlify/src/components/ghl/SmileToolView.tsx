import React, { useEffect, useMemo, useState } from 'react';
import { Upload, Sparkles, Loader2, AlertCircle, Info, Video, Link2, CheckCircle2, RefreshCw } from 'lucide-react';
import { ClinicBranding } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface SmileToolViewProps {
  clinicBranding: ClinicBranding;
}

type SmileStyle = 'subtle' | 'natural' | 'hollywood';

interface PatientRecord {
  id: string;
  crmContactId?: string | null;
  fullName?: string;
  name: string;
  email: string;
  phone: string;
  interestedIn?: string;
}

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Non-JSON API response: ${text.slice(0, 300)}`);
  }
  return response.json();
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STYLE_OPTIONS: Array<{ value: SmileStyle; label: string; helper: string }> = [
  { value: 'subtle', label: 'Subtle', helper: 'Gentle cosmetic refinement' },
  { value: 'natural', label: 'Natural', helper: 'Balanced, realistic enhancement' },
  { value: 'hollywood', label: 'Hollywood', helper: 'Bright, high-impact smile makeover' },
];

export function SmileToolView({ clinicBranding }: SmileToolViewProps) {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewAssetUrl, setPreviewAssetUrl] = useState<string | null>(null);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [style, setStyle] = useState<SmileStyle>('natural');
  const [isProcessingPreview, setIsProcessingPreview] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [isSyncingRecord, setIsSyncingRecord] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const primaryColor = clinicBranding.primaryColor;
  const accentColor = clinicBranding.accentColor || clinicBranding.primaryColor;
  const primarySoft = `${primaryColor}14`;
  const primaryBorder = `${primaryColor}30`;
  const primaryGradient = `linear-gradient(to right, ${primaryColor}, ${accentColor})`;

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedLeadId) || null,
    [patients, selectedLeadId],
  );

  async function fetchPatients() {
    setPatientsLoading(true);
    try {
      const response = await fetch('/api/admin/patients', { credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to load patients.');
      setPatients(data.patients || []);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to load patients for the smile tool.');
    } finally {
      setPatientsLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!videoJobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video/veo/status?jobId=${encodeURIComponent(videoJobId)}`);
        const data = await parseJsonResponse(response);
        if (data.status === 'completed' && data.assetUrl) {
          setVideoUrl(data.assetUrl);
          setIsProcessingVideo(false);
          setSuccessMessage('AI video is ready and linked to this session.');
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setIsProcessingVideo(false);
          setErrorMessage(data.error || 'Video generation failed.');
          clearInterval(pollInterval);
        }
      } catch (error: any) {
        setIsProcessingVideo(false);
        setErrorMessage(error.message || 'Unable to check video status.');
        clearInterval(pollInterval);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [videoJobId]);

  function resetGeneratedAssets() {
    setPreviewImage(null);
    setPreviewAssetUrl(null);
    setPreviewJobId(null);
    setVideoUrl(null);
    setVideoJobId(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function handleFile(file: File) {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be less than 10MB.');
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    resetGeneratedAssets();
    setUploadedImage(dataUrl);
    setSuccessMessage('Photo uploaded. Choose a style and generate the preview.');
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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

    setIsProcessingPreview(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPreviewImage(null);
    setPreviewAssetUrl(null);
    setPreviewJobId(null);
    setVideoUrl(null);
    setVideoJobId(null);

    try {
      const response = await fetch('/api/smile-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: uploadedImage,
          intensity: style,
          leadId: selectedLeadId || undefined,
          crmContactId: selectedPatient?.crmContactId || undefined,
        }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) throw new Error(data.error || 'Unable to generate the preview right now.');
      setPreviewImage(data.previewImageUrl);
      setPreviewAssetUrl(data.previewAssetUrl || data.previewImageUrl);
      setPreviewJobId(data.jobId || null);
      setSuccessMessage(selectedLeadId ? 'Preview ready and linked to the selected patient.' : 'Preview ready.');
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to generate the preview right now.');
    } finally {
      setIsProcessingPreview(false);
    }
  }

  async function generateVideo() {
    if (!previewImage) return;

    setIsProcessingVideo(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/video/veo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: previewImage,
          provider: 'veo',
          leadId: selectedLeadId || undefined,
        }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) throw new Error(data.error || 'Unable to start video generation.');
      if (!data.jobId) throw new Error('Video API did not return a job ID.');
      setVideoJobId(data.jobId);
      setSuccessMessage('Video generation started. We are checking until it finishes.');
    } catch (error: any) {
      setIsProcessingVideo(false);
      setErrorMessage(error.message || 'Unable to start video generation.');
    }
  }

  async function syncToRecord() {
    if (!selectedLeadId || (!previewAssetUrl && !videoUrl)) return;

    setIsSyncingRecord(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/sync-patient-media', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          crmContactId: selectedPatient?.crmContactId || undefined,
          previewUrl: previewAssetUrl || undefined,
          videoUrl: videoUrl || undefined,
          previewJobId: previewJobId || undefined,
          videoJobId: videoJobId || undefined,
          status: videoUrl ? 'Video Ready' : 'Preview Ready',
        }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) throw new Error(data.error || 'Unable to sync media back to the patient record.');
      setSuccessMessage('Media URLs have been synced to the patient record for GHL workflows.');
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to sync media back to the patient record.');
    } finally {
      setIsSyncingRecord(false);
    }
  }

  function openAsset(url: string | null) {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 lg:space-y-7">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Smile Tool</h2>
        <p className="text-sm text-slate-500">Generate AI smile previews and videos, then sync the asset URLs back to the patient record.</p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: primaryBorder }}>
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0" style={{ color: primaryColor }} />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold" style={{ color: primaryColor }}>Recommended workflow</h4>
            <p className="text-sm leading-6 text-slate-600">
              Pick a patient when you want the preview and video URLs written back into GHL automatically. You can still test the tool without linking a record first.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="patient-record" className="text-sm font-medium text-slate-700">Patient Record</Label>
            <div className="flex flex-col gap-3 lg:flex-row">
              <select
                id="patient-record"
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus-visible:outline-none"
              >
                <option value="">Use tool without linking a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName || patient.name} - {patient.email}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={fetchPatients}
                disabled={patientsLoading}
                className="h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {patientsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
              </Button>
            </div>
            {selectedPatient && (
              <p className="text-xs text-slate-500">
                Linked patient: <span className="font-medium text-slate-700">{selectedPatient.fullName || selectedPatient.name}</span>
                {selectedPatient.interestedIn ? ` • ${selectedPatient.interestedIn}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workflow Sync</p>
          <p className="mt-2 text-sm text-slate-700">{selectedLeadId ? 'Ready to sync generated asset URLs back to the record.' : 'Select a patient to sync media URLs into GHL.'}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">1. Upload Patient Photo</h3>
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: primarySoft, color: primaryColor }}>Input</span>
            </div>

            {!uploadedImage ? (
              <div
                className="rounded-2xl border-2 border-dashed bg-slate-50/60 transition-all"
                style={dragActive ? { borderColor: primaryColor, backgroundColor: primarySoft } : { borderColor: '#cbd5e1' }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <label className="flex cursor-pointer flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: primarySoft }}>
                    <Upload className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <p className="text-base font-semibold text-slate-900">Drop photo here or click to upload</p>
                  <p className="mt-1 text-sm text-slate-500">Supports JPG, PNG, WEBP up to 10MB</p>
                  <div className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ background: primaryGradient }}>
                    Browse Files
                  </div>
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <img src={uploadedImage} alt="Uploaded patient" className="h-[420px] w-full object-cover" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={generatePreview} disabled={isProcessingPreview} className="h-11 flex-1 text-sm font-semibold text-white" style={{ background: primaryGradient }}>
                    {isProcessingPreview ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Preview</>}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadedImage(null);
                      resetGeneratedAssets();
                    }}
                    className="h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">2. Choose Preview Style</h3>
              <span className="text-xs text-slate-400">Used for the image generation prompt</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {STYLE_OPTIONS.map((option) => {
                const isSelected = style === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setStyle(option.value)}
                    className="rounded-2xl border px-4 py-4 text-left transition-all"
                    style={isSelected ? { borderColor: primaryColor, backgroundColor: primarySoft } : { borderColor: '#e2e8f0' }}
                  >
                    <p className="text-sm font-semibold" style={{ color: isSelected ? primaryColor : '#0f172a' }}>{option.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{option.helper}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">3. Enhanced Smile Preview</h3>
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: primarySoft, color: primaryColor }}>Preview</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {previewImage ? (
                <img src={previewImage} alt="AI smile preview" className="h-[420px] w-full object-cover" />
              ) : (
                <div className="flex h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
                  {isProcessingPreview ? <Loader2 className="h-10 w-10 animate-spin" style={{ color: primaryColor }} /> : <Sparkles className="h-10 w-10 text-slate-300" />}
                  <p className="text-sm text-slate-500">{isProcessingPreview ? 'Generating preview...' : 'Your generated smile preview will appear here.'}</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button onClick={generateVideo} disabled={!previewImage || isProcessingVideo} className="h-11 flex-1 text-sm font-semibold text-white" style={{ background: primaryGradient }}>
                {isProcessingVideo ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Video...</> : <><Video className="mr-2 h-4 w-4" />Create AI Video</>}
              </Button>
              <Button
                variant="outline"
                onClick={syncToRecord}
                disabled={!selectedLeadId || (!previewAssetUrl && !videoUrl) || isSyncingRecord}
                className="h-11 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {isSyncingRecord ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Syncing...</> : <><Link2 className="mr-2 h-4 w-4" />Save to Record</>}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">4. AI Video Result</h3>
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: primarySoft, color: primaryColor }}>Video</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {videoUrl ? (
                <video controls className="h-[320px] w-full bg-slate-950 object-contain">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex h-[320px] flex-col items-center justify-center gap-3 px-6 text-center">
                  {isProcessingVideo ? <Loader2 className="h-10 w-10 animate-spin" style={{ color: primaryColor }} /> : <Video className="h-10 w-10 text-slate-300" />}
                  <p className="text-sm text-slate-500">{isProcessingVideo ? 'Generating video. This can take a few minutes...' : 'Generate a preview first, then create the video.'}</p>
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">Preview Asset URL</Label>
                <div className="flex gap-2">
                  <Input value={previewAssetUrl || ''} readOnly placeholder="Preview URL will appear here" className="h-11 border-slate-200 text-sm" />
                  <Button variant="outline" onClick={() => openAsset(previewAssetUrl)} disabled={!previewAssetUrl} className="h-11 border-slate-200 text-slate-600">
                    Open
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">Video Asset URL</Label>
                <div className="flex gap-2">
                  <Input value={videoUrl || ''} readOnly placeholder="Video URL will appear here" className="h-11 border-slate-200 text-sm" />
                  <Button variant="outline" onClick={() => openAsset(videoUrl)} disabled={!videoUrl} className="h-11 border-slate-200 text-slate-600">
                    Open
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(successMessage || errorMessage) && (
        <div
          className={`rounded-2xl border px-5 py-4 shadow-sm ${errorMessage ? 'border-red-200 bg-red-50' : 'bg-white'}`}
          style={!errorMessage ? { borderColor: primaryBorder } : undefined}
        >
          <div className="flex items-start gap-3">
            {errorMessage ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: primaryColor }} />
            )}
            <p className={`text-sm leading-6 ${errorMessage ? 'text-red-700' : 'text-slate-700'}`}>{errorMessage || successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
