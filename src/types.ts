export type TierLevel = 1 | 2 | 3 | 4;

export interface TierInfo {
  level: TierLevel;
  name: string;
  limit: number;
  cost: number;
  perks: string[];
}

export interface User {
  username: string;
  email: string;
  referralCodeUsed?: string;
  ownReferralCode: string;
  tier: TierLevel;
  balance: number;
  referralCount: number;
  referralBonusEarned: number;
  activeBings: ActiveBing[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'referral' | 'purchase' | 'earnings' | 'upgrade';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

export interface BingService {
  id: string;
  title: string;
  description: string;
  price: number;
  totalIncome: number;
  dailyIncome: number;
  durationDays: number;
  category: 'Cloud' | 'Node' | 'Server' | 'Vault' | 'Arbitrage';
  popularity: 'Hot' | 'Trending' | 'VIP Only' | 'Standard';
  color: string;
}

export interface ActiveBing {
  id: string;
  serviceId: string;
  title: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  timestampBought: string;
  durationDays: number;
  lastClaimedTimestamp: string;
  accumulatedUnclaimed: number;
  totalClaimed: number;
  isCompleted: boolean;
}

export interface CompanyDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  telegramChannel: string;
}

export interface AdminMessage {
  id: string;
  recipient: string; // 'all' or username
  title: string;
  body: string;
  timestamp: string;
  sender: string;
  createdAtMs?: number;
}


