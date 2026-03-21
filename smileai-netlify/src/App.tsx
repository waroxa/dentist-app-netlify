import React, { useEffect, useState } from 'react';
import { Hero } from './components/Hero';
import { SmileTransformationSection } from './components/SmileTransformationSection';
import { PremiumExamples } from './components/PremiumExamples';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { SocialProofNotifications } from './components/SocialProofNotifications';
import { GettingStarted } from './components/docs/GettingStarted';
import { SetupGuide } from './components/docs/SetupGuide';
import { Support } from './components/docs/Support';
import { Privacy } from './components/docs/Privacy';
import { Terms } from './components/docs/Terms';
import { StaffLoginModal } from './components/StaffLoginModal';
import { Button } from './components/ui/button';

export interface ClinicBranding {
  clinicName: string;
  logo?: string;
  primaryColor: string;
  accentColor: string;
  heroImage?: string;
  contactInfo?: { address?: string; phone?: string; email?: string };
  socialMedia?: { facebook?: string; instagram?: string; tiktok?: string; linkedin?: string; youtube?: string };
  testimonials?: Array<{ name: string; location: string; text: string; rating: number; image?: string }>;
}

function AdminArea({ onLogout }: { onLogout: () => void }) {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/oauth/status', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setConnections(data.connections || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">SmileVisionPro AI Admin</h1>
            <p className="text-slate-600">Private integration controls, connection status, and deployment notes.</p>
          </div>
          <Button variant="outline" onClick={onLogout}>Sign out</Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-3">CRM integration</h2>
            <p className="text-sm text-slate-600 mb-4">Connect your private CRM workspace securely through the backend-only OAuth flow.</p>
            <div className="flex gap-3">
              <a href="/api/oauth/start" className="inline-flex rounded-md bg-sky-600 px-4 py-2 text-white">Connect workspace</a>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-3">Connection status</h2>
            {loading ? <p className="text-sm text-slate-500">Loading…</p> : connections.length === 0 ? <p className="text-sm text-slate-500">No active workspace connected yet.</p> : (
              <ul className="space-y-3 text-sm">
                {connections.map((connection) => (
                  <li key={connection.location_id} className="rounded-lg border p-3">
                    <div className="font-medium">Location: {connection.location_id}</div>
                    <div className="text-slate-500">Expires: {connection.expires_at || 'Unknown'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clinicBranding] = useState<ClinicBranding>({
    clinicName: 'SmileVisionPro AI',
    primaryColor: '#0EA5E9',
    accentColor: '#06B6D4',
    contactInfo: { email: 'support@smilevisionpro.ai' },
  });

  const path = window.location.pathname;

  useEffect(() => {
    document.title = 'SmileVisionPro AI';
    fetch('/api/admin/session', { credentials: 'include' }).then((res) => setIsAdmin(res.ok)).catch(() => setIsAdmin(false));
  }, []);

  if (path === '/getting-started') return <GettingStarted />;
  if (path === '/setup-guide') return <SetupGuide />;
  if (path === '/support') return <Support />;
  if (path === '/privacy') return <Privacy />;
  if (path === '/terms') return <Terms />;
  if (path.startsWith('/admin')) return isAdmin ? <AdminArea onLogout={async () => { await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }); window.location.href = '/'; }} /> : <><StaffLoginModal isOpen={true} onClose={() => { window.location.href = '/'; }} onSuccess={() => { setIsAdmin(true); window.location.href = '/admin'; }} /></>;

  return (
    <div className="min-h-screen bg-white">
      <Hero clinicBranding={clinicBranding} />
      <SmileTransformationSection />
      <div id="examples">
        <PremiumExamples />
      </div>
      <HowItWorks />
      <Testimonials clinicBranding={clinicBranding} />
      <Footer clinicBranding={clinicBranding} />
      <SocialProofNotifications />
      <StaffLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); setIsAdmin(true); window.location.href = '/admin'; }} />
    </div>
  );
}

export default App;
