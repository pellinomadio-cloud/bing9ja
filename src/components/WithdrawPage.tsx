import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Lock, CheckCircle2, ChevronRight, Landmark, Loader2 } from 'lucide-react';
import { User } from '../types';
import { formatNaira } from '../data';

interface WithdrawPageProps {
  user: User;
  onWithdraw: (amount: number, description: string) => void;
  onBack: () => void;
  onUpgradeRequest: () => void;
}

export default function WithdrawPage({ user, onWithdraw, onBack, onUpgradeRequest }: WithdrawPageProps) {
  const isTierLocked = user.tier < 2;

  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const banks = [
    'Guaranty Trust Bank (GTBank)',
    'Access Bank',
    'Zenith Bank',
    'United Bank for Africa (UBA)',
    'First Bank of Nigeria',
    'Kuda Microfinance Bank',
    'OPay Digital Services',
    'PalmPay Limited',
    'Sterling Bank',
    'Wema Bank / ALAT'
  ];

  // Auto-fill account name with a simulated resolver when they enter exactly 10 digits
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAccountNumber(val);
    
    if (val.length === 10) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        // Generate a clean name based on username or general placeholder
        setAccountName(`${user.username.toUpperCase()} ENTERPRISES`);
      }, 900);
    } else {
      setAccountName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) {
      alert('Please select your destination bank.');
      return;
    }
    if (accountNumber.length !== 10) {
      alert('NUBAN Account number must be exactly 10 digits.');
      return;
    }
    if (!accountName) {
      alert('Recipient account name must be resolved first.');
      return;
    }
    
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Please enter a valid amount to withdraw.');
      return;
    }
    if (amountVal < 1000) {
      alert('Minimum withdrawal amount is ₦1,000.00.');
      return;
    }
    if (user.balance < amountVal) {
      alert(`Insufficient funds! Your balance is ${formatNaira(user.balance)}.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onWithdraw(amountVal, `Withdrawal of ${formatNaira(amountVal)} to ${selectedBank} (${accountNumber})`);
      setSuccess(true);
    }, 1500);
  };

  const handleReset = () => {
    setSelectedBank('');
    setAccountNumber('');
    setAccountName('');
    setAmount('');
    setSuccess(false);
  };

  if (isTierLocked) {
    return (
      <div className="space-y-6 pb-24 font-sans text-primary-dark">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-primary-medium/10 hover:bg-purple-50 rounded-2xl cursor-pointer text-primary-medium transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-xl font-black tracking-tight">Withdrawal Hub</h2>
        </div>

        {/* Lock Banner */}
        <div className="bg-white rounded-3xl border border-primary-medium/10 p-8 shadow-sm text-center space-y-6" id="tier-locked-withdrawal-container">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto animate-pulse">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-primary-medium">Withdrawal Blocked (Requires Lvl 2)</h3>
            <p className="text-xs text-purple-400 font-medium max-w-sm mx-auto leading-relaxed">
              Your account level is currently on Tier 1. Direct commercial bank withdrawals are restricted to verified Tier 2 Level users and above.
            </p>
          </div>
          
          <button
            onClick={onUpgradeRequest}
            className="w-full max-w-xs py-3 bg-primary-brand hover:bg-black text-white rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Upgrade Account to Lvl 2
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 font-sans text-primary-dark">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2.5 bg-white border border-primary-medium/10 hover:bg-purple-50 rounded-2xl cursor-pointer text-primary-medium transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-black tracking-tight">Commercial Bank Cashout</h2>
          <p className="text-xs text-purple-400 font-medium">Safe CBN secured transfer clearance</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-primary-medium/10 p-8 text-center space-y-5 shadow-sm"
            id="vtu-withdraw-success"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-primary-medium">Withdrawal Successful</h3>
              <p className="text-xs text-purple-400 font-medium mt-1 leading-relaxed max-w-sm mx-auto">
                Your request has been compiled and completed. ₦{parseFloat(amount).toLocaleString()} has been routed to your Commercial Bank account with reference verification code.
              </p>
            </div>
            <button
              onClick={onBack}
              className="w-full max-w-xs py-3 bg-primary-brand hover:bg-black text-white rounded-2xl font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Balance info header */}
            <div className="bg-primary-dark p-4 rounded-3xl text-white flex justify-between items-center border border-purple-950">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-purple-300 font-bold">Total Wallet Cashroll</p>
                <p className="text-lg font-black mt-0.5">{formatNaira(user.balance)}</p>
              </div>
              <span className="text-[9px] font-bold text-amber-400 bg-white/10 px-2.5 py-1 rounded-full uppercase">
                Tier 2 Secured
              </span>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-primary-medium/10 shadow-sm space-y-4">
              {/* Select Destination Bank */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Destination Commercial Bank</label>
                <select
                  required
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-50/40 border border-purple-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-brand/20 font-bold text-primary-dark"
                >
                  <option value="">-- Choose Bank --</option>
                  {banks.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-400">NUBAN 10-Digit Account Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. 0123456789"
                    value={accountNumber}
                    onChange={handleAccountNumberChange}
                    className="w-full px-4 py-3 bg-purple-50/40 border border-purple-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-brand/20 font-bold tracking-wider text-primary-dark"
                  />
                  {isVerifying && (
                    <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-brand animate-spin" />
                  )}
                </div>
              </div>

              {/* Resolved Account Name */}
              {accountNumber.length === 10 && (
                <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/50">
                  <p className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">Resolved Account Owner Name</p>
                  <p className="text-xs font-black text-primary-dark mt-0.5">
                    {accountName || 'Fetching account record...'}
                  </p>
                </div>
              )}

              {/* Amount to Withdraw */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Withdrawal Amount (₦)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  placeholder="Min ₦1,000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-50/40 border border-purple-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-brand/20 font-bold text-primary-dark"
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || isVerifying || !accountName}
                className="w-full mt-2 py-3 bg-primary-brand hover:bg-black disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm Bank Transfer Cashout</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
