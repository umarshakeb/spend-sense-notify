
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SMSPermissionRequest = () => {
  const [hasAskedForPermission, setHasAskedForPermission] = useState(false);
  const navigate = useNavigate();

  const requestSMSPermission = async () => {
    setHasAskedForPermission(true);
    
    try {
      // In a real app with Capacitor, you would use a plugin to request SMS permissions
      // For now, we'll just simulate a successful permission grant
      console.log("Requesting SMS permission");
      
      // Navigate to SMS import page after permission request
      navigate('/sms-import');
    } catch (error) {
      console.error("Error requesting SMS permission:", error);
    }
  };

  return (
    <Card className="border-dashed border-2 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-primary" />
          Setup SMS Transaction Tracking
        </CardTitle>
        <CardDescription>
          Automatically track your expenses by analyzing your bank SMS messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-green-500" />
          <p>
            Your messages are analyzed on your device only and never shared with anyone.
            We only read bank transaction messages to help you track your spending.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={requestSMSPermission}
          className="w-full sm:w-auto"
          disabled={hasAskedForPermission}
        >
          {hasAskedForPermission ? "Permission Requested" : "Allow SMS Access"}
        </Button>
      </CardFooter>
    </Card>
  );
};
