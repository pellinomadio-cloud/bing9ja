import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, Shield, 
  ChevronRight, Bell, Smartphone, HelpCircle, Award, 
  Layers, Gift, Wallet, TrendingUp, History, CheckCircle, Flame, Copy, Globe, XCircle,
  Headphones, Send
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
  isAppInstallable?: boolean;
  onTriggerAppInstall?: () => void;
}

export default function DashboardHome({
  user,
  transactions,
  onNavigate,
  onOpenUpgradeModal,
  onAddMoneySimulation,
  onSimulateWithdrawal,
  onClaimAllEarnings,
  unclaimedEarnings,
  isAppInstallable = false,
  onTriggerAppInstall
}: DashboardHomeProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

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
    navigator.clipboard.writeText(`https://volerapay.online/join?ref=${user.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Select 3 top products for bento shop preview
  const shopPreviewProducts = BING_SERVICES.slice(0, 3);
  const productIcons = ['⚡', '💎', '🛡️'];

  return (
    <div className="space-y-4 pb-24 font-sans text-primary-dark">
      {/* Live Withdrawal Ticker Toast / Cashout Testimony */}
      <div className="relative z-20 overflow-hidden w-full max-w-md mx-auto h-[62px] flex items-center justify-center" id="live-withdrawal-ticker-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWithdrawalIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full bg-neutral-900 text-white rounded-3xl p-3 px-5 shadow-lg shadow-emerald-950/20 border-2 border-emerald-500 flex items-center justify-between gap-3"
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
      <div className="relative flex justify-between items-center py-2 px-1" id="top-welcome-bar">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={() => onNavigate('me')}>
            <img 
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} 
              alt="User Avatar"
              className="h-11 w-11 rounded-full bg-amber-100 border border-neutral-200/50 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
            {/* Minimal Tier Indicator Badge */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-neutral-950 border border-white">
              {user.tier}
            </span>
          </div>
          <div>
            <p className="text-neutral-500 text-xs font-semibold leading-none">Hello,</p>
            <h3 className="font-bold text-base text-neutral-800 tracking-tight leading-tight mt-1">
              {user.username.toLowerCase()}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Help Headphones Button with Custom Badge */}
          <button 
            type="button"
            className="h-10 w-10 rounded-full bg-white shadow-xs border border-neutral-100 flex items-center justify-center relative cursor-pointer hover:bg-neutral-50 transition-colors"
            onClick={() => onNavigate('support')}
            title="Help Support Desk"
          >
            <Headphones className="h-5 w-5 text-neutral-800" />
            <span className="absolute -top-2 bg-[#E0533C] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full tracking-wider shadow-xs scale-90">
              HELP
            </span>
          </button>

          {/* Notifications Bell Button */}
          <button 
            type="button"
            className="h-10 w-10 rounded-full bg-white shadow-xs border border-neutral-100 flex items-center justify-center relative cursor-pointer hover:bg-neutral-50 transition-colors"
            onClick={handleOpenNotifications}
            title="Announcements"
          >
            <Bell className="h-5 w-5 text-neutral-800" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#E0533C] ring-2 ring-white"></span>
            )}
          </button>
        </div>
      </div>


      {/* Premium Green & Gold PWA App Installer Banner */}
      <div className="bg-gradient-to-r from-[#0d2a1d] to-[#14422b] border border-[#d4af37]/30 rounded-[32px] p-5 text-white shadow-xl relative overflow-hidden" id="pwa-install-banner">
        {/* Abstract Gold Circles in background */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute left-1/3 top-2 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row w-full sm:w-auto">
            <div className="relative shrink-0 p-1.5 bg-gradient-to-br from-[#d4af37] to-[#f3e5ab] rounded-2xl shadow-md shadow-[#d4af37]/10 flex-shrink-0 mx-auto sm:mx-0">
              <img 
                src="/volerapay_icon.jpg" 
                alt="Volerapay Gold Icon" 
                className="h-12 w-12 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full mb-1">
                  <Smartphone size={10} className="stroke-[3]" /> OFFICIAL MOBILE APP
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-[#f3e5ab] tracking-tight leading-snug">
                Install Volerapay on Android
              </h4>
              <p className="text-xs text-neutral-300 font-medium">
                Claim real-time node yields & secure transfers directly from your phone's screen.
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-center sm:justify-end">
            {isAppInstallable ? (
              <button
                type="button"
                onClick={onTriggerAppInstall}
                className="w-full sm:w-auto bg-gradient-to-r from-[#d4af37] to-[#b3922e] hover:from-[#e5c14d] hover:to-[#c6a236] text-[#0d2a1d] font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-black/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#f3e5ab]/30"
              >
                <span>Install Now</span>
                <ChevronRight size={14} className="stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowInstallInstructions(!showInstallInstructions)}
                className="w-full sm:w-auto bg-[#1c4d36] hover:bg-[#256648] text-[#f3e5ab] border border-[#d4af37]/40 font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{showInstallInstructions ? "Hide Guide" : "Install Guide"}</span>
                <HelpCircle size={14} className="stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Step-by-Step Instructions Collapsible Toggle */}
        <AnimatePresence>
          {showInstallInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-emerald-500/20 text-xs text-neutral-200 space-y-3 leading-relaxed">
                <p className="font-bold text-[#f3e5ab] flex items-center gap-1">
                  💡 Easy Android installation using your mobile browser:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="bg-[#113a26] p-3 rounded-xl border border-emerald-500/10">
                    <span className="font-black text-[#d4af37] mr-1">1.</span> Tap the <span className="font-extrabold text-[#f3e5ab]">Menu button (three dots)</span> at the top-right corner of Google Chrome.
                  </div>
                  <div className="bg-[#113a26] p-3 rounded-xl border border-emerald-500/10">
                    <span className="font-black text-[#d4af37] mr-1">2.</span> Select <span className="font-extrabold text-[#f3e5ab]">"Install app"</span> or <span className="font-extrabold text-[#f3e5ab]">"Add to Home screen"</span>.
                  </div>
                  <div className="bg-[#113a26] p-3 rounded-xl border border-emerald-500/10">
                    <span className="font-black text-[#d4af37] mr-1">3.</span> Confirm the prompt. The app icon will appear on your device desktop instantly!
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Bento Grid Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Card 1: Balance Card (Redesigned to match the uploaded image) */}
        <div 
          className="lg:col-span-12 bg-[#121315] rounded-[32px] p-6 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[230px] border border-neutral-800"
          id="balance-card"
        >
          {/* Card Header: Wallet Balance title on left, Add Money button on right */}
          <div className="z-10 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 text-[#8E9094]">
                  <span className="text-xs font-bold tracking-wider uppercase">Wallet Balance</span>
                  <button 
                    type="button" 
                    onClick={() => setShowBalance(!showBalance)} 
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-[#8E9094] hover:text-white cursor-pointer"
                  >
                    {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
                
                {/* Balance display */}
                <h2 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight flex items-center">
                  {showBalance ? (
                    <>
                      <span className="text-[#8E9094] mr-1.5 font-extrabold font-sans">₦</span>
                      <span className="text-white font-mono">{user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </>
                  ) : (
                    <span className="text-[#8E9094] tracking-wider font-mono">₦ ••••••••</span>
                  )}
                </h2>
              </div>

              {/* Add Money Button (Top-Right of card, styled exactly like the uploaded image) */}
              <button
                type="button"
                id="add-money-btn"
                onClick={onAddMoneySimulation}
                className="bg-[#1E1F22] hover:bg-[#2B2D31] text-white border-2 border-[#E0533C] transition-all font-extrabold text-xs py-2 px-5 rounded-full shadow-lg shadow-black/30 active:scale-95 cursor-pointer shrink-0"
              >
                Add Money
              </button>
            </div>
          </div>

          {/* Quick Actions Panel (Translucent Horizontal Button Area matching the image design) */}
          <div className="bg-[#1C1D21]/90 border border-white/[0.03] rounded-2xl p-4 mt-6 z-10 grid grid-cols-4 gap-2 text-center shadow-inner">
            {/* Action 1: Withdraw Fund (matches 'Send') */}
            <button
              type="button"
              id="withdraw-btn"
              onClick={() => onNavigate('withdraw')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="h-12 w-12 rounded-full bg-[#2B2D31] hover:bg-[#35373C] transition-all flex items-center justify-center text-white shadow-sm group-hover:scale-105">
                <Send size={18} className="stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white transition-colors truncate w-full">
                Withdraw Fund
              </span>
            </button>

            {/* Action 2: Mobile Data (matches 'Data') */}
            <button
              type="button"
              id="service-data"
              onClick={() => onNavigate('airtime-data')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="h-12 w-12 rounded-full bg-[#2B2D31] hover:bg-[#35373C] transition-all flex items-center justify-center text-white shadow-sm group-hover:scale-105">
                <TrendingUp size={18} className="stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white transition-colors truncate w-full">
                Mobile Data
              </span>
            </button>

            {/* Action 3: Airtime (matches 'Airtime') */}
            <button
              type="button"
              id="service-airtime"
              onClick={() => onNavigate('airtime-data')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="h-12 w-12 rounded-full bg-[#2B2D31] hover:bg-[#35373C] transition-all flex items-center justify-center text-white shadow-sm group-hover:scale-105">
                <Smartphone size={18} className="stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white transition-colors truncate w-full">
                Airtime
              </span>
            </button>

            {/* Action 4: History (matches 'Pay Bills' / 'More' three-dots but keeps History functionality) */}
            <button
              type="button"
              id="history-btn"
              onClick={() => onNavigate('transactions')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="h-12 w-12 rounded-full bg-[#2B2D31] hover:bg-[#35373C] transition-all flex items-center justify-center text-white shadow-sm group-hover:scale-105">
                <History size={18} className="stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white transition-colors truncate w-full">
                History
              </span>
            </button>
          </div>

          {/* Active Nodes Indicator (compact bottom line) */}
          <div 
            className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[11px] opacity-80 hover:opacity-100 transition-opacity cursor-pointer z-10"
            onClick={() => onNavigate('bingshop')}
          >
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="font-semibold text-xs">
                Active Nodes: <span className="text-white font-mono">{user.activeBings.filter(b => !b.isCompleted).length}</span> Online
              </span>
            </div>
            <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-[11px] uppercase tracking-wider">
              <span>View Nodes</span>
              <ChevronRight size={12} className="stroke-[3]" />
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

      {/* Promos & Security (Side-by-side grids, redesigned to match premium promotional card style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Floating Promotion Banner */}
        <div 
          onClick={() => onNavigate('referrals')}
          className="bg-gradient-to-br from-[#121315] to-[#1E1F22] text-white p-6 rounded-[32px] relative overflow-hidden flex justify-between items-center cursor-pointer border border-neutral-800 shadow-xl group hover:border-[#E0533C]/40 transition-all"
          id="promo-banner"
        >
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 h-28 w-28 bg-[#E0533C]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#E0533C]/15 transition-all"></div>
          
          <div className="space-y-1.5 z-10 max-w-[70%]">
            <span className="text-[10px] font-black uppercase text-[#E0533C] tracking-widest">PROMOTION CENTER</span>
            <h4 className="font-bold text-lg sm:text-xl text-white tracking-tight leading-snug">
              INVITE FRIENDS TO VOLERAPAY
            </h4>
            <p className="text-xs text-neutral-400 font-medium">
              Earn instant <span className="text-white font-extrabold">₦16,890.00</span> reward per active node referral.
            </p>
            <div className="mt-3.5 inline-flex items-center gap-2 bg-white text-neutral-950 font-extrabold text-[11px] px-4.5 py-2 rounded-full shadow-md group-hover:bg-[#E0533C] group-hover:text-white transition-all">
              <span>Start Inviting</span>
              <ChevronRight size={13} className="stroke-[3]" />
            </div>
          </div>

          <div className="p-4 bg-neutral-800/50 border border-neutral-700/30 rounded-2xl z-10 scale-105 group-hover:scale-110 transition-transform duration-300">
            <Gift className="h-7 w-7 text-[#E0533C]" />
          </div>
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
