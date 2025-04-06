
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, BookOpen, Music, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const subscriptionData = [
  {
    id: 1,
    title: "Netflix",
    amount: 14.99,
    renewalDate: "Apr 9, 2025",
    icon: Film,
    daysLeft: 3,
  },
  {
    id: 2,
    title: "Coursera",
    amount: 29.99,
    renewalDate: "Apr 10, 2025",
    icon: BookOpen,
    daysLeft: 4,
  },
  {
    id: 3,
    title: "Spotify",
    amount: 9.99,
    renewalDate: "Apr 8, 2025",
    icon: Music,
    daysLeft: 2,
  },
];

export function UpcomingRenewals() {
  const { toast } = useToast();

  const handleCancelClick = (subscriptionName: string) => {
    toast({
      title: "Marked for cancellation",
      description: `${subscriptionName} will be canceled before the next renewal.`,
    });
  };
  
  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Upcoming Renewals</CardTitle>
        </div>
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {subscriptionData.map((subscription) => {
            const IconComponent = subscription.icon;
            return (
              <div key={subscription.id} className="space-y-2">
                <div className="flex items-center">
                  <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="flex-1 font-medium">{subscription.title}</div>
                  <Badge variant={subscription.daysLeft <= 3 ? "destructive" : "outline"}>
                    {subscription.daysLeft} days
                  </Badge>
                </div>
                <div className="flex items-center text-sm">
                  <div className="flex-1 text-muted-foreground">
                    ${subscription.amount}/month · Renews {subscription.renewalDate}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleCancelClick(subscription.title)}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Usage this month</span>
                    <span>20 hours</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
