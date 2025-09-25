import { Aptos, AptosConfig, Network, AccountAddress } from "@aptos-labs/ts-sdk";
import { 
  StrategyInfo, 
  UserStake, 
  VaultInfo, 
  YieldStrategy, 
  DepositParams, 
  WithdrawParams,
  ContractAddresses,
  DURATION_OPTIONS,
  YIELD_TIERS,
  BASIS_POINTS_DENOMINATOR,
  SECONDS_IN_YEAR
} from "@/types/contracts";

// Contract addresses - these should be updated with your deployed contract addresses
const CONTRACT_ADDRESSES: ContractAddresses = {
  vault: "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd", // From Move.toml
  strategy: "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd", // Same as vault for now
  mockCoins: "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd", // Same as vault for now
  lendingProtocol: "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd", // Same as vault for now
};

class ContractService {
  private aptos: Aptos;
  private moduleAddress: string;

  constructor() {
    // Initialize with devnet where contracts are deployed
    const config = new AptosConfig({ 
      network: Network.DEVNET
    });
    this.aptos = new Aptos(config);
    this.moduleAddress = "0x4b60a43a85ace47e73b53550beef265817e38f9cc36c9005034fc7d8125f95fd"; // From Move.toml
  }

  // Get user's stake information from the vault
  async getUserStake(userAddress: string): Promise<UserStake> {
    try {
      // Validate address format
      if (!AccountAddress.isValid({ input: userAddress })) {
        throw new Error("Invalid account address format");
      }

      const result = await this.aptos.view({
        payload: {
          function: `${this.moduleAddress}::simple_vault::get_stake`,
          functionArguments: [userAddress],
        }
      });
      
      if (result && result.length >= 3) {
        const [principal, totalReturn, unlockTimestampSecs] = result as [string, string, string];
        const now = Math.floor(Date.now() / 1000);
        const daysInvested = Math.max(0, Math.floor((now - parseInt(unlockTimestampSecs)) / 86400));
        
        return {
          principal: parseInt(principal),
          totalReturn: parseInt(totalReturn),
          unlockTimestampSecs: parseInt(unlockTimestampSecs),
          daysInvested,
          isLocked: now < parseInt(unlockTimestampSecs),
        };
      }
      
      return {
        principal: 0,
        totalReturn: 0,
        unlockTimestampSecs: 0,
        daysInvested: 0,
        isLocked: false,
      };
    } catch (error) {
      console.error("Error fetching user stake:", error);
      throw error;
    }
  }

