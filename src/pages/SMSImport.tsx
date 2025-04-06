
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
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseSMS, Transaction } from "@/utils/smsParser";
import { useToast } from "@/components/ui/use-toast";
import { Check, MessageSquareText } from "lucide-react";

const formSchema = z.object({
  smsText: z.string().min(10, {
    message: "SMS text should be at least 10 characters.",
  }),
});

export default function SMSImport() {
  const { toast } = useToast();
  const [importedTransactions, setImportedTransactions] = useState<Transaction[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      smsText: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
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
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SMS Import</h1>
        <p className="text-muted-foreground">
          Import transactions from bank SMS messages
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import SMS</CardTitle>
            <CardDescription>
              Paste your bank or card SMS to extract transaction details
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <Button type="submit">
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  Parse SMS
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              Extracted transactions from SMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            {importedTransactions.length > 0 ? (
              <div className="space-y-4">
                {importedTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center border-b pb-2">
                    <div className="mr-2">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{transaction.category}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {transaction.description}
                      </div>
                    </div>
                    <div>
                      <span className={transaction.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}>
                        {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquareText className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No transactions parsed yet.</p>
                <p className="text-sm">Paste an SMS and click Parse SMS to extract transactions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
