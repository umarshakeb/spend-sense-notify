
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { categorizeTransaction } from "@/utils/expenseUtils";

// Categories available for selection
const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Education",
  "Bills & Utilities",
  "Health",
  "Travel",
  "Subscription",
  "Miscellaneous",
  "Income",
];

// Form schema with validation
const formSchema = z.object({
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  category: z.string().optional(),
});

interface AddExpenseFormProps {
  onAddTransaction: (transaction: any) => void;
}

export function AddExpenseForm({ onAddTransaction }: AddExpenseFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [needsManualCategory, setNeedsManualCategory] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      category: undefined,
    },
  });
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Try to auto-categorize based on description
    let category = values.category;
    
    // If category is not selected manually, try to auto-categorize
    if (!category) {
      category = categorizeTransaction(values.description);
      
      // If we couldn't categorize automatically
      if (category === "Miscellaneous" && !needsManualCategory) {
        setNeedsManualCategory(true);
        toast({
          title: "Please categorize this transaction",
          description: "We couldn't automatically categorize this transaction. Please select a category.",
        });
        return;
      }
    }
    
    // Generate a unique transaction ID
    const newTransaction = {
      id: `tr-${Date.now()}`,
      description: values.description,
      amount: -Math.abs(Number(values.amount)), // Make it negative for expenses
      date: new Date(values.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      category,
      type: "expense",
    };
    
    onAddTransaction(newTransaction);
    
    toast({
      title: "Expense added",
      description: `$${Math.abs(Number(values.amount)).toFixed(2)} for ${values.description}`,
    });
    
    // Reset form and close dialog
    form.reset();
    setNeedsManualCategory(false);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Add Expense</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Enter your expense details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Coffee, Groceries, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {needsManualCategory && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Please select the most appropriate category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
