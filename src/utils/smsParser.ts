import { supabase } from "@/integrations/supabase/client";

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'income';
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  renewalDate: Date;
  category: string;
  platform: string;
}

// Patterns for actual transaction messages
const UPI_TRANSACTION_PATTERNS = [
  // Pattern 1: "Amt Sent Rs.111.00 From BANK_NAME A/C *1234 TO RECEIVER On 11-06"
  /(?:Amt\s+)?Sent\s+Rs\.?\s*([0-9,.]+)\s+From\s+([A-Z\s]+)\s+A\/C\s+\*(\d{4})\s+TO\s+([^,\n]+)\s+On\s+([0-9-]+)/i,
  
  // Pattern 2: "Rs.111.00 sent from BANK A/C *1234 to RECEIVER on 11-06"
  /Rs\.?\s*([0-9,.]+)\s+sent\s+from\s+([A-Z\s]+)\s+A\/C\s+\*(\d{4})\s+to\s+([^,\n]+)\s+on\s+([0-9-]+)/i,
  
  // Pattern 3: "Received Rs.111.00 in BANK A/C *1234 from SENDER on 11-06"
  /Received\s+Rs\.?\s*([0-9,.]+)\s+in\s+([A-Z\s]+)\s+A\/C\s+\*(\d{4})\s+from\s+([^,\n]+)\s+on\s+([0-9-]+)/i,
  
  // Pattern 4: "Rs.111.00 received in BANK A/C *1234 from SENDER on 11-06"
  /Rs\.?\s*([0-9,.]+)\s+received\s+in\s+([A-Z\s]+)\s+A\/C\s+\*(\d{4})\s+from\s+([^,\n]+)\s+on\s+([0-9-]+)/i
];

// Patterns for card/bank transactions
const BANK_TRANSACTION_PATTERNS = [
  // Debit patterns
  /(?:debited|spent|paid)\s+(?:INR|Rs\.?|₹)?\s*([0-9,.]+)\s+(?:from|on)\s+([A-Z\s]+).*?(?:A\/C|Card)\s+(?:\*|ending)(\d{4})/i,
  
  // Credit patterns  
  /(?:credited|received|deposited)\s+(?:INR|Rs\.?|₹)?\s*([0-9,.]+)\s+(?:to|in)\s+([A-Z\s]+).*?(?:A\/C|Card)\s+(?:\*|ending)(\d{4})/i,
  
  // Balance info patterns
  /(?:A\/C|Account)\s+(?:\*|ending)?(\d{4})\s+(?:debited|credited)\s+(?:INR|Rs\.?|₹)?\s*([0-9,.]+)/i
];

// Exclude promotional/offer messages
const PROMOTIONAL_KEYWORDS = [
  'offer', 'scheme', 'discount', 'cashback', 'reward', 'bonus', 'gift',
  'congratulations', 'winner', 'prize', 'free', 'limited time', 'expires',
  'apply now', 'click here', 'visit', 'download', 'install', 'upgrade',
  'pre-approved', 'eligible', 'qualify', 'minimum', 'maximum', 'terms',
  'conditions', 'interest rate', 'loan', 'credit card', 'insurance'
];

// Known bank names and their common abbreviations
const BANK_NAMES = [
  'HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'YES', 'INDUSIND', 'PNB',
  'CANARA', 'BOB', 'UNION', 'FEDERAL', 'RBL', 'IDFC', 'BANDHAN',
  'PAYTM', 'PHONEPE', 'GPAY', 'GOOGLEPAY', 'BHIM', 'UPI'
];

function isPromotionalMessage(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PROMOTIONAL_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

function isBankMessage(text: string): boolean {
  return BANK_NAMES.some(bank => 
    new RegExp(`\\b${bank}\\b`, 'i').test(text)
  );
}

function parseUPITransaction(text: string): {
  amount: number | null;
  bank: string | null;
  accountDigits: string | null;
  counterparty: string | null;
  date: string | null;
  type: 'sent' | 'received' | null;
} {
  for (const pattern of UPI_TRANSACTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const bank = match[2].trim();
      const accountDigits = match[3];
      const counterparty = match[4].trim();
      const dateStr = match[5];
      
      // Determine if it's sent or received
      const isSent = /sent|from/i.test(text);
      const type = isSent ? 'sent' : 'received';
      
      return {
        amount,
        bank,
        accountDigits,
        counterparty,
        date: dateStr,
        type
      };
    }
  }
  
  return {
    amount: null,
    bank: null,
    accountDigits: null,
    counterparty: null,
    date: null,
    type: null
  };
}

