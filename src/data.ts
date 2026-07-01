import { BingService, TierInfo, CompanyDetails } from './types';

export const TIERS: TierInfo[] = [
  {
    level: 1,
    name: "Tier 1 (Silver Basic)",
    limit: 100000,
    cost: 0,
    perks: [
      "Store Unlimited Dashboard balance",
      "Standard Withdrawal Processing (24h)",
      "Access to basic GoldRush Cloud & Vault plans",
      "Standard referral benefits"
    ]
  },
  {
    level: 2,
    name: "Tier 2 (Gold Plus)",
    limit: 500000,
    cost: 7600,
    perks: [
      "Commercial Bank Cashouts Unlocked",
      "Express Withdrawal Processing (4h)",
      "Access to Node & Server GoldRush plans",
      "1.5x speed on daily claims",
      "Priority customer help desk"
    ]
  },
  {
    level: 3,
    name: "Tier 3 (Platinum Pro)",
    limit: 2500000,
    cost: 15000,
    perks: [
      "Immediate Direct Bank Settled Payouts",
      "Instant Withdrawal Processing (30m)",
      "Access to high-yield Arbitrage plans",
      "Zero fees on internal fund transfers",
      "Exclusive platinum community channel access"
    ]
  },
  {
    level: 4,
    name: "Tier 4 (Black Ultimate)",
    limit: 10000000,
    cost: 35000,
    perks: [
      "Premium VIP Priority Cashouts Unlocked",
      "Immediate VIP direct channel payouts",
      "Access to all Premium & Executive GoldRush Nodes",
      "Dedicated 24/7 Account Success Manager",
      "Custom branded virtual card option"
    ]
  }
];

