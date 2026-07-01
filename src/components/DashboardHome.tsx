import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, Shield, 
  ChevronRight, Bell, Smartphone, HelpCircle, Award, 
  Layers, Gift, Wallet, TrendingUp, History, CheckCircle, Flame, Copy, Globe, XCircle
} from 'lucide-react';
import { User, Transaction, TierLevel } from '../types';
import { formatNaira, TIERS, BING_SERVICES } from '../data';

const liveWithdrawals = [
  { name: "Gift O.", amount: 600000, bank: "Access Bank" },
  { name: "Chinedu K.", amount: 350000, bank: "Guaranty Trust Bank (GTBank)" },
  { name: "Abubakar M.", amount: 150000, bank: "United Bank for Africa (UBA)" },
  { name: "Funmi A.", amount: 750000, bank: "Zenith Bank" },
  { name: "Blessing I.", amount: 120000, bank: "First Bank of Nigeria" },
  { name: "Nnamdi O.", amount: 480000, bank: "Fidelity Bank" },
  { name: "Zainab S.", amount: 250000, bank: "Wema Bank" },
  { name: "Olumide J.", amount: 95000, bank: "Sterling Bank" },
  { name: "Kelechi U.", amount: 300000, bank: "Union Bank" },
  { name: "Ibrahim A.", amount: 1200000, bank: "Stanbic IBTC" },
  { name: "Emeka N.", amount: 500000, bank: "Access Bank" },
  { name: "Chioma A.", amount: 80000, bank: "Guaranty Trust Bank (GTBank)" },
  { name: "Yusuf D.", amount: 220000, bank: "United Bank for Africa (UBA)" },
  { name: "Temitope B.", amount: 450000, bank: "Zenith Bank" },
  { name: "Umar F.", amount: 130000, bank: "First Bank of Nigeria" },
  { name: "Adeola G.", amount: 680000, bank: "Fidelity Bank" },
  { name: "Efe O.", amount: 1100000, bank: "Stanbic IBTC" },
  { name: "Patience E.", amount: 290000, bank: "Wema Bank" },
  { name: "Tunde S.", amount: 180000, bank: "Sterling Bank" },
  { name: "Aisha B.", amount: 350000, bank: "Union Bank" }
];

interface DashboardHomeProps {
  user: User;
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
  onOpenUpgradeModal: () => void;
  onAddMoneySimulation: () => void;
  onSimulateWithdrawal: () => void;
  onClaimAllEarnings: () => void;
  unclaimedEarnings: number;
}

