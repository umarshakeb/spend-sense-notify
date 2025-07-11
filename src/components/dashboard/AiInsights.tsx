
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { getUserCurrency, formatCurrency } from "@/utils/smsParser";

export default function AiInsights() {
  const [currency, setCurrency] = useState('INR'); // Default to INR

  useEffect(() => {
    const fetchCurrency = async () => {
      console.log('AiInsights: Fetching user currency...');
      try {
        const userCurrency = await getUserCurrency();
        console.log('AiInsights: User currency detected:', userCurrency);
        setCurrency(userCurrency);
      } catch (error) {
        console.error('AiInsights: Error fetching currency:', error);
        setCurrency('INR'); // Fallback to INR
      }
    };
    
    fetchCurrency();
  }, []);

  // Use INR amounts for Indian market
  const amounts = {
    foodExpense: 3750,
    subscriptionCost: 2400,
    yearlySavings: 22500,
    remainingBudget: 10500,
    totalBudget: 65000
  };

  console.log('AiInsights: Using amounts:', amounts, 'for currency:', currency);

  const insights = [
    {
      id: 1,
      type: "spending_pattern",
      icon: TrendingUp,
      title: "Increased Food Spending",
      description: `Your food expenses have increased by 23% this month compared to last month. You've spent ${formatCurrency(amounts.foodExpense)} on food delivery alone.`,
      severity: "medium" as const,
      actionable: true,
    },
    {
      id: 2,
      type: "saving_opportunity",
      icon: TrendingDown,
      title: "Subscription Optimization",
      description: `You have 3 entertainment subscriptions costing ${formatCurrency(amounts.subscriptionCost)}/month. Consider consolidating to save ${formatCurrency(amounts.yearlySavings)}/year.`,
      severity: "low" as const,
      actionable: true,
    },
    {
      id: 3,
      type: "budget_alert",
      icon: AlertTriangle,
      title: "Budget Threshold Alert",
      description: `You're approaching your monthly shopping budget limit. ${formatCurrency(amounts.remainingBudget)} remaining out of ${formatCurrency(amounts.totalBudget)}.`,
      severity: "high" as const,
      actionable: true,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Personalized financial insights based on your spending patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className={`mt-0.5 ${getSeverityColor(insight.severity)}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-medium leading-none">
                  {insight.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
