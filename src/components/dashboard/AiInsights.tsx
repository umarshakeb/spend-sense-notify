
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, Sparkles, PiggyBank } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Sample insights data - in a real app, this would come from an AI analysis of user's data
const sampleInsights = [
  {
    id: 1,
    type: "subscription",
    title: "Subscription Savings",
    description: "You could save $19.98/month by cancelling Netflix and Spotify, which you used less than 5 hours last month.",
    action: "Review Subscriptions",
    actionPath: "/subscriptions",
    savings: 19.98,
  },
  {
    id: 2,
    type: "spending",
    title: "Spending Pattern",
    description: "Your dining expenses increased by 25% this month. Setting a budget of $300/month could save you $120.",
    action: "Set Budget",
    actionPath: "/analytics",
    savings: 120,
  },
  {
    id: 3,
    type: "loan",
    title: "Loan Repayment Plan",
    description: "By allocating your subscription savings to your loan, you could pay it off 3 months earlier and save $230 in interest.",
    action: "View Plan",
    actionPath: "/analytics",
    savings: 230,
  },
];

export function AiInsights() {
  const { toast } = useToast();
  const [insights, setInsights] = useState(sampleInsights);
  const [isLoading, setIsLoading] = useState(false);

  // Total potential savings
  const totalSavings = insights.reduce((total, insight) => total + insight.savings, 0);

  const generateNewInsights = () => {
    setIsLoading(true);
    // This would be an API call to an AI service in a real implementation
    setTimeout(() => {
      toast({
        title: "Insights refreshed",
        description: "Your financial insights have been updated with the latest data.",
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Personalized financial recommendations based on your spending habits
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={generateNewInsights}
          disabled={isLoading}
        >
          {isLoading ? "Analyzing..." : "Refresh Insights"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Potential Savings</h4>
              <p className="text-sm text-muted-foreground">
                Based on our AI analysis of your spending patterns
              </p>
            </div>
            <div className="flex items-center">
              <PiggyBank className="h-8 w-8 mr-2 text-primary" />
              <span className="text-2xl font-bold">${totalSavings.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{insight.title}</h4>
                <Badge variant="outline" className="ml-2">
                  ${insight.savings.toFixed(2)} potential savings
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {insight.description}
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal text-sm"
                onClick={() => toast({
                  title: "Coming soon",
                  description: "This feature will be available in the next update."
                })}
              >
                {insight.action} →
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
