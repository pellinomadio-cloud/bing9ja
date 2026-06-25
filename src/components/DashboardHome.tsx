import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, Shield, 
  ChevronRight, Bell, Smartphone, HelpCircle, Award, 
  Layers, Gift, Wallet, TrendingUp, History, CheckCircle, Flame, Copy, Globe
} from 'lucide-react';
import { User, Transaction, TierLevel } from '../types';
import { formatNaira, TIERS, BING_SERVICES } from '../data';

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
  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [copied, setCopied] = useState(false);

  const currentTierInfo = TIERS.find(t => t.level === user.tier) || TIERS[0];
  const limitPercent = Math.min((user.balance / currentTierInfo.limit) * 100, 100);

  // Filter transactions
  const filteredTx = transactions.filter(tx => {
    if (filterType === 'all') return true;
    if (filterType === 'inflow') {
      return ['deposit', 'referral', 'earnings'].includes(tx.type);
    }
    if (filterType === 'outflow') {
      return ['withdrawal', 'purchase', 'upgrade'].includes(tx.type);
    }
    return true;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://bing9ja.com/join?ref=${user.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Select 3 top products for bento shop preview
  const shopPreviewProducts = BING_SERVICES.slice(0, 3);
  const productIcons = ['⚡', '💎', '🛡️'];

  return (
    <div className="space-y-4 pb-24 font-sans text-primary-dark">
      {/* Top Welcome Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-primary-medium/10 shadow-sm" id="top-welcome-bar">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary-medium to-primary-brand flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            {/* Medal badge based on tier */}
            <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow border border-purple-100">
              <Award className={`h-5 w-5 ${
                user.tier === 1 ? 'text-slate-400' :
                user.tier === 2 ? 'text-amber-500' :
                user.tier === 3 ? 'text-indigo-400' :
                'text-fuchsia-600 animate-bounce'
              }`} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base tracking-tight">Hi, {user.username.toUpperCase()}</h3>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                user.tier === 1 ? 'bg-slate-100 text-slate-700' :
                user.tier === 2 ? 'bg-amber-100 text-amber-800' :
                user.tier === 3 ? 'bg-purple-100 text-purple-800' :
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
            onClick={() => onNavigate('referrals')}
          >
            <Gift className="h-5 w-5 text-primary-brand" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary-accent animate-pulse"></span>
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
              <div className="flex justify-between items-center mb-1 text-[9px]">
                <span className="uppercase tracking-wider opacity-60 font-bold">Limit Capacity Status</span>
                <span className="font-bold">{limitPercent.toFixed(1)}% Used</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${limitPercent}%` }}></div>
              </div>
              <p className="text-[8px] mt-1 opacity-60">Max Balance Limit: {formatNaira(currentTierInfo.limit)}</p>
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
                { id: 'me', label: 'My Limits', icon: Layers, color: 'bg-purple-50 text-purple-600' },
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
                      else if (srv.id === 'me') onNavigate('me');
                      else if (srv.id === 'help') onNavigate('support');
                    }}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${srv.color}`}>
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <span className={`text-[10px] font-bold tracking-tight ${srv.id === 'bingshop' ? 'text-amber-700 font-extrabold' : 'text-primary-dark/80'}`}>
                      {srv.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Card 5: Recent Transactions Card (md:col-span-12) */}
        <div className="md:col-span-12 bg-white p-5 rounded-3xl border border-primary-medium/10 shadow-sm" id="recent-transactions-box">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary-brand" />
              <h4 className="font-extrabold text-xs tracking-wider uppercase text-purple-400">Transactions</h4>
            </div>
            
            {/* Quick Filters */}
            <div className="flex bg-purple-50 p-0.5 rounded-xl border border-purple-100">
              {(['all', 'inflow', 'outflow'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  id={`filter-tx-${f}`}
                  onClick={() => setFilterType(f)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 ${
                    filterType === f 
                      ? 'bg-white text-primary-brand shadow-sm' 
                      : 'text-purple-400 hover:text-primary-brand'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction list layout */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {filteredTx.length === 0 ? (
                <div className="text-center py-8 text-purple-300 text-xs font-semibold">
                  No transactions found under this filter.
                </div>
              ) : (
                filteredTx.map(tx => {
                  const isInflow = ['deposit', 'referral', 'earnings'].includes(tx.type);
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex justify-between items-center p-3 bg-purple-50/20 hover:bg-purple-50/50 border border-purple-100/30 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          isInflow ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {isInflow ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-primary-dark">{tx.description}</h5>
                          <p className="text-[10px] text-purple-400/80 font-mono mt-0.5">{tx.reference} • {tx.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-extrabold tracking-tight ${
                          isInflow ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isInflow ? '+' : '-'}{formatNaira(tx.amount)}
                        </span>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-purple-400 mt-0.5">
                          <CheckCircle size={10} className="text-emerald-500" />
                          <span className="font-bold capitalize">{tx.status}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
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

        {/* Security Check Indicator Banner */}
        <div className="bg-white p-4 rounded-3xl border border-primary-medium/10 shadow-sm flex items-center gap-3.5" id="security-banner">
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Shield className="h-5.5 w-5.5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-primary-dark">Certified Safe & Audited by CBN</h4>
            <p className="text-[11px] text-purple-400 font-medium">
              256-bit bank security is active. All Bing deposits and earnings are fully backed.
            </p>
          </div>
          <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            ACTIVE
          </span>
        </div>

      </div>
    </div>
  );
}
