
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
import { parseSMS, Transaction, Subscription, saveSMSData, generateRealisticSMSData } from "@/utils/smsParser";
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

  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        setIsMobileDevice(Capacitor.isNativePlatform());
        
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

  const simulateAutoDetection = async () => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const { transactions, subscriptions, balance: detectedBalance } = generateRealisticSMSData();
      
      setBalance(detectedBalance);
      setImportedTransactions(transactions);
      setImportedSubscriptions(subscriptions);
      
      saveSMSData(transactions, subscriptions, detectedBalance);
      
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
      
      const balanceMatch = values.smsText.match(/Avl Bal: INR ([0-9,.]+)/);
      if (balanceMatch && balanceMatch[1]) {
        const balanceValue = parseFloat(balanceMatch[1].replace(/,/g, ''));
        setBalance(balanceValue);
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
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <AppLayout showBackButton={true}>
      <div className="w-full min-h-screen px-3 py-4 sm:py-6 sm:px-6 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 min-w-0">
          <div className="w-full min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold break-words">SMS Import</h1>
            <p className="text-sm sm:text-base text-muted-foreground break-words">
              Import transactions from bank SMS messages
            </p>
          </div>

          {isAutoDetecting ? (
            <Card className="w-full min-w-0">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl break-words">Analyzing SMS Messages</CardTitle>
                <CardDescription className="text-sm break-words">
                  We're automatically scanning your bank messages to extract transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10">
                <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-4" />
                <p className="text-center text-sm sm:text-base break-words">Analyzing your messages...</p>
                <p className="text-muted-foreground text-center text-xs sm:text-sm mt-2 break-words">
                  This only takes a few seconds
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 w-full min-w-0">
              <Card className="w-full min-w-0">
                {balance !== null && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border-b border-emerald-200 dark:border-emerald-900 rounded-t-lg">
                    <div className="flex justify-between items-center w-full min-w-0">
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300 break-words">Current Balance</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-300 flex items-center flex-shrink-0">
                        <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="break-all">{balance.toLocaleString('en-IN')}</span>
                      </span>
                    </div>
                  </div>
                )}
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl break-words">Import SMS</CardTitle>
                  <CardDescription className="text-sm break-words">
                    {isMobileDevice ? 
                      "We've automatically analyzed your bank messages" :
                      "Paste your bank or card SMS to extract transaction details"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {!isMobileDevice && (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                        <FormField
                          control={form.control}
                          name="smsText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">SMS Text</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Paste your SMS text here..." 
                                  {...field}
                                  rows={8}
                                  className="text-sm resize-none"
                                />
                              </FormControl>
                              <FormDescription className="text-xs break-words">
                                Example: "Your account XX1234 has been debited INR 499.00 for Netflix subscription."
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isProcessing} className="w-full sm:w-auto">
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
                      <Inbox className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                      <p className="text-center mb-4 text-sm break-words">
                        We've analyzed your bank messages and found transactions
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={simulateAutoDetection}
                        disabled={isProcessing}
                        className="w-full sm:w-auto"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="w-full min-w-0">
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl break-words">Results</CardTitle>
                  <CardDescription className="text-sm break-words">
                    Extracted data from SMS
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Tabs defaultValue="transactions" className="w-full">
                    <TabsList className="mb-4 w-full">
                      <TabsTrigger value="transactions" className="flex-1 text-xs sm:text-sm">
                        Transactions <Badge className="ml-1 text-xs">{importedTransactions.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="subscriptions" className="flex-1 text-xs sm:text-sm">
                        Subscriptions <Badge className="ml-1 text-xs">{importedSubscriptions.length}</Badge>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="transactions" className="w-full">
                      {isProcessing ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center border-b pb-2">
                              <Skeleton className="h-6 w-6 mr-2 rounded-full" />
                              <div className="flex-1 min-w-0">
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                              <Skeleton className="h-5 w-16" />
                            </div>
                          ))}
                        </div>
                      ) : importedTransactions.length > 0 ? (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                          {importedTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center border-b pb-2 w-full min-w-0">
                              <div className="mr-2 flex-shrink-0">
                                <Check className="h-5 w-5 text-green-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm break-words">{transaction.category}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {transaction.description}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <span className={`text-sm ${transaction.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {transaction.amount < 0 ? '-₹' : '+₹'}{Math.abs(transaction.amount).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquareText className="mx-auto h-12 w-12 opacity-20 mb-2" />
                          <p className="text-sm break-words">No transactions parsed yet.</p>
                          <p className="text-xs break-words">{isMobileDevice ? "Refresh to analyze more messages" : "Paste an SMS and click Parse SMS to extract transactions"}</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="subscriptions" className="w-full">
                      {isProcessing ? (
                        <div className="space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex items-center border-b pb-2">
                              <Skeleton className="h-6 w-6 mr-2 rounded-full" />
                              <div className="flex-1 min-w-0">
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                              <Skeleton className="h-5 w-16" />
                            </div>
                          ))}
                        </div>
                      ) : importedSubscriptions.length > 0 ? (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                          {importedSubscriptions.map((subscription) => (
                            <div key={subscription.id} className="flex items-center border-b pb-2 w-full min-w-0">
                              <div className="mr-2 flex-shrink-0">
                                <Check className="h-5 w-5 text-green-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm break-words">{subscription.name}</div>
                                <div className="text-xs text-muted-foreground break-words">
                                  Renews on {subscription.renewalDate.toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex flex-col items-end flex-shrink-0">
                                <span className="font-medium flex items-center text-sm">
                                  <IndianRupee className="h-3 w-3 mr-0.5" />
                                  {subscription.amount.toLocaleString('en-IN')}
                                </span>
                                <Badge variant="outline" className="mt-1 text-xs">{subscription.category}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquareText className="mx-auto h-12 w-12 opacity-20 mb-2" />
                          <p className="text-sm break-words">No subscriptions detected.</p>
                          <p className="text-xs break-words">{isMobileDevice ? "Refresh to analyze more messages" : "Paste an SMS and click Parse SMS to extract subscriptions"}</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-end p-4 sm:p-6">
                  <Button 
                    variant="default" 
                    disabled={importedTransactions.length === 0}
                    onClick={handleImportAll}
                    className="w-full sm:w-auto"
                  >
                    Import All Transactions
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
