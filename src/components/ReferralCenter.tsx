import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, Copy, Check, Users, ShieldCheck, Sparkles, UserPlus,
  TrendingUp, Award, Smartphone, Send
} from 'lucide-react';
import { User } from '../types';
import { formatNaira } from '../data';

interface ReferralCenterProps {
  user: User;
  onSimulateReferral: (friendName: string) => void;
}

export default function ReferralCenter({ user }: { user: User }) {
  const [copied, setCopied] = useState(false);

  const referralBonusAmount = 16890;
  const referralLink = `${window.location.origin}/ref?code=${user.ownReferralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 font-sans text-primary-dark">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-primary-dark via-primary-medium to-primary-brand text-white p-6 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="absolute top-[-30%] right-[-10%] w-48 h-48 rounded-full bg-primary-accent/30 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-300" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-pink-200">The Bing Bounty Program</span>
          </div>
          <h1 className="text-2xl font-black">Refer & Earn</h1>
          <p className="text-purple-200 text-xs max-w-sm">
            Unlock the ultimate cash incentive. Get credited <span className="font-extrabold text-white">{formatNaira(referralBonusAmount)}</span> instantly for every user that signs up under your custom link.
          </p>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-purple-100/50 shadow-sm text-center space-y-1">
          <Users className="h-6 w-6 text-primary-brand mx-auto" />
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Total Referred</p>
          <p className="text-xl font-extrabold text-primary-dark">{user.referralCount} Users</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-purple-100/50 shadow-sm text-center space-y-1">
          <TrendingUp className="h-6 w-6 text-emerald-500 mx-auto" />
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Bounty Earned</p>
          <p className="text-xl font-extrabold text-emerald-600">{formatNaira(user.referralCount * referralBonusAmount)}</p>
        </div>
      </div>

      {/* Sharing Link Box */}
      <div className="bg-white p-5 rounded-3xl border border-purple-100/50 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-brand" />
          <h4 className="font-extrabold text-xs tracking-wider uppercase text-purple-400">Your Shareable Credentials</h4>
        </div>

        <div className="space-y-3">
          {/* Code */}
          <div className="flex justify-between items-center bg-purple-50/40 px-4 py-3 rounded-2xl border border-purple-100/30">
            <div>
              <span className="text-[10px] text-purple-400 font-bold block">REFERRAL CODE</span>
              <span className="text-sm font-extrabold text-primary-dark font-mono tracking-wider">{user.ownReferralCode}</span>
            </div>
            <span className="text-[10px] font-bold text-primary-brand bg-primary-light px-2.5 py-1 rounded-full uppercase tracking-wide">
              Level {user.tier} active
            </span>
          </div>

          {/* Link */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-primary-dark/70 tracking-wide block">Direct Referral Link</span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-purple-50/50 border border-purple-100 rounded-2xl px-4 py-3 text-xs font-medium text-purple-700 focus:outline-none select-all"
              />
              <button
                type="button"
                id="copy-ref-link-btn"
                onClick={handleCopy}
                className={`px-4 bg-primary-dark hover:bg-primary-brand text-white rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  copied ? 'bg-emerald-600 hover:bg-emerald-600' : ''
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="text-xs font-bold">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bounty Flow explanation */}
      <div className="bg-white p-5 rounded-3xl border border-purple-100/50 shadow-sm space-y-4" id="referral-rules-card">
        <h4 className="font-extrabold text-xs tracking-wider uppercase text-purple-400">Bounty Payout Roadmap</h4>
        
        <div className="space-y-3.5">
          {[
            { step: '1', title: 'Share Code', desc: 'Send your referral credentials or link to friends, family, or social groups.' },
            { step: '2', title: 'Friend Registers', desc: 'They complete their registration on GoldRush9ja with your referral code entered.' },
            { step: '3', title: '₦16,890 Reward Issued', desc: 'Your account balance is instantly credited with the bounty payout.' }
          ].map((s) => (
            <div key={s.step} className="flex gap-3.5">
              <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary-brand font-black text-xs flex-shrink-0">
                {s.step}
              </div>
              <div className="text-xs">
                <h5 className="font-extrabold text-primary-dark">{s.title}</h5>
                <p className="text-purple-400 mt-0.5 font-medium leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
