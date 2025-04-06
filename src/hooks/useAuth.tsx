
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored JWT token and user data
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        // Invalid stored user data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    }
    
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API call for authentication
      // In a real app, this would be an actual API call to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo authentication - this should be replaced with actual backend authentication
      if (email && password) {
        // Mock successful authentication
        const userData: User = {
          id: "user-123",
          email,
          name: email.split("@")[0]
        };
        
        // Store token and user data
        const mockToken = "mock-jwt-token-" + Math.random().toString(36).substring(2);
        localStorage.setItem("auth_token", mockToken);
        localStorage.setItem("user_data", JSON.stringify(userData));
        
        setUser(userData);
        toast.success("Successfully signed in!");
        navigate('/');
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API call for registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password) {
        // Mock successful registration
        const userData: User = {
          id: "user-" + Math.random().toString(36).substring(2),
          email,
          name: name || email.split("@")[0]
        };
        
        // Store token and user data
        const mockToken = "mock-jwt-token-" + Math.random().toString(36).substring(2);
        localStorage.setItem("auth_token", mockToken);
        localStorage.setItem("user_data", JSON.stringify(userData));
        
        setUser(userData);
        toast.success("Account created successfully!");
        navigate('/');
      } else {
        throw new Error("Please provide valid email and password");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
    toast.success("Signed out successfully");
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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
