import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh py-12 px-4">
        <div className="max-w-md w-full animate-fade-in text-center glass-card p-10 rounded-xl">
          <div className="w-20 h-20 bg-success/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-base-content mb-4 tracking-tight">Check Your Inbox</h2>
          <p className="text-base-content/60 mb-8 font-medium leading-relaxed">
            If an account exists for <span className="text-base-content font-bold">{email}</span>, you will receive a reset link shortly.
          </p>
          <div className="space-y-4">
            <p className="text-xs text-base-content/40 font-bold uppercase tracking-widest">Didn't get the email?</p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full border-base-300 py-3 font-bold rounded-xl">
              Try Another Email
            </Button>
            <Link to="/login" className="block text-sm font-bold text-brand-vibrant hover:underline mt-4">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh py-12 px-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-base-content mb-2 tracking-tight">Recover Password</h1>
            <p className="text-base-content/60 font-medium">Enter your email and we'll send you a link to reset.</p>
        </div>
        
        <div className="glass-card py-10 px-8 rounded-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-accent/5 rounded-full blur-2xl"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-medium animate-slide-up">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Button type="submit" variant="primary" className="w-full py-4 rounded-xl font-bold btn-premium flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? 'Processing...' : <><Mail size={18} /> Send Reset Link</>}
            </Button>
            
            <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-base-content/60 hover:text-base-content transition-all">
                    <ArrowLeft size={16} /> Back to Sign In
                </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
