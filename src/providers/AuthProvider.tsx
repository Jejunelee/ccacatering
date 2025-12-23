'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  session: Session | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  session: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to check and update auth state
    const updateAuthState = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          // Check admin status with retry logic
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single<{ role: 'admin' | 'user' }>();
          
          if (error) {
            console.error('Error fetching admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.role === 'admin');
          }
        } catch (error) {
          console.error('Error checking admin:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    // Initial session check with better error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Try to recover by signing out
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        } else {
          await updateAuthState(session);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes with debouncing
    let timeoutId: NodeJS.Timeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth event: ${event}`);
        
        // Debounce rapid state changes
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(async () => {
          await updateAuthState(session);
        }, 100);
      }
    );

    // Handle browser visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became active, check session
        supabase.auth.getSession().then(({ data: { session } }) => {
          updateAuthState(session);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, session }}>
      {children}
    </AuthContext.Provider>
  );
}