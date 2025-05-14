
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  DollarSign,
  CalendarClock,
  IndianRupee 
} from "lucide-react";
import { Transaction, Subscription } from "@/utils/smsParser";

// Create a custom hook to get transaction data from SMS
const useTransactionData = () => {
  const [data, setData] = useState({
    balance: null as number | null,
    income: 0,
    expenses: 0,
    subscriptions: 0,
    subscriptionTotal: 0,
    currency: '₹', // Default to Indian Rupee
  });

  useEffect(() => {
    // Try to retrieve data from localStorage where SMS Import page would save it
    const loadSavedData = () => {
      try {
        const storedTransactions = localStorage.getItem('sms_transactions');
        const storedSubscriptions = localStorage.getItem('sms_subscriptions');
        const storedBalance = localStorage.getItem('sms_balance');
        
        let transactions: Transaction[] = [];
        let subscriptions: Subscription[] = [];
        let balance: number | null = null;
        
        if (storedTransactions) {
          transactions = JSON.parse(storedTransactions);
        }
        
        if (storedSubscriptions) {
          subscriptions = JSON.parse(storedSubscriptions);
        }
        
        if (storedBalance) {
          balance = parseFloat(storedBalance);
        }
        
        // Calculate totals
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const subscriptionTotal = subscriptions.reduce((sum, s) => sum + s.amount, 0);
        
        setData({
          balance,
          income,
          expenses,
          subscriptions: subscriptions.length,
          subscriptionTotal,
          currency: '₹', // Using Indian Rupee symbol as detected from SMS
        });
      } catch (error) {
        console.error("Error loading transaction data:", error);
      }
    };
    
    loadSavedData();
    
    // Set up an event listener for when SMS data is updated
    window.addEventListener('sms_data_updated', loadSavedData);
    
    return () => {
      window.removeEventListener('sms_data_updated', loadSavedData);
    };
  }, []);
  
  return data;
};

export function SpendingSummary() {
  const { 
    balance, 
    income, 
    expenses, 
    subscriptions, 
    subscriptionTotal,
    currency 
  } = useTransactionData();
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          {currency === '$' ? 
            <DollarSign className="h-4 w-4 text-muted-foreground" /> : 
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          }
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {balance !== null ? 
              `${currency}${balance.toLocaleString('en-IN')}` : 
              `${currency}0.00`
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Add bank messages to update
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month's Income</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {`${currency}${income.toLocaleString('en-IN')}`}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on your bank messages
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month's Expenses</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {`${currency}${expenses.toLocaleString('en-IN')}`}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on your bank messages
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subscriptions}</div>
          <p className="text-xs text-muted-foreground">
            {subscriptions > 0 ? 
              `${currency}${subscriptionTotal.toLocaleString('en-IN')}/month total` : 
              'No subscriptions detected'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
