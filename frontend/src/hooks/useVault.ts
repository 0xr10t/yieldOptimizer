import { useState, useEffect, useCallback } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { contractService } from "@/services/contractService";
import { UserStake, YieldStrategy, DepositParams, WithdrawParams, DURATION_OPTIONS } from "@/types/contracts";

// Initialize Aptos client for transaction waiting - no API key required
const config = new AptosConfig({ 
  network: Network.DEVNET
});
const aptos = new Aptos(config);

export const useVault = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [userStake, setUserStake] = useState<UserStake | null>(null);
  const [strategies, setStrategies] = useState<YieldStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's stake information
  const fetchUserStake = useCallback(async () => {
    if (!account?.address) {
      setUserStake(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stake = await contractService.getUserStake(account.address.toString());
      setUserStake(stake);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user stake");
      console.error("Error fetching user stake:", err);
    } finally {
      setLoading(false);
    }
  }, [account?.address]);

  // Fetch available yield strategies
  const fetchStrategies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const strategiesData = await contractService.getYieldStrategies();
      setStrategies(strategiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch strategies");
      console.error("Error fetching strategies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Deposit funds into vault
  const deposit = useCallback(async (params: DepositParams) => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate parameters
      console.log('🔍 Debug - Deposit params:', params);
      contractService.validateDepositParams(params);
      
      // Determine which vault function to use based on asset type
      let vaultFunction: `${string}::${string}::${string}` = "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd::simple_vault::deposit";
      
      if (params.assetType?.includes("mock_coins::USDC")) {
        vaultFunction = "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd::simple_vault::deposit_usdc";
      } else if (params.assetType?.includes("mock_coins::USDT")) {
        // For now, USDT uses the same function as USDC
        vaultFunction = "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd::simple_vault::deposit_usdc";
      }
      
      const transaction: InputTransactionData = {
        data: {
          function: vaultFunction,
          functionArguments: [
            params.amount.toString(),
            params.durationSecs.toString(),
          ],
        },
      };

      console.log('🚀 Debug - Submitting transaction:', transaction);
      console.log('🚀 Debug - Vault function:', vaultFunction);
      console.log('🚀 Debug - Function arguments:', transaction.data.functionArguments);
      
      const response = await signAndSubmitTransaction(transaction);
      console.log('✅ Debug - Transaction response:', response);
      
      // Wait for transaction confirmation
      try {
        await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log('✅ Debug - Transaction confirmed');
      } catch (error) {
        console.error('❌ Debug - Transaction confirmation error:', error);
      }
      
      await fetchUserStake(); // Refresh user stake after deposit
      return response;
    } catch (err) {
      let errorMessage = "Deposit failed";
      
      if (err instanceof Error) {
        console.error('❌ Debug - Full error object:', err);
        if (err.message.includes("User has rejected the request")) {
          errorMessage = "Transaction was cancelled by user.";
        } else if (err.message.includes("EOBJECT_DOES_NOT_EXIST")) {
          errorMessage = "Vault not initialized. Please contact the administrator to initialize the vault.";
        } else if (err.message.includes("insufficient balance")) {
          errorMessage = "Insufficient balance for this transaction.";
        } else if (err.message.includes("INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE")) {
          errorMessage = "Insufficient APT balance for gas fees.";
        } else if (err.message.includes("FUNCTION_RESOLUTION_FAILURE")) {
          errorMessage = "Contract function not found. Please check if the vault is properly deployed.";
        } else {
          errorMessage = err.message;
        }
      } else {
        console.error('❌ Debug - Unknown error type:', err);
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserStake]);

  // Withdraw funds from vault
  const withdraw = useCallback(async (params: WithdrawParams = {}) => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate parameters
      contractService.validateWithdrawParams(params);
      
      const transaction: InputTransactionData = {
        data: {
          function: "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd::vault::withdraw",
          typeArguments: ["0x1::aptos_coin::AptosCoin"], // Replace with your asset type
          functionArguments: [],
        },
      };

      const response = await signAndSubmitTransaction(transaction);
      
      // Wait for transaction confirmation
      try {
        await aptos.waitForTransaction({ transactionHash: response.hash });
      } catch (error) {
        console.error("Transaction confirmation error:", error);
      }
      
      await fetchUserStake(); // Refresh user stake after withdrawal
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Withdrawal failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserStake]);

  // Harvest rewards
  const harvest = useCallback(async () => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate parameters
      contractService.validateHarvestParams();
      
      const transaction: InputTransactionData = {
        data: {
          function: "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd::vault::harvest",
          typeArguments: ["0x1::aptos_coin::AptosCoin"], // Replace with your asset type
          functionArguments: [],
        },
      };

      const response = await signAndSubmitTransaction(transaction);
      
      // Wait for transaction confirmation
      try {
        await aptos.waitForTransaction({ transactionHash: response.hash });
      } catch (error) {
        console.error("Transaction confirmation error:", error);
      }
      
      await fetchUserStake(); // Refresh user stake after harvest
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Harvest failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserStake]);

  // Get user's token balance
  const getTokenBalance = useCallback(async (tokenType: string = "0x1::aptos_coin::AptosCoin") => {
    if (!account?.address) return 0;

    try {
      return await contractService.getTokenBalance(account.address.toString(), tokenType);
    } catch (err) {
      console.error(`Error fetching token balance for ${tokenType}:`, err);
      return 0;
    }
  }, [account?.address]);

  // Calculate APY based on duration and asset type
  const getAPYForDuration = useCallback((durationSecs: number, assetType?: string): number => {
    // APY calculation based on asset type and duration
    if (assetType?.includes("mock_coins::USDC")) {
      // USDC: 12.45% APY
      if (durationSecs === DURATION_OPTIONS.ONE_MONTH) {
        return 1.04; // 1.04% for 1 month (12.45% APY)
      } else if (durationSecs === DURATION_OPTIONS.SIX_MONTHS) {
        return 6.23; // 6.23% for 6 months (12.45% APY)
      }
    } else if (assetType?.includes("mock_coins::USDT")) {
      // USDT: 11.89% APY
      if (durationSecs === DURATION_OPTIONS.ONE_MONTH) {
        return 0.99; // 0.99% for 1 month (11.89% APY)
      } else if (durationSecs === DURATION_OPTIONS.SIX_MONTHS) {
        return 5.95; // 5.95% for 6 months (11.89% APY)
      }
    } else {
      // APT: 8.50% APY (default)
      if (durationSecs === DURATION_OPTIONS.ONE_MONTH) {
        return 0.71; // 0.71% for 1 month (8.50% APY)
      } else if (durationSecs === DURATION_OPTIONS.SIX_MONTHS) {
        return 4.25; // 4.25% for 6 months (8.50% APY)
      }
    }
    return 0;
  }, []);

  // Calculate expected yield with asset-specific APY
  const calculateExpectedYield = useCallback((amount: number, durationSecs: number, assetType?: string) => {
    const apy = getAPYForDuration(durationSecs, assetType);
    return (amount * apy) / 100;
  }, [getAPYForDuration]);

  // Calculate total return with asset-specific APY
  const calculateTotalReturn = useCallback((amount: number, durationSecs: number, assetType?: string) => {
    const yieldAmount = calculateExpectedYield(amount, durationSecs, assetType);
    return amount + yieldAmount;
  }, [calculateExpectedYield]);

  // Format duration
  const formatDuration = useCallback((durationSecs: number) => {
    return contractService.formatDuration(durationSecs);
  }, []);

  // Load data on mount and when account changes
  useEffect(() => {
    if (account?.address) {
      fetchUserStake();
      fetchStrategies();
    }
  }, [account?.address, fetchUserStake, fetchStrategies]);

  return {
    // State
    userStake,
    strategies,
    loading,
    error,
    
    // Actions
    deposit,
    withdraw,
    harvest,
    fetchUserStake,
    fetchStrategies,
    getTokenBalance,
    
    // Utilities
    calculateExpectedYield,
    calculateTotalReturn,
    formatDuration,
    getAPYForDuration,
    
    // Computed values
    hasStake: Boolean(userStake && userStake.principal > 0),
    canWithdraw: Boolean(userStake && !userStake.isLocked),
    totalEarnings: userStake && typeof userStake.totalReturn === 'number' && typeof userStake.principal === 'number' ? userStake.totalReturn - userStake.principal : 0,
    availableBalance: userStake && typeof userStake.totalReturn === 'number' ? userStake.totalReturn : 0,
  };
};
