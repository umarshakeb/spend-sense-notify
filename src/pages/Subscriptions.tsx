
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Film, BookOpen, Music, BellRing, BellOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Sample data
const ottSubscriptions = [
  {
    id: "netflix",
    name: "Netflix",
    price: 14.99,
    renewalDate: "Apr 9, 2025",
    category: "Entertainment",
    usageHours: 26,
    maxHours: 50,
    icon: Film,
    daysRemaining: 3,
    notificationsEnabled: true,
  },
  {
    id: "spotify",
    name: "Spotify",
    price: 9.99,
    renewalDate: "Apr 8, 2025",
    category: "Music",
    usageHours: 18,
    maxHours: 30,
    icon: Music,
    daysRemaining: 2,
    notificationsEnabled: true,
  },
];

const eduSubscriptions = [
  {
    id: "coursera",
    name: "Coursera",
    price: 29.99,
    renewalDate: "Apr 10, 2025",
    category: "Education",
    usageHours: 4,
    maxHours: 20,
    icon: BookOpen,
    daysRemaining: 4,
    notificationsEnabled: true,
  },
  {
    id: "skillshare",
    name: "Skillshare",
    price: 19.99,
    renewalDate: "Apr 15, 2025",
    category: "Education",
    usageHours: 2,
    maxHours: 20,
    icon: BookOpen,
    daysRemaining: 9,
    notificationsEnabled: false,
  },
];

export default function Subscriptions() {
  const { toast } = useToast();

  const handleNotificationToggle = (subscription: { name: string, notificationsEnabled: boolean }) => {
    toast({
      title: subscription.notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled",
      description: `You will ${subscription.notificationsEnabled ? 'no longer' : 'now'} receive renewal notifications for ${subscription.name}.`,
    });
  };

  const handleCancelSubscription = (name: string) => {
    toast({
      title: "Marked for Cancellation",
      description: `${name} has been marked for cancellation before the next renewal.`,
    });
  };

  const renderSubscriptionCard = (subscription: any) => {
    const IconComponent = subscription.icon;
    const usagePercentage = (subscription.usageHours / subscription.maxHours) * 100;

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
            onClick={() => handleCancelSubscription(subscription.name)}
          >
            Cancel Subscription
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">
          Track and manage your subscriptions
        </p>
      </div>

      <Tabs defaultValue="ott">
        <TabsList>
          <TabsTrigger value="ott">Entertainment</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>
        <TabsContent value="ott" className="mt-6">
          <div className="space-y-4">
            {ottSubscriptions.map(renderSubscriptionCard)}
          </div>
        </TabsContent>
        <TabsContent value="education" className="mt-6">
          <div className="space-y-4">
            {eduSubscriptions.map(renderSubscriptionCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
