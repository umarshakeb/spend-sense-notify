
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

const BANK_NAME_PATTERNS = [
  /(?:HDFC|SBI|ICICI|Axis|Kotak|PNB|Bank of Baroda|Canara|Yes Bank|Union Bank)/i,
  /(?:Federal|Indian Bank|UCO|Indian Overseas|Dena Bank|Bank of Maharashtra)/i,
  /(?:Citi|HSBC|Standard Chartered|Bank of America|Wells Fargo|Chase|JPMorgan)/i
];

function extractAmount(text: string, patterns: { pattern: RegExp, category: string }[]): { amount: number | null, category: string | null } {
  for (const { pattern, category } of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      return { amount, category };
    }
  }
  return { amount: null, category: null };
}

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

export function isBankMessage(text: string): boolean {
  return BANK_NAME_PATTERNS.some(pattern => pattern.test(text));
}

function categorizeTransaction(text: string): string {
  if (/(?:grocery|food|restaurant|cafe|dining|swiggy|zomato|dominos)/i.test(text)) return 'Food & Dining';
  if (/(?:movie|entertainment|ticket|cinema|bookmyshow)/i.test(text)) return 'Entertainment';
  if (/(?:uber|ola|transport|travel|flight|train|bus)/i.test(text)) return 'Transportation';
  if (/(?:amazon|flipkart|shopping|store|mall|myntra|ajio)/i.test(text)) return 'Shopping';
  if (/(?:bill|utility|electricity|water|gas|phone|internet)/i.test(text)) return 'Bills & Utilities';
  if (/(?:salary|income|deposit|transfer)/i.test(text)) return 'Income';
  if (/(?:netflix|spotify|prime|hotstar|subscription)/i.test(text)) return 'Subscriptions';
  return 'Miscellaneous';
}

