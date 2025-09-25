import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrendingPairs from "@/components/TrendingPairs";
import PoolCard from "@/components/PoolCard";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus,
  HelpCircle,
  Filter,
  TrendingUp
} from "lucide-react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  
  const filters = [
    { label: "ALL 100", value: "ALL" },
    { label: "TOP 20", value: "TOP" },
    { label: "⚡ APT 72", value: "APT" },
    { label: "💧 USDC 23", value: "USDC" },
    { label: "💚 USDT 15", value: "USDT" },
    { label: "⚫ WETH 8", value: "WETH" }
  ];

  const pools = [
    {
      pair: "amAPT - APT",
      volume24h: "$67,496.43",
      apr: "0.28%",
      tvl: "$4.280M",
      stable: true,
      version: "0.5"
    },
    {
      pair: "BTC - WBTC",
      volume24h: "$2,006.12",
      apr: "0.00%",
      tvl: "$936,807.305",
      stable: true,
      version: "0.5"
    },
    {
      pair: "WETH - WETH",
      volume24h: "$1,098.66",
      apr: "0.01%",
      tvl: "$834,473.477",
      stable: true,
      version: "0.5"
    },
    {
      pair: "USDC - USDT",
      volume24h: "$3,578.5",
      apr: "0.16%",
      tvl: "$424,897.101",
      stable: true,
      version: "0.5"
    },
    {
      pair: "doodoo - APT",
      volume24h: "$2,113.1",
      apr: "0.17%",
      tvl: "$307,719.91",
      stable: false,
      version: "0.5"
    }
  ];

  const handleDeposit = (poolPair) => {
    // Navigate to deposit page - you'll need to implement routing
    window.location.href = '/deposit';
    // Or if using React Router: navigate('/deposit');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="animate-slide-in-left">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">Liquidity Pools</h1>
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Stake APT to earn rewards</p>
            </div>
            <div className="flex space-x-4 animate-slide-in-right">
              <Button variant="hero" size="lg" className="animate-glow-pulse">
                <Plus className="w-5 h-5 mr-2" />
                Add Liquidity
              </Button>
              <Button variant="outline" size="lg">
                Create Pool
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Trending Pairs */}
        <TrendingPairs />

        {/* Navigation Tabs */}
        <Tabs defaultValue="pools" className="animate-fade-in">
          <TabsList className="grid w-fit grid-cols-2 mb-8">
            <TabsTrigger value="pools" className="px-8">Pools</TabsTrigger>
            <TabsTrigger value="my-pools" className="px-8">My Pools</TabsTrigger>
          </TabsList>

          <TabsContent value="pools" className="space-y-6">
            {/* Pool Type Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between animate-slide-up">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-full">
                  Classic
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  Concentrated
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search Pools"
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
            <div className="grid grid-cols-6 gap-4 px-6 py-3 text-sm text-muted-foreground border-b border-border animate-fade-in">
              <div className="col-span-2">Pools</div>
              <div className="text-center">Volume 24H ⬇</div>
              <div className="text-center">APR ⬇</div>
              <div className="text-center">TVL ⬇</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Pool Rows */}
            <div className="space-y-2">
              {pools.map((pool, index) => (
                <Card key={pool.pair} className="glass-morphism animate-slide-up border-border/50 hover:bg-accent/50 transition-all duration-200" style={{animationDelay: `${index * 100}ms`}}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* Pool Info */}
                      <div className="col-span-2 flex items-center space-x-4">
                        <div className="flex -space-x-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 border-2 border-background"></div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 border-2 border-background"></div>
                        </div>
                        <div>
                          <div className="font-medium text-lg">{pool.pair}</div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {pool.stable && <Badge variant="secondary" className="text-xs">Stable</Badge>}
                            <span>Ver. {pool.version}</span>
                          </div>
                        </div>
                      </div>

                      {/* Volume 24H */}
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Volume 24H</div>
                        <div className="font-medium">{pool.volume24h}</div>
                      </div>

                      {/* APR */}
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">APR</div>
                        <div className="font-medium text-green-500">{pool.apr}</div>
                      </div>

                      {/* TVL */}
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">TVL</div>
                        <div className="font-medium">{pool.tvl}</div>
                      </div>

                      {/* Actions */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleDeposit(pool.pair)}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                          >
                            Deposit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-pools" className="space-y-6">
            <Card className="glass-morphism animate-bounce-in">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Liquidity Positions</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't provided liquidity to any pools yet. Start earning by adding liquidity to your first pool.
                </p>
                <Button variant="hero" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Liquidity
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;