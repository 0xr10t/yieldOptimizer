// Contract types and interfaces for Move smart contracts integration

export interface StrategyInfo {
  poolAddress: string;
  wantMetadata: string;
  receiptTokenStore: string;
  apy: number;
  tvl: string;
  symbol: string;
  name: string;
}

export interface UserStake {
  principal: number;
  totalReturn: number;
  unlockTimestampSecs: number;
  daysInvested: number;
  isLocked: boolean;
}

export interface DepositEvent {
  user: string;
  amount: number;
  durationSecs: number;
  totalReturn: number;
}

export interface WithdrawalEvent {
  user: string;
  amountWithdrawn: number;
}

export interface VaultInfo {
  totalDeposits: number;
  userStake: UserStake;
  strategy: StrategyInfo;
}

export interface TokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
  metadata: string;
}

export interface YieldStrategy {
  id: string;
  name: string;
  symbol: string;
  apy: number;
  tvl: string;
  volume24h: string;
  stable: boolean;
  version: string;
  poolAddress: string;
  strategyObject: string;
}

export interface DepositParams {
  amount: number;
  durationSecs: number;
  assetType?: string;
}

export interface WithdrawParams {
  amount?: number; // If not provided, withdraws all
}

export interface ContractAddresses {
  vault: string;
  strategy: string;
  mockCoins: string;
  lendingProtocol: string;
}

// Duration constants matching the Move contract
export const DURATION_OPTIONS = {
  ONE_MONTH: 2592000, // 30 days in seconds
  SIX_MONTHS: 15778463, // ~6 months in seconds
} as const;

export const YIELD_TIERS = {
  ONE_MONTH_BPS: 300, // 3.00%
  SIX_MONTHS_BPS: 500, // 5.00%
} as const;

export const BASIS_POINTS_DENOMINATOR = 10000;
export const SECONDS_IN_YEAR = 31536000;
