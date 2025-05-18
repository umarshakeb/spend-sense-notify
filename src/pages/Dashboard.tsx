import { SpendingSummary } from "@/components/dashboard/SpendingSummary";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { UpcomingRenewals } from "@/components/dashboard/UpcomingRenewals";
import { AiInsights } from "@/components/dashboard/AiInsights";
import { SMSPermissionRequest } from "@/components/dashboard/SMSPermissionRequest";
import { LoanRepaymentCard } from "@/components/dashboard/LoanRepaymentCard";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [smsPermissionAsked, setSmsPermissionAsked] = useState(false);

  useEffect(() => {
    // Check if we've already asked for SMS permission
    const permissionAsked = localStorage.getItem('sms_permission_asked') === 'true';
    setSmsPermissionAsked(permissionAsked);
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">Welcome to SpendSense</CardTitle>
            <CardDescription className="text-lg">
              Track your finances, manage subscriptions and get insights into your spending habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 py-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Track your finances</h3>
                <p className="text-muted-foreground">
                  SpendSense helps you automatically categorize transactions, track spending patterns,
                  and manage your subscriptions all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button onClick={() => navigate('/signin')} size="lg">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/signup')} variant="outline" size="lg">
                    Create Account
                  </Button>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border bg-card shadow">
                <img 
                  src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Finance Management" 
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SMS Import</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Import transactions from SMS and bank notifications
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2" disabled>
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subscription Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get notified before your subscriptions renew
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2" disabled>
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usage Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track how often you use your subscription services
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2" disabled>
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get display name from profile or fallback to email
  const displayName = user.profile?.name || user.email?.split('@')[0] || "User";

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
        <p className="text-muted-foreground">
          Here's your financial overview
        </p>
      </div>
      
      {/* Show SMS permission card if not asked before, or button to re-open if already asked */}
      {!smsPermissionAsked ? (
        <SMSPermissionRequest />
      ) : (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Want to update your transaction data?
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              // Clear the permission asked flag and refresh
              localStorage.removeItem('sms_permission_asked');
              setSmsPermissionAsked(false);
            }}
            className="flex items-center gap-2"
          >
            <MessageSquareText className="h-4 w-4" />
            Re-scan Messages
          </Button>
        </div>
      )}
      
      <LoanRepaymentCard />
      
      <SpendingSummary />
      
      <AiInsights />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Your spending patterns over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <SpendingChart />
            </CardContent>
          </Card>
        </div>
        
        <UpcomingRenewals />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions />
        </CardContent>
      </Card>
    </div>
  );
}
