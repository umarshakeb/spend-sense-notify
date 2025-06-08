
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock, Landmark } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const LoanRepaymentCard = () => {
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Loan details saved",
        description: "We'll help you track your loan repayment progress."
      });
      setLoading(false);
      setShowLoanForm(false);
    }, 1000);
  };

  return (
    <Card className="border-dashed mb-6 w-full overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Landmark className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="break-words">Loan Repayment</span>
        </CardTitle>
        <CardDescription className="text-sm break-words">
          Track your loan repayment progress and find ways to save
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {showLoanForm ? (
          <form onSubmit={handleAddLoan} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="loanAmount" className="text-sm">Loan Amount (₹)</Label>
              <Input
                id="loanAmount"
                placeholder="e.g. 500000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                type="number"
                min="0"
                required
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interestRate" className="text-sm">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                placeholder="e.g. 8.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="monthlyPayment" className="text-sm">Monthly Payment (₹)</Label>
              <Input
                id="monthlyPayment"
                placeholder="e.g. 15000"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                type="number"
                min="0"
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Saving..." : "Save Loan"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowLoanForm(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="break-words">Do you have any loans that you'd like to pay off sooner?</p>
            <p className="break-words">
              Add your loan details, and we'll help you track repayment progress and find ways to save on interest.
            </p>
          </div>
        )}
      </CardContent>
      {!showLoanForm && (
        <CardFooter className="p-4 sm:p-6 pt-0">
          <Button onClick={() => setShowLoanForm(true)} className="w-full sm:w-auto">
            Add Loan Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
