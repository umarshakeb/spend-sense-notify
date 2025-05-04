
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Film, BookOpen, Music, BellRing, BellOff, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";

interface Subscription {
  id: string;
  name: string;
  price: number;
  renewalDate: string;
  renewal_date: string;
  category: string;
  usageHours: number;
  usage_hours: number;
  maxHours: number;
  max_hours: number;
  icon: any;
  daysRemaining: number;
  notificationsEnabled: boolean;
  notifications_enabled: boolean;
}

// Map categories to icons
const categoryIcons: Record<string, any> = {
  "Entertainment": Film,
  "Education": BookOpen,
  "Music": Music,
};

export default function Subscriptions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeTab, setActiveTab] = useState("entertainment");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('renewal_date', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedSubscriptions = data.map(sub => {
            const renewalDate = new Date(sub.renewal_date);
            const today = new Date();
            const daysRemaining = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              id: sub.id,
              name: sub.name,
              price: sub.price,
              renewalDate: new Date(sub.renewal_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              renewal_date: sub.renewal_date,
              category: sub.category,
              usageHours: sub.usage_hours || 0,
              usage_hours: sub.usage_hours || 0,
              maxHours: sub.max_hours || 0,
              max_hours: sub.max_hours || 0,
              icon: categoryIcons[sub.category] || Film,
              daysRemaining,
              notificationsEnabled: sub.notifications_enabled,
              notifications_enabled: sub.notifications_enabled
            };
          });
          
          setSubscriptions(formattedSubscriptions);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        toast({
          title: "Error",
          description: "Failed to load subscriptions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [user, toast]);

  const handleNotificationToggle = async (subscription: Subscription) => {
    try {
      const newStatus = !subscription.notificationsEnabled;
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ notifications_enabled: newStatus })
        .eq('id', subscription.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSubscriptions(subscriptions.map(s => 
        s.id === subscription.id 
          ? { ...s, notificationsEnabled: newStatus, notifications_enabled: newStatus } 
          : s
      ));
      
      toast({
        title: newStatus ? "Notifications Enabled" : "Notifications Disabled",
        description: `You will ${newStatus ? 'now' : 'no longer'} receive renewal notifications for ${subscription.name}.`,
      });
    } catch (error: any) {
      console.error("Error updating notifications:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings",
        variant: "destructive"
      });
    }
  };

  const handleCancelSubscription = async (subscription: Subscription) => {
    try {
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
        title: "Marked for Cancellation",
        description: `${subscription.name} has been marked for cancellation before the next renewal.`,
      });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  };

  // Filter subscriptions by category
  const entertainmentSubscriptions = subscriptions.filter(
    sub => ["Entertainment", "Music", "Streaming"].includes(sub.category)
  );
  
  const educationSubscriptions = subscriptions.filter(
    sub => ["Education", "Learning", "Books"].includes(sub.category)
  );

  const renderSubscriptionCard = (subscription: Subscription) => {
    const IconComponent = subscription.icon;
    const usagePercentage = (subscription.usageHours / subscription.maxHours) * 100 || 0;

    return (
      <Card key={subscription.id} className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{subscription.name}</CardTitle>
              {subscription.daysRemaining <= 3 && (
                <Badge variant="destructive">Renews soon</Badge>
              )}
            </div>
            <CardDescription>
              ${subscription.price}/month · Renews {subscription.renewalDate}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNotificationToggle(subscription)}
          >
            {subscription.notificationsEnabled ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usage this month</span>
              <span>{subscription.usageHours} hrs / {subscription.maxHours} hrs</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm">View Details</Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleCancelSubscription(subscription)}
          >
            Cancel Subscription
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground">
              Track and manage your subscriptions
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        <Tabs defaultValue="entertainment" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>
          <TabsContent value="entertainment" className="mt-6">
            {isLoading ? (
              <div className="text-center py-10">Loading subscriptions...</div>
            ) : entertainmentSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {entertainmentSubscriptions.map(renderSubscriptionCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No entertainment subscriptions found.</p>
                <Button className="mt-4">Add Entertainment Subscription</Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="education" className="mt-6">
            {isLoading ? (
              <div className="text-center py-10">Loading subscriptions...</div>
            ) : educationSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {educationSubscriptions.map(renderSubscriptionCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No education subscriptions found.</p>
                <Button className="mt-4">Add Education Subscription</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
