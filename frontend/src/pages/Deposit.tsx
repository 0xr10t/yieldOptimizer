"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useVault } from "@/hooks/useVault"
import { DURATION_OPTIONS } from "@/types/contracts"
import { ArrowLeft, ArrowRight, CheckCircle, Search, Plus, TrendingUp, Shield, Zap, AlertCircle, Clock, DollarSign } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const Deposit = () => {
  const navigate = useNavigate()
  const { account } = useWallet()
  const { 
    strategies, 
    deposit, 
    loading, 
    error, 
    getTokenBalance,
    calculateExpectedYield,
    calculateTotalReturn,
    formatDuration,
    getAPYForDuration
  } = useVault()
  
  const [selectedAsset, setSelectedAsset] = useState("APT")
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState(DURATION_OPTIONS.ONE_MONTH)
  const [step, setStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [userBalance, setUserBalance] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")

  // Available assets for deposit on devnet
  const availableAssets = [
    { symbol: "APT", name: "Aptos Coin", decimals: 8, type: "0x1::aptos_coin::AptosCoin" },
    { symbol: "USDC", name: "Mock USDC", decimals: 6, type: "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd::mock_coins::USDC" },
    { symbol: "USDT", name: "Mock USDT", decimals: 6, type: "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd::mock_coins::USDT" },
  ]

  // Get available strategies
  const availableStrategies = strategies.filter(strategy => 
    strategy.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    strategy.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedStrategy = strategies.find((strategy) => strategy.symbol === selectedAsset)

  // Get selected asset info
  const selectedAssetInfo = availableAssets.find(asset => asset.symbol === selectedAsset)

  // Fetch user balance for selected asset
  useEffect(() => {
    const fetchBalance = async () => {
      if (account?.address && selectedAssetInfo) {
        try {
          const balance = await getTokenBalance(selectedAssetInfo.type)
          setUserBalance(balance / Math.pow(10, selectedAssetInfo.decimals)) // Convert from smallest unit
        } catch (err) {
          console.error("Error fetching balance:", err)
          setUserBalance(0)
        }
      }
    }
    fetchBalance()
  }, [account?.address, selectedAssetInfo, getTokenBalance])

  const handleDeposit = async () => {
    if (!account) {
      alert("Please connect your wallet first")
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (parseFloat(amount) > userBalance) {
      alert("Insufficient balance")
      return
    }

    if (!selectedAssetInfo) {
      alert("Please select a valid asset")
      return
    }

    try {
      setIsProcessing(true)
      setStep(2)
      
      const depositParams = {
        amount: Math.floor(parseFloat(amount) * Math.pow(10, selectedAssetInfo.decimals)), // Convert to smallest unit
        durationSecs: duration,
        assetType: selectedAssetInfo.type
      }

      const response = await deposit(depositParams)
      console.log("Deposit successful:", response)
      setTransactionHash(response.hash || "")
      
      setStep(3)
      setTimeout(() => setStep(4), 2000)
    } catch (err) {
      console.error("Deposit failed:", err)
      alert(`Deposit failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      setStep(1)
    } finally {
      setIsProcessing(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Cosmic background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-md relative z-10">
          <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50 text-center shadow-2xl">
            <CardContent className="p-8">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-white">Deposit Successful!</h2>
              <p className="text-slate-300 mb-8 text-lg">
                Your {amount} {selectedAsset} has been successfully deposited and is now earning yield.
              </p>
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-10">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 p-2 rounded-xl"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Single-Token Deposits</h1>
              <p className="text-slate-300 text-lg">Single-sided liquidity positions that hold only one token in a pool.</p>
            </div>
          </div>

          {step === 1 && (
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search Pools"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 rounded-xl backdrop-blur-sm text-lg"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-4 mb-8">
                <Button className="bg-slate-700/50 text-white hover:bg-slate-600/50 rounded-xl px-6 py-2">
                  ALL {availableStrategies.length}
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/30 rounded-xl px-6 py-2">
                  ≡ APT {strategies.filter(s => s.symbol === "APT").length}
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/30 rounded-xl px-6 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  USDC {strategies.filter(s => s.symbol === "USDC").length}
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Pool List */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl">
                    <CardHeader className="pb-4">
                      <div className="grid grid-cols-12 gap-4 text-slate-400 text-sm font-medium">
                        <div className="col-span-4">Pools</div>
                        <div className="col-span-3 text-right">TVL</div>
                        <div className="col-span-2 text-right">Reward</div>
                        <div className="col-span-3 text-right">Actions</div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                          <p className="text-slate-300 mt-2">Loading strategies...</p>
                        </div>
                      ) : availableStrategies.length > 0 ? (
                        availableStrategies.map((strategy, index) => (
                          <motion.div
                            key={strategy.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`grid grid-cols-12 gap-4 items-center p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                              selectedAsset === strategy.symbol 
                                ? 'bg-purple-600/30 border border-purple-500/50' 
                                : 'bg-slate-700/20 hover:bg-slate-700/30'
                            }`}
                            onClick={() => setSelectedAsset(strategy.symbol)}
                          >
                            <div className="col-span-4 flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                strategy.symbol === 'USDC' ? 'bg-blue-600' : 
                                strategy.symbol === 'USDT' ? 'bg-green-600' : 'bg-purple-600'
                              }`}>
                                {strategy.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="text-white font-semibold flex items-center gap-2">
                                  {strategy.symbol} Yield Strategy
                                </div>
                                <div className="text-slate-400 text-sm">🏦 Vault Protocol</div>
                              </div>
                            </div>
                            <div className="col-span-3 text-right">
                              <div className="text-white font-bold text-lg">{strategy.tvl}</div>
                            </div>
                            <div className="col-span-2 text-right">
                              <div className="text-green-400 font-semibold">{strategy.apy.toFixed(2)}% APY</div>
                            </div>
                            <div className="col-span-3 text-right">
                              <Button 
                                size="sm" 
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-8 h-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-slate-300">No strategies found matching your search.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Deposit Form */}
                <div className="lg:col-span-1">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div key="step1" variants={containerVariants} className="space-y-6">
                        <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl">
                          <CardHeader>
                            <CardTitle className="text-xl text-white">Deposit {selectedAsset}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="space-y-3">
                              <label className="text-sm font-medium text-slate-300">Select Strategy</label>
                              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  {strategies.map((strategy) => (
                                    <SelectItem key={strategy.id} value={strategy.symbol} className="text-white hover:bg-slate-700">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                                          strategy.symbol === 'USDC' ? 'bg-blue-600' : 
                                          strategy.symbol === 'USDT' ? 'bg-green-600' : 'bg-purple-600'
                                        }`}>
                                          {strategy.symbol.charAt(0)}
                                        </div>
                                        <div>
                                          <span className="font-medium">{strategy.symbol}</span>
                                          <div className="text-xs text-slate-400">{strategy.apy.toFixed(2)}% APY</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <label className="text-sm font-medium text-slate-300">Lock Duration</label>
                              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value={DURATION_OPTIONS.ONE_MONTH.toString()} className="text-white hover:bg-slate-700">
                                    <div className="flex items-center justify-between w-full">
                                      <span>1 Month</span>
                                      <Badge variant="secondary" className="ml-2">3.00% APY</Badge>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value={DURATION_OPTIONS.SIX_MONTHS.toString()} className="text-white hover:bg-slate-700">
                                    <div className="flex items-center justify-between w-full">
                                      <span>6 Months</span>
                                      <Badge variant="secondary" className="ml-2">5.00% APY</Badge>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-300">Amount</label>
                                <span className="text-sm text-slate-400">
                                  Balance: {userBalance.toFixed(2)} {selectedAsset}
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 rounded-xl"
                                  max={userBalance}
                                />
                                <Button
                                  variant="outline"
                                  onClick={() => setAmount(userBalance.toString())}
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50 rounded-xl px-6"
                                >
                                  Max
                                </Button>
                              </div>
                            </div>

                            <div className="bg-slate-700/30 rounded-xl p-4 space-y-3 border border-slate-600/30">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Lock Duration</span>
                                <span className="text-white font-medium">{formatDuration(duration)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">APY</span>
                                <span className="text-green-400 font-bold">{getAPYForDuration(duration).toFixed(2)}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Est. Total Return</span>
                                <span className="text-green-400 font-bold">
                                  ${calculateTotalReturn(parseFloat(amount) || 0, duration).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Est. Yield Earned</span>
                                <span className="text-green-400 font-bold">
                                  +${calculateExpectedYield(parseFloat(amount) || 0, duration).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Strategy TVL</span>
                                <span className="text-white font-medium">{selectedStrategy?.tvl || "N/A"}</span>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                              onClick={handleDeposit}
                              disabled={!amount || Number.parseFloat(amount) <= 0 || isProcessing || !account}
                            >
                              {isProcessing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  Deposit {amount || "0.00"} {selectedAsset}
                                  <ArrowRight className="w-5 h-5" />
                                </>
                              )}
                            </Button>

                            {error && (
                              <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Info Cards */}
                        <div className="space-y-4">
                          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/30">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                                <div>
                                  <div className="text-white font-semibold text-sm">High Yields</div>
                                  <div className="text-slate-400 text-xs">Optimized returns</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/30">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-blue-400" />
                                <div>
                                  <div className="text-white font-semibold text-sm">Secure Protocol</div>
                                  <div className="text-slate-400 text-xs">Audited contracts</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {(step.toString() === "2" || step.toString() === "3") && (
                      <motion.div
                        key="processing"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                      >
                        <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl">
                          <CardContent className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-6"></div>
                            <h3 className="text-xl font-semibold mb-3 text-white">
                              {step.toString() === "2" ? "Approving USDC on Ethereum..." : "Bridging to Aptos via CCTP..."}
                            </h3>
                            <p className="text-slate-300">Please wait while we process your transaction</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Deposit