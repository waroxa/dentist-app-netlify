import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Shield, CheckCircle, TrendingUp, Upload, 
  FileImage, Brain, Activity, ExternalLink 
} from 'lucide-react';
import { Button } from '../ui/button';
import { EmbeddedAppLayout } from './EmbeddedAppLayout';

/**
 * SmileVisionMarketplaceApp - Premium SaaS interface for GoHighLevel marketplace
 * Mobile-first (390x844), designed for iframe embedding
 */
export function SmileVisionMarketplaceApp() {
  const [isInstalled, setIsInstalled] = useState(false);

  return (
    <EmbeddedAppLayout maxWidth="full">
      <div className="min-h-screen bg-slate-50" style={{ maxWidth: '100vw', overflow: 'hidden' }}>
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-semibold text-slate-900 truncate leading-tight">
                  SmileVisionPro AI
                </h1>
                <p className="text-xs text-slate-500 truncate leading-tight">
                  AI-Powered Dental Suite
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-5">
          <AnimatePresence mode="wait">
            {!isInstalled ? (
              <NotInstalledState onInstall={() => setIsInstalled(true)} />
            ) : (
              <InstalledState />
            )}
          </AnimatePresence>
        </main>
      </div>
    </EmbeddedAppLayout>
  );
}

/**
 * STATE 1: Not Installed - Connection prompt
 */
function NotInstalledState({ onInstall }: { onInstall: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-md mx-auto"
    >
      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Visual Header */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 px-5 py-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl mb-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            Connect SmileVisionPro AI
          </h2>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-5">
          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            Enable AI-powered dental imaging analysis and visual case insights directly inside your CRM workspace.
          </p>

          {/* Features */}
          <div className="space-y-2.5">
            <FeatureItem 
              icon={<FileImage className="w-3.5 h-3.5" />}
              text="Advanced dental image analysis"
            />
            <FeatureItem 
              icon={<Brain className="w-3.5 h-3.5" />}
              text="AI-powered diagnostic insights"
            />
            <FeatureItem 
              icon={<Activity className="w-3.5 h-3.5" />}
              text="Real-time confidence scoring"
            />
            <FeatureItem 
              icon={<Shield className="w-3.5 h-3.5" />}
              text="Privacy-focused handling"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Button
              onClick={onInstall}
              className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg shadow-sm text-sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Connect / Install App
            </Button>

            <button className="w-full text-sm text-cyan-600 hover:text-cyan-700 font-medium py-1.5 flex items-center justify-center gap-1.5">
              Learn More
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-2 pt-1">
            <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Secure OAuth connection - No data stored without consent
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoCard
          icon={<TrendingUp className="w-4 h-4 text-cyan-600" />}
          title="98.5%"
          subtitle="AI Accuracy"
        />
        <InfoCard
          icon={<Activity className="w-4 h-4 text-cyan-600" />}
          title="< 2 sec"
          subtitle="Analysis Time"
        />
      </div>
    </motion.div>
  );
}

/**
 * STATE 2: Installed - Dashboard view
 */
function InstalledState() {
  const [selectedTab, setSelectedTab] = useState<'upload' | 'recent'>('upload');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-md mx-auto space-y-4"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <MetricCard
          value="12"
          label="Today"
          trend="+3"
          color="text-cyan-700"
        />
        <MetricCard
          value="847"
          label="Total"
          trend="+24"
          color="text-cyan-700"
        />
        <MetricCard
          value="96.2%"
          label="Confidence"
          trend="+1.2%"
          color="text-emerald-600"
        />
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex">
            <TabButton
              active={selectedTab === 'upload'}
              onClick={() => setSelectedTab('upload')}
              icon={<Upload className="w-4 h-4" />}
              label="Upload"
            />
            <TabButton
              active={selectedTab === 'recent'}
              onClick={() => setSelectedTab('recent')}
              icon={<FileImage className="w-4 h-4" />}
              label="Recent"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 py-5">
          <AnimatePresence mode="wait">
            {selectedTab === 'upload' ? (
              <UploadTab key="upload" />
            ) : (
              <RecentTab key="recent" />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Insights Summary */}
      <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-4 border border-cyan-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-cyan-100">
            <Brain className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
              AI Insights
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Last 7 days: 94% high confidence. Top: Caries (32%), Calculus (28%).
            </p>
            <button className="text-xs font-medium text-cyan-600 hover:text-cyan-700">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Upload Tab Content
 */
function UploadTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Upload Area */}
      <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-cyan-400 hover:bg-cyan-50/30 transition-colors cursor-pointer">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full mb-2">
          <Upload className="w-5 h-5 text-slate-500" />
        </div>
        <h3 className="text-sm font-medium text-slate-900 mb-0.5">
          Upload Dental Image
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Drop file here or click to browse
        </p>
        <Button
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs h-8 px-4"
        >
          Select File
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          <QuickActionButton
            icon={<FileImage className="w-4 h-4" />}
            label="X-Ray Analysis"
          />
          <QuickActionButton
            icon={<Activity className="w-4 h-4" />}
            label="Smile Assessment"
          />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Recent Tab Content
 */
function RecentTab() {
  const analyses = [
    { id: 1, patient: 'Patient #A8472', date: '2 hours ago', confidence: 98, status: 'Complete' },
    { id: 2, patient: 'Patient #B2193', date: '5 hours ago', confidence: 94, status: 'Complete' },
    { id: 3, patient: 'Patient #C7841', date: 'Yesterday', confidence: 96, status: 'Complete' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {analyses.map((analysis) => (
        <AnalysisCard key={analysis.id} {...analysis} />
      ))}
    </motion.div>
  );
}

/* ============================================
   COMPONENT LIBRARY
   ============================================ */

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-cyan-50 flex items-center justify-center text-cyan-600">
        {icon}
      </div>
      <span className="text-sm text-slate-700">{text}</span>
    </div>
  );
}

function InfoCard({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-slate-200 text-center shadow-sm">
      <div className="inline-flex items-center justify-center mb-1.5">
        {icon}
      </div>
      <div className="text-base font-bold text-slate-900">{title}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

function MetricCard({ value, label, trend, color }: { value: string; label: string; trend: string; color: string }) {
  return (
    <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
      <div className={`text-base font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      <div className="text-xs font-medium text-emerald-600 mt-0.5">{trend}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-medium text-sm transition-colors border-b-2
        ${active 
          ? 'bg-white text-cyan-700 border-cyan-600' 
          : 'text-slate-500 hover:text-slate-700 border-transparent'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function QuickActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100">
      <div className="text-cyan-600">
        {icon}
      </div>
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </button>
  );
}

function AnalysisCard({ patient, date, confidence, status }: { patient: string; date: string; confidence: number; status: string }) {
  return (
    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100">
      <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
        <FileImage className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900">{patient}</div>
        <div className="text-xs text-slate-500">{date}</div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-sm font-bold text-cyan-700">{confidence}%</div>
        <div className="text-xs text-slate-500">{status}</div>
      </div>
    </div>
  );
}
