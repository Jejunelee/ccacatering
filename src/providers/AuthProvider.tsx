'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setIsLoading(false);
          return;
        }

        // 2. Set user immediately
        setUser(session?.user ?? null);

        // 3. Check admin status if user exists
        if (session?.user) {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single<{ role: 'admin' | 'user' }>();
          
          if (!mounted) return;
          
          if (profileError) {
            console.error('Profile fetch error:', profileError);
            // Even if profile fetch fails, we have a valid session
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.role === 'admin');
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Run initial auth setup
    initializeAuth();

    // 4. Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        // Update user state
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile for admin check
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single<{ role: 'admin' | 'user' }>();
          
          if (error) {
            console.error('Profile fetch error on auth change:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.role === 'admin');
          }
        } else {
          setIsAdmin(false);
        }
        
        // Note: We don't set isLoading here to avoid UI flickering
        // Loading is only controlled by the initial check
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);