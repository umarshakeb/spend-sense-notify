import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { ArrowUpDown, ChevronDown, Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddExpenseForm } from "@/components/transactions/AddExpenseForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";

// Transaction type definition
interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: string;
  user_id?: string;
}

export default function Transactions() {
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["income", "expense"]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch transactions from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Format the transaction data
          const formattedData = data.map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          }));
          
          setTransactionData(formattedData);
        }
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [user, toast]);

  const handleAddTransaction = async (transaction: Transaction) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add transactions",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Format the date for database insertion
      const formattedDate = new Date(transaction.date).toISOString();
      
      // Insert the transaction into Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          type: transaction.type,
          date: formattedDate,
          user_id: user.id
        })
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Format the date for display
        const newTransaction = {
          ...data,
          date: new Date(data.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        };
        
        // Add to local state
        setTransactionData([newTransaction, ...transactionData]);
        
        toast({
          title: "Transaction added",
          description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of $${Math.abs(Number(transaction.amount)).toFixed(2)} added successfully`,
        });
      }
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive"
      });
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      // Don't allow deselecting both types
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleExport = () => {
    if (sortedTransactions.length === 0) {
      toast({
        title: "No data to export",
        description: "Add some transactions first",
      });
      return;
    }

    // Create CSV content
    const headers = ["Date", "Description", "Category", "Amount", "Type"];
    const csvContent = [
      headers.join(","),
      ...sortedTransactions.map(t => 
        [
          t.date,
          `"${t.description.replace(/"/g, '""')}"`, // Escape quotes in csv
          t.category,
          Math.abs(t.amount).toFixed(2),
          t.type
        ].join(",")
      )
    ].join("\n");

    // Create download link
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${sortedTransactions.length} transactions exported as CSV`,
    });
  };

  const filteredTransactions = transactionData.filter(transaction => {
    const matchesSearch = search === "" || 
      transaction.description.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = selectedTypes.includes(transaction.type);
    
    return matchesSearch && matchesType;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "amount") {
      return sortDirection === "asc" 
        ? a.amount - b.amount 
        : b.amount - a.amount;
    }
    
    if (sortBy === "date") {
      return sortDirection === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    // Default to string sorting for other columns
    const aValue = a[sortBy as keyof typeof a] as string;
    const bValue = b[sortBy as keyof typeof b] as string;
    
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your transaction history
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="w-[250px] pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span>Type</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={selectedTypes.includes("expense")}
                  onCheckedChange={() => handleTypeToggle("expense")}
                >
                  Expenses
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedTypes.includes("income")}
                  onCheckedChange={() => handleTypeToggle("income")}
                >
                  Income
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-2">
            <AddExpenseForm onAddTransaction={handleAddTransaction} />
            
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Date
                    {sortBy === "date" && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center">
                    Description
                    {sortBy === "description" && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {sortBy === "category" && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center justify-end">
                    Amount
                    {sortBy === "amount" && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : sortedTransactions.length > 0 ? (
                sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className={`text-right ${transaction.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                      {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}
