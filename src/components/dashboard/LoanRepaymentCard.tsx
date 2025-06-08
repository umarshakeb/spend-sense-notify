
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark } from "lucide-react";
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
      // Reset form
      setLoanAmount("");
      setInterestRate("");
      setMonthlyPayment("");
    }, 1000);
  };

  return (
    <div className="w-full max-w-full min-w-0">
      <Card className="border-dashed w-full overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Landmark className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="break-words truncate">Loan Repayment</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm break-words">
            Track your loan repayment progress and find ways to save
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          {showLoanForm ? (
            <form onSubmit={handleAddLoan} className="space-y-3 sm:space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="loanAmount" className="text-xs sm:text-sm">Loan Amount (₹)</Label>
                <Input
                  id="loanAmount"
                  placeholder="e.g. 500000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  type="number"
                  min="0"
                  required
                  className="w-full text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interestRate" className="text-xs sm:text-sm">Interest Rate (%)</Label>
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
                  className="w-full text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monthlyPayment" className="text-xs sm:text-sm">Monthly Payment (₹)</Label>
                <Input
                  id="monthlyPayment"
                  placeholder="e.g. 15000"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  type="number"
                  min="0"
                  required
                  className="w-full text-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm">
                  {loading ? "Saving..." : "Save Loan"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLoanForm(false)}
                  className="w-full sm:w-auto text-sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
              <p className="break-words">Do you have any loans that you'd like to pay off sooner?</p>
              <p className="break-words">
                Add your loan details, and we'll help you track repayment progress and find ways to save on interest.
              </p>
            </div>
          )}
        </CardContent>
        {!showLoanForm && (
          <CardFooter className="p-3 sm:p-4 md:p-6 pt-0">
            <Button onClick={() => setShowLoanForm(true)} className="w-full sm:w-auto text-sm">
              Add Loan Details
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
