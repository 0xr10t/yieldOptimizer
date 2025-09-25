import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeylessAuth } from '@/hooks/useKeylessAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleCallback } = useKeylessAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract ID token from URL fragment
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        const idToken = params.get('id_token');

        if (!idToken) {
          throw new Error('No ID token found in callback');
        }

        // Handle the callback
        await handleCallback(idToken);

        // Redirect to dashboard on success
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to home on error
        navigate('/', { replace: true });
      }
    };

    processCallback();
  }, [handleCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border-slate-700/50 text-center">
        <CardContent className="p-8">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader className="w-12 h-12 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Completing Login...</h2>
          <p className="text-slate-300">
            Please wait while we set up your keyless account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
