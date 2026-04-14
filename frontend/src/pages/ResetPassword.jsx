import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', { token, password });
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired reset token');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh py-12 px-4">
        <div className="max-w-md w-full animate-fade-in text-center glass-card p-10 rounded-xl">
          <div className="w-20 h-20 bg-success/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-base-content mb-4 tracking-tight">Access Restored</h2>
          <p className="text-base-content/60 mb-8 font-medium leading-relaxed">
            Your password has been reset successfully. You can now securely sign in to your SoloCompass account.
          </p>
          <Link to="/login">
            <Button variant="primary" className="w-full py-4 rounded-xl font-bold btn-premium flex items-center justify-center gap-2">
              Sign In to Account <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh py-12 px-4 shadow-2xl">
      <div className="max-w-md w-full animate-fade-in relative z-10">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-base-content mb-2 tracking-tight">Create New Password</h1>
            <p className="text-base-content/60 font-medium">Please enter and confirm your new solo-explorer password.</p>
        </div>
        
        <div className="glass-card py-10 px-8 rounded-xl relative overflow-hidden">
          {!token && (
            <div className="bg-orange-50 border border-orange-100 text-orange-600 px-4 py-3 rounded-xl text-sm font-medium mb-6">
              Missing reset token. Please check the link in your email.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-medium animate-slide-up">
                {error}
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" variant="primary" className="w-full py-4 rounded-xl font-bold btn-premium flex items-center justify-center gap-2" disabled={isLoading || !token}>
              {isLoading ? 'Resetting...' : <><Lock size={18} /> Confirm Password Change</>}
            </Button>
            
            <div className="text-center font-black text-[10px] text-base-content/40 uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-brand-vibrant" /> Secured by SoloCompass Cryptography
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
