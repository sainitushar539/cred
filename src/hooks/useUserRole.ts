import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          // If user has admin role, use admin; otherwise client
          const isAdmin = data.some((r: any) => r.role === 'admin');
          setRole(isAdmin ? 'admin' : 'client');
        } else {
          setRole('client');
        }
        setLoading(false);
      });
  }, [user]);

  return { role, isAdmin: role === 'admin', isClient: role === 'client', loading };
};
