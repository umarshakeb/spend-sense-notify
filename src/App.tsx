
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Transactions from "./pages/Transactions";
import Subscriptions from "./pages/Subscriptions";
import Analytics from "./pages/Analytics";
import SMSImport from "./pages/SMSImport";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ConfirmEmail from "./pages/ConfirmEmail";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { AuthProvider } from "./hooks/useAuth";
import { SplashScreen } from "./components/mobile/SplashScreen";

// Add event interface for TypeScript
declare global {
  interface WindowEventMap {
    'sms_data_updated': Event;
  }
}

// Create a new query client with retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed requests twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  },
});

const App = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running as a mobile app
    const checkPlatform = async () => {
      try {
        // Dynamic import to avoid issues in browsers that don't support Capacitor
        const { Capacitor } = await import('@capacitor/core');
        setIsMobile(Capacitor.isNativePlatform());
        
        // If running on a mobile device, apply additional device-specific settings
        if (Capacitor.isNativePlatform()) {
          try {
            // Import status bar plugin dynamically
            const { StatusBar, Style } = await import('@capacitor/status-bar');
            
            // Set status bar style
            await StatusBar.setStyle({ style: Style.Light });
            
            // Make sure it's visible
            await StatusBar.show();
          } catch (err) {
            console.log('Status bar plugin not available', err);
          }
          
          // Disable viewport zooming on iOS and apply safe area insets
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
          document.getElementsByTagName('head')[0].appendChild(meta);
        }
      } catch (error) {
        console.log('Not running on Capacitor');
      }
    };

    checkPlatform();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="App w-full max-w-full overflow-x-hidden">
          <Toaster />
          <Sonner position="top-center" closeButton={true} richColors={true} />
          {isMobile && <SplashScreen />}
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/sms-import" element={<SMSImport />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/confirm" element={<ConfirmEmail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
