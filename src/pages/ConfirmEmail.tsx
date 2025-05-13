
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ConfirmEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirmEmail = async () => {
      // Get type and token from URL query parameters
      const params = new URLSearchParams(location.search);
      const type = params.get("type");
      const token = params.get("token");

      if (!type || !token) {
        setStatus("error");
        return;
      }

      try {
        // Process the confirmation with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          console.error("Verification error:", error);
          setStatus("error");
        } else {
          setStatus("success");
          // Automatically navigate to sign-in after 3 seconds on success
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        }
      } catch (err) {
        console.error("Verification exception:", err);
        setStatus("error");
      }
    };

    confirmEmail();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              {status === "loading" && (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
              {status === "success" && <CheckCircle className="h-6 w-6 text-primary" />}
              {status === "error" && <XCircle className="h-6 w-6 text-destructive" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your email address."}
            {status === "success" && "Your email has been successfully verified. You can now sign in."}
            {status === "error" && "We couldn't verify your email. The link may be invalid or expired."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <div className="text-center text-sm text-muted-foreground">
              Redirecting you to the sign in page in a few seconds...
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate("/signin")}
            variant={status === "success" ? "default" : "outline"}
          >
            Go to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
