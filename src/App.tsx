
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
import { AuthProvider } from "./hooks/useAuth";
import { SplashScreen } from "./components/mobile/SplashScreen";

const queryClient = new QueryClient();

const App = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running as a mobile app
    const checkPlatform = async () => {
      try {
        // Dynamic import to avoid issues in browsers that don't support Capacitor
        const { Capacitor } = await import('@capacitor/core');
        setIsMobile(Capacitor.isNativePlatform());
      } catch (error) {
        console.log('Not running on Capacitor');
      }
    };

    checkPlatform();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
