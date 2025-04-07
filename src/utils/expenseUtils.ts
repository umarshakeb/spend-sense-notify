
// Function to categorize transaction based on keywords
export function categorizeTransaction(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  // Food & Dining related keywords
  if (/coffee|cafe|restaurant|dining|food|grocery|groceries|meal|breakfast|lunch|dinner|takeout|bakery|pizza|burger|sushi/i.test(lowerDesc)) {
    return "Food & Dining";
  }
  
  // Shopping related keywords
  if (/amazon|walmart|target|shop|store|mall|purchase|buy|clothes|clothing|fashion|retail|online|ebay|etsy/i.test(lowerDesc)) {
    return "Shopping";
  }
  
  // Transportation related keywords
  if (/uber|lyft|taxi|cab|train|bus|metro|subway|transport|gas|fuel|parking|car|vehicle|ride/i.test(lowerDesc)) {
    return "Transportation";
  }
  
  // Entertainment related keywords
  if (/movie|cinema|theater|concert|show|ticket|game|event|netflix|hulu|disney|spotify|music|entertainment/i.test(lowerDesc)) {
    return "Entertainment";
  }
  
  // Education related keywords
  if (/book|course|class|school|college|university|tuition|education|learn|study|tutorial|udemy|coursera|skillshare/i.test(lowerDesc)) {
    return "Education";
  }
  
  // Bills & Utilities related keywords
  if (/bill|utility|electric|water|gas|internet|wifi|phone|mobile|cable|subscription|insurance|rent|mortgage/i.test(lowerDesc)) {
    return "Bills & Utilities";
  }
  
  // Health related keywords
  if (/doctor|medical|health|medicine|pharmacy|drug|hospital|clinic|dental|dentist|therapy|fitness|gym|workout/i.test(lowerDesc)) {
    return "Health";
  }
  
  // Travel related keywords
  if (/hotel|motel|airbnb|flight|airline|travel|trip|vacation|holiday|booking|reservation|tour|cruise|resort/i.test(lowerDesc)) {
    return "Travel";
  }
  
  // Subscription related keywords  
  if (/subscription|netflix|hulu|disney|spotify|apple|amazon prime|youtube|premium|monthly|annual/i.test(lowerDesc)) {
    return "Subscription";
  }
  
  // Income related keywords
  if (/salary|income|payment|deposit|revenue|wage|earning|profit|dividend|interest|refund|return|reimbursement/i.test(lowerDesc)) {
    return "Income";
  }
  
  // Default category if no match is found
  return "Miscellaneous";
}
