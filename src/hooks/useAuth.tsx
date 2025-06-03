
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
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Only true during initial load
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
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user && event === 'SIGNED_IN') {
          // We use setTimeout to prevent deadlocks with Supabase auth
          setTimeout(async () => {
            await updateUserWithProfile(session.user);
            toast.success("Successfully signed in!");
            navigate('/');
          }, 0);
        } else if (session?.user) {
          // Just update the user with profile, but no navigation
          setTimeout(async () => {
            await updateUserWithProfile(session.user);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Handle sign out
          setTimeout(() => {
            setUser(null);
            toast.success("Signed out successfully");
            navigate('/signin');
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        await updateUserWithProfile(session.user);
      }
      
      setIsLoading(false); // Set to false after initial check
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: name || email.split("@")[0]
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Account created! Please check your email to verify your account.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
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
