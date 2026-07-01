import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, Flame, Gift, Layers, X, CheckCircle, 
  AlertTriangle, CreditCard, ChevronRight, HelpCircle, LogOut 
} from 'lucide-react';

import { User, Transaction, BingService, ActiveBing, TierLevel } from './types';
import { TIERS, formatNaira, generateId, generateReference, getCompanyDetails } from './data';
import { getCollectionData, setDocumentData, deleteDocumentData } from './firebase';
import AuthScreen from './components/AuthScreen';
import DashboardHome from './components/DashboardHome';
import BingShop from './components/BingShop';
import ReferralCenter from './components/ReferralCenter';
import UserProfileMe from './components/UserProfileMe';
import TransactionHistoryPage from './components/TransactionHistoryPage';
import AirtimeDataPage from './components/AirtimeDataPage';
import WithdrawPage from './components/WithdrawPage';
import ExlPage from './components/ExlPage';
import SupportPage from './components/SupportPage';
import AdminPage from './components/AdminPage';
import UpgradePaymentPage from './components/UpgradePaymentPage';
import UpgradePage from './components/UpgradePage';
import BingPurchasePaymentPage from './components/BingPurchasePaymentPage';
import { BING_SERVICES } from './data';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('goldrush9ja_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('goldrush9ja_transactions');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<any>(null);
  const [selectedBingService, setSelectedBingService] = useState<any>(null);

  const [upgradeRequests, setUpgradeRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('goldrush9ja_upgrade_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [purchaseRequests, setPurchaseRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('goldrush9ja_bing_purchase_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const company = getCompanyDetails();

  // Rate-limiting and redundant write guards for Firestore Integration
  const syncedTransactionIdsRef = useRef<Set<string>>(new Set());
  const lastSyncedUserFingerprintRef = useRef<string>('');
  const syncedUpgradeRequestsRef = useRef<Set<string>>(new Set());
  const syncedPurchaseRequestsRef = useRef<Set<string>>(new Set());

  const getUserSyncFingerprint = (u: User | null): string => {
    if (!u) return '';
    const bingsPart = (u.activeBings || [])
      .map(b => `${b.id}:${b.totalClaimed}:${b.isCompleted}`)
      .join(',');
    return `${u.username}:${u.email}:${u.tier}:${u.balance}:${u.referralCount}:${u.referralBonusEarned}:${bingsPart}`;
  };

  // --- FIRESTORE INTEGRATION SYNC ENGINE ---
  // 1. Initial Boot & Periodic Sync: pull all records from Firestore to cache in local storage
  useEffect(() => {
    let active = true;
    async function loadFromFirestore() {
      try {
        // Load Registered Users
        const fUsers = await getCollectionData<any>('users');
        if (fUsers && fUsers.length > 0 && active) {
          localStorage.setItem('goldrush9ja_registered_users', JSON.stringify(fUsers));
          
          // If we have an active user, update their local record with the one in Firestore
          if (user) {
            const latestUser = fUsers.find((u: any) => u.username.toLowerCase() === user.username.toLowerCase());
            if (latestUser) {
              const activeBingsChanged = JSON.stringify(latestUser.activeBings) !== JSON.stringify(user.activeBings);
              const referralCountChanged = (latestUser.referralCount || 0) !== (user.referralCount || 0);
              const referralBonusChanged = (latestUser.referralBonusEarned || 0) !== (user.referralBonusEarned || 0);
              if (
                latestUser.tier !== user.tier || 
                latestUser.balance !== user.balance || 
                referralCountChanged ||
                referralBonusChanged ||
                activeBingsChanged
              ) {
                const updatedUser = {
                  ...user,
                  tier: latestUser.tier,
                  balance: latestUser.balance,
                  referralCount: latestUser.referralCount || 0,
                  referralBonusEarned: latestUser.referralBonusEarned || 0,
                  activeBings: latestUser.activeBings || []
                };
                setUser(updatedUser);
                lastSyncedUserFingerprintRef.current = getUserSyncFingerprint(updatedUser);
              } else {
                lastSyncedUserFingerprintRef.current = getUserSyncFingerprint(user);
              }
            }
          }
        }

        // Load Transactions
        const fTxs = await getCollectionData<Transaction>('transactions');
        if (fTxs && active && user) {
          const userTxs = fTxs.filter((t: any) => t.username?.toLowerCase() === user.username.toLowerCase());
          
          // Merge local transactions to prevent losing recently added local transactions that haven't synced yet
          const localSaved = localStorage.getItem('goldrush9ja_transactions');
          let merged = [...userTxs];
          if (localSaved) {
            try {
              const localTxs = JSON.parse(localSaved);
              localTxs.forEach((lt: any) => {
                if (!merged.some((t: any) => t.id === lt.id)) {
                  merged.unshift(lt);
                }
              });
            } catch (e) {}
          }
          setTransactions(merged);
          
          // Populate transaction cache
          merged.forEach((t: any) => {
            syncedTransactionIdsRef.current.add(t.id);
          });
        }

        // Load Upgrade Requests
        const fUpgrades = await getCollectionData<any>('upgrade_requests');
        if (fUpgrades && active) {
          const localSaved = localStorage.getItem('goldrush9ja_upgrade_requests');
          let merged = [...fUpgrades];
          if (localSaved) {
            try {
              const localReqs = JSON.parse(localSaved);
              // For any local request that is pending, if it's not present in fUpgrades, keep it
              localReqs.forEach((lr: any) => {
                if (lr.status === 'pending' && !merged.some((r: any) => r.id === lr.id)) {
                  merged.push(lr);
                }
              });
            } catch (e) {}
          }
          localStorage.setItem('goldrush9ja_upgrade_requests', JSON.stringify(merged));
          setUpgradeRequests(merged);
          
          // Populate upgrade requests cache
          merged.forEach((r: any) => {
            syncedUpgradeRequestsRef.current.add(`${r.id}_${r.status}`);
          });
        }

        // Load Node Purchases
        const fPurchases = await getCollectionData<any>('bing_purchase_requests');
        if (fPurchases && active) {
          const localSaved = localStorage.getItem('goldrush9ja_bing_purchase_requests');
          let merged = [...fPurchases];
          if (localSaved) {
            try {
              const localReqs = JSON.parse(localSaved);
              localReqs.forEach((lr: any) => {
                if (lr.status === 'pending' && !merged.some((r: any) => r.id === lr.id)) {
                  merged.push(lr);
                }
              });
            } catch (e) {}
          }
          localStorage.setItem('goldrush9ja_bing_purchase_requests', JSON.stringify(merged));
          setPurchaseRequests(merged);
          
          // Populate purchase requests cache
          merged.forEach((r: any) => {
            syncedPurchaseRequestsRef.current.add(`${r.id}_${r.status}`);
          });
        }

        // Load System Company Settings
        const fSettings = await getCollectionData<any>('system');
        const companyDetailsSetting = fSettings.find((s: any) => s.id === 'company_details');
        if (companyDetailsSetting && active) {
          localStorage.setItem('goldrush9ja_company_details', JSON.stringify(companyDetailsSetting));
        }
        const bannedUsersSetting = fSettings.find((s: any) => s.id === 'banned_users');
        if (bannedUsersSetting && active) {
          localStorage.setItem('goldrush9ja_banned_users', JSON.stringify(bannedUsersSetting.usernames || []));
        }

        // Load Corporate Admin Messages
        const fMessages = await getCollectionData<any>('messages');
        if (fMessages && active) {
          const now = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;
          const validMessages: any[] = [];
          
          for (const msg of fMessages) {
            const msgTime = msg.createdAtMs || now;
            if (now - msgTime > oneDayMs) {
              deleteDocumentData('messages', msg.id).catch(err => console.error('Error deleting expired message:', err));
            } else {
              if (!msg.createdAtMs) {
                msg.createdAtMs = now;
                setDocumentData('messages', msg.id, { ...msg, createdAtMs: now }).catch(err => console.error('Error updating message time:', err));
              }
              validMessages.push(msg);
            }
          }
          localStorage.setItem('goldrush9ja_messages', JSON.stringify(validMessages));
        }
      } catch (err) {
        console.error('Error in loadFromFirestore:', err);
      }
    }

    loadFromFirestore();

    // Pull database updates every 7 seconds to keep multiple sessions synchronized
    const interval = setInterval(loadFromFirestore, 7000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user?.username]);

  // 2. Outbound Sync: push local state mutations up to Firestore
  // Sync user state to Firestore whenever current user or registered users list changes
  useEffect(() => {
    if (!user) return;
    
    // Guard: Only sync to Firestore if there are semantic changes to the user object
    const currentFingerprint = getUserSyncFingerprint(user);
    if (lastSyncedUserFingerprintRef.current === currentFingerprint) {
      return;
    }
    lastSyncedUserFingerprintRef.current = currentFingerprint;
    
    // Find matching record from registered users list to get the password
    const savedUsers = localStorage.getItem('goldrush9ja_registered_users');
    let password = 'password123';
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        const matched = parsed.find((u: any) => u.username.toLowerCase() === user.username.toLowerCase());
        if (matched && matched.password) {
          password = matched.password;
        }
      } catch (e) {}
    }

    setDocumentData('users', user.username.toLowerCase(), {
      ...user,
      password
    });
  }, [user]);

  // Sync transactions list to Firestore
  useEffect(() => {
    if (transactions.length > 0) {
      transactions.forEach((tx) => {
        // Guard: Only sync to Firestore if this transaction was not already synced in this session
        if (!syncedTransactionIdsRef.current.has(tx.id)) {
          syncedTransactionIdsRef.current.add(tx.id);
          setDocumentData('transactions', tx.id, {
            ...tx,
            username: user?.username || 'system'
          });
        }
      });
    }
  }, [transactions, user?.username]);

  // Sync upgrade requests and node purchase requests whenever there is a creation/approval action
  useEffect(() => {
    const handleSyncRequests = () => {
      try {
        const upgradesRaw = localStorage.getItem('goldrush9ja_upgrade_requests');
        if (upgradesRaw) {
          const reqs = JSON.parse(upgradesRaw);
          reqs.forEach((r: any) => {
            const key = `${r.id}_${r.status}`;
            if (!syncedUpgradeRequestsRef.current.has(key)) {
              syncedUpgradeRequestsRef.current.add(key);
              setDocumentData('upgrade_requests', r.id, r);
            }
          });
        }

        const bingsRaw = localStorage.getItem('goldrush9ja_bing_purchase_requests');
        if (bingsRaw) {
          const reqs = JSON.parse(bingsRaw);
          reqs.forEach((r: any) => {
            const key = `${r.id}_${r.status}`;
            if (!syncedPurchaseRequestsRef.current.has(key)) {
              syncedPurchaseRequestsRef.current.add(key);
              setDocumentData('bing_purchase_requests', r.id, r);
            }
          });
        }
      } catch (e) {
        console.error('Error syncing requests to Firestore:', e);
      }
    };

    handleSyncRequests();
  }, [upgradeRequests, purchaseRequests]);

  // Merge pending activations (upgrade & purchase requests) into user transaction history
  const displayedTransactions = useMemo(() => {
    let list = [...transactions];
    if (!user) return list;

    // Fetch pending upgrades
    const userPendingUpgrade = upgradeRequests.filter((r: any) => 
      r.username.toLowerCase() === user.username.toLowerCase() && 
      r.status === 'pending'
    );
    userPendingUpgrade.forEach((req: any) => {
      if (!list.some(t => t.id === req.id || t.reference === req.reference)) {
        list.unshift({
          id: req.id,
          type: 'upgrade',
          amount: req.cost,
          description: `Upgrade Level ${req.targetTier} (Processing)`,
          timestamp: req.timestamp,
          status: 'pending',
          reference: req.reference
        });
      }
    });

    // Fetch pending purchase requests
    const userPendingBings = purchaseRequests.filter((r: any) => 
      r.username.toLowerCase() === user.username.toLowerCase() && 
      r.status === 'pending'
    );
    userPendingBings.forEach((req: any) => {
      if (!list.some(t => t.id === req.id || t.reference === req.reference)) {
        list.unshift({
          id: req.id,
          type: 'purchase',
          amount: req.price,
          description: `Deploy Node: ${req.serviceTitle} (Processing)`,
          timestamp: req.timestamp,
          status: 'pending',
          reference: req.reference
        });
      }
    });

    return list;
  }, [transactions, user, upgradeRequests, purchaseRequests]);

  // Sync user state to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('goldrush9ja_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('goldrush9ja_user');
    }
  }, [user]);

  // Ensure registered users array is initialized and filter out any pre-seeded mock users
  useEffect(() => {
    const usersRaw = localStorage.getItem('goldrush9ja_registered_users');
    if (!usersRaw) {
      localStorage.setItem('goldrush9ja_registered_users', JSON.stringify([]));
    } else {
      try {
        const users = JSON.parse(usersRaw);
        if (Array.isArray(users)) {
          // Filter out the mock demo accounts
          const mockUsernames = ["emeka_abuja", "chioma_luxe", "tunde_mining", "adebayo_gold"];
          const filteredUsers = users.filter((u: any) => u && u.username && !mockUsernames.includes(u.username.toLowerCase()));
          
          // Only update if we actually removed some mock accounts
          if (filteredUsers.length !== users.length) {
            localStorage.setItem('goldrush9ja_registered_users', JSON.stringify(filteredUsers));
          }
        }
      } catch (e) {
        localStorage.setItem('goldrush9ja_registered_users', JSON.stringify([]));
      }
    }
  }, []);

  // Sync current user state back into registered users database
  useEffect(() => {
    if (!user) return;
    const usersRaw = localStorage.getItem('goldrush9ja_registered_users');
    let registeredUsers: any[] = [];
    if (usersRaw) {
      try {
        registeredUsers = JSON.parse(usersRaw);
      } catch (e) {
        registeredUsers = [];
      }
    }

    const idx = registeredUsers.findIndex((u: any) => u.username.toLowerCase() === user.username.toLowerCase());
    if (idx !== -1) {
      registeredUsers[idx] = {
        ...registeredUsers[idx],
        tier: user.tier,
        balance: user.balance,
        referralCount: user.referralCount,
        referralBonusEarned: user.referralBonusEarned,
        activeBings: user.activeBings || []
      };
    } else {
      registeredUsers.push({
        username: user.username,
        email: user.email,
        tier: user.tier,
        balance: user.balance,
        referralCount: user.referralCount,
        referralBonusEarned: user.referralBonusEarned,
        activeBings: user.activeBings || [],
        password: 'password123'
      });
    }
    localStorage.setItem('goldrush9ja_registered_users', JSON.stringify(registeredUsers));
  }, [user]);

  // Periodic/Action-based check to see if admin approved an upgrade or changed something
  useEffect(() => {
    if (!user) return;
    const usersRaw = localStorage.getItem('goldrush9ja_registered_users');
    if (usersRaw) {
      try {
        const registeredUsers = JSON.parse(usersRaw);
        const latestRecord = registeredUsers.find((u: any) => u.username.toLowerCase() === user.username.toLowerCase());
        if (latestRecord) {
          // Sync tier level, balance, activeBings, and other core attributes
          const activeBingsChanged = JSON.stringify(latestRecord.activeBings) !== JSON.stringify(user.activeBings);
          const referralCountChanged = (latestRecord.referralCount || 0) !== (user.referralCount || 0);
          const referralBonusChanged = (latestRecord.referralBonusEarned || 0) !== (user.referralBonusEarned || 0);
          if (
            latestRecord.tier !== user.tier || 
            latestRecord.balance !== user.balance || 
            referralCountChanged ||
            referralBonusChanged ||
            activeBingsChanged
          ) {
            setUser(prev => prev ? {
              ...prev,
              tier: latestRecord.tier,
              balance: latestRecord.balance,
              referralCount: latestRecord.referralCount || 0,
              referralBonusEarned: latestRecord.referralBonusEarned || 0,
              activeBings: latestRecord.activeBings || []
            } : null);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeTab]);

  // Sync transactions to local storage
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('goldrush9ja_transactions', JSON.stringify(transactions));
    } else {
      localStorage.removeItem('goldrush9ja_transactions');
    }
  }, [transactions]);

  // Handle Signup / Login Success
  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser);
    
    // Add Signup Welcome Transaction if not already exists
    const initialTx: Transaction = {
      id: generateId(),
      type: 'deposit',
      amount: 6700,
      description: 'Signup Welcome Bonus',
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };
    
    setTransactions([initialTx]);
    setActiveTab('home');
    addToast(`Welcome to GoldRush9ja, ${newUser.username}! ₦6,700.00 signup credit applied.`, 'success');
  };

  // Toast helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Background passive income ticker
  // Triggers every 3 seconds to increment unclaimed revenue for all online bings based on elapsed time
  useEffect(() => {
    if (!user || user.activeBings.length === 0) return;

    const interval = setInterval(() => {
      setUser(prevUser => {
        if (!prevUser) return null;
        let hasChanges = false;
        
        const updatedBings = prevUser.activeBings.map(bing => {
          if (bing.isCompleted) return bing;
          
          // Calculate exact accumulated value since lastClaimedTimestamp
          const lastTime = new Date(bing.lastClaimedTimestamp).getTime();
          const msPassed = Date.now() - lastTime;
          const ratePerMs = bing.dailyIncome / (24 * 60 * 60 * 1000); // 86400000 ms in a day
          const exactEarned = Math.floor(msPassed * ratePerMs);
          
          const totalRemaining = bing.totalIncome - bing.totalClaimed;
          const actualUnclaimed = Math.max(0, Math.min(exactEarned, totalRemaining));
          
          if (actualUnclaimed !== bing.accumulatedUnclaimed) {
            hasChanges = true;
            return {
              ...bing,
              accumulatedUnclaimed: actualUnclaimed
            };
          }
          return bing;
        });

        if (hasChanges) {
          return {
            ...prevUser,
            activeBings: updatedBings
          };
        }
        return prevUser;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [user ? user.activeBings.length : 0]);

  // Calculate overall unclaimed earnings
  const unclaimedEarnings = user 
    ? user.activeBings.reduce((sum, b) => sum + b.accumulatedUnclaimed, 0)
    : 0;

  // Claim all earnings of active bings
  const handleClaimAllEarnings = () => {
    if (!user || unclaimedEarnings <= 0) return;

    const newBalance = user.balance + unclaimedEarnings;
    const nowISO = new Date().toISOString();
    const updatedBings = user.activeBings.map(b => {
      const claimedSum = b.totalClaimed + b.accumulatedUnclaimed;
      return {
        ...b,
        totalClaimed: claimedSum,
        accumulatedUnclaimed: 0,
        lastClaimedTimestamp: nowISO,
        isCompleted: claimedSum >= b.totalIncome
      };
    });

    const claimTx: Transaction = {
      id: generateId(),
      type: 'earnings',
      amount: unclaimedEarnings,
      description: 'Claimed GoldRush Mining Yields',
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };

    setUser({
      ...user,
      balance: newBalance,
      activeBings: updatedBings
    });
    setTransactions(prev => [claimTx, ...prev]);
    addToast(`Successfully credited ${formatNaira(unclaimedEarnings)} node profits to your bankroll!`, 'success');
  };

  // Claim single active bing earnings
  const handleClaimSingleEarning = (activeBingId: string) => {
    if (!user) return;
    const targetBing = user.activeBings.find(b => b.id === activeBingId);
    if (!targetBing || targetBing.accumulatedUnclaimed <= 0) return;

    const amountToClaim = targetBing.accumulatedUnclaimed;

    const newBalance = user.balance + amountToClaim;
    const nowISO = new Date().toISOString();
    const updatedBings = user.activeBings.map(b => {
      if (b.id === activeBingId) {
        const totalClaimedSoFar = b.totalClaimed + amountToClaim;
        return {
          ...b,
          totalClaimed: totalClaimedSoFar,
          accumulatedUnclaimed: 0,
          lastClaimedTimestamp: nowISO,
          isCompleted: totalClaimedSoFar >= b.totalIncome
        };
      }
      return b;
    });

    const singleClaimTx: Transaction = {
      id: generateId(),
      type: 'earnings',
      amount: amountToClaim,
      description: `Collected ${targetBing.title} Yields`,
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };

    setUser({
      ...user,
      balance: newBalance,
      activeBings: updatedBings
    });
    setTransactions(prev => [singleClaimTx, ...prev]);
    addToast(`Collected ${formatNaira(amountToClaim)} from ${targetBing.title}!`, 'success');
  };

  // Redirect to Bing Purchase and checkout flow
  const handleBuyBing = (service: BingService) => {
    if (!user) return;

    // Prevent double purchasing if already owned/active
    const hasActive = user.activeBings.some(b => b.serviceId === service.id && !b.isCompleted);
    if (hasActive) {
      addToast(`You already have an active leased contract for ${service.title}. You cannot purchase the same contract twice!`, 'error');
      return;
    }

    // Prevent double purchasing if already pending review
    const bingsSaved = localStorage.getItem('goldrush9ja_bing_purchase_requests');
    if (bingsSaved) {
      try {
        const reqs = JSON.parse(bingsSaved);
        const hasPending = reqs.some((r: any) => 
          r.username.toLowerCase() === user.username.toLowerCase() && 
          r.serviceId === service.id && 
          r.status === 'pending'
        );
        if (hasPending) {
          addToast(`You already have a pending lease request for ${service.title}. Please wait for corporate approval!`, 'error');
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    setSelectedBingService(service);
    setActiveTab('bing-purchase-payment');
  };
  
  // Purchase and instantly deploy mining node using dashboard/wallet balance
  const handlePurchaseBingWithBalance = (service: BingService) => {
    if (!user) return;
    if (user.balance < service.price) {
      addToast(`Insufficient Balance! Your current balance is ${formatNaira(user.balance)}, but ${service.title} costs ${formatNaira(service.price)}. Please fund your wallet.`, 'error');
      return;
    }

    const newBalance = user.balance - service.price;
    const newActiveBing: ActiveBing = {
      id: 'active-' + Math.floor(100000 + Math.random() * 900000),
      serviceId: service.id,
      title: service.title,
      price: service.price,
      dailyIncome: service.dailyIncome,
      totalIncome: service.totalIncome,
      timestampBought: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      durationDays: service.durationDays,
      lastClaimedTimestamp: new Date().toISOString(),
      accumulatedUnclaimed: 0,
      totalClaimed: 0,
      isCompleted: false
    };

    const purchaseTx: Transaction = {
      id: generateId(),
      type: 'purchase',
      amount: service.price,
      description: `Deployed ${service.title} (Paid with Wallet Balance)`,
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };

    const updatedUser = {
      ...user,
      balance: newBalance,
      activeBings: [...(user.activeBings || []), newActiveBing]
    };

    setUser(updatedUser);
    setTransactions(prev => [purchaseTx, ...prev]);

    // Also update this user inside registered users in local storage
    const usersRaw = localStorage.getItem('goldrush9ja_registered_users');
    if (usersRaw) {
      try {
        const registered = JSON.parse(usersRaw);
        const uIdx = registered.findIndex((u: any) => u.username.toLowerCase() === user.username.toLowerCase());
        if (uIdx !== -1) {
          registered[uIdx] = {
            ...registered[uIdx],
            balance: newBalance,
            activeBings: updatedUser.activeBings
          };
          localStorage.setItem('goldrush9ja_registered_users', JSON.stringify(registered));
        }
      } catch (e) {
        console.error(e);
      }
    }

    addToast(`Successfully purchased and deployed ${service.title} using your dashboard balance!`, 'success');
    setActiveTab('bingshop');
  };

  // Simulate a referral signup
  const handleSimulateReferral = (friendName: string) => {
    if (!user) return;
    const referralBonusAmount = 16890;

    const newBalance = user.balance + referralBonusAmount;
    const referralTx: Transaction = {
      id: generateId(),
      type: 'referral',
      amount: referralBonusAmount,
      description: `Referral Reward: ${friendName} signed up`,
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };

    setUser({
      ...user,
      balance: newBalance,
      referralCount: user.referralCount + 1,
      referralBonusEarned: user.referralBonusEarned + referralBonusAmount
    });
    setTransactions(prev => [referralTx, ...prev]);
    addToast(`Excellent! ${friendName} registered with your link. Received ₦16,890.00 credit!`, 'success');
  };

  // Simulate Add Money Deposit
  const handleAddMoneySimulation = () => {
    if (!user) return;
    const depositAmount = 25000; // Adding 25k to balance

    const newBalance = user.balance + depositAmount;
    const depositTx: Transaction = {
      id: generateId(),
      type: 'deposit',
      amount: depositAmount,
      description: 'Deposit via Bank Transfer',
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };

    setUser({
      ...user,
      balance: newBalance
    });
    setTransactions(prev => [depositTx, ...prev]);
    addToast(`${formatNaira(depositAmount)} successfully credited to your wallet via secure secure gateway.`, 'success');
  };

  // Simulate Bank Withdrawal
  const handleSimulateWithdrawal = () => {
    if (!user) return;
    const withdrawAmount = 10000; // Withdraw ₦10k

    if (user.balance < withdrawAmount) {
      addToast(`Insufficient funds! Minimum withdrawal is ₦10,000.00.`, 'error');
      return;
    }

    const newBalance = user.balance - withdrawAmount;
    const withdrawTx: Transaction = {
      id: generateId(),
      type: 'withdrawal',
      amount: withdrawAmount,
      description: 'Withdrawal to Bank Account',
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };

    setUser({
      ...user,
      balance: newBalance
    });
    setTransactions(prev => [withdrawTx, ...prev]);
    addToast(`Withdrawal of ${formatNaira(withdrawAmount)} processed successfully to your registered commercial bank account.`, 'success');
  };

  const handlePurchaseItem = (amount: number, description: string) => {
    if (!user) return;
    const newBalance = user.balance - amount;
    const newTx: Transaction = {
      id: generateId(),
      type: 'purchase',
      amount,
      description,
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };
    setUser({
      ...user,
      balance: newBalance
    });
    setTransactions(prev => [newTx, ...prev]);
    addToast(`Successful: ${description}`, 'success');
  };

  const handleClaimTelegramBonus = () => {
    if (!user) return;
    const bonusAmount = 10000;
    const bonusTx: Transaction = {
      id: generateId(),
      type: 'deposit',
      amount: bonusAmount,
      description: 'Telegram Bonus Reward',
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };
    setUser({
      ...user,
      balance: user.balance + bonusAmount
    });
    setTransactions(prev => [bonusTx, ...prev]);
    addToast('Successfully claimed your ₦10,000.00 Telegram channel join bonus!', 'success');
  };

  const handleUserWithdrawal = (amount: number, description: string) => {
    if (!user) return;
    const newBalance = user.balance - amount;
    const withdrawTx: Transaction = {
      id: generateId(),
      type: 'withdrawal',
      amount,
      description,
      timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: generateReference()
    };
    setUser({
      ...user,
      balance: newBalance
    });
    setTransactions(prev => [withdrawTx, ...prev]);
    addToast(`Withdrawal of ${formatNaira(amount)} processed successfully!`, 'success');
  };

  // Handle Tier Upgrade - Launch payment and checkout flow
  const handleUpgradeTier = (targetTierLevel: TierLevel) => {
    if (!user) return;
    const targetTier = TIERS.find(t => t.level === targetTierLevel);
    if (!targetTier) return;

    if (user.tier >= targetTierLevel) {
      addToast(`Your account is already on Tier ${user.tier} or higher.`, 'info');
      return;
    }

    setSelectedUpgradeTier(targetTier);
    setShowUpgradeModal(false);
    setActiveTab('upgrade-payment');
  };

  // Reset demo
  const handleResetAppSimulation = () => {
    setUser(null);
    setTransactions([]);
    setActiveTab('home');
    localStorage.removeItem('goldrush9ja_user');
    localStorage.removeItem('goldrush9ja_transactions');
    addToast('Demo sandbox reset completed successfully!', 'success');
  };

  // Sign out helper
  const handleSignOut = () => {
    setUser(null);
    setTransactions([]);
    setActiveTab('home');
    localStorage.removeItem('goldrush9ja_user');
    localStorage.removeItem('goldrush9ja_transactions');
    addToast('Logged out securely.', 'info');
  };

  if (!user) {
    return (
      <>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
        {/* Simple Toast Container */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map(t => (
            <div 
              key={t.id} 
              className={`p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center justify-between gap-3 pointer-events-auto animate-slide-in ${
                t.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
                t.type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
                'bg-primary-dark text-purple-200 border-purple-900'
              }`}
            >
              <span>{t.message}</span>
              <button type="button" onClick={() => removeToast(t.id)} className="text-white/80 hover:text-white">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  const isUserBanned = (() => {
    if (!user) return false;
    const savedBanned = localStorage.getItem('goldrush9ja_banned_users');
    if (savedBanned) {
      const bannedList: string[] = JSON.parse(savedBanned);
      return bannedList.includes(user.username);
    }
    return false;
  })();

  if (user && isUserBanned) {
    return (
      <div className="min-h-screen bg-primary-light flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-rose-100 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-inner">
            <AlertTriangle size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-rose-600 tracking-tight">Account Suspended</h2>
            <p className="text-xs text-purple-400 font-medium leading-relaxed">
              Your account under the identifier <span className="font-extrabold text-primary-medium">{user.username.toUpperCase()}</span> has been suspended/banned by administration for violating policy or terms of services.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100/50 text-[11px] text-purple-500 font-medium">
            Contact support on our official Telegram channel <span className="font-extrabold text-primary-brand">{company.telegramChannel}</span> for review.
          </div>
          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
          >
            Exit Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-light flex flex-col relative font-sans">
      
      {/* Toast Portal */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center justify-between gap-3 pointer-events-auto animate-slide-in ${
              t.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
              t.type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
              'bg-primary-dark text-purple-200 border-purple-950'
            }`}
          >
            <span>{t.message}</span>
            <button type="button" onClick={() => removeToast(t.id)} className="text-white/80 hover:text-white">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Top Header bar */}
      <header className="bg-primary-medium text-white px-4 py-3 shadow-md border-b border-white/10">
        <div className="w-full max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <div className="w-4.5 h-4.5 bg-primary-medium rounded-sm transform rotate-45"></div>
            </div>
            <span className="text-xs sm:text-sm md:text-base font-black tracking-tight">GOLDRUSH9JA</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/5">
              <span className="text-[10px] font-black uppercase text-purple-200">LVL {user.tier}</span>
            </div>
            <div className="h-6 w-[1px] bg-white/15"></div>
            <div className="text-right">
              <p className="text-xs font-bold tracking-tight">{user.username.toUpperCase()}</p>
              <p className="text-[9px] opacity-65 font-mono">ID: {user.username.substring(0, 4).toUpperCase()}-{user.tier}X</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-6 pb-28 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <DashboardHome 
                user={user} 
                transactions={displayedTransactions} 
                onNavigate={setActiveTab}
                onOpenUpgradeModal={() => setActiveTab('upgrade')}
                onAddMoneySimulation={handleAddMoneySimulation}
                onSimulateWithdrawal={handleSimulateWithdrawal}
                onClaimAllEarnings={handleClaimAllEarnings}
                unclaimedEarnings={unclaimedEarnings}
              />
            </motion.div>
          )}

          {activeTab === 'bingshop' && (
            <motion.div 
              key="bingshop" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <BingShop 
                user={user} 
                onBuyBing={handleBuyBing} 
                onClaimEarning={handleClaimSingleEarning}
                onNavigate={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'referrals' && (
            <motion.div 
              key="referrals" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ReferralCenter 
                user={user} 
              />
            </motion.div>
          )}

          {activeTab === 'me' && (
            <motion.div 
              key="me" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <UserProfileMe 
                user={user} 
                onNavigate={setActiveTab}
                onSignOut={handleSignOut}
              />
            </motion.div>
          )}

          {activeTab === 'upgrade' && (
            <motion.div 
              key="upgrade" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <UpgradePage 
                user={user} 
                onUpgradeTier={handleUpgradeTier} 
                onBack={() => setActiveTab('home')}
              />
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div 
              key="transactions" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <TransactionHistoryPage 
                transactions={displayedTransactions} 
                onBack={() => setActiveTab('home')} 
              />
            </motion.div>
          )}

          {activeTab === 'airtime-data' && (
            <motion.div 
              key="airtime-data" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <AirtimeDataPage 
                user={user} 
                onPurchase={handlePurchaseItem} 
                onBack={() => setActiveTab('home')} 
                onUpgradeRequest={() => { setActiveTab('upgrade'); }}
              />
            </motion.div>
          )}

          {activeTab === 'withdraw' && (
            <motion.div 
              key="withdraw" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <WithdrawPage 
                user={user} 
                onWithdraw={handleUserWithdrawal} 
                onBack={() => setActiveTab('home')} 
                onUpgradeRequest={() => { setActiveTab('upgrade'); }}
              />
            </motion.div>
          )}

          {activeTab === 'exl' && (
            <motion.div 
              key="exl" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ExlPage 
                user={user} 
                onPurchase={handlePurchaseItem} 
                onBack={() => setActiveTab('home')} 
                onUpgradeRequest={() => { setActiveTab('upgrade'); }}
              />
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div 
              key="support" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <SupportPage 
                user={user} 
                transactions={displayedTransactions}
                onClaimBonus={handleClaimTelegramBonus} 
                onNavigate={setActiveTab}  
                onBack={() => setActiveTab('home')}
                addToast={addToast}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div 
              key="admin" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <AdminPage 
                onBack={() => setActiveTab('support')} 
                addToast={addToast}
              />
            </motion.div>
          )}

          {activeTab === 'upgrade-payment' && (
            <motion.div 
              key="upgrade-payment" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <UpgradePaymentPage 
                user={user}
                selectedTier={selectedUpgradeTier || TIERS.find(t => t.level === user.tier + 1) || TIERS[1]}
                onBack={() => setActiveTab('home')}
                addToast={addToast}
                upgradeRequests={upgradeRequests}
                onUpgradeSubmitted={(newReq) => setUpgradeRequests(prev => [newReq, ...prev])}
              />
            </motion.div>
          )}

          {activeTab === 'bing-purchase-payment' && (
            <motion.div 
              key="bing-purchase-payment" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <BingPurchasePaymentPage 
                user={user}
                selectedService={selectedBingService || BING_SERVICES[0]}
                onBack={() => setActiveTab('bingshop')}
                addToast={addToast}
                purchaseRequests={purchaseRequests}
                onPurchaseSubmitted={(newReq) => setPurchaseRequests(prev => [newReq, ...prev])}
                onPurchaseWithBalance={handlePurchaseBingWithBalance}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation Bar (OPay layout inspired) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-purple-100 py-2.5 px-6 shadow-2xl z-40 flex justify-between items-center max-w-2xl mx-auto rounded-t-3xl">
        {[
          { id: 'home', label: 'Home', icon: HomeIcon },
          { id: 'bingshop', label: 'GoldRush Shop', icon: Flame, badge: user.activeBings.filter(b => !b.isCompleted).length > 0 },
          { id: 'referrals', label: 'Refer & Earn', icon: Gift },
          { id: 'me', label: 'Me', icon: Layers }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl relative transition-all duration-300 cursor-pointer"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary-medium text-white shadow-md shadow-purple-950/20 scale-105' 
                  : 'text-purple-400 hover:text-primary-brand hover:bg-purple-50'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${
                isActive ? 'text-primary-medium' : 'text-purple-400/90'
              }`}>
                {item.label}
              </span>
              {item.badge && (
                <span className="absolute top-0.5 right-2 h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Upgrade Modal triggered from Home */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-100"
          >
            <div className="bg-gradient-to-r from-primary-medium to-primary-brand p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-300 animate-bounce" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">Account Upgrade Portal</h3>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="p-1 hover:bg-white/15 rounded-lg text-white"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-purple-500 font-medium">
                Choose the tier level to unlock premium limits. Upgrades are immediate and fees are deducted from your balance.
              </p>

              <div className="space-y-3">
                {TIERS.slice(1).map(tier => {
                  const isUnlocked = user.tier >= tier.level;
                  const canAfford = user.balance >= tier.cost;
                  return (
                    <div 
                      key={tier.level}
                      className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                        isUnlocked ? 'border-purple-100 bg-purple-50/25 opacity-70' : 'border-purple-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs text-primary-dark">{tier.name}</h4>
                          <span className="text-[10px] text-purple-400 font-mono">Cost: {formatNaira(tier.cost)}</span>
                        </div>
                      </div>
                      
                      {!isUnlocked && (
                        <button
                          type="button"
                          id={`modal-upgrade-tier-btn-${tier.level}`}
                          onClick={() => handleUpgradeTier(tier.level)}
                          className={`w-full py-2 bg-primary-dark hover:bg-primary-brand text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer ${
                            canAfford ? '' : 'opacity-50 pointer-events-none'
                          }`}
                        >
                          Unlock Level {tier.level}
                        </button>
                      )}
                      {isUnlocked && (
                        <div className="text-[10px] font-bold text-purple-400 text-center py-1">
                          ✓ Level Unlocked
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