export function parseSMS(messages: { body: string, date: Date }[]): { 
  transactions: Transaction[],
  subscriptions: Subscription[]
} {
  const transactions: Transaction[] = [];
  const subscriptions: Subscription[] = [];
  
  const bankMessages = messages.filter(msg => isBankMessage(msg.body));
  
  bankMessages.forEach((message, index) => {
    const { body, date } = message;
    
    let { amount, category } = extractAmount(body, EXPENSE_PATTERNS);
    let type: 'expense' | 'income' = 'expense';
    
    if (amount === null) {
      const incomeResult = extractAmount(body, INCOME_PATTERNS);
      amount = incomeResult.amount;
      category = incomeResult.category;
      type = 'income';
    }
    
    if (amount !== null) {
      const { isSubscription, name, category: subCategory, platform } = identifySubscription(body);
      
      if (isSubscription && name) {
        const renewalDate = new Date(date);
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        
        subscriptions.push({
          id: `sub-${index}`,
          name,
          amount,
          renewalDate,
          category: subCategory,
          platform
        });
      }
      
      transactions.push({
        id: `txn-${index}`,
        date,
        amount: type === 'expense' ? -amount : amount,
        description: body.substring(0, 100),
        category: category || categorizeTransaction(body),
        type
      });
    }
  });
  
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

// Generate realistic bank account numbers
export function generateRealisticAccountNumber(): string {
  const bankCodes = ['50100', '60200', '30400', '91100', '81100'];
  const randomBankCode = bankCodes[Math.floor(Math.random() * bankCodes.length)];
  const accountSuffix = Math.floor(Math.random() * 9000) + 1000;
  return `XX${randomBankCode.slice(-4)}${accountSuffix}`;
}

// Generate realistic balances
export function generateRealisticBalance(): number {
  return Math.floor(Math.random() * 500000) + 150000; // Between 1.5L to 6.5L
}

export function getRandomBankName(): string {
  const banks = [
    "HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", 
    "Kotak Bank", "Yes Bank", "PNB", "Canara Bank"
  ];
  return banks[Math.floor(Math.random() * banks.length)];
}

// Generate realistic transaction data with proper balance calculations
export function generateRealisticSMSData(): { 
  transactions: Transaction[], 
  subscriptions: Subscription[], 
  balance: number 
} {
  const accountNumber = generateRealisticAccountNumber();
  const currentBalance = generateRealisticBalance();
  
  // Create realistic transactions
  const transactionData = [
    { amount: 85000, type: 'income', desc: 'Salary from XYZ Technologies Pvt Ltd', category: 'Income', days: 28 },
    { amount: 649, type: 'expense', desc: 'Netflix Premium subscription', category: 'Subscriptions', days: 25 },
    { amount: 299, type: 'expense', desc: 'Spotify Premium subscription', category: 'Subscriptions', days: 23 },
    { amount: 2500, type: 'expense', desc: 'Electricity bill payment', category: 'Bills & Utilities', days: 20 },
    { amount: 1850, type: 'expense', desc: 'Swiggy food order', category: 'Food & Dining', days: 18 },
    { amount: 450, type: 'expense', desc: 'Uber cab ride', category: 'Transportation', days: 15 },
    { amount: 8500, type: 'expense', desc: 'Amazon.in purchase', category: 'Shopping', days: 12 },
    { amount: 1200, type: 'expense', desc: 'Movie tickets BookMyShow', category: 'Entertainment', days: 10 },
    { amount: 750, type: 'expense', desc: 'Coffee shop purchase', category: 'Food & Dining', days: 8 },
    { amount: 15000, type: 'expense', desc: 'EMI payment to HDFC Bank', category: 'Bills & Utilities', days: 5 },
    { amount: 3200, type: 'expense', desc: 'Grocery shopping', category: 'Food & Dining', days: 3 },
    { amount: 890, type: 'expense', desc: 'Mobile recharge', category: 'Bills & Utilities', days: 1 }
  ];

  const transactions: Transaction[] = [];
  const subscriptions: Subscription[] = [];

  transactionData.forEach((txn, index) => {
    const date = new Date();
    date.setDate(date.getDate() - txn.days);
    
    const bankName = getRandomBankName();
    const transactionAmount = txn.type === 'expense' ? -txn.amount : txn.amount;
    
    // Calculate balance for this transaction (showing balance after transaction)
    let balanceAfterTxn = currentBalance;
    for (let i = 0; i <= index; i++) {
      const prevTxn = transactionData[i];
      if (prevTxn.type === 'expense') {
        balanceAfterTxn -= prevTxn.amount;
      } else {
        balanceAfterTxn += prevTxn.amount;
      }
    }
    
    const smsText = txn.type === 'expense' 
      ? `${bankName}: Your A/c ${accountNumber} debited INR ${txn.amount.toLocaleString('en-IN')}.00 on ${date.toLocaleDateString('en-GB')} for ${txn.desc}. Avl Bal: INR ${Math.max(balanceAfterTxn, 0).toLocaleString('en-IN')}`
      : `${bankName}: A/c ${accountNumber} credited INR ${txn.amount.toLocaleString('en-IN')}.00 on ${date.toLocaleDateString('en-GB')} by NEFT-${txn.desc}. Avl Bal: INR ${balanceAfterTxn.toLocaleString('en-IN')}`;

    transactions.push({
      id: `txn-${index}`,
      date,
      amount: transactionAmount,
      description: smsText,
      category: txn.category,
      type: txn.type as 'expense' | 'income'
    });

    // Add subscriptions
    if (txn.category === 'Subscriptions') {
      const renewalDate = new Date(date);
      renewalDate.setMonth(renewalDate.getMonth() + 1);
      
      subscriptions.push({
        id: `sub-${index}`,
        name: txn.desc,
        amount: txn.amount,
        renewalDate,
        category: 'entertainment',
        platform: 'ott'
      });
    }
  });

  // Sort transactions by date (newest first)
  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  console.log('Generated realistic SMS data:', { transactions: transactions.length, subscriptions: subscriptions.length, balance: currentBalance });
  
  return { transactions, subscriptions, balance: currentBalance };
}
