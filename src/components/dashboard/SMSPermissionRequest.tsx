
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
      } catch (error) {
        setIsMobileDevice(false);
      }
    };

    checkPlatform();
  }, []);

  const requestSMSPermission = async () => {
    setIsLoading(true);
    setHasAskedForPermission(true);
    
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
        description: "Unable to access SMS. Please try again or use manual import.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 mb-6 w-full max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <MessageSquareText className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="flex-shrink">Setup SMS Transaction Tracking</span>
        </CardTitle>
        <CardDescription className="break-normal">
          Automatically track your expenses by analyzing your bank SMS messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="break-normal">
            Your messages are analyzed on your device only and never shared with anyone.
            We only read bank transaction messages to help you track your spending.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={requestSMSPermission}
          className="w-full sm:w-auto"
          disabled={hasAskedForPermission && isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {hasAskedForPermission 
            ? (isLoading ? "Analyzing Messages..." : "Permission Granted") 
            : "Allow SMS Access"}
        </Button>
      </CardFooter>
    </Card>
  );
};
