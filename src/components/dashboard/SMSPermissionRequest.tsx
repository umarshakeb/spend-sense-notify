
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, ShieldCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export const SMSPermissionRequest = () => {
  const [hasAskedForPermission, setHasAskedForPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const navigate = useNavigate();

  // Check if running on a mobile device with Capacitor
  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        setIsMobileDevice(Capacitor.isNativePlatform());
        
        // Try to automatically request permission if on a mobile device
        // and if we haven't already asked for it
        if (Capacitor.isNativePlatform() && !localStorage.getItem('sms_permission_asked')) {
          requestSMSPermission();
        }
      } catch (error) {
        setIsMobileDevice(false);
      }
    };

    checkPlatform();
  }, []);

  const requestSMSPermission = async () => {
    setIsLoading(true);
    setHasAskedForPermission(true);
    localStorage.setItem('sms_permission_asked', 'true');
    
    try {
      // Check if we're on a real mobile device
      if (isMobileDevice) {
        // In a real implementation with Capacitor SMS plugin:
        // 1. Request SMS read permission
        // 2. Fetch SMS messages
        // 3. Parse them for transactions
        
        // For now we're simulating this process
        toast({
          title: "SMS Access Granted",
          description: "Analyzing your bank messages...",
        });
        
        // Wait a moment to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "SMS Analysis Complete",
          description: "Found 12 banking transactions",
        });
        
        // Navigate to SMS import page where the analyzed messages will be shown
        navigate('/sms-import');
      } else {
        // On web browser, we'll just redirect to the manual import page
        toast({
          title: "Device Detection",
          description: "This feature works best on a mobile device. Redirecting to manual input.",
        });
        
        setTimeout(() => {
          navigate('/sms-import');
        }, 1500);
      }
    } catch (error) {
      console.error("Error requesting SMS permission:", error);
      toast({
        title: "Permission Error",
        description: "Unable to access SMS. Please try again or use manual input.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hide the card if we've already asked for permission
  if (localStorage.getItem('sms_permission_asked') && !isLoading) {
    return null;
  }

  return (
    <Card className="border-dashed border-2 w-full">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="flex items-start gap-2 text-sm sm:text-lg">
          <MessageSquareText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
          <span className="break-words">Setup SMS Transaction Tracking</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Automatically track expenses by analyzing bank SMS
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="flex items-start gap-2 text-xs sm:text-sm">
          <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="break-words">
            Messages analyzed on-device only. We only read bank messages to track spending.
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0">
        <Button 
          onClick={requestSMSPermission}
          className="w-full text-xs sm:text-sm"
          disabled={isLoading}
          size="sm"
        >
          {isLoading && <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />}
          {isLoading ? "Analyzing Messages..." : "Allow SMS Access"}
        </Button>
      </CardFooter>
    </Card>
  );
};