export const BING_SERVICES: BingService[] = [
  {
    id: "bing-1",
    title: "GoldRush Cloud Starter",
    description: "Enter the GoldRush system with a lightweight virtual machine. Ideal for beginners.",
    price: 3000,
    totalIncome: 6000,
    dailyIncome: 6000,
    durationDays: 1,
    category: "Cloud",
    popularity: "Standard",
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: "bing-2",
    title: "GoldRush Naira Fast Boost",
    description: "High-velocity server nodes processing micro-transactions at lightspeed.",
    price: 5000,
    totalIncome: 10500,
    dailyIncome: 10500,
    durationDays: 1,
    category: "Vault",
    popularity: "Trending",
    color: "from-fuchsia-500 to-purple-700"
  },
  {
    id: "bing-3",
    title: "GoldRush Smart Shield",
    description: "Secure, automated smart contract parser earning continuous network gas fees.",
    price: 8000,
    totalIncome: 18000,
    dailyIncome: 18000,
    durationDays: 1,
    category: "Vault",
    popularity: "Standard",
    color: "from-indigo-600 to-violet-800"
  },
  {
    id: "bing-4",
    title: "GoldRush Lagos Grid Node",
    description: "Local data cluster positioned in Ikeja processing localized logistics routing.",
    price: 12000,
    totalIncome: 28500,
    dailyIncome: 28500,
    durationDays: 1,
    category: "Node",
    popularity: "Hot",
    color: "from-purple-700 to-pink-600"
  },
  {
    id: "bing-5",
    title: "GoldRush Gbagada Server",
    description: "Multi-threaded dedicated rig processing payment payloads across West Africa.",
    price: 20000,
    totalIncome: 51000,
    dailyIncome: 51000,
    durationDays: 1,
    category: "Server",
    popularity: "Hot",
    color: "from-purple-900 to-violet-950"
  },
  {
    id: "bing-6",
    title: "GoldRush Safebox Vault",
    description: "Liquidity locker contributing to local currency exchange hedging pools.",
    price: 30000,
    totalIncome: 78000,
    dailyIncome: 78000,
    durationDays: 1,
    category: "Vault",
    popularity: "Trending",
    color: "from-pink-600 to-rose-700"
  },
  {
    id: "bing-7",
    title: "GoldRush Abuja Hub Node",
    description: "Capital-grade digital processing server supporting public network audits.",
    price: 45000,
    totalIncome: 120000,
    dailyIncome: 120000,
    durationDays: 1,
    category: "Node",
    popularity: "Standard",
    color: "from-violet-700 to-purple-900"
  },
  {
    id: "bing-8",
    title: "GoldRush West Africa Cloud",
    description: "Continental-tier CDN server caching high-traffic local video feeds.",
    price: 60000,
    totalIncome: 165000,
    dailyIncome: 165000,
    durationDays: 1,
    category: "Cloud",
    popularity: "Trending",
    color: "from-indigo-700 to-pink-700"
  },
  {
    id: "bing-9",
    title: "GoldRush Quantum Arbitrage",
    description: "Advanced price-difference execution logic yielding returns across 8 global hubs.",
    price: 80000,
    totalIncome: 240000,
    dailyIncome: 240000,
    durationDays: 1,
    category: "Arbitrage",
    popularity: "VIP Only",
    color: "from-purple-950 via-purple-700 to-indigo-900"
  },
  {
    id: "bing-10",
    title: "GoldRush Ikeja Power Grid",
    description: "Industrial hardware power unit powering secondary fintech computations.",
    price: 100000,
    totalIncome: 315000,
    dailyIncome: 315000,
    durationDays: 1,
    category: "Node",
    popularity: "VIP Only",
    color: "from-indigo-950 via-violet-800 to-fuchsia-950"
  },
  {
    id: "bing-11",
    title: "GoldRush Lekki VIP Server",
    description: "Prestige server stack for exclusive, hyper-secured high-throughput ledgers.",
    price: 150000,
    totalIncome: 495000,
    dailyIncome: 495000,
    durationDays: 1,
    category: "Server",
    popularity: "VIP Only",
    color: "from-slate-900 via-purple-900 to-indigo-950"
  },
  {
    id: "bing-12",
    title: "GoldRush Whale Arbitrage",
    description: "Deep pool algorithmic buyer extracting margins from bulk commodity purchases.",
    price: 250000,
    totalIncome: 855000,
    dailyIncome: 855000,
    durationDays: 1,
    category: "Arbitrage",
    popularity: "VIP Only",
    color: "from-violet-900 via-pink-900 to-fuchsia-950"
  },
  {
    id: "bing-13",
    title: "GoldRush Emerald Oracle",
    description: "Precision blockchain oracle processing vital price feeds with high security bonds.",
    price: 400000,
    totalIncome: 1440000,
    dailyIncome: 1440000,
    durationDays: 1,
    category: "Node",
    popularity: "VIP Only",
    color: "from-slate-950 via-purple-950 to-pink-950"
  },
  {
    id: "bing-14",
    title: "GoldRush Imperial Mainframe",
    description: "The crown jewel of enterprise hardware. Maximum network throughput configuration.",
    price: 600000,
    totalIncome: 2250000,
    dailyIncome: 2250000,
    durationDays: 1,
    category: "Server",
    popularity: "VIP Only",
    color: "from-fuchsia-900 via-indigo-950 to-slate-950"
  },
  {
    id: "bing-15",
    title: "GoldRush Apex Ultimate Cloud",
    description: "Uncapped processing array running quantum-level operations with ultimate returns.",
    price: 1000000,
    totalIncome: 3900000,
    dailyIncome: 3900000,
    durationDays: 1,
    category: "Cloud",
    popularity: "VIP Only",
    color: "from-black via-purple-950 to-fuchsia-950"
  }
];

export const formatNaira = (amount: number): string => {
  return "₦" + amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
export const generateReference = () => "TX-" + Math.floor(Math.random() * 100000000).toString();

export const getCompanyDetails = (): CompanyDetails => {
  const saved = localStorage.getItem('goldrush9ja_company_details');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // Use defaults
    }
  }
  return {
    bankName: "Wema Bank / ALAT",
    accountNumber: "0124982345",
    accountName: "GOLDRUSH9JA FINANCIAL HUB CO.",
    telegramChannel: "@goldrush9ja"
  };
};

export const saveCompanyDetails = (details: CompanyDetails) => {
  localStorage.setItem('goldrush9ja_company_details', JSON.stringify(details));
};
