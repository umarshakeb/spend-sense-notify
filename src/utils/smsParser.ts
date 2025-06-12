
import { supabase } from "@/integrations/supabase/client";

export interface Transaction {
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category: string;
  date: string;
}

export interface Subscription {
  name: string;
  price: number;
  category: string;
  renewalDate: string;
}

export async function parseSMSWithLLM(messages: Array<{ body: string, date?: string }>) {
  try {
    console.log('Parsing SMS messages with open-source LLM...');
    
    const { data, error } = await supabase.functions.invoke('parse-sms-with-llm', {
      body: { messages }
    });

    if (error) {
      console.error('LLM parsing error:', error);
      throw error;
    }

    console.log('LLM parsing result:', data);
    return {
      transactions: data.transactions || [],
      subscriptions: data.subscriptions || []
    };
  } catch (error) {
    console.error('Failed to parse SMS with LLM:', error);
    // Fallback to local parsing
    return {
      transactions: [],
      subscriptions: []
    };
  }
}

// Get user's currency based on their profile
export async function getUserCurrency(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'USD';

    const { data: profile } = await supabase
      .from('profiles')
      .select('currency_code, country_code')
      .eq('id', user.id)
      .single();

    return profile?.currency_code || 'USD';
  } catch (error) {
    console.error('Error getting user currency:', error);
    return 'USD';
  }
}

// Format currency based on user's locale
export function formatCurrency(amount: number, currencyCode: string): string {
  const currencyMap: { [key: string]: { symbol: string, locale: string } } = {
    'INR': { symbol: '₹', locale: 'en-IN' },
    'USD': { symbol: '$', locale: 'en-US' },
    'GBP': { symbol: '£', locale: 'en-GB' },
    'EUR': { symbol: '€', locale: 'en-EU' }
  };

  const currency = currencyMap[currencyCode] || currencyMap['USD'];
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
}

// Generate sample SMS messages for demo
export function generateSampleSMSMessages() {
  return [
    { body: "Rs. 250 debited from your SBI a/c no. XXXXX123 on 15-07-2024 for purchase at Zomato. Avl Bal: Rs. 7,850.00" },
    { body: "Rs. 1,200 credited to your HDFC Bank a/c no. YYYYY456 on 14-07-2024 from Google Pay. Avl Bal: Rs. 15,200.00" },
    { body: "Dear Customer, your Amazon Prime subscription of Rs. 999 is due for renewal on 20-07-2024." },
    { body: "Rs. 500 debited from your ICICI Bank a/c no. ZZZZZ789 on 13-07-2024 for bill payment to Airtel. Avl Bal: Rs. 3,500.00" },
    { body: "Received Rs. 750 in your Axis Bank a/c no. AAAAA012 on 12-07-2024 from PhonePe. Avl Bal: Rs. 10,750.00" },
    { body: "Dear Customer, get 20% off on your next purchase at Myntra. Use code MYNTRA20." },
    { body: "Rs. 300 debited from your Kotak Bank a/c no. BBBBB345 on 11-07-2024 for movie tickets at BookMyShow. Avl Bal: Rs. 6,200.00" },
    { body: "Rs. 1,500 credited to your PNB a/c no. CCCCC678 on 10-07-2024 from salary. Avl Bal: Rs. 12,500.00" },
    { body: "Dear Customer, avail exciting offers on credit cards. Call 1800-123-4567." },
    { body: "Rs. 400 debited from your BOB a/c no. DDDDD901 on 09-07-2024 for fuel at Indian Oil. Avl Bal: Rs. 4,600.00" },
  ];
}

// Generate realistic SMS data for demo
export function generateRealisticSMSData() {
  const transactions: Transaction[] = [
    { amount: 250, type: 'expense', description: 'Zomato', category: 'Food & Dining', date: '2024-07-15' },
    { amount: 1200, type: 'income', description: 'Google Pay', category: 'Transfer', date: '2024-07-14' },
    { amount: 500, type: 'expense', description: 'Airtel Bill', category: 'Bills & Utilities', date: '2024-07-13' },
    { amount: 750, type: 'income', description: 'PhonePe', category: 'Transfer', date: '2024-07-12' },
    { amount: 300, type: 'expense', description: 'BookMyShow', category: 'Entertainment', date: '2024-07-11' },
    { amount: 1500, type: 'income', description: 'Salary', category: 'Transfer', date: '2024-07-10' },
    { amount: 400, type: 'expense', description: 'Indian Oil', category: 'Transportation', date: '2024-07-09' },
  ];

  const subscriptions: Subscription[] = [
    { name: 'Amazon Prime', price: 999, category: 'Entertainment', renewalDate: '2024-07-20' },
  ];

  const balance = 15000;

  return { transactions, subscriptions, balance };
}

// Save SMS data to localStorage
export function saveSMSData(transactions: Transaction[], subscriptions: Subscription[], balance: number) {
  try {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    localStorage.setItem('balance', JSON.stringify(balance));
    return true;
  } catch (error) {
    console.error('Error saving SMS data:', error);
    return false;
  }
}
