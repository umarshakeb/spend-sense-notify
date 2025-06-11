
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PhoneSignupProps {
  onBack: () => void;
}

export default function PhoneSignup({ onBack }: PhoneSignupProps) {
  const { signUp } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState(''); // For demo purposes

  const sendOTP = async () => {
    if (!phoneNumber.startsWith('+')) {
      toast.error("Please enter phone number with country code (e.g., +91...)");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phoneNumber }
      });

      if (error) throw error;

      toast.success("OTP sent successfully!");
      // For demo purposes, show the OTP
      if (data.otp) {
        setDemoOtp(data.otp);
        toast.info(`Demo OTP: ${data.otp}`);
      }
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber, otpCode: otp }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Phone number verified!");
        setStep('details');
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignup = async () => {
    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, name, phoneNumber);
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            {step === 'phone' ? (
              <Phone className="h-6 w-6 text-primary" />
            ) : (
              <Shield className="h-6 w-6 text-primary" />
            )}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          {step === 'phone' && "Enter Phone Number"}
          {step === 'otp' && "Verify OTP"}
          {step === 'details' && "Complete Signup"}
        </CardTitle>
        <CardDescription>
          {step === 'phone' && "We'll send you a verification code"}
          {step === 'otp' && `Enter the 6-digit code sent to ${phoneNumber}`}
          {step === 'details' && "Complete your account setup"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button onClick={sendOTP} className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </Button>
          </>
        )}

        {step === 'otp' && (
          <>
            {demoOtp && (
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-600">Demo OTP: {demoOtp}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <Button onClick={verifyOTP} className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button variant="outline" onClick={() => setStep('phone')} className="w-full">
              Change Phone Number
            </Button>
          </>
        )}

        {step === 'details' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={completeSignup} className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </>
        )}

        <Button variant="ghost" onClick={onBack} className="w-full">
          Back to Login Options
        </Button>
      </CardContent>
    </Card>
  );
}
