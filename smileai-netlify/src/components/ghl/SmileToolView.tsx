import React, { useState } from 'react';
import { Upload, Sparkles, Loader2, AlertCircle, Info } from 'lucide-react';
import { ClinicBranding } from '../../App';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface SmileToolViewProps {
  clinicBranding: ClinicBranding;
}

export function SmileToolView({ clinicBranding }: SmileToolViewProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const primaryColor = clinicBranding.primaryColor;
  const accentColor = clinicBranding.accentColor || clinicBranding.primaryColor;
  const primarySoft = `${primaryColor}14`;
  const primaryBorder = `${primaryColor}30`;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setAiImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSmile = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setAiImage(uploadedImage); // In real app, this would be the AI result
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Smile Transformation Tool</h2>
        <p className="text-sm text-slate-500 mt-0.5">Create AI-enhanced smile previews for your patients</p>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: primarySoft, border: `1px solid ${primaryBorder}` }}>
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
        <div>
          <h4 className="font-medium text-sm mb-0.5" style={{ color: primaryColor }}>How it works</h4>
          <p className="text-sm" style={{ color: primaryColor }}>
            Upload a patient's photo, and our AI will generate a preview of their enhanced smile to visualize potential treatment outcomes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Upload Patient Photo</h3>
          
          {!uploadedImage ? (
            <div
              className="relative border-2 border-dashed rounded-lg transition-all border-slate-200 bg-slate-50/50"
              style={dragActive ? { borderColor: primaryColor, backgroundColor: primarySoft } : undefined}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label className="flex flex-col items-center justify-center py-16 cursor-pointer">
                <Upload className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700 mb-1">Drop photo here or click to upload</p>
                <p className="text-xs text-slate-500 mb-4">Supports JPG, PNG - up to 10MB</p>
                <div className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors" style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}>
                  Browse Files
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full h-72 object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateSmile}
                  disabled={isProcessing}
                  className="flex-1 text-white text-sm h-10"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Preview
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedImage(null);
                    setAiImage(null);
                  }}
                  className="border-slate-200 text-slate-600 text-sm h-10"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Enhanced Smile Preview</h3>
          
          <div 
            className="border rounded-lg overflow-hidden mb-4 border-slate-200"
            style={aiImage ? { borderColor: primaryColor } : undefined}
          >
            {aiImage ? (
              <img
                src={aiImage}
                alt="Enhanced Smile"
                className="w-full h-72 object-cover"
              />
            ) : (
              <div className="w-full h-72 flex flex-col items-center justify-center bg-slate-50">
                <Sparkles className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">Preview will appear here</p>
              </div>
            )}
          </div>

          {aiImage && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button className="flex-1 text-white text-sm h-10" style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}>
                  Save to Record
                </Button>
                <Button variant="outline" className="border-slate-200 text-slate-600 text-sm h-10">
                  Download
                </Button>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-500">
                    This is a visual preview only. Actual results may vary.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Usage Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">89</p>
            <p className="text-xs text-slate-500 mt-0.5">Assessments</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">68%</p>
            <p className="text-xs text-slate-500 mt-0.5">Conversion</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">24</p>
            <p className="text-xs text-slate-500 mt-0.5">This Week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
