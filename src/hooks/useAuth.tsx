
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

// Define an extended user type that includes profile data
interface UserWithProfile extends User {
  profile?: {
    name?: string | null;
    avatar_url?: string | null;
  };
}

interface AuthContextType {
  user: UserWithProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, phoneNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Function to update user with profile data
  const updateUserWithProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      return;
    }

    const profile = await fetchProfile(currentUser.id);
    const userWithProfile = {
      ...currentUser,
      profile: profile || {}
    };
    
    setUser(userWithProfile);
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        
        // Handle password recovery flow
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery detected, redirecting to update password');
          navigate('/update-password');
          return;
        }
        
        if (session?.user && event === 'SIGNED_IN') {
          await updateUserWithProfile(session.user);
          toast.success("Successfully signed in!");
          navigate('/');
        } else if (session?.user) {
          await updateUserWithProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          toast.success("Signed out successfully");
          navigate('/signin');
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          await updateUserWithProfile(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with:', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      console.log('Sign in successful');
    } catch (error: any) {
      console.error('Sign in failed:', error);
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string, phoneNumber?: string) => {
    console.log('Attempting to sign up with:', email);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
            phone_number: phoneNumber
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      console.log('Sign up successful');
      toast.success("Account created! Please check your email to verify your account.");
    } catch (error: any) {
      console.error('Sign up failed:', error);
      toast.error(error.message || "Failed to create account");
      throw error;
    }
  };

  const signOut = async () => {
    console.log('Attempting to sign out');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      console.log('Sign out successful');
    } catch (error: any) {
      console.error('Sign out failed:', error);
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
