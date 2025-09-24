import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Deposit = () => {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(1);

  const assets = [
    { symbol: "USDC", name: "USD Coin", balance: 1250.50 },
    { symbol: "USDT", name: "Tether USD", balance: 850.25 }
  ];

  const selectedAssetData = assets.find(asset => asset.symbol === selectedAsset);

  const handleDeposit = () => {
    // Simulate deposit process
    setStep(2);
    setTimeout(() => setStep(3), 2000);
    setTimeout(() => setStep(4), 4000);
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Deposit Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your {amount} {selectedAsset} has been successfully deposited.
            </p>
            <Button variant="hero" onClick={() => navigate("/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Deposit Assets</h1>
            <p className="text-muted-foreground">Add funds to start earning yield</p>
          </div>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Choose Amount"}
              {step === 2 && "Approving Transaction..."}
              {step === 3 && "Bridging to Aptos..."}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Asset</label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.symbol} value={asset.symbol}>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{asset.symbol}</span>
                            <span className="text-muted-foreground">- {asset.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Amount</label>
                    <span className="text-sm text-muted-foreground">
                      Balance: {selectedAssetData?.balance} {selectedAsset}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setAmount(selectedAssetData?.balance.toString() || "")}
                    >
                      Max
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current APY</span>
                    <span className="text-primary font-medium">12.45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Est. Annual Earnings</span>
                    <span className="text-success font-medium">
                      +${((parseFloat(amount) || 0) * 0.1245).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handleDeposit}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  Bridge & Deposit
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {(step === 2 || step === 3) && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">
                  {step === 2 ? "Approving USDC on Ethereum..." : "Bridging to Aptos via CCTP..."}
                </h3>
                <p className="text-muted-foreground">
                  Please wait while we process your transaction
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Deposit;