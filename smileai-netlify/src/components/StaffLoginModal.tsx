import { useState } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface StaffLoginModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; }

export function StaffLoginModal({ isOpen, onClose, onSuccess }: StaffLoginModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      setPassword('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  return <AnimatePresence><><motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" /><div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{opacity:0,scale:.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.95,y:20}} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button><div className="text-center mb-6"><div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-white" /></div><h2 className="text-2xl text-gray-900 mb-2">Private staff access</h2><p className="text-sm text-gray-600">Use your administrator password to open the private control panel.</p></div><form onSubmit={handleSubmit} className="space-y-4"><div><label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">Password</label><div className="relative"><Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Enter your password" className="h-12 pr-12" autoFocus /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div>{error && <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"><AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" /><p className="text-sm text-red-700">{error}</p></motion.div>}<Button type="submit" disabled={isLoading || !password} className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">{isLoading ? 'Authenticating…' : 'Open admin'}</Button></form></motion.div></div></></AnimatePresence>;
}
