import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useKeylessAuth } from "@/hooks/useKeylessAuth";
import TrendingPairs from "@/components/TrendingPairs";
import PoolCard from "@/components/PoolCard";
import { useVault } from "@/hooks/useVault";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus,
  HelpCircle,
  Filter,
  TrendingUp,
  Wallet,
  DollarSign,
  Clock,
  AlertCircle
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { account, connect } = useWallet();
  const { user: keylessUser, isLoggedIn } = useKeylessAuth();
  
  // Safely destructure useVault with error handling
  let vaultData;
  try {
    vaultData = useVault();
  } catch (err) {
    console.error('Error in useVault hook:', err);
    vaultData = {
      strategies: [],
      userStake: null,
      loading: false,
      error: 'Failed to load vault data',
      hasStake: false,
      canWithdraw: false,
      totalEarnings: 0,
      availableBalance: 0
    };
  }
  
  const { 
    strategies = [], 
    userStake, 
    loading = false, 
    error, 
    hasStake = false, 
    canWithdraw = false,
    totalEarnings = 0,
    availableBalance = 0 
  } = vaultData;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  
  const filters = [
    { label: `ALL ${strategies.length}`, value: "ALL" },
    { label: "TOP 20", value: "TOP" },
    { label: "⚡ APT 2", value: "APT" },
    { label: "💧 USDC 2", value: "USDC" },
    { label: "💚 USDT 1", value: "USDT" },
    { label: "⚫ WETH 0", value: "WETH" }
  ];

  // Filter strategies based on search and filter
  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         strategy.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "ALL" || 
                         strategy.symbol.toUpperCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="animate-slide-in-left">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">Yield Optimizer</h1>
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {isLoggedIn ? (
                  `Keyless Account: ${keylessUser?.name || keylessUser?.email}`
                ) : account ? (
                  `Connected: ${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}`
                ) : (
                  "Connect wallet or sign in to start earning yield"
                )}
              </p>
            </div>
            <div className="flex space-x-4 animate-slide-in-right">
              {!account ? (
                <Button variant="default" size="lg" className="animate-glow-pulse" onClick={() => connect?.()}>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </Button>
              ) : (
                <>
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="animate-glow-pulse"
                    onClick={() => navigate("/deposit")}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Deposit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate("/withdraw")}
                  >
                    <ArrowDownLeft className="w-5 h-5 mr-2" />
                    Withdraw
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* User Portfolio Summary */}
        {account && hasStake && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-morphism animate-slide-in-left">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deposited</p>
                    <p className="text-2xl font-bold">${userStake?.principal.toFixed(2) || "0.00"}</p>
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

            <Card className="glass-morphism animate-fade-in" style={{animationDelay: "300ms"}}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold">${availableBalance.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-destructive font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trending Pairs */}
        <TrendingPairs />

        {/* Navigation Tabs */}
        <Tabs defaultValue="strategies" className="animate-fade-in">
          <TabsList className="grid w-fit grid-cols-2 mb-8">
            <TabsTrigger value="strategies" className="px-8">Yield Strategies</TabsTrigger>
            <TabsTrigger value="my-positions" className="px-8">My Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="strategies" className="space-y-6">
            {/* Strategy Type Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between animate-slide-up">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-full">
                  Stablecoins
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  High Yield
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search Strategies"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass-morphism"
                  />
                </div>
              </div>
            </div>

            {/* Token Filters */}
            <div className="flex flex-wrap gap-2 animate-slide-up" style={{animationDelay: "100ms"}}>
              {filters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedFilter === filter.value ? "hero" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
                  className="rounded-full transition-all duration-200 hover:scale-105"
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-6 py-3 text-sm text-muted-foreground border-b border-border animate-fade-in">
              <div>Strategies</div>
              <div className="text-right">Volume 24H ⬇</div>
              <div className="text-right">APY ⬇</div>
              <div className="text-right">TVL ⬇</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Strategy Cards */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading strategies...</p>
                </div>
              ) : filteredStrategies.length > 0 ? (
                filteredStrategies.map((strategy, index) => (
                  <PoolCard
                    key={strategy.id}
                    pair={`${strategy.symbol} Yield Strategy`}
                    volume24h={strategy.volume24h}
                    apr={`${strategy.apy.toFixed(2)}%`}
                    tvl={strategy.tvl}
                    stable={strategy.stable}
                    version={strategy.version}
                    delay={index * 100}
                    onClick={() => navigate("/deposit")}
                  />
                ))
              ) : (
                <Card className="glass-morphism">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Strategies Found</h3>
                    <p className="text-muted-foreground mb-6">
                      No yield strategies match your current filters. Try adjusting your search criteria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-positions" className="space-y-6">
            {!account ? (
              <Card className="glass-morphism animate-bounce-in">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-6">
                    Connect your wallet to view your yield farming positions and earnings.
                  </p>
                  <Button variant="hero" size="lg" onClick={connect}>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            ) : !hasStake ? (
              <Card className="glass-morphism animate-bounce-in">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Active Positions</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't deposited into any yield strategies yet. Start earning by depositing into your first strategy.
                  </p>
                  <Button variant="hero" size="lg" onClick={() => navigate("/deposit")}>
                    <Plus className="w-5 h-5 mr-2" />
                    Start Earning Yield
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="glass-morphism animate-bounce-in">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span>Active Position</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Strategy</span>
                          <span className="font-semibold">USDC Yield Strategy</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Principal Deposited</span>
                          <span className="font-semibold">${userStake?.principal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Return</span>
                          <span className="font-semibold text-success">${userStake?.totalReturn.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Days Invested</span>
                          <span className="font-semibold">{userStake?.daysInvested}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={canWithdraw ? "default" : "secondary"}>
                            {canWithdraw ? "Available" : "Locked"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Unlock Time</span>
                          <span className="font-semibold">
                            {userStake?.unlockTimestampSecs ? 
                              new Date(userStake.unlockTimestampSecs * 1000).toLocaleDateString() : 
                              "N/A"
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Earnings</span>
                          <span className="font-semibold text-success">+${totalEarnings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate("/withdraw")}
                      >
                        <ArrowDownLeft className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => navigate("/deposit")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;