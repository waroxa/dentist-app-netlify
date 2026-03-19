import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle2, Video, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface LeadFormData { fullName: string; email: string; phone: string; interestedIn: string; notes: string; }

export function SmileTransformationSection() {
  const [lead, setLead] = useState<LeadFormData>({ fullName: '', email: '', phone: '', interestedIn: '', notes: '' });
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<'subtle' | 'natural' | 'bright'>('natural');

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingLead(true);
    setMessage(null);
    try {
      const res = await fetch('/api/lead-submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details?.join(' ') || data.error || 'Unable to save your request.');
      setLeadId(data.leadId);
      setLeadCaptured(true);
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.message || 'Unable to save your request.');
    } finally { setSubmittingLead(false); }
  }

  function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setUploadedImage(dataUrl);
    setPreviewImage(null);
    setVideoUrl(null);
  }

  async function generatePreview() {
    if (!uploadedImage) return;
    setProcessing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/smile-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId, imageDataUrl: uploadedImage, intensity }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to generate preview.');
      setPreviewImage(data.previewImageUrl);
      setMessage('Your AI smile preview is ready.');
    } catch (err: any) {
      setMessage(err.message || 'Unable to generate preview.');
    } finally { setProcessing(false); }
  }

  async function generateVideo() {
    if (!previewImage) return;
    setVideoProcessing(true);
    try {
      const res = await fetch('/api/video-create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId, imageUrl: previewImage }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to create video.');
      setVideoUrl(data.assetUrl);
      setMessage(data.note || 'Your animated result is ready.');
    } catch (err: any) {
      setMessage(err.message || 'Unable to create video.');
    } finally { setVideoProcessing(false); }
  }

  return (
    <section id="smile-transform" className="bg-slate-50 py-16 px-4">
      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">
        <div className="bg-white rounded-3xl p-8 shadow-sm border">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm text-sky-700 mb-4"><Sparkles className="w-4 h-4" /> Smile preview workflow</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Upload a photo and preview a healthier smile.</h2>
          <p className="text-slate-600 mb-6">We securely capture your request, create an AI smile preview, and optionally generate an animated result.</p>
          {!leadCaptured ? (
            <form className="space-y-4" onSubmit={submitLead}>
              <div><Label>Full name</Label><Input value={lead.fullName} onChange={(e) => setLead({ ...lead, fullName: e.target.value })} /></div>
              <div className="grid gap-4 md:grid-cols-2"><div><Label>Email</Label><Input type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} /></div><div><Label>Phone</Label><Input value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} /></div></div>
              <div><Label>Interested in</Label><Input placeholder="Veneers, whitening, implants, aligners…" value={lead.interestedIn} onChange={(e) => setLead({ ...lead, interestedIn: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={lead.notes} onChange={(e) => setLead({ ...lead, notes: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={submittingLead}>{submittingLead ? 'Saving request…' : 'Continue to secure upload'}</Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex gap-3"><CheckCircle2 className="text-emerald-600" /><div><p className="font-medium text-emerald-800">Request saved</p><p className="text-sm text-emerald-700">Now upload a smiling or relaxed photo with your teeth visible.</p></div></div>
              <div><Label>Upload photo</Label><div className="mt-2 border-2 border-dashed rounded-2xl p-6 text-center bg-slate-50"><Upload className="mx-auto mb-3 text-slate-400" /><input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />{uploadedImage && <p className="mt-3 text-sm text-slate-600">Image ready for processing.</p>}</div></div>
              <div><Label>Preview style</Label><div className="mt-2 flex gap-2 flex-wrap">{(['subtle','natural','bright'] as const).map((item) => <button type="button" key={item} onClick={() => setIntensity(item)} className={`rounded-full px-4 py-2 text-sm border ${intensity === item ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200'}`}>{item}</button>)}</div></div>
              <div className="flex flex-wrap gap-3"><Button onClick={generatePreview} disabled={!uploadedImage || processing}>{processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating preview…</> : 'Generate smile preview'}</Button><Button variant="outline" onClick={generateVideo} disabled={!previewImage || videoProcessing}>{videoProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Preparing animation…</> : <><Video className="w-4 h-4 mr-2" />Create smile video</>}</Button></div>
            </div>
          )}
          {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border"><h3 className="text-xl font-semibold mb-4">Original upload</h3>{uploadedImage ? <img src={uploadedImage} alt="Original upload" className="w-full rounded-2xl" /> : <div className="aspect-[4/3] rounded-2xl bg-slate-100 grid place-items-center text-slate-400">Your uploaded image will appear here.</div>}</div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border"><h3 className="text-xl font-semibold mb-4">AI preview result</h3>{previewImage ? <img src={previewImage} alt="Smile preview" className="w-full rounded-2xl" /> : <div className="aspect-[4/3] rounded-2xl bg-slate-100 grid place-items-center text-slate-400">Generate a preview to see the transformed result.</div>}{videoUrl && <div className="mt-4"><h4 className="font-medium mb-2">Animated result</h4><img src={videoUrl} alt="Animated smile result" className="w-full rounded-2xl" /></div>}</div>
        </div>
      </div>
    </section>
  );
}
