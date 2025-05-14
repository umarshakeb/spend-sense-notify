
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { parseSMS, Transaction, Subscription, saveSMSData, getRandomBankName } from "@/utils/smsParser";
import { useToast } from "@/components/ui/use-toast";
import { Check, MessageSquareText, Inbox, Loader2, RefreshCw, IndianRupee } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  smsText: z.string().min(10, {
    message: "SMS text should be at least 10 characters.",
  }),
});

interface SMSMessage {
  body: string;
  date: Date;
}

export default function SMSImport() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [importedTransactions, setImportedTransactions] = useState<Transaction[]>([]);
  const [importedSubscriptions, setImportedSubscriptions] = useState<Subscription[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      smsText: "",
    },
  });

  // Check if running on a mobile device with Capacitor
  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        setIsMobileDevice(Capacitor.isNativePlatform());
        
        // If we're on a mobile device, start auto-detecting messages
        if (Capacitor.isNativePlatform()) {
          simulateAutoDetection();
        } else {
          setIsAutoDetecting(false);
        }
      } catch (error) {
        setIsMobileDevice(false);
        setIsAutoDetecting(false);
      }
    };

    checkPlatform();
  }, []);

  // Simulate auto-detection of SMS messages on mobile devices
  const simulateAutoDetection = async () => {
    setIsProcessing(true);
    
    // Simulate delay for message processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic bank names for samples
    const bankName1 = getRandomBankName();
    const bankName2 = getRandomBankName();
    const bankName3 = getRandomBankName();
    
    // Sample bank SMS messages with more realistic data
    const sampleMessages: SMSMessage[] = [
      {
        body: `${bankName1}: Your Acct XX1234 has been debited INR 499.00 on 14-05-2025 for Netflix subscription. Avl Bal: INR 24,532.75`,
        date: new Date(2025, 4, 14)
      },
      {
        body: `${bankName1}: Your Acct XX1234 has been debited INR 750.00 on 13-05-2025 for Food Order from Swiggy. Avl Bal: INR 25,031.75`,
        date: new Date(2025, 4, 13)
      },
      {
        body: `${bankName2}: Your Acct XX1234 has been credited INR 45,000.00 on 01-05-2025 by SALARY/ABC COMPANY. Avl Bal: INR 67,281.75`,
        date: new Date(2025, 4, 1)
      },
      {
        body: `${bankName1}: Your Acct XX1234 has been debited INR 199.00 on 12-05-2025 for Spotify Premium. Avl Bal: INR 25,781.75`,
        date: new Date(2025, 4, 12)
      },
      {
        body: `${bankName3}: INR 2,340.00 debited from your account XX5678 for Amazon.in purchase on 10-05-2025. Avl Bal: INR 31,450.80`,
        date: new Date(2025, 4, 10)
      },
      {
        body: `${bankName2}: INR 899.00 spent at Flipkart via UPI on 09-05-2025. Avl bal: INR 33,790.80`,
        date: new Date(2025, 4, 9)
      }
    ];
    
    try {
      // Extract balance from the most recent message
      const latestMessage = sampleMessages[0];
      const balanceMatch = latestMessage.body.match(/Avl Bal: INR ([0-9,.]+)/);
      if (balanceMatch && balanceMatch[1]) {
        const balanceValue = parseFloat(balanceMatch[1].replace(/,/g, ''));
        setBalance(balanceValue);
      }
      
      // Parse the messages
      const { transactions, subscriptions } = parseSMS(sampleMessages);
      setImportedTransactions(transactions);
      setImportedSubscriptions(subscriptions);
      
      // Save the data to localStorage so dashboard can use it
      saveSMSData(transactions, subscriptions, balance);
      
      toast({
        title: "SMS Analysis Complete",
        description: `Found ${transactions.length} transactions and ${subscriptions.length} subscriptions.`,
      });
    } catch (error) {
      toast({
        title: "Error Processing Messages",
        description: "There was an issue analyzing your SMS messages.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsAutoDetecting(false);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);
    
    // Create a test array of messages to parse
    const messages = [
      {
        body: values.smsText,
        date: new Date()
      }
    ];

    try {
      const { transactions, subscriptions } = parseSMS(messages);
      setImportedTransactions(transactions);
      setImportedSubscriptions(subscriptions);
      
      // Try to extract balance information
      const balanceMatch = values.smsText.match(/Avl Bal: INR ([0-9,.]+)/);
      if (balanceMatch && balanceMatch[1]) {
        const balanceValue = parseFloat(balanceMatch[1].replace(/,/g, ''));
        setBalance(balanceValue);
        
        // Save to localStorage
        saveSMSData(transactions, subscriptions, balanceValue);
      } else {
        saveSMSData(transactions, subscriptions, balance);
      }
      
      toast({
        title: "SMS Parsed Successfully",
        description: `Found ${transactions.length} transactions and ${subscriptions.length} subscriptions.`,
      });
    } catch (error) {
      toast({
        title: "Error Parsing SMS",
        description: "Could not extract transaction data from the SMS text.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleImportAll = () => {
    toast({
      title: "Transactions Imported",
      description: "All transactions have been added to your dashboard.",
    });
    
    // Wait a moment then navigate back to dashboard
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <AppLayout showBackButton={true}>
      <div className="container mx-auto py-6 space-y-6 px-3 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold">SMS Import</h1>
          <p className="text-muted-foreground">
            Import transactions from bank SMS messages
          </p>
        </div>

        {isAutoDetecting ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Analyzing SMS Messages</CardTitle>
              <CardDescription>
                We're automatically scanning your bank messages to extract transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center">Analyzing your messages...</p>
              <p className="text-muted-foreground text-center text-sm mt-2">
                This only takes a few seconds
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="w-full">
              {balance !== null && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border-b border-emerald-200 dark:border-emerald-900 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Current Balance</span>
                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {balance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>Import SMS</CardTitle>
                <CardDescription>
                  {isMobileDevice ? 
                    "We've automatically analyzed your bank messages" :
                    "Paste your bank or card SMS to extract transaction details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isMobileDevice && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <FormField
                        control={form.control}
                        name="smsText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMS Text</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Paste your SMS text here..." 
                                {...field}
                                rows={10} 
                              />
                            </FormControl>
                            <FormDescription>
                              Example: "Your account XX1234 has been debited INR 499.00 for Netflix subscription."
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <MessageSquareText className="mr-2 h-4 w-4" />
                            Parse SMS
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
                {isMobileDevice && (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Inbox className="h-12 w-12 text-primary mb-4" />
                    <p className="text-center mb-4">
                      We've analyzed your bank messages and found transactions
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={simulateAutoDetection}
                      disabled={isProcessing}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="pb-2">
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Extracted data from SMS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transactions">
                  <TabsList className="mb-4">
                    <TabsTrigger value="transactions">
                      Transactions <Badge className="ml-1">{importedTransactions.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="subscriptions">
                      Subscriptions <Badge className="ml-1">{importedSubscriptions.length}</Badge>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="transactions">
                    {isProcessing ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center border-b pb-2">
                            <Skeleton className="h-6 w-6 mr-2 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : importedTransactions.length > 0 ? (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {importedTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center border-b pb-2">
                            <div className="mr-2">
                              <Check className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{transaction.category}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {transaction.description}
                              </div>
                            </div>
                            <div>
                              <span className={transaction.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}>
                                {transaction.amount < 0 ? '-₹' : '+₹'}{Math.abs(transaction.amount).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquareText className="mx-auto h-12 w-12 opacity-20 mb-2" />
                        <p>No transactions parsed yet.</p>
                        <p className="text-sm">{isMobileDevice ? "Refresh to analyze more messages" : "Paste an SMS and click Parse SMS to extract transactions"}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="subscriptions">
                    {isProcessing ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="flex items-center border-b pb-2">
                            <Skeleton className="h-6 w-6 mr-2 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : importedSubscriptions.length > 0 ? (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {importedSubscriptions.map((subscription) => (
                          <div key={subscription.id} className="flex items-center border-b pb-2">
                            <div className="mr-2">
                              <Check className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{subscription.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Renews on {subscription.renewalDate.toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-medium flex items-center whitespace-nowrap">
                                <IndianRupee className="h-3 w-3 mr-0.5" />
                                {subscription.amount.toLocaleString('en-IN')}
                              </span>
                              <Badge variant="outline" className="mt-1">{subscription.category}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquareText className="mx-auto h-12 w-12 opacity-20 mb-2" />
                        <p>No subscriptions detected.</p>
                        <p className="text-sm">{isMobileDevice ? "Refresh to analyze more messages" : "Paste an SMS and click Parse SMS to extract subscriptions"}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="default" 
                  disabled={importedTransactions.length === 0}
                  onClick={handleImportAll}
                >
                  Import All Transactions
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
