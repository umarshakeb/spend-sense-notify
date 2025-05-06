
import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-950">
      <div className="animate-pulse">
        <CreditCard className="h-24 w-24 text-finance-primary" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">SpendSense</h1>
      <p className="mt-2 text-muted-foreground">Finance Tracker</p>
    </div>
  );
}
