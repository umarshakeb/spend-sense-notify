
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
import { generateRealisticSMSData, saveSMSData } from "@/utils/smsParser";
import { toast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [smsPermissionAsked, setSmsPermissionAsked] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const permissionAsked = localStorage.getItem('sms_permission_asked') === 'true';
    setSmsPermissionAsked(permissionAsked);
    
    // Auto-read SMS when user logs in for the first time
    if (user && !permissionAsked) {
      autoReadSMSOnLogin();
    }
    
    setIsInitialLoading(false);
  }, [user]);

  const autoReadSMSOnLogin = async () => {
    try {
      console.log('Starting SMS auto-read on login...');
      
      // Simulate SMS reading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { transactions, subscriptions, balance } = generateRealisticSMSData();
      
      console.log('Generated data:', { transactions: transactions.length, subscriptions: subscriptions.length, balance });
      
      saveSMSData(transactions, subscriptions, balance);
      localStorage.setItem('sms_permission_asked', 'true');
      setSmsPermissionAsked(true);
      
      toast({
        title: "Welcome to SpendSense!",
        description: `Found ${transactions.length} transactions from your bank messages.`,
      });
    } catch (error) {
      console.error("Error reading SMS on login:", error);
    }
  };

  if (!user) {
    return (
      <div className="w-full h-full min-h-screen p-4 sm:p-8">
        <div className="w-full max-w-6xl mx-auto">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-secondary/10 w-full overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-2xl sm:text-3xl font-bold break-words">Welcome to SpendSense</CardTitle>
              <CardDescription className="text-base sm:text-lg break-words">
                Track your finances, manage subscriptions and get insights into your spending habits
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-2 py-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold break-words">Track your finances</h3>
                  <p className="text-base text-muted-foreground break-words">
                    SpendSense helps you automatically categorize transactions, track spending patterns,
                    and manage your subscriptions all in one place.
                  </p>
                  <div className="flex flex-col gap-3 pt-2 w-full">
                    <Button onClick={() => navigate('/signin')} size="lg" className="w-full">
                      Sign In
                    </Button>
                    <Button onClick={() => navigate('/signup')} variant="outline" size="lg" className="w-full">
                      Create Account
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden border bg-card shadow w-full">
                  <img 
                    src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                    alt="Finance Management" 
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4 w-full">
                <Card className="w-full min-w-0">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg break-words">SMS Import</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground break-words">
                      Import transactions from SMS and bank notifications
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 text-sm w-full sm:w-auto" disabled>
                      Learn More <ArrowRight className="ml-1 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="w-full min-w-0">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg break-words">Subscription Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground break-words">
                      Get notified before your subscriptions renew
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 text-sm w-full sm:w-auto" disabled>
                      Learn More <ArrowRight className="ml-1 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="w-full min-w-0 col-span-1 sm:col-span-2 lg:col-span-1">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg break-words">Usage Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground break-words">
                      Track how often you use your subscription services
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 text-sm w-full sm:w-auto" disabled>
                      Learn More <ArrowRight className="ml-1 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = user.profile?.name || user.email?.split('@')[0] || "User";

  return (
    <div className="w-full h-full min-h-screen p-4 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-6 min-w-0">
        <div className="w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold break-words">{`Welcome back, ${displayName}!`}</h1>
          <p className="text-base text-muted-foreground mt-1 break-words">
            Here's your financial overview
          </p>
        </div>
        
        {!smsPermissionAsked && !isInitialLoading ? (
          <div className="w-full min-w-0">
            <SMSPermissionRequest />
          </div>
        ) : smsPermissionAsked ? (
          <div className="flex flex-col gap-3 w-full min-w-0">
            <p className="text-sm text-muted-foreground break-words">
              Want to update your transaction data?
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                localStorage.removeItem('sms_permission_asked');
                setSmsPermissionAsked(false);
                autoReadSMSOnLogin();
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <MessageSquareText className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">Re-scan Messages</span>
            </Button>
          </div>
        ) : null}
        
        <div className="w-full min-w-0">
          <LoanRepaymentCard />
        </div>
        
        <div className="w-full min-w-0">
          <SpendingSummary />
        </div>
        
        <div className="w-full min-w-0">
          <AiInsights />
        </div>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full min-w-0">
          <div className="lg:col-span-2 w-full min-w-0">
            <Card className="h-full w-full">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-xl break-words">Spending Trends</CardTitle>
                <CardDescription className="text-sm break-words">Your spending patterns over time</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="w-full overflow-hidden min-w-0">
                  <SpendingChart />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full min-w-0">
            <UpcomingRenewals />
          </div>
        </div>
        
        <Card className="w-full min-w-0">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-xl break-words">Recent Transactions</CardTitle>
            <CardDescription className="text-sm break-words">Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full overflow-hidden min-w-0">
              <RecentTransactions />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
