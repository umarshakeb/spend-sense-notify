
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShoppingCart, Coffee, Film, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: string;
}

// Map categories to icons
const categoryIcons: Record<string, any> = {
  "Shopping": ShoppingCart,
  "Food & Dining": Coffee,
  "Entertainment": Film,
  "Education": BookOpen,
  "Income": CreditCard,
};

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedTransactions = data.map(transaction => ({
            id: transaction.id,
            title: transaction.description,
            description: transaction.description,
            amount: transaction.amount,
            date: new Date(transaction.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            category: transaction.category,
            type: transaction.type,
          }));
          
          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentTransactions();
  }, [user]);

  // Default icon if category doesn't have specific one
  const getIconForCategory = (category: string) => {
    return categoryIcons[category] || CreditCard;
  };

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center">
                <Skeleton className="h-9 w-9 rounded-full mr-4" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              const IconComponent = getIconForCategory(transaction.category);
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
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No recent transactions found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
