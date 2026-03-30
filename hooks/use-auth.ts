import { useEffect, useState, useCallback } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { posthog } from '@/lib/posthog';
import { type Profile } from '@/lib/types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('fetchProfile:', error.message);
      setProfile(null);
      return null;
    }
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const applySession = async (next: Session | null) => {
      if (cancelled) return;
      setLoading(true);
      setSession(next);
      setUser(next?.user ?? null);
      if (next?.user) {
        posthog.identify(next.user.id);
        await fetchProfile(next.user.id);
      } else {
        posthog.reset();
        setProfile(null);
      }
      if (!cancelled) {
        setLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data: { session: initial } }) => {
      if (cancelled) return;
      void applySession(initial);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }
      void (async () => {
        await applySession(nextSession);
      })();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  return {
    session,
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };
}
