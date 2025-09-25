import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowDownLeft, AlertCircle, CheckCircle, Loader, DollarSign, Clock, Shield, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useVault } from "@/hooks/useVault";

const Withdraw = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const { 
    userStake, 
    withdraw, 
    loading, 
    error, 
    hasStake, 
    canWithdraw,
    totalEarnings,
    availableBalance,
    formatDuration
  } = useVault();
  
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  // Redirect if no wallet connected or no stake
  useEffect(() => {
    if (!account) {
      navigate("/dashboard");
      return;
    }
    if (!hasStake) {
      navigate("/deposit");
      return;
    }
  }, [account, hasStake, navigate]);

  const handleWithdraw = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!canWithdraw) {
      alert("Your funds are still locked. Please wait until the lock period expires.");
      return;
    }

    if (!userStake) {
      alert("No stake found");
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await withdraw();
      console.log("Withdrawal successful:", response);
      setTransactionHash(response.hash || "");
      
      setTransactionComplete(true);
    } catch (err) {
      console.error("Withdrawal failed:", err);
      alert(`Withdrawal failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate time remaining until unlock
  const getTimeRemaining = () => {
    if (!userStake) return "";
    
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = userStake.unlockTimestampSecs - now;
    
    if (timeRemaining <= 0) return "Available now";
    
    const days = Math.floor(timeRemaining / 86400);
    const hours = Math.floor((timeRemaining % 86400) / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (transactionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border-slate-700/50 text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Withdrawal Successful!</h2>
            <p className="text-slate-300 mb-6">
              Your funds have been successfully withdrawn to your wallet.
            </p>
            {transactionHash && (
              <p className="text-xs text-slate-400 mb-6 break-all">
                Transaction: {transactionHash}
              </p>
            )}
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userStake) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border-slate-700/50 text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-3 text-white">No Active Stake</h2>
            <p className="text-slate-300 mb-6">
              You don't have any active deposits to withdraw.
            </p>
            <Button 
              onClick={() => navigate("/deposit")} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Make a Deposit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/dashboard")}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Withdrawal Card */}
        <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <ArrowDownLeft className="w-8 h-8 text-red-400" />
              Withdraw Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stake Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-slate-300">Principal</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {(userStake.principal / 1e8).toFixed(2)} APT
                </p>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-slate-300">Total Earnings</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {((userStake.totalReturn - userStake.principal) / 1e8).toFixed(2)} APT
                </p>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-slate-300">Total Return</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {(userStake.totalReturn / 1e8).toFixed(2)} APT
                </p>
              </div>
            </div>

            {/* Lock Status */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-slate-300">Lock Status</span>
                </div>
                <Badge variant={canWithdraw ? "default" : "secondary"}>
                  {canWithdraw ? "Unlocked" : "Locked"}
                </Badge>
              </div>
              
              <p className="text-white font-medium mb-2">
                {getTimeRemaining()}
              </p>
              
              {!canWithdraw && (
                <div className="space-y-2">
                  <Progress 
                    value={Math.max(0, Math.min(100, ((Date.now() / 1000 - (userStake.unlockTimestampSecs - userStake.daysInvested * 86400)) / (userStake.daysInvested * 86400)) * 100))}
                    className="h-2"
                  />
                  <p className="text-xs text-slate-400">
                    Days invested: {userStake.daysInvested}
                  </p>
                </div>
              )}
            </div>

            <Separator className="bg-slate-600" />

            {/* Withdrawal Action */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Available to withdraw:</span>
                <span className="text-xl font-bold text-white">
                  {canWithdraw ? (userStake.totalReturn / 1e8).toFixed(2) : "0.00"} APT
                </span>
              </div>
              
              <Button 
                onClick={handleWithdraw}
                disabled={!canWithdraw || isProcessing || loading}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing Withdrawal...
                  </>
                ) : canWithdraw ? (
                  "Withdraw All Funds"
                ) : (
                  "Funds Locked"
                )}
              </Button>
              
              {!canWithdraw && (
                <p className="text-xs text-slate-400 text-center">
                  Your funds will be available for withdrawal when the lock period expires.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900/20 border-red-500/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-morphism animate-slide-in-left">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold">${availableBalance.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-morphism animate-scale-in" style={{animationDelay: "100ms"}}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-success">+${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-morphism animate-slide-in-right" style={{animationDelay: "200ms"}}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Invested</p>
                  <p className="text-2xl font-bold">{userStake?.daysInvested || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Withdraw Form */}
          <Card className="glass-morphism animate-slide-up">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 text-primary-foreground" />
                </div>
                <span>Withdrawal Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enhanced Balance Display */}
              <div className="bg-gradient-secondary rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Portfolio Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Principal Deposit</span>
                    <span className="text-lg font-semibold">${userStake?.principal.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Earned Rewards</span>
                    <span className="text-lg font-semibold text-success">+${totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Lock Duration</span>
                    <span className="text-lg font-semibold">{formatDuration(userStake?.unlockTimestampSecs ? 
                      Math.max(0, userStake.unlockTimestampSecs - Math.floor(Date.now() / 1000)) : 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Available</span>
                    <span className="text-2xl font-bold text-primary">${availableBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Amount Input */}
              <div className="space-y-4">
                <label className="text-sm font-semibold">Withdrawal Amount</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="text-right text-xl font-semibold pr-20 h-14 glass-morphism"
                    max={availableBalance}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Badge variant="secondary">USDC</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((percentage) => (
                    <Button
                      key={percentage}
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:scale-105 transition-all"
                      onClick={() => setWithdrawAmount(((availableBalance * percentage) / 100).toFixed(2))}
                    >
                      {percentage === 100 ? 'MAX' : `${percentage}%`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Enhanced Transaction Summary */}
              {withdrawAmount && (
                <div className="bg-gradient-hero rounded-xl p-6 space-y-4 border border-primary/30 animate-fade-in">
                  <h3 className="font-semibold text-lg text-primary flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Transaction Preview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Withdrawal Amount</span>
                      <span className="font-semibold text-lg">${parseFloat(withdrawAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Network Fee</span>
                      <span className="font-medium text-warning">~$0.50</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Processing Time</span>
                      <span className="font-medium">~30-60 seconds</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="font-semibold text-success">You'll Receive</span>
                      <span className="font-bold text-xl text-success">
                        ${(parseFloat(withdrawAmount) - 0.5).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Withdraw Button */}
              <Button
                variant="destructive"
                size="xl"
                className="w-full animate-glow-pulse"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || isProcessing || parseFloat(withdrawAmount) > availableBalance || !canWithdraw}
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Processing Withdrawal...
                  </>
                ) : !canWithdraw ? (
                  <>
                    <Clock className="w-5 h-5 mr-2" />
                    Funds Locked
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-5 h-5 mr-2" />
                    Withdraw ${withdrawAmount || "0.00"}
                  </>
                )}
              </Button>

              {/* Enhanced Warning */}
              <div className="flex items-start space-x-3 p-4 bg-warning/5 rounded-xl border border-warning/20">
                <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-warning mb-1">
                    {!canWithdraw ? "Funds Locked" : "Security Notice"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {!canWithdraw 
                      ? `Your funds are locked until ${userStake?.unlockTimestampSecs ? 
                          new Date(userStake.unlockTimestampSecs * 1000).toLocaleDateString() : 
                          "the unlock time"}. You cannot withdraw until then.`
                      : "Withdrawals are irreversible and will be sent directly to your connected wallet. Please verify the amount before confirming."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Transaction Status */}
          <Card className="glass-morphism animate-slide-up" style={{animationDelay: "200ms"}}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <span>Transaction Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isProcessing && !transactionComplete ? (
                <div className="text-center py-16 animate-bounce-in">
                  <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                    <ArrowDownLeft className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Withdraw</h3>
                  <p className="text-muted-foreground mb-6">
                    Configure your withdrawal amount and click the withdraw button to begin
                  </p>
                  <div className="bg-muted/10 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> You can withdraw any amount up to your total balance at any time
                    </p>
                  </div>
                </div>
              ) : transactionComplete ? (
                <div className="text-center py-16 space-y-6 animate-bounce-in">
                  <div className="w-24 h-24 bg-success/20 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce-in">
                    <CheckCircle className="w-12 h-12 text-success" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-success mb-2">Withdrawal Complete!</h3>
                    <p className="text-muted-foreground mb-4">
                      Your funds have been successfully transferred to your wallet
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Transaction Confirmed
                    </Badge>
                    <div className="bg-muted/10 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground font-mono">
                        Tx Hash: 0x1234567890abcdef...
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
                    Return to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center animate-glow-pulse">
                      <Loader className="w-10 h-10 text-primary animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Processing Withdrawal</h3>
                    <p className="text-muted-foreground">Securely transferring your funds...</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-success/10 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-success" />
                      <div>
                        <p className="font-medium">Transaction Initiated</p>
                        <p className="text-sm text-muted-foreground">Withdrawal request submitted</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-3 bg-primary/10 rounded-lg">
                      <Loader className="w-6 h-6 text-primary animate-spin" />
                      <div>
                        <p className="font-medium">Blockchain Processing</p>
                        <p className="text-sm text-muted-foreground">Confirming on Aptos network...</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-3 bg-muted/5 rounded-lg opacity-50">
                      <div className="w-6 h-6 rounded-full border-2 border-muted"></div>
                      <div>
                        <p className="font-medium text-muted-foreground">Transfer Complete</p>
                        <p className="text-sm text-muted-foreground">Funds sent to your wallet</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-hero rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">Est. 30-60 seconds</span>
                    </div>
                    <Progress value={66} className="h-2" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;