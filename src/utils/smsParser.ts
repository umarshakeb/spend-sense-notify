
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

const EXPENSE_PATTERNS = [
  {
    pattern: /(?:spent|paid|debited|charged)\s+(?:INR|Rs\.?|₹)?\s*([0-9,.]+)/i,
    category: 'general'
  },
  {
    pattern: /(?:txn|transaction|payment)\s+of\s+(?:INR|Rs\.?|₹)?\s*([0-9,.]+)/i,
    category: 'general'
  },
  {
    pattern: /(?:INR|Rs\.?|₹)\s*([0-9,.]+)\s+(?:debited|spent|paid)/i,
    category: 'general'
  }
];

const INCOME_PATTERNS = [
  {
    pattern: /(?:received|credited|added|deposited)\s+(?:INR|Rs\.?|₹)?\s*([0-9,.]+)/i,
    category: 'income'
  },
  {
    pattern: /(?:INR|Rs\.?|₹)\s*([0-9,.]+)\s+(?:credited|received)/i,
    category: 'income'
  }
];

const SUBSCRIPTION_PATTERNS = [
  {
    pattern: /(?:Netflix|Prime Video|Amazon Prime|Disney\+|Hotstar)/i,
    category: 'entertainment',
    platform: 'ott'
  },
  {
    pattern: /(?:Spotify|Apple Music|YouTube Music|Gaana)/i,
    category: 'music',
    platform: 'ott'
  },
  {
    pattern: /(?:Coursera|Udemy|Skillshare|Pluralsight|LinkedIn Learning)/i,
    category: 'education',
    platform: 'edutech'
  }
];

// Function to extract amount from text using patterns
function extractAmount(text: string, patterns: { pattern: RegExp, category: string }[]): { amount: number | null, category: string | null } {
  for (const { pattern, category } of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Replace any commas and convert to number
      const amount = parseFloat(match[1].replace(/,/g, ''));
      return { amount, category };
    }
  }
  return { amount: null, category: null };
}

// Function to identify subscription type
function identifySubscription(text: string): { isSubscription: boolean, name: string | null, category: string, platform: string } {
  for (const { pattern, category, platform } of SUBSCRIPTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return { 
        isSubscription: true, 
        name: match[0], 
        category, 
        platform 
      };
    }
  }
  return { isSubscription: false, name: null, category: '', platform: '' };
}

// Function to categorize transaction
function categorizeTransaction(text: string): string {
  if (/(?:grocery|food|restaurant|cafe|dining)/i.test(text)) return 'Food & Dining';
  if (/(?:movie|entertainment|ticket|cinema)/i.test(text)) return 'Entertainment';
  if (/(?:uber|ola|transport|travel|flight)/i.test(text)) return 'Transportation';
  if (/(?:amazon|flipkart|shopping|store|mall)/i.test(text)) return 'Shopping';
  if (/(?:bill|utility|electricity|water|gas)/i.test(text)) return 'Bills & Utilities';
  if (/(?:salary|income|deposit)/i.test(text)) return 'Income';
  return 'Miscellaneous';
}

// Main function to parse SMS
export function parseSMS(messages: { body: string, date: Date }[]): { 
  transactions: Transaction[],
  subscriptions: Subscription[]
} {
  const transactions: Transaction[] = [];
  const subscriptions: Subscription[] = [];
  
  messages.forEach((message, index) => {
    const { body, date } = message;
    
    // Check for expenses first
    let { amount, category } = extractAmount(body, EXPENSE_PATTERNS);
    let type: 'expense' | 'income' = 'expense';
    
    // If no expense found, check for income
    if (amount === null) {
      const incomeResult = extractAmount(body, INCOME_PATTERNS);
      amount = incomeResult.amount;
      category = incomeResult.category;
      type = 'income';
    }
    
    // If amount was found, create a transaction
    if (amount !== null) {
      // Check if this might be a subscription
      const { isSubscription, name, category: subCategory, platform } = identifySubscription(body);
      
      if (isSubscription && name) {
        // Add as a subscription
        const renewalDate = new Date(date);
        renewalDate.setMonth(renewalDate.getMonth() + 1); // Assuming monthly renewal
        
        subscriptions.push({
          id: `sub-${index}`,
          name,
          amount,
          renewalDate,
          category: subCategory,
          platform
        });
      }
      
      // Also add as a regular transaction
      transactions.push({
        id: `txn-${index}`,
        date,
        amount: type === 'expense' ? -amount : amount, // Negative for expenses
        description: body.substring(0, 100), // Truncate description
        category: category || categorizeTransaction(body),
        type
      });
    }
  });
  
  return { transactions, subscriptions };
}
