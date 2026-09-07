import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type UserRole = 'buyer' | 'supplier' | 'admin';

const ROLE_PRIORITY: UserRole[] = ['admin', 'supplier', 'buyer'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  allRoles: UserRole[];
  loading: boolean;
  rolesLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [allRoles, setAllRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  // Tracks whether the user_roles fetch is in flight, distinct from
  // allRoles.length === 0 (which is ALSO true once a genuinely-roleless
  // account's fetch completes). Without this, ProtectedRoute couldn't tell
  // "still loading" apart from "loaded and empty" and would spin forever.
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    // Supabase fires onAuthStateChange (e.g. TOKEN_REFRESHED) whenever a tab
    // regains focus, even when it's the same user with an already-known
    // role. Only re-fetch (and only flip rolesLoading, which ProtectedRoute
    // uses to swap children for a spinner -- unmounting the page and
    // wiping any in-progress form state) when the signed-in user actually
    // changes, not on every routine token refresh.
    let lastUserId: string | null = null;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        const newUserId = session?.user?.id ?? null;
        if (newUserId === lastUserId) return;
        lastUserId = newUserId;

        // Defer role fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setRolesLoading(true);
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setAllRoles([]);
          setRolesLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      lastUserId = session?.user?.id ?? null;
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRolesLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      if (!data || data.length === 0) {
        setUserRole(null);
        setAllRoles([]);
        return;
      }

      // Get all roles
      const roles = data.map(r => r.role as UserRole);
      setAllRoles(roles);

      // Determine primary role based on priority (admin > supplier > buyer)
      const primaryRole = ROLE_PRIORITY.find(role => roles.includes(role)) ?? null;
      setUserRole(primaryRole);
    } catch (err) {
      console.error('Error fetching user roles:', err);
    } finally {
      setRolesLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        return { error };
      }

      // Insert user role
      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role });

        if (roleError) {
          console.error('Error inserting user role:', roleError);
          return { error: roleError };
        }

        // If supplier, create initial supplier profile
        if (role === 'supplier') {
          const { error: supplierError } = await supabase
            .from('supplier_profiles')
            .insert({ 
              user_id: data.user.id, 
              company_name: fullName + "'s Business"
            });

          if (supplierError) {
            console.error('Error creating supplier profile:', supplierError);
          }
        }

        // Immediately set the role after signup (don't wait for auth state change)
        setAllRoles([role]);
        setUserRole(role);
        setRolesLoading(false);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setAllRoles([]);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, allRoles, loading, rolesLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
