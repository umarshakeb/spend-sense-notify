
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { parseSMSWithLLM, saveSMSData, generateSampleSMSMessages } from "@/utils/smsParser";

export default function SMSImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    transactions: number;
    subscriptions: number;
    balance?: number;
  } | null>(null);
  const navigate = useNavigate();

  const handleImportSMS = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Simulate progress
      setProgress(20);
      toast.info("Reading SMS messages...");
      
      // Generate sample SMS messages for demo
      const sampleMessages = generateSampleSMSMessages();
      setProgress(40);
      
      toast.info("Processing messages with AI...");
      
      // Use LLM-powered parsing
      const { transactions, subscriptions } = await parseSMSWithLLM(sampleMessages);
      setProgress(80);
      
      // Calculate balance
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
      const balance = 15000 + totalIncome - totalExpenses;
      
      // Save to localStorage
      const saved = saveSMSData(transactions, subscriptions, balance);
      setProgress(100);
      
      if (saved) {
        setResults({
          transactions: transactions.length,
          subscriptions: subscriptions.length,
          balance
        });
        toast.success("SMS data imported successfully!");
      } else {
        throw new Error("Failed to save data");
      }
      
    } catch (error) {
      console.error("SMS import error:", error);
      toast.error("Failed to import SMS data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">SMS Import</h1>
        <p className="text-muted-foreground mt-2">
          Import your bank SMS messages to automatically track transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Import Bank SMS Messages
          </CardTitle>
          <CardDescription>
            Our AI will analyze your SMS messages to extract transaction data automatically.
            Only actual transaction messages will be processed - promotional messages are ignored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isProcessing && !results && (
            <div className="text-center space-y-4">
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Click the button below to start importing your SMS messages.
                  We'll use advanced AI to identify and parse transaction messages accurately.
                </p>
                <Button onClick={handleImportSMS} size="lg">
                  Start SMS Import
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Only transaction messages are processed</p>
                <p>• Promotional and offer messages are automatically filtered out</p>
                <p>• Your SMS data is processed securely and privately</p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">Processing SMS Messages...</h3>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {progress < 40 && "Reading SMS messages..."}
                  {progress >= 40 && progress < 80 && "AI is analyzing transaction patterns..."}
                  {progress >= 80 && "Finalizing data..."}
                </p>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">Import Completed!</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{results.transactions}</div>
                    <div className="text-sm text-muted-foreground">Transactions</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{results.subscriptions}</div>
                    <div className="text-sm text-muted-foreground">Subscriptions</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{results.balance?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-muted-foreground">Current Balance</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center space-y-2">
                <Button onClick={() => navigate('/dashboard')} className="w-full">
                  View Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate('/transactions')} className="w-full">
                  View Transactions
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
