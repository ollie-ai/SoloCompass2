import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

const OAuthCallback = ({ provider }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthFromToken } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refresh = searchParams.get('refresh');
      const error = searchParams.get('error');
      const code = searchParams.get('code');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/login?error=' + error);
        return;
      }

      if (token && refresh) {
        await setAuthFromToken(token, refresh);
        navigate('/dashboard');
        return;
      }

      if (code) {
        try {
          const response = await fetch(`/api/auth/${provider}/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
          const data = await response.json();
          if (data.token && data.refreshToken) {
            await setAuthFromToken(data.token, data.refreshToken);
            navigate('/dashboard');
            return;
          }
        } catch (err) {
          console.error('Token exchange failed:', err);
        }
      }

      navigate('/login?error=oauth_failed');
    };

    handleCallback();
  }, [searchParams, navigate, setAuthFromToken, provider]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-vibrant mx-auto mb-4" />
        <p className="text-base-content/80 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