  // Get receipt token balance from strategy
  async getReceiptTokenBalance(strategyObject: string): Promise<number> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.moduleAddress}::strategy::get_receipt_token_balance`,
          typeArguments: ["0x1::aptos_coin::AptosCoin", "ReceiptToken", "RewardToken"],
          functionArguments: [strategyObject],
        }
      });
      return result ? parseInt(result[0] as string) : 0;
    } catch (error) {
      console.error("Error fetching receipt token balance:", error);
      throw error;
    }
  }

  // Get available yield strategies (mock data for now - replace with actual contract calls)
  async getYieldStrategies(): Promise<YieldStrategy[]> {
    // This would typically fetch from your strategy contract
    // For now, returning mock data based on your contract structure
    return [
      {
        id: "apt-strategy-1",
        name: "APT Yield Strategy",
        symbol: "APT",
        apy: 8.50,
        tvl: "$1,000,000",
        volume24h: "$25,000.00",
        stable: false,
        version: "1.0",
        poolAddress: CONTRACT_ADDRESSES.vault,
        strategyObject: "0x1", // Replace with actual strategy object address
      },
      {
        id: "usdc-strategy-1",
        name: "USDC Yield Strategy",
        symbol: "USDC",
        apy: 12.45,
        tvl: "$4,763,266",
        volume24h: "$67,496.43",
        stable: true,
        version: "0.5",
        poolAddress: CONTRACT_ADDRESSES.vault,
        strategyObject: "0x1", // Replace with actual strategy object address
      },
      {
        id: "usdt-strategy-1", 
        name: "USDT Yield Strategy",
        symbol: "USDT",
        apy: 11.89,
        tvl: "$334,274",
        volume24h: "$2,006.12",
        stable: true,
        version: "0.5",
        poolAddress: CONTRACT_ADDRESSES.vault,
        strategyObject: "0x1", // Replace with actual strategy object address
      },
    ];
  }

  // Note: Deposit function is now handled by the wallet adapter in useVault hook
  // This method is kept for reference but should use signAndSubmitTransaction from wallet
  validateDepositParams(params: DepositParams): void {
    const { amount, durationSecs, assetType } = params;
    
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    
    // Validate duration
    if (durationSecs !== DURATION_OPTIONS.ONE_MONTH && 
        durationSecs !== DURATION_OPTIONS.SIX_MONTHS) {
      throw new Error("Invalid duration. Must be 1 month or 6 months.");
    }
    
    // Validate assetType if provided
    if (assetType && typeof assetType !== 'string') {
      throw new Error("Asset type must be a string");
    }
  }

  // Note: Withdraw function is now handled by the wallet adapter in useVault hook
  // This method is kept for reference but should use signAndSubmitTransaction from wallet
  validateWithdrawParams(params: WithdrawParams = {}): void {
    // Add any withdrawal validation logic here
    // For now, the vault contract handles all validation
  }

  // Note: Harvest function is now handled by the wallet adapter in useVault hook
  // This method is kept for reference but should use signAndSubmitTransaction from wallet
  validateHarvestParams(): void {
    // Add any harvest validation logic here
    // For now, the vault contract handles all validation
  }

  // Get user's token balance
  async getTokenBalance(userAddress: string, tokenType: string = "0x1::aptos_coin::AptosCoin"): Promise<number> {
    try {
      // Validate address format
      if (!AccountAddress.isValid({ input: userAddress })) {
        throw new Error("Invalid account address format");
      }

      // For APT (AptosCoin), use the coin balance function
      if (tokenType === "0x1::aptos_coin::AptosCoin") {
        const result = await this.aptos.view({
          payload: {
            function: "0x1::coin::balance",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [userAddress],
          }
        });
        return result ? parseInt(result[0] as string) : 0;
      } 
      // For mock USDC, we'll return a mock balance since we know tokens were minted
      else if (tokenType.includes("mock_coins::USDC")) {
        // Return the minted amount (1000 USDC = 1000000000 with 6 decimals)
        // In a real implementation, you'd fetch this from the blockchain
        return 1000000000; // 1000 USDC
      }
      // For mock USDT, we'll return a mock balance
      else if (tokenType.includes("mock_coins::USDT")) {
        // Return a mock balance for USDT
        return 500000000; // 500 USDT
      }
      else {
        // For other fungible assets
        const result = await this.aptos.view({
          payload: {
            function: "0x1::primary_fungible_store::balance",
            typeArguments: [tokenType],
            functionArguments: [userAddress],
          }
        });
        return result ? parseInt(result[0] as string) : 0;
      }
    } catch (error) {
      console.error(`Error fetching token balance for ${tokenType} at address ${userAddress}:`, error);
      // Return 0 instead of throwing to prevent UI crashes
      return 0;
    }
  }

  // Calculate expected yield based on amount and duration
  calculateExpectedYield(amount: number, durationSecs: number): number {
    const yieldRateBps = durationSecs === DURATION_OPTIONS.ONE_MONTH 
      ? YIELD_TIERS.ONE_MONTH_BPS 
      : YIELD_TIERS.SIX_MONTHS_BPS;
    
    const yieldEarned = (amount * yieldRateBps * durationSecs) / 
      (SECONDS_IN_YEAR * BASIS_POINTS_DENOMINATOR);
    
    return Math.floor(yieldEarned);
  }

  // Get total return (principal + yield)
  calculateTotalReturn(amount: number, durationSecs: number): number {
    const yieldEarned = this.calculateExpectedYield(amount, durationSecs);
    return amount + yieldEarned;
  }

  // Format duration for display
  formatDuration(durationSecs: number): string {
    if (durationSecs === DURATION_OPTIONS.ONE_MONTH) {
      return "1 Month";
    } else if (durationSecs === DURATION_OPTIONS.SIX_MONTHS) {
      return "6 Months";
    }
    return "Unknown";
  }

  // Get APY percentage for duration
  getAPYForDuration(durationSecs: number): number {
    if (durationSecs === DURATION_OPTIONS.ONE_MONTH) {
      return (YIELD_TIERS.ONE_MONTH_BPS / BASIS_POINTS_DENOMINATOR) * 100;
    } else if (durationSecs === DURATION_OPTIONS.SIX_MONTHS) {
      return (YIELD_TIERS.SIX_MONTHS_BPS / BASIS_POINTS_DENOMINATOR) * 100;
    }
    return 0;
  }
}

export const contractService = new ContractService();
