import { useEffect, useMemo, useState } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AccessMode = 'loading' | 'login' | 'setup' | 'unavailable';

interface AdminStatusResponse {
  mode?: 'login' | 'setup' | 'unavailable';
  activationEnabled?: boolean;
  error?: string;
  workspaceKey?: string;
}

const initialMessage = 'Use your administrator password to open the private control panel.';

function getWorkspaceKey() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  return (
    params.get('location_id') ||
    params.get('locationId') ||
    sessionStorage.getItem('ghl_current_location_id') ||
    localStorage.getItem('ghl_location_id') ||
    'default'
  );
}

export function StaffLoginModal({ isOpen, onClose, onSuccess }: StaffLoginModalProps) {
  const [accessMode, setAccessMode] = useState<AccessMode>('loading');
  const [statusMessage, setStatusMessage] = useState(initialMessage);
  const [password, setPassword] = useState('');
  const [activationSecret, setActivationSecret] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activationAuthorized, setActivationAuthorized] = useState(false);
  const [workspaceKey, setWorkspaceKey] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const clearForm = () => {
    setPassword('');
    setActivationSecret('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setActivationAuthorized(false);
    setIsLoading(false);
    setError('');
  };

  const loadStatus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const currentWorkspaceKey = getWorkspaceKey();
      setWorkspaceKey(currentWorkspaceKey);
      const res = await fetch(`/api/admin/status?workspaceKey=${encodeURIComponent(currentWorkspaceKey)}`, { credentials: 'include' });
      const data: AdminStatusResponse = await res.json();
      if (data.workspaceKey) setWorkspaceKey(data.workspaceKey);

      if (!res.ok || data.mode === 'unavailable') {
        setAccessMode('unavailable');
        setStatusMessage(data.error || 'Staff access is temporarily unavailable. Please check the workspace configuration and try again.');
        return;
      }

      if (data.mode === 'setup') {
        if (data.activationEnabled) {
          setAccessMode('setup');
          setStatusMessage('First-time staff access must be activated by an authorized workspace administrator.');
        } else {
          setAccessMode('unavailable');
          setStatusMessage('Staff access setup is temporarily unavailable. Please confirm the private workspace configuration.');
        }
        return;
      }

      setAccessMode('login');
      setStatusMessage(initialMessage);
    } catch (err: any) {
      setAccessMode('unavailable');
      setStatusMessage(err?.message || 'Staff access is temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      clearForm();
      setAccessMode('loading');
      setStatusMessage(initialMessage);
      return;
    }
    clearForm();
    setAccessMode('loading');
    setStatusMessage(initialMessage);
    void loadStatus();
  }, [isOpen]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, workspaceKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setAccessMode('setup');
          setStatusMessage('This workspace still needs first-time staff access setup.');
        }
        throw new Error(data.error || 'Login failed.');
      }
      setPassword('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorizeActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/activate-authorize', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationSecret, workspaceKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authorization failed.');
      setActivationAuthorized(true);
      setActivationSecret('');
      setStatusMessage('Authorization confirmed. Create the first staff password to finish setup.');
    } catch (err: any) {
      setError(err.message || 'Authorization failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/activate-complete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, confirmPassword, workspaceKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Setup failed.');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Setup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = useMemo(() => {
    if (accessMode === 'setup') return activationAuthorized ? 'Create staff password' : 'Activate staff access';
    if (accessMode === 'unavailable') return 'Staff access unavailable';
    return 'Private staff access';
  }, [accessMode, activationAuthorized]);

  const icon = useMemo(() => {
    if (accessMode === 'setup') return activationAuthorized ? <ShieldCheck className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />;
    if (accessMode === 'unavailable') return <Wrench className="w-8 h-8 text-white" />;
    return <Lock className="w-8 h-8 text-white" />;
  }, [accessMode, activationAuthorized]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                {icon}
              </div>
              <h2 className="mb-2 text-2xl text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">{statusMessage}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {accessMode === 'loading' && (
              <div className="space-y-3">
                <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
              </div>
            )}

            {accessMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your password"
                      className="h-12 pr-12"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !password}
                  className="h-12 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? 'Authenticating...' : 'Open admin'}
                </Button>
              </form>
            )}

            {accessMode === 'setup' && !activationAuthorized && (
              <form onSubmit={handleAuthorizeActivation} className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                  Enter the private activation code for this workspace to verify authorized access before creating the first staff password.
                </div>
                {workspaceKey !== 'default' && (
                  <p className="text-xs text-gray-500">Workspace ID: {workspaceKey}</p>
                )}
                <p className="text-xs text-gray-500">
                  For workspace installs, use this format: <span className="font-mono">{workspaceKey}:your-setup-secret</span>
                </p>
                <div>
                  <label htmlFor="activationSecret" className="mb-2 block text-sm font-medium text-gray-900">
                    Activation code
                  </label>
                  <div className="relative">
                    <Input
                      id="activationSecret"
                      type={showPassword ? 'text' : 'password'}
                      value={activationSecret}
                      onChange={(e) => {
                        setActivationSecret(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter activation code"
                      className="h-12 pr-12"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !activationSecret}
                  className="h-12 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? 'Verifying...' : 'Verify and continue'}
                </Button>
              </form>
            )}

            {accessMode === 'setup' && activationAuthorized && (
              <form onSubmit={handleCompleteSetup} className="space-y-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Create the first password for private staff access. This password will be required for all future sign-ins.
                </div>
                <div>
                  <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-gray-900">
                    New password
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Create a strong password"
                      className="h-12 pr-12"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Use at least 12 characters with uppercase, lowercase, and a number.
                  </p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-900">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Re-enter the password"
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="h-12 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? 'Saving...' : 'Create password and continue'}
                </Button>
              </form>
            )}

            {accessMode === 'unavailable' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                  Private staff access is currently unavailable because the workspace configuration could not be verified.
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadStatus()}
                  disabled={isLoading}
                  className="h-12 w-full"
                >
                  {isLoading ? 'Checking...' : 'Retry'}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </>
    </AnimatePresence>
  );
}