function parseBankTransaction(text: string): {
  amount: number | null;
  bank: string | null;
  accountDigits: string | null;
  type: 'debit' | 'credit' | null;
} {
  for (const pattern of BANK_TRANSACTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const bank = match[2] ? match[2].trim() : null;
      const accountDigits = match[3] || match[1];
      
      const isDebit = /debited|spent|paid/i.test(text);
      const type = isDebit ? 'debit' : 'credit';
      
      return {
        amount,
        bank,
        accountDigits,
        type
      };
    }
  }
  
  return {
    amount: null,
    bank: null,
    accountDigits: null,
    type: null
  };
}

function categorizeTransaction(text: string, counterparty?: string): string {
  const lowerText = text.toLowerCase();
  const lowerCounterparty = counterparty?.toLowerCase() || '';
  
  // Food & Dining
  if (/swiggy|zomato|dominos|mcdonald|kfc|pizza|restaurant|cafe|food/i.test(lowerText + lowerCounterparty)) {
    return 'Food & Dining';
  }
  
  // Transportation  
  if (/uber|ola|rapido|metro|petrol|fuel|parking|transport/i.test(lowerText + lowerCounterparty)) {
    return 'Transportation';
  }
  
  // Shopping
  if (/amazon|flipkart|myntra|ajio|nykaa|shopping|store/i.test(lowerText + lowerCounterparty)) {
    return 'Shopping';
  }
  
  // Entertainment
  if (/netflix|prime|hotstar|spotify|bookmyshow|movie|entertainment/i.test(lowerText + lowerCounterparty)) {
    return 'Entertainment';
  }
  
  // Bills & Utilities
  if (/electricity|water|gas|phone|internet|mobile|recharge|bill/i.test(lowerText + lowerCounterparty)) {
    return 'Bills & Utilities';
  }
  
  // If counterparty looks like a person's name, categorize as transfer
  if (counterparty && /^[A-Z][a-z]+\s+[A-Z][a-z]+$/i.test(counterparty.trim())) {
    return 'Transfer';
  }
  
  return 'Miscellaneous';
}

function parseDate(dateStr: string): Date {
  const currentYear = new Date().getFullYear();
  
  // Handle formats like "11-06" (DD-MM)
  if (/^\d{1,2}-\d{1,2}$/.test(dateStr)) {
    const [day, month] = dateStr.split('-').map(Number);
    return new Date(currentYear, month - 1, day);
  }
  
  // Handle other common formats
  try {
    return new Date(dateStr);
  } catch {
    return new Date(); // Fallback to current date
  }
}

export async function parseSMSWithLLM(messages: { body: string, date: Date }[]): Promise<{ 
  transactions: Transaction[],
  subscriptions: Subscription[]
}> {
  try {
    console.log(`Processing ${messages.length} messages with LLM`);
    
    const { data, error } = await supabase.functions.invoke('parse-sms-with-llm', {
      body: { messages }
    });

    if (error) {
      console.error('LLM parsing error:', error);
      // Fallback to local parsing
      return parseSMS(messages);
    }

    const transactions = data.transactions.map((t: any, index: number) => ({
      id: `llm-txn-${index}`,
      date: new Date(t.date),
      amount: t.amount,
      description: t.description,
      category: t.category,
      type: t.type
    }));

    console.log(`LLM parsed ${transactions.length} transactions`);
    return { transactions, subscriptions: data.subscriptions || [] };
  } catch (error) {
    console.error('Error using LLM for SMS parsing:', error);
    // Fallback to local parsing
    return parseSMS(messages);
  }
}

