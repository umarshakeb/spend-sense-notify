
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, BookOpen, Music, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface Subscription {
  id: string;
  title: string;
  name: string;
  amount: number;
  price: number;
  renewalDate: string;
  renewal_date: string;
  icon: any;
  daysLeft: number;
  usage: {
    hours: number;
    maxHours: number;
    percentage: number;
  };
  usage_hours: number;
  max_hours: number;
  notifications_enabled: boolean;
  category: string;
}

// Map categories to icons
const categoryIcons: Record<string, any> = {
  "Entertainment": Film,
  "Education": BookOpen,
  "Music": Music,
};

export function UpcomingRenewals() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('renewal_date', { ascending: true })
          .limit(3);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedSubscriptions = data.map(sub => {
            const renewalDate = new Date(sub.renewal_date);
            const today = new Date();
            const daysLeft = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Calculate usage percentage
            const usagePercentage = sub.max_hours > 0 ? (sub.usage_hours / sub.max_hours) * 100 : 0;
            
            return {
              id: sub.id,
              title: sub.name,
              name: sub.name,
              amount: sub.price,
              price: sub.price,
              renewalDate: new Date(sub.renewal_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              renewal_date: sub.renewal_date,
              icon: categoryIcons[sub.category] || Film,
              daysLeft,
              usage: {
                hours: sub.usage_hours || 0,
                maxHours: sub.max_hours || 0,
                percentage: usagePercentage,
              },
              usage_hours: sub.usage_hours,
              max_hours: sub.max_hours,
              notifications_enabled: sub.notifications_enabled,
              category: sub.category
            };
          });
          
          setSubscriptions(formattedSubscriptions);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [user]);

  const handleCancelClick = async (subscription: Subscription) => {
    try {
      // In a real app, you might not actually delete the subscription
      // but just mark it as cancelled
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscription.id);
      
      if (error) {
        throw error;
      }
      
      // Remove from local state
      setSubscriptions(subscriptions.filter(s => s.id !== subscription.id));
      
      toast({
        title: "Marked for cancellation",
        description: `${subscription.name} will be canceled before the next renewal.`,
      });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleNotifications = async (subscription: Subscription) => {
    try {
      const newNotificationStatus = !subscription.notifications_enabled;
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ notifications_enabled: newNotificationStatus })
        .eq('id', subscription.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSubscriptions(subscriptions.map(s => 
        s.id === subscription.id 
          ? { ...s, notifications_enabled: newNotificationStatus } 
          : s
      ));
      
      toast({
        title: newNotificationStatus ? "Notifications Enabled" : "Notifications Disabled",
        description: `You will ${newNotificationStatus ? 'now' : 'no longer'} receive renewal notifications for ${subscription.name}.`,
      });
    } catch (error) {
      console.error("Error updating subscription notifications:", error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center">
          <div className="flex-1">
            <CardTitle>Upcoming Renewals</CardTitle>
          </div>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 rounded-full mr-2" />
                  <Skeleton className="h-4 w-32 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center text-sm">
                  <Skeleton className="h-3 w-40 flex-1" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <Skeleton className="h-2 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                  <Skeleton className="h-1.5 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Upcoming Renewals</CardTitle>
        </div>
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {subscriptions.length > 0 ? (
            subscriptions.map((subscription) => {
              const IconComponent = subscription.icon;
              const lowUsage = subscription.usage.percentage < 30;
              
              return (
                <div key={subscription.id} className="space-y-2">
                  <div className="flex items-center">
                    <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex-1 font-medium">{subscription.name}</div>
                    <Badge variant={subscription.daysLeft <= 3 ? "destructive" : "outline"}>
                      {subscription.daysLeft} days
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="flex-1 text-muted-foreground">
                      ${subscription.price}/month · Renews {subscription.renewalDate}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleCancelClick(subscription)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Usage this month</span>
                      <span>
                        {subscription.usage.hours} hours
                        {lowUsage && (
                          <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">
                            Low usage
                          </Badge>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          lowUsage ? "bg-amber-500" : "bg-primary"
                        }`} 
                        style={{ width: `${subscription.usage.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No upcoming renewals found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
