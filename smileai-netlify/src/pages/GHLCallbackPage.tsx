// src/pages/GHLCallbackPage.tsx
// Browser landing page when the CRM redirects back after authorization.
// Reads ?code from URL, sends it to our Netlify Function (not directly to the CRM),
// then redirects to the admin panel. client_secret NEVER touches this file.

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function GHLCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Connecting to CRM…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code       = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setStatus('error');
      setMessage(`The CRM returned an error: ${errorParam}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received from the CRM.');
      return;
    }

    // POST code to our Netlify Function – token exchange happens there
    fetch('/api/ghl-refresh'.replace('ghl-refresh', 'ghl-callback'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state: params.get('state') }),
    })
      .then(async (res) => {
        // Netlify function redirects via 302; fetch follows it automatically.
        // If it ended up on /admin/ghl-connect we're done.
        if (res.url.includes('/admin/ghl-connect')) {
          const finalParams = new URL(res.url).searchParams;
          const locationId  = finalParams.get('locationId');
          if (locationId) localStorage.setItem('ghl_connected_location', locationId);
          setStatus('success');
          setMessage('Connected! Redirecting…');
          setTimeout(() => { window.location.href = res.url; }, 1000);
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }

        // Fallback: parse JSON response
        const data = await res.json();
        if (data.locationId) localStorage.setItem('ghl_connected_location', data.locationId);
        setStatus('success');
        setMessage('Connected! Redirecting…');
        setTimeout(() => {
          window.location.href = `/admin/ghl-connect?success=true&locationId=${data.locationId ?? ''}`;
        }, 1000);
      })
      .catch((err) => {
        console.error('CRM callback error:', err);
        setStatus('error');
        setMessage(err.message ?? 'Connection failed. Please try again.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">

        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting to CRM
            </h1>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Connected!</h1>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <a
              href="/admin/ghl-connect"
              className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              ← Back to Settings
            </a>
          </>
        )}

      </div>
    </div>
  );
}
