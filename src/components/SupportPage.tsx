import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageSquare, Send, ShieldCheck, Key, HelpCircle, X, CheckCircle, Gift } from 'lucide-react';
import { User, Transaction } from '../types';
import { formatNaira, getCompanyDetails } from '../data';

interface SupportPageProps {
  user: User;
  transactions: Transaction[];
  onClaimBonus: () => void;
  onNavigate: (tab: string) => void;
  onBack: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function SupportPage({ 
  user, 
  transactions, 
  onClaimBonus, 
  onNavigate, 
  onBack,
  addToast
}: SupportPageProps) {
  const company = getCompanyDetails();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [joinedChannel, setJoinedChannel] = useState(() => {
    return localStorage.getItem(`joined_telegram_${user.username}`) === 'true';
  });
  
  // Check if Telegram bonus was already claimed
  const hasClaimed = transactions.some(tx => tx.description.includes('Telegram Bonus'));

  const handleTryClaim = () => {
    if (!joinedChannel) {
      addToast(`Access Denied: You must click "Join Telegram Channel" first and subscribe to ${company.telegramChannel} to qualify for this reward!`, 'error');
      return;
    }
    onClaimBonus();
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode.trim().toUpperCase() === 'MAVELL999') {
      setShowAdminModal(false);
      addToast('System Overlord Admin Panel unlocked!', 'success');
      onNavigate('admin');
    } else {
      addToast('Invalid admin clearance authentication code!', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans text-primary-dark relative">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-primary-medium/10 hover:bg-purple-50 rounded-2xl cursor-pointer text-primary-medium transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight">Help & Support</h2>
            <p className="text-xs text-purple-400 font-medium">Connect with human representatives</p>
          </div>
        </div>

        {/* Small subtle red dot as requested: "add a red small dot button somewhere on the page, if admin click on it, he can login with the details below to access admin panel dashboard: MAVELL999. only admin knows this" */}
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="h-2 w-2 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer mr-2 shadow-sm animate-pulse"
          title="Server Status"
          id="admin-secret-dot"
        />
      </div>

      {/* Main Support Cards */}
      <div className="bg-white rounded-3xl border border-primary-medium/10 p-6 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-purple-50 text-primary-brand rounded-full flex items-center justify-center mx-auto shadow-inner">
            <MessageSquare size={30} />
          </div>
          <h3 className="font-extrabold text-base text-primary-medium">Official Telegram Community</h3>
          <p className="text-xs text-purple-400 font-medium max-w-sm mx-auto leading-relaxed">
            Join the official Bing9ja Telegram broadcast group. Stay up to date with core updates, secure node yields, VIP events, and cash giveaways.
          </p>
        </div>

        {/* Telegram Invite Promo Block */}
        <div className="bg-primary-dark p-5 rounded-3xl text-white space-y-4 border border-purple-950 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-400 animate-bounce" />
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-400">Join Community Bonus</h4>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
              ₦10,000.00 FREE
            </span>
          </div>

          <p className="text-xs leading-relaxed text-purple-200">
            All registered members who join the official Telegram broadcast channel <span className="text-white font-extrabold font-mono">{company.telegramChannel}</span> are eligible for an immediate ₦10,000.00 wallet credit.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <a 
              href={company.telegramChannel.startsWith('http') ? company.telegramChannel : `https://t.me/${company.telegramChannel.replace('@', '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => {
                setJoinedChannel(true);
                localStorage.setItem(`joined_telegram_${user.username}`, 'true');
                addToast('Thank you for joining! You can now claim your ₦10,000.00 bonus.', 'success');
              }}
              className="w-full py-3 bg-[#229ED9] hover:bg-[#1e8cc1] text-white rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Send size={14} className="fill-current" />
              <span>Join Telegram Channel {company.telegramChannel}</span>
            </a>
            
            <button
              onClick={handleTryClaim}
              disabled={hasClaimed}
              className={`w-full py-3 rounded-2xl font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                hasClaimed
                  ? 'bg-purple-950/20 text-purple-500 cursor-not-allowed border border-purple-900/10'
                  : 'bg-primary-accent text-primary-medium hover:bg-white'
              }`}
            >
              {hasClaimed ? (
                <>
                  <span>✓ ₦10,000 Bonus Claimed</span>
                </>
              ) : (
                <>
                  <span>Claim ₦10,000.00 Bonus</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Safety and FAQ Accordion */}
      <div className="bg-white rounded-3xl border border-primary-medium/10 p-5 shadow-sm space-y-3">
        <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-400">Frequently Asked Questions</h4>
        
        <div className="space-y-3">
          {[
            { q: 'How long do bank withdrawals take?', a: 'Bank withdrawals are completed via our direct commercial clearing link. Once clicked, funds are typically approved and cleared within 1 to 5 minutes.' },
            { q: 'Why is the airtime portal locked for me?', a: 'To maintain discounted bulk VTU pricing, only verified Tier 2 levels and above have permission to run mobile topups on our system.' },
            { q: 'Can I change my registered phone number?', a: 'Yes, please open a direct support ticket through the telegram representative group and they will re-bind your secure keys.' }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 bg-purple-50/20 border border-purple-100/40 rounded-2xl">
              <p className="font-bold text-xs text-primary-dark">{item.q}</p>
              <p className="text-[11px] text-purple-400 font-medium mt-1 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Secret Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-100"
          >
            <div className="bg-gradient-to-r from-rose-600 to-primary-dark p-4.5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-rose-300 animate-pulse" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">System Administration Login</h3>
              </div>
              <button 
                onClick={() => setShowAdminModal(false)}
                className="p-1 hover:bg-white/15 rounded-lg text-white"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleAdminAuth} className="p-5 space-y-4">
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                CLEARANCE CODE REQUIRED
              </p>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter secret clearance phrase..."
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-4 py-3 bg-purple-50/40 border border-purple-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-bold text-center tracking-widest text-primary-dark uppercase"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all uppercase tracking-wider cursor-pointer"
              >
                Unlock Administrator Console
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