export function parseSMS(messages: { body: string, date: Date }[]): { 
  transactions: Transaction[],
  subscriptions: Subscription[]
} {
  const transactions: Transaction[] = [];
  const subscriptions: Subscription[] = [];
  
  // Filter to only bank messages and exclude promotional content
  const validMessages = messages.filter(msg => 
    isBankMessage(msg.body) && !isPromotionalMessage(msg.body)
  );
  
  console.log(`Processing ${validMessages.length} valid bank messages out of ${messages.length} total messages`);
  
  validMessages.forEach((message, index) => {
    const { body, date } = message;
    
    // Try to parse as UPI transaction first
    const upiData = parseUPITransaction(body);
    if (upiData.amount !== null && upiData.type !== null) {
      const transactionDate = upiData.date ? parseDate(upiData.date) : date;
      
      transactions.push({
        id: `txn-${index}`,
        date: transactionDate,
        amount: upiData.type === 'sent' ? -upiData.amount : upiData.amount,
        description: `${upiData.type === 'sent' ? 'Sent to' : 'Received from'} ${upiData.counterparty} via ${upiData.bank}`,
        category: categorizeTransaction(body, upiData.counterparty),
        type: upiData.type === 'sent' ? 'expense' : 'income'
      });
      
      console.log(`Parsed UPI transaction: ₹${upiData.amount} ${upiData.type} ${upiData.counterparty}`);
      return;
    }
    
    // Try to parse as regular bank transaction
    const bankData = parseBankTransaction(body);
    if (bankData.amount !== null && bankData.type !== null) {
      transactions.push({
        id: `txn-${index}`,
        date,
        amount: bankData.type === 'debit' ? -bankData.amount : bankData.amount,
        description: body.substring(0, 100) + '...',
        category: categorizeTransaction(body),
        type: bankData.type === 'debit' ? 'expense' : 'income'
      });
      
      console.log(`Parsed bank transaction: ₹${bankData.amount} ${bankData.type} from ${bankData.bank}`);
    }
  });
  
  console.log(`Successfully parsed ${transactions.length} transactions`);
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  return { transactions, subscriptions };
}

export function saveSMSData(transactions: Transaction[], subscriptions: Subscription[], balance: number | null) {
  try {
    localStorage.setItem('sms_transactions', JSON.stringify(transactions));
    localStorage.setItem('sms_subscriptions', JSON.stringify(subscriptions));
    
    if (balance !== null) {
      localStorage.setItem('sms_balance', balance.toString());
    }
    
    window.dispatchEvent(new Event('sms_data_updated'));
    return true;
  } catch (error) {
    console.error("Error saving SMS data to localStorage:", error);
    return false;
  }
}

// Generate sample transaction messages for testing
export function generateSampleSMSMessages(): { body: string, date: Date }[] {
  const messages = [
    {
      body: "Amt Sent Rs.250.00 From HDFC BANK A/C *4567 TO RAHUL SHARMA On 10-06 Ref 234567890 Not You? Call 18002586161/SMS BLOCK UPI to 9971056161",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      body: "Received Rs.1500.00 in ICICI A/C *8901 from PRIYA SINGH on 09-06 Ref 345678901 UPI Txn via PHONEPE",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      body: "Your SBI A/C *2345 debited INR 85.00 on 08-06 for SWIGGY ORDER at MUMBAI. Avl Bal: INR 15,240.50",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      body: "Sent Rs.500.00 From AXIS BANK A/C *6789 TO AMAZON PAY On 07-06 Ref 456789012",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      body: "KOTAK BANK A/C *3456 credited Rs.25000.00 on 06-06 by NEFT-SALARY TRANSFER from XYZ COMPANY",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];
  
  return messages;
}

// For demo purposes - this would be replaced with actual SMS reading
export function generateRealisticSMSData(): { 
  transactions: Transaction[], 
  subscriptions: Subscription[], 
  balance: number 
} {
  const sampleMessages = generateSampleSMSMessages();
  const { transactions, subscriptions } = parseSMS(sampleMessages);
  
  // Calculate a realistic balance based on transactions
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const totalReceived = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = 15000 + totalReceived - totalSpent; // Starting with base balance
  
  console.log('Generated realistic SMS data:', { 
    transactions: transactions.length, 
    subscriptions: subscriptions.length, 
    balance 
  });
  
  return { transactions, subscriptions, balance };
}

export { isBankMessage };

// Enhanced function to get user's currency preference
export async function getUserCurrency(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 'USD'; // Default currency
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('currency_code, country_code')
      .eq('id', user.id)
      .single();

    return profile?.currency_code || 'USD';
  } catch (error) {
    console.error('Error fetching user currency:', error);
    return 'USD';
  }
}

// Currency formatting helper
export function formatCurrency(amount: number, currencyCode: string): string {
  const formatters: { [key: string]: Intl.NumberFormat } = {
    'INR': new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
    'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    'EUR': new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }),
    'GBP': new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
  };

  const formatter = formatters[currencyCode] || formatters['USD'];
  return formatter.format(amount);
}
