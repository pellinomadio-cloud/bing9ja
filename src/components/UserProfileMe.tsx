import React from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, Mail, ShieldAlert, Award, Layers, Check, 
  ChevronRight, Smartphone, KeyRound, ExternalLink, ShieldCheck, LogOut, Settings2
} from 'lucide-react';
import { User } from '../types';
import { TIERS, formatNaira } from '../data';

interface UserProfileMeProps {
  user: User;
  onSignOut: () => void;
  onNavigate: (tab: string) => void;
}

export default function UserProfileMe({ user, onSignOut, onNavigate }: UserProfileMeProps) {
  const currentTierInfo = TIERS.find(t => t.level === user.tier) || TIERS[0];

  return (
    <div className="space-y-6 pb-24 font-sans text-primary-dark max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100/50 shadow-sm flex flex-col items-center text-center space-y-3" id="me-profile-card">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary-medium via-primary-brand to-primary-accent flex items-center justify-center text-white font-extrabold text-3xl shadow-md">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary-brand p-1 rounded-full shadow border-2 border-white">
            <Award className="h-5 w-5 text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{user.username.toUpperCase()}</h2>
          <p className="text-xs text-purple-400 font-mono mt-0.5">{user.email}</p>
        </div>

        <div className="flex gap-2">
          <span className="text-[10px] font-extrabold bg-primary-light text-primary-brand px-3 py-1 rounded-full uppercase tracking-wider border border-purple-100">
            Account: Verified
          </span>
          <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
            {currentTierInfo.name}
          </span>
        </div>
      </div>

      {/* Account Limits Tracker Box */}
      <div className="bg-white p-5 rounded-3xl border border-purple-100/50 shadow-sm space-y-4" id="tier-limit-overview">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary-brand" />
          <h4 className="font-extrabold text-xs tracking-wider uppercase text-purple-400">Current Vault Capacities</h4>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-purple-50/40 p-3 rounded-2xl border border-purple-100/30">
            <span className="text-purple-400 font-bold block">WALLET CAPACITY</span>
            <span className="text-base font-extrabold text-emerald-600 font-mono">UNLIMITED</span>
          </div>
          <div className="bg-purple-50/40 p-3 rounded-2xl border border-purple-100/30">
            <span className="text-purple-400 font-bold block">CURRENT BALANCE</span>
            <span className="text-base font-extrabold text-primary-brand font-mono">{formatNaira(user.balance)}</span>
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100/30 flex items-start gap-2.5 text-[11px] text-purple-700">
          <ShieldAlert size={16} className="text-primary-brand flex-shrink-0 mt-0.5" />
          <p className="font-medium">
            {user.tier < 2 
              ? "Your dashboard balance is unlimited. However, you need to upgrade to Tier 2 to unlock Commercial Bank Cashouts."
              : "Your account is on Tier 2 or higher. Direct Commercial Bank Cashouts are fully unlocked."}
          </p>
        </div>
      </div>

      {/* Structured Settings Section */}
      <div className="bg-white p-5 rounded-3xl border border-purple-100/50 shadow-sm space-y-4" id="me-settings-board">
        <div className="flex items-center gap-2 border-b border-purple-50 pb-3">
          <Settings2 className="h-4 w-4 text-primary-brand" />
          <h4 className="font-extrabold text-xs tracking-wider uppercase text-purple-400">System Preferences</h4>
        </div>

        <div className="space-y-2">
          {/* Option: Upgrade Level */}
          <button
            onClick={() => onNavigate('upgrade')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-purple-50/50 rounded-2xl transition-all border border-transparent hover:border-purple-100 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-purple-100 text-primary-brand rounded-xl flex items-center justify-center">
                <Award size={18} />
              </div>
              <div>
                <span className="text-xs font-bold block text-primary-dark">Upgrade Account Tier</span>
                <span className="text-[10px] text-purple-400 font-semibold block mt-0.5">Increase daily transaction limits</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-purple-300 group-hover:text-primary-brand transition-colors" />
          </button>

          {/* Option: Transaction History */}
          <button
            onClick={() => onNavigate('transactions')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-purple-50/50 rounded-2xl transition-all border border-transparent hover:border-purple-100 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-purple-100 text-primary-brand rounded-xl flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div>
                <span className="text-xs font-bold block text-primary-dark">Transaction Logs</span>
                <span className="text-[10px] text-purple-400 font-semibold block mt-0.5">View your direct deposits & withdraw records</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-purple-300 group-hover:text-primary-brand transition-colors" />
          </button>

          {/* Option: Referral Portal */}
          <button
            onClick={() => onNavigate('referrals')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-purple-50/50 rounded-2xl transition-all border border-transparent hover:border-purple-100 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-purple-100 text-primary-brand rounded-xl flex items-center justify-center">
                <Smartphone size={18} />
              </div>
              <div>
                <span className="text-xs font-bold block text-primary-dark">Referral Affiliate Center</span>
                <span className="text-[10px] text-purple-400 font-semibold block mt-0.5">Track your code and affiliate bonuses</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-purple-300 group-hover:text-primary-brand transition-colors" />
          </button>
        </div>
      </div>

      {/* Session Security Sign Out */}
      <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-sm space-y-3" id="profile-signout-box">
        <h4 className="font-extrabold text-xs tracking-wider uppercase text-red-600">Session Security</h4>
        <p className="text-xs text-purple-400 font-semibold">
          Ready to end your session? Sign out securely. Your details and current balance are safely stored on secured servers.
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-extrabold rounded-2xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <LogOut size={14} className="stroke-[3]" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
}