export default function DashboardHome({
  user,
  transactions,
  onNavigate,
  onOpenUpgradeModal,
  onAddMoneySimulation,
  onSimulateWithdrawal,
  onClaimAllEarnings,
  unclaimedEarnings
}: DashboardHomeProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [readMessageIds, setReadMessageIds] = useState<string[]>([]);
  const [currentWithdrawalIndex, setCurrentWithdrawalIndex] = useState(0);

  useEffect(() => {
    // Ticker rotation logic
    const interval = setInterval(() => {
      setCurrentWithdrawalIndex((prev) => {
        let nextIndex = Math.floor(Math.random() * liveWithdrawals.length);
        while (nextIndex === prev && liveWithdrawals.length > 1) {
          nextIndex = Math.floor(Math.random() * liveWithdrawals.length);
        }
        return nextIndex;
      });
    }, 5500); // changes every 5.5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load messages from localStorage
    const savedMsgs = localStorage.getItem('goldrush9ja_messages');
    if (savedMsgs) {
      try {
        const parsed = JSON.parse(savedMsgs);
        // Filter messages for this user or 'all'
        const userMsgs = parsed.filter((m: any) => 
          m.recipient === 'all' || 
          m.recipient?.toLowerCase() === user.username.toLowerCase()
        );
        // Sort descending by timestamp (newest first)
        userMsgs.sort((a: any, b: any) => b.id.localeCompare(a.id));
        setMessages(userMsgs);
      } catch (e) {
        console.error(e);
      }
    }

    // Load read message IDs
    const savedReadIds = localStorage.getItem('goldrush9ja_read_message_ids');
    if (savedReadIds) {
      try {
        setReadMessageIds(JSON.parse(savedReadIds));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user.username, showNotifications]);

  const unreadMessagesCount = messages.filter(m => !readMessageIds.includes(m.id)).length;

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    // Mark all as read when opening
    const newReadIds = [...new Set([...readMessageIds, ...messages.map(m => m.id)])];
    setReadMessageIds(newReadIds);
    localStorage.setItem('goldrush9ja_read_message_ids', JSON.stringify(newReadIds));
  };

  const currentTierInfo = TIERS.find(t => t.level === user.tier) || TIERS[0];
  const limitPercent = Math.min((user.balance / currentTierInfo.limit) * 100, 100);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://goldrush9ja.online/join?ref=${user.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Select 3 top products for bento shop preview
  const shopPreviewProducts = BING_SERVICES.slice(0, 3);
  const productIcons = ['⚡', '💎', '🛡️'];

  return (
    <div className="space-y-4 pb-24 font-sans text-primary-dark">
      {/* Live Withdrawal Ticker Toast / Cashout Testimony */}
      <div className="relative z-20 overflow-hidden w-full max-w-md mx-auto" id="live-withdrawal-ticker-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWithdrawalIndex}
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-neutral-900 text-white rounded-3xl p-3.5 px-5 shadow-lg shadow-emerald-950/20 border-2 border-emerald-500 flex items-center justify-between gap-3"
            id={`withdrawal-alert-${currentWithdrawalIndex}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="min-w-0 leading-relaxed">
                <p className="text-xs font-semibold text-neutral-300 tracking-tight">
                  <span className="font-extrabold text-white text-sm">{liveWithdrawals[currentWithdrawalIndex].name}</span>
                  <span className="text-neutral-400 mx-1">withdrew</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{formatNaira(liveWithdrawals[currentWithdrawalIndex].amount)}</span>
                  <span className="text-neutral-400 mx-1">to</span>
                  <span className="font-bold text-white">{liveWithdrawals[currentWithdrawalIndex].bank}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Top Welcome Bar */}
      <div className="relative flex justify-between items-center bg-white p-4 rounded-3xl border border-primary-medium/10 shadow-sm" id="top-welcome-bar">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary-medium to-primary-brand flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            {/* Medal badge based on tier */}
            <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow border border-purple-100">
              <Award className={`h-5 w-5 ${
                user.tier === 1 ? 'text-[#8B4513]' :
                user.tier === 2 ? 'text-[#D4AF37]' :
                user.tier === 3 ? 'text-indigo-400' :
                'text-fuchsia-600 animate-bounce'
              }`} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base tracking-tight">Hi, {user.username.toUpperCase()}</h3>
              <span className={`absolute -top-2.5 right-6 text-[9px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider shadow-sm border ${
                user.tier === 1 ? 'bg-[#8B4513] text-[#FFF8F3] border-[#70350B]' :
                user.tier === 2 ? 'bg-[#D4AF37] text-amber-950 border-[#BFA12C]' :
                user.tier === 3 ? 'bg-purple-600 text-white border-purple-700' :
                'bg-black text-amber-400 border border-amber-500'
              }`}>
                Lvl {user.tier}
              </span>
            </div>
            <p className="text-xs text-purple-400 font-medium">Safe & Premium Banking</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            className="p-2.5 bg-primary-light rounded-xl hover:bg-purple-100 transition-colors relative cursor-pointer"
            onClick={handleOpenNotifications}
            title="Corporate Announcements"
          >
            <Bell className="h-5 w-5 text-primary-brand" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center animate-bounce shadow">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button 
            type="button"
            className="p-2.5 bg-primary-light rounded-xl hover:bg-purple-100 transition-colors cursor-pointer"
            onClick={() => onNavigate('me')}
          >
            <Layers className="h-5 w-5 text-primary-brand" />
          </button>
        </div>
      </div>

      {/* Live Earnings Ticker Banner if user has running bings */}
      {user.activeBings.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-primary-brand text-white p-4 rounded-3xl shadow-md border border-amber-400/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
          id="live-earnings-banner"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
              <h4 className="font-extrabold text-xs tracking-wider uppercase">Live Node Revenue System</h4>
            </div>
            <p className="text-sm font-semibold mt-1">
              Unclaimed: <span className="font-extrabold text-lg">{formatNaira(unclaimedEarnings)}</span>
            </p>
          </div>
          <button
            type="button"
            id="claim-earnings-btn"
            disabled={unclaimedEarnings <= 0}
            onClick={onClaimAllEarnings}
            className="w-full sm:w-auto px-4 py-2.5 bg-white text-amber-700 hover:bg-amber-50 disabled:opacity-50 disabled:pointer-events-none font-bold text-xs rounded-xl shadow-sm transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <TrendingUp size={14} className="stroke-[3]" />
            <span>Claim & Balance Credit</span>
          </button>
        </motion.div>
      )}

      {/* Bento Grid Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Card 1: Balance Card (lg:col-span-6) */}
        <div 
          className="lg:col-span-6 bg-primary-medium rounded-3xl p-5 text-white flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[230px]"
          id="balance-card"
        >
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="z-10 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <Wallet size={15} className="text-purple-300" />
                  <p className="text-[11px] opacity-70 font-semibold tracking-wider uppercase">Total Available Balance</p>
                  <button 
                    type="button" 
                    onClick={() => setShowBalance(!showBalance)} 
                    className="p-1 hover:bg-white/10 rounded transition-colors text-purple-200"
                  >
                    {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                {showBalance ? formatNaira(user.balance) : '₦ ••••••••'}
              </h2>
            </div>

            {/* Progress status */}
            <div className="bg-black/20 rounded-2xl p-3 mt-3">
              <div className="flex justify-between items-center text-[9px]">
                <span className="uppercase tracking-wider opacity-60 font-bold">Wallet Storage Capacity</span>
                <span className="font-extrabold text-amber-300">UNLIMITED</span>
              </div>
              <p className="text-[8px] mt-1 opacity-60">
                {user.tier < 2 ? '⚠️ Upgrade to Tier 2 to enable Commercial Bank Cashout' : '✅ Tier 2 Secured: Bank withdrawals active'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3.5 z-10">
            <button
              type="button"
              id="add-money-btn"
              onClick={() => onNavigate('transactions')}
              className="flex-1 bg-white text-primary-dark hover:bg-purple-50 transition-all font-bold text-[11px] py-2.5 rounded-xl flex items-center justify-center gap-1 shadow-md active:scale-95 cursor-pointer"
            >
              <History size={13} className="stroke-[3]" />
              <span>Transaction History</span>
            </button>
            <button
              type="button"
              id="withdraw-btn"
              onClick={() => onNavigate('withdraw')}
              className="flex-1 bg-purple-950/40 backdrop-blur-md text-white border border-white/20 hover:bg-white/10 transition-all font-bold text-[11px] py-2.5 rounded-xl flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <ArrowUpRight size={13} className="stroke-[3]" />
              <span>Withdraw</span>
            </button>
          </div>

          {/* Active Nodes Indicator */}
          <div 
            className="mt-3.5 pt-3 border-t border-white/10 flex justify-between items-center text-[11px] opacity-90 hover:opacity-100 transition-opacity cursor-pointer z-10"
            onClick={() => onNavigate('bingshop')}
          >
            <div className="flex items-center gap-1.5 text-purple-200">
              <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span className="font-semibold">
                Active: {user.activeBings.filter(b => !b.isCompleted).length} Nodes Running
              </span>
            </div>
            <div className="flex items-center gap-0.5 text-white font-bold">
              <span>Invest</span>
              <ChevronRight size={12} />
            </div>
          </div>
        </div>

        {/* Card 2: Core Payment Services (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-primary-medium/10 shadow-sm flex flex-col justify-between" id="services-grid-box">
          <div>
            <h4 className="font-extrabold text-[11px] tracking-wider uppercase text-purple-400 mb-4">Core Payment Services</h4>
            
            <div className="grid grid-cols-4 gap-y-5 gap-x-2 text-center">
              {[
                { id: 'bingshop', label: 'Bing Shop', icon: Flame, color: 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20' },
                { id: 'referrals', label: 'Refer & Earn', icon: Gift, color: 'bg-purple-100 text-primary-brand' },
                { id: 'airtime', label: 'Airtime', icon: Smartphone, color: 'bg-purple-50 text-purple-600' },
                { id: 'data', label: 'Mobile Data', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
                { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight, color: 'bg-purple-50 text-purple-600' },
                { id: 'exl', label: 'EXL', icon: Globe, color: 'bg-purple-50 text-purple-600' },
                { id: 'upgrade', label: 'Upgrade', icon: Award, color: 'bg-primary-accent text-primary-medium shadow-md shadow-primary-accent/30 font-extrabold animate-pulse' },
                { id: 'help', label: 'Support', icon: HelpCircle, color: 'bg-purple-50 text-purple-600' },
              ].map((srv) => {
                const Icon = srv.icon;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    id={`service-${srv.id}`}
                    onClick={() => {
                      if (srv.id === 'bingshop') onNavigate('bingshop');
                      else if (srv.id === 'referrals') onNavigate('referrals');
                      else if (srv.id === 'airtime' || srv.id === 'data') onNavigate('airtime-data');
                      else if (srv.id === 'withdraw') onNavigate('withdraw');
                      else if (srv.id === 'exl') onNavigate('exl');
                      else if (srv.id === 'upgrade') onNavigate('upgrade');
                      else if (srv.id === 'help') onNavigate('support');
                    }}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${srv.color}`}>
                       <Icon className="h-5.5 w-5.5" />
                    </div>
                    <span className={`text-[10px] font-bold tracking-tight ${
                      srv.id === 'bingshop' ? 'text-amber-700 font-extrabold' : 
                      srv.id === 'upgrade' ? 'text-amber-600 font-extrabold animate-pulse' : 
                      'text-primary-dark/80'
                    }`}>
                      {srv.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Promos & Security (Side-by-side grids) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Floating Promotion Banner */}
        <div 
          onClick={() => onNavigate('referrals')}
          className="bg-primary-medium text-white p-4 rounded-3xl relative overflow-hidden flex items-center gap-4 cursor-pointer hover:bg-[#1f124a] transition-colors shadow-md border border-purple-900/40"
          id="promo-banner"
        >
          <div className="p-3 bg-white/10 rounded-2xl">
            <Gift className="h-6 w-6 text-amber-300 animate-bounce" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-amber-300">Invite Friends, Get Paid!</h4>
            <p className="text-xs text-purple-200 mt-0.5">
              Earn instant <span className="font-extrabold text-white">₦16,890.00</span> bonus reward for each registered friend!
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-purple-300 ml-auto flex-shrink-0" />
        </div>



      </div>

      {/* Notifications Inbox Modal Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[80vh]"
          >
            <div className="bg-gradient-to-r from-primary-medium to-purple-950 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-300 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black">Official Notifications</h3>
                  <p className="text-[10px] text-purple-200">Inbox & Corporate Announcements</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-purple-200 transition-colors cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-purple-300 text-xs font-semibold space-y-2">
                  <Bell className="h-8 w-8 text-purple-200 mx-auto opacity-40" />
                  <p>Your inbox is currently empty.</p>
                  <p className="text-[10px] text-purple-400 font-normal">Check back later for system announcements.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className="bg-purple-50/40 border border-purple-100/50 p-4 rounded-2xl space-y-1.5 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-black tracking-wide text-rose-600 uppercase bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                        {msg.sender === 'Admin' ? 'Management' : msg.sender}
                      </span>
                      <span className="text-[9px] text-purple-400 font-medium font-mono">{msg.timestamp}</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-primary-dark">{msg.title}</h4>
                    <p className="text-xs text-purple-950/80 leading-relaxed whitespace-pre-wrap font-medium">{msg.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-purple-50 bg-purple-50/20 text-center">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full py-2.5 bg-primary-dark hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Close Inbox
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
