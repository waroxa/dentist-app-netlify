import { useEffect, useState } from 'react';
import { Check, Link2, RefreshCw, Shield } from 'lucide-react';
import { Button } from '../ui/button';

interface Connection {
  provider: string;
  location_id: string;
  scope: string;
  expires_at: string;
  is_active: boolean;
  updated_at: string;
}

export function ApiSettingsPanel() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConnections = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/oauth/status', { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load connection status.');
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load connection status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadConnections();
  }, []);

  const activeConnections = connections.filter((connection) => connection.is_active);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">CRM Connection</h3>
        <p className="text-sm text-gray-600">
          Connect through the secure marketplace OAuth flow. API keys and tokens are stored only on the server.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold">No browser-stored credentials</p>
            <p>Use the marketplace connection button below to authorize the CRM workspace.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Loading connection status...
          </div>
        ) : activeConnections.length ? (
          <div className="space-y-3">
            {activeConnections.map((connection) => (
              <div key={`${connection.provider}-${connection.location_id}`} className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                  <Check className="h-4 w-4" />
                  Connected workspace
                </div>
                <p className="mt-2 break-all text-xs text-green-700">Location ID: {connection.location_id}</p>
                <p className="mt-1 text-xs text-green-700">Scopes: {connection.scope || 'default marketplace scopes'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            No active CRM connection found.
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => { window.location.href = '/api/oauth/start'; }} className="bg-blue-600 text-white hover:bg-blue-700">
            <Link2 className="mr-2 h-4 w-4" />
            Connect CRM
          </Button>
          <Button onClick={() => void loadConnections()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
}
