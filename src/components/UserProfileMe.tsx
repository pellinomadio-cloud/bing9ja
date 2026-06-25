import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, Mail, ShieldAlert, Award, Layers, Check, 
  ChevronRight, Smartphone, KeyRound, ExternalLink, ShieldCheck
} from 'lucide-react';
import { User, TierLevel } from '../types';
import { TIERS, formatNaira } from '../data';

interface UserProfileMeProps {
  user: User;
  onUpgradeTier: (targetTier: TierLevel) => void;
  onSignOut: () => void;
}

export default function UserProfileMe({ user, onUpgradeTier, onSignOut }: UserProfileMeProps) {
  const currentTierInfo = TIERS.find(t => t.level === user.tier) || TIERS[0];

  return (
    <div className="space-y-6 pb-24 font-sans text-primary-dark">
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
            <span className="text-purple-400 font-bold block">MAXIMUM LIMIT</span>
            <span className="text-base font-extrabold text-primary-dark font-mono">{formatNaira(currentTierInfo.limit)}</span>
          </div>
          <div className="bg-purple-50/40 p-3 rounded-2xl border border-purple-100/30">
            <span className="text-purple-400 font-bold block">CURRENT UTILIZED</span>
            <span className="text-base font-extrabold text-primary-brand font-mono">{formatNaira(user.balance)}</span>
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100/30 flex items-start gap-2.5 text-[11px] text-purple-700">
          <ShieldAlert size={16} className="text-primary-brand flex-shrink-0 mt-0.5" />
          <p className="font-medium">
            Standard Tier 1 accounts have a hard ceiling limit of ₦100,000. Upgrading to higher tiers permanently expands your wallet's balance limit capacity.
          </p>
        </div>
      </div>

      {/* Tiers Upgrade Board */}
      <div className="bg-white p-5 rounded-3xl border border-purple-100/50 shadow-sm space-y-4" id="tiers-upgrade-board">
        <h3 className="font-extrabold text-xs tracking-wider uppercase text-purple-400">Expand Your Tier Capacity</h3>
        
        <div className="space-y-4">
          {TIERS.map((tier) => {
            const isCurrent = user.tier === tier.level;
            const isUnlocked = user.tier >= tier.level;
            const canAfford = user.balance >= tier.cost;

            return (
              <div 
                key={tier.level}
                id={`tier-card-${tier.level}`}
                className={`p-4.5 rounded-2xl border transition-all duration-300 relative ${
                  isCurrent 
                    ? 'border-primary-brand bg-primary-light/40 shadow-sm' 
                    : isUnlocked 
                      ? 'border-purple-100 bg-purple-50/30 opacity-75' 
                      : 'border-purple-100 hover:border-purple-200 bg-white'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-4 right-4 text-[10px] font-extrabold text-white bg-primary-brand px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    CURRENT ACTIVE
                  </span>
                )}

                <h4 className="text-sm font-extrabold text-primary-dark">{tier.name}</h4>
                <p className="text-xs text-purple-400 mt-0.5 font-mono">
                  {tier.level === 1 ? 'Default starting account' : `Upgrade Fee: ${formatNaira(tier.cost)}`}
                </p>

                {/* Perks Checklist */}
                <ul className="mt-3.5 space-y-1.5 text-xs font-semibold text-primary-dark/80">
                  {tier.perks.map((p, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-purple-100 text-primary-brand flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="stroke-[3]" />
                      </div>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                {/* Upgrade Button */}
                {!isUnlocked && (
                  <button
                    type="button"
                    id={`upgrade-tier-btn-${tier.level}`}
                    onClick={() => onUpgradeTier(tier.level)}
                    className={`w-full mt-4 py-2.5 text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      canAfford
                        ? 'bg-primary-dark hover:bg-primary-brand text-white active:scale-95'
                        : 'bg-purple-100 text-purple-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Upgrade to Tier {tier.level}</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Security Sign Out */}
      <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-sm space-y-3" id="profile-signout-box">
        <h4 className="font-extrabold text-xs tracking-wider uppercase text-red-600">Session Security</h4>
        <p className="text-xs text-purple-400 font-medium">
          Ready to end your session? Sign out securely. Your details and current balance are safely stored on CBN secured servers.
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
}
