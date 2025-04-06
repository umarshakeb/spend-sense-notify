
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShoppingCart, Coffee, Film, BookOpen } from "lucide-react";

const transactionData = [
  {
    id: 1,
    title: "Amazon",
    amount: -89.99,
    date: "Apr 5, 2025",
    category: "Shopping",
    icon: ShoppingCart,
  },
  {
    id: 2,
    title: "Starbucks",
    amount: -5.75,
    date: "Apr 4, 2025",
    category: "Food",
    icon: Coffee,
  },
  {
    id: 3,
    title: "Netflix",
    amount: -14.99,
    date: "Apr 3, 2025", 
    category: "Subscription",
    icon: Film,
  },
  {
    id: 4,
    title: "Udemy",
    amount: -19.99,
    date: "Apr 2, 2025",
    category: "Education",
    icon: BookOpen,
  },
  {
    id: 5,
    title: "Salary",
    amount: 2350.00,
    date: "Apr 1, 2025",
    category: "Income",
    icon: CreditCard,
  },
];

export function RecentTransactions() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {transactionData.map((transaction) => {
            const IconComponent = transaction.icon;
            return (
              <div key={transaction.id} className="flex items-center">
                <Avatar className="h-9 w-9 mr-4">
                  <IconComponent className="h-4 w-4" />
                </Avatar>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">
                    {transaction.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${transaction.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {transaction.amount < 0 ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
