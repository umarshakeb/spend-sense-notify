
import { useState } from "react";
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

// Sample transaction data
const transactionData = [
  {
    id: "tr1",
    date: "Apr 5, 2025",
    description: "Amazon",
    category: "Shopping",
    amount: -89.99,
    type: "expense",
  },
  {
    id: "tr2",
    date: "Apr 4, 2025",
    description: "Starbucks",
    category: "Food",
    amount: -5.75,
    type: "expense",
  },
  {
    id: "tr3",
    date: "Apr 3, 2025",
    description: "Netflix",
    category: "Subscription",
    amount: -14.99,
    type: "expense",
  },
  {
    id: "tr4",
    date: "Apr 2, 2025",
    description: "Udemy",
    category: "Education",
    amount: -19.99,
    type: "expense",
  },
  {
    id: "tr5",
    date: "Apr 1, 2025",
    description: "Salary",
    category: "Income",
    amount: 2350.00,
    type: "income",
  },
  {
    id: "tr6",
    date: "Mar 28, 2025",
    description: "Uber",
    category: "Transportation",
    amount: -24.50,
    type: "expense",
  },
  {
    id: "tr7",
    date: "Mar 25, 2025",
    description: "Grocery Store",
    category: "Groceries",
    amount: -78.32,
    type: "expense",
  },
  {
    id: "tr8",
    date: "Mar 22, 2025",
    description: "Phone Bill",
    category: "Utilities",
    amount: -45.00,
    type: "expense",
  },
  {
    id: "tr9",
    date: "Mar 20, 2025",
    description: "Spotify",
    category: "Subscription",
    amount: -9.99,
    type: "expense",
  },
  {
    id: "tr10",
    date: "Mar 15, 2025",
    description: "Interest",
    category: "Income",
    amount: 3.45,
    type: "income",
  },
];

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["income", "expense"]);

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
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage your transaction history
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
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

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
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
            {sortedTransactions.length > 0 ? (
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
  );
}
