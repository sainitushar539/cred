import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ProtectedRoute = ({
  children,
  redirectTo = '/auth',
}: {
  children: ReactNode;
  redirectTo?: string;
}) => {
  const { user, loading } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (loading) {
      setSessionChecked(false);
      setHasSession(false);
      return;
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setHasSession(Boolean(data.session) && !error);
      setSessionChecked(true);
    });

    return () => {
      mounted = false;
    };
  }, [loading, user]);

  if (loading || (!user && !sessionChecked)) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-primary font-mono text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user && !hasSession) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
