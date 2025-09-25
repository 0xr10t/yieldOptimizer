import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  // Redirect if no wallet connected
  useEffect(() => {
    if (!account) {
      navigate("/dashboard");
      return;
    }
    // Removed automatic redirect to deposit - let user see withdraw page even without stake
  }, [account, navigate]);

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
                  {userStake ? (userStake.principal / 1e8).toFixed(2) : "0.00"} APT
                </p>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-slate-300">Total Earnings</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {userStake ? ((userStake.totalReturn - userStake.principal) / 1e8).toFixed(2) : "0.00"} APT
                </p>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-slate-300">Total Return</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {userStake ? (userStake.totalReturn / 1e8).toFixed(2) : "0.00"} APT
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
            </div>

            <Separator className="bg-slate-600" />

            {/* Withdrawal Action */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Available to withdraw:</span>
                <span className="text-xl font-bold text-white">
                  {canWithdraw && userStake ? (userStake.totalReturn / 1e8).toFixed(2) : "0.00"} APT
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
