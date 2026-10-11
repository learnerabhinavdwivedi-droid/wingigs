'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../data/remote/supabase';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: any | null;
  loading: boolean;
  isSupabaseConnected: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInGuest: (displayName?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isSupabaseConnected: false,
  signInWithPassword: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  signInGuest: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      // 1. Check real Supabase Auth session if configured
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data?.session?.user && mounted) {
            setSession(data.session);
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              displayName: data.session.user.user_metadata?.display_name || data.session.user.email?.split('@')[0],
              avatarUrl: data.session.user.user_metadata?.avatar_url,
              isAnonymous: false,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth session check failed, falling back to local vault:', err);
        }
      }

      // 2. Check local persistent athlete profile/session in localStorage
      if (typeof window !== 'undefined') {
        const localUserJson = localStorage.getItem('bahar_auth_user');
        if (localUserJson) {
          try {
            const parsed = JSON.parse(localUserJson);
            if (parsed && parsed.email && mounted) {
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {
            // invalid json, ignore
          }
        }
      }

      if (mounted) setLoading(false);
    }

    initializeAuth();

    // 3. Listen to Supabase auth state change if configured
    let authListener: any = null;
    if (isSupabaseConfigured) {
      try {
        const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
          if (!mounted) return;
          setSession(newSession);
          if (newSession?.user) {
            setUser({
              id: newSession.user.id,
              email: newSession.user.email || '',
              displayName: newSession.user.user_metadata?.display_name || newSession.user.email?.split('@')[0],
              avatarUrl: newSession.user.user_metadata?.avatar_url,
              isAnonymous: false,
            });
          } else {
            // User logged out from Supabase
            const localUserJson = localStorage.getItem('bahar_auth_user');
            if (localUserJson) {
              try {
                setUser(JSON.parse(localUserJson));
              } catch {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
        });
        authListener = data.subscription;
      } catch (err) {
        console.warn('Supabase auth listener subscription error:', err);
      }
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return { success: false, error: 'Email is required' };
    if (!password) return { success: false, error: 'Password is required' };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const u: AuthUser = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            displayName: data.user.user_metadata?.display_name || trimmedEmail.split('@')[0],
            avatarUrl: data.user.user_metadata?.avatar_url,
            isAnonymous: false,
          };
          setUser(u);
          localStorage.setItem('bahar_auth_user', JSON.stringify(u));
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Authentication error' };
      }
    }

    // Local / Offline Athlete Authentication fallback
    const localUser: AuthUser = {
      id: `local_${Date.now()}`,
      email: trimmedEmail,
      displayName: trimmedEmail.split('@')[0],
      isAnonymous: false,
    };
    setUser(localUser);
    localStorage.setItem('bahar_auth_user', JSON.stringify(localUser));
    return { success: true };
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return { success: false, error: 'Email is required' };
    if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              display_name: displayName || trimmedEmail.split('@')[0],
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const u: AuthUser = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            displayName: displayName || trimmedEmail.split('@')[0],
            avatarUrl: data.user.user_metadata?.avatar_url,
            isAnonymous: false,
          };
          setUser(u);
          localStorage.setItem('bahar_auth_user', JSON.stringify(u));
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Sign up error' };
      }
    }

    // Local / Offline Athlete registration fallback
    const localUser: AuthUser = {
      id: `local_${Date.now()}`,
      email: trimmedEmail,
      displayName: displayName || trimmedEmail.split('@')[0],
      isAnonymous: false,
    };
    setUser(localUser);
    localStorage.setItem('bahar_auth_user', JSON.stringify(localUser));
    return { success: true };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error during Supabase signout:', err);
      }
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('bahar_auth_user');
  };

  const signInGuest = (displayName?: string) => {
    const guestUser: AuthUser = {
      id: `guest_${Date.now()}`,
      email: 'athlete@local.court',
      displayName: displayName || 'Court Athlete',
      isAnonymous: true,
    };
    setUser(guestUser);
    localStorage.setItem('bahar_auth_user', JSON.stringify(guestUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSupabaseConnected: isSupabaseConfigured,
        signInWithPassword,
        signUp,
        signOut,
        signInGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
