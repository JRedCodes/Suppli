/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; success?: boolean; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Handle email confirmation
      if (event === 'SIGNED_IN' && nextSession) {
        // User confirmed their email and signed in
        setSession(nextSession);
        setUser(nextSession.user);
      } else if (event === 'TOKEN_REFRESHED' && nextSession) {
        // Session refreshed
        setSession(nextSession);
        setUser(nextSession.user);
      } else {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Provide more helpful error messages
      let errorMessage = error.message;
      
      // Check for specific error codes
      if (error.status === 400) {
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          errorMessage = 'Please confirm your email address before signing in. Check your inbox for the confirmation link.';
        }
      } else if (error.status === 429 || error.message.includes('rate limit')) {
        errorMessage = 'Too many sign-in attempts. Please wait a few minutes and try again.';
      }
      
      // Log error for debugging (remove in production)
      console.error('Sign-in error:', {
        message: error.message,
        status: error.status,
        originalError: error,
      });
      
      return { error: errorMessage };
    }
    
    // If successful, the session should be set automatically via onAuthStateChange
    // But we can verify it here
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      console.log('Sign-in successful:', { userId: data.session.user.id, email: data.session.user.email });
    } else {
      console.warn('Sign-in succeeded but no session returned');
    }
    
    return {};
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return {
        success: true,
        message: 'Please check your email to confirm your account. Click the confirmation link in the email to complete signup.',
      };
    }

    // If session exists, email confirmation might be disabled
    if (data.session) {
      return { success: true, message: 'Account created successfully!' };
    }

    return { success: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
