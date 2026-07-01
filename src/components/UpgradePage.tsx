import React from 'react';
import { motion } from 'motion/react';
import { Award, Check, ChevronRight, ArrowLeft, ShieldCheck, Zap, Layers } from 'lucide-react';
import { User, TierLevel } from '../types';
import { TIERS, formatNaira } from '../data';

interface UpgradePageProps {
  user: User;
  onUpgradeTier: (targetTier: TierLevel) => void;
  onBack: () => void;
}

export default function UpgradePage({ user, onUpgradeTier, onBack }: UpgradePageProps) {
  const currentTierInfo = TIERS.find(t => t.level === user.tier) || TIERS[0];

  return (
    <div className="space-y-6 pb-24 font-sans text-primary-dark max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-3xl border border-purple-100/50 shadow-xs" id="upgrade-header">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-purple-50 rounded-2xl text-purple-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-base font-black tracking-tight">Upgrade Account Tier</h2>
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Expand your daily cashout limits</p>
        </div>
      </div>

      {/* Current Level Status Hero */}
      <div className="bg-gradient-to-tr from-primary-medium to-purple-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden" id="current-tier-hero">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <Award className="h-6 w-6 text-amber-300 animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider bg-white/10 px-3 py-1 rounded-full">
              Level {user.tier} Verified
            </span>
          </div>

          <div>
            <p className="text-[10px] text-purple-200 uppercase tracking-wider font-extrabold">Active Privilege Level</p>
            <h3 className="text-lg font-black tracking-tight">{currentTierInfo.name}</h3>
            <p className="text-xs text-purple-200/90 mt-1 font-semibold">
              Daily Cashout Cap: <span className="text-white font-extrabold font-mono">{formatNaira(currentTierInfo.limit)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Available Tiers List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-xs tracking-wider uppercase text-purple-400 px-1">Choose Premium Tier</h3>
        
        <div className="space-y-4">
          {TIERS.map((tier) => {
            const isCurrent = user.tier === tier.level;
            const isUnlocked = user.tier >= tier.level;
            const canAfford = user.balance >= tier.cost;

            return (
              <motion.div 
                key={tier.level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                id={`tier-card-${tier.level}`}
                className={`p-5 rounded-3xl border transition-all duration-300 relative ${
                  isCurrent 
                    ? 'border-primary-brand bg-primary-light/40 shadow-sm' 
                    : isUnlocked 
                      ? 'border-purple-100 bg-purple-50/20 opacity-70' 
                      : 'border-purple-100 hover:border-purple-200 bg-white shadow-xs'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-5 right-5 text-[9px] font-black text-white bg-primary-brand px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    ACTIVE LEVEL
                  </span>
                )}

                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isUnlocked ? 'bg-purple-100 text-primary-brand' : 'bg-purple-50 text-purple-400'
                  }`}>
                    {tier.level}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-primary-dark">{tier.name}</h4>
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                      {tier.level === 1 ? 'Free activation' : `Upgrade Cost: ${formatNaira(tier.cost)}`}
                    </p>
                  </div>
                </div>

                {/* Benefits / Perks Checklist */}
                <div className="mt-4 pt-4 border-t border-purple-50 space-y-2">
                  <p className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Tier Privileges:</p>
                  <ul className="space-y-2 text-xs font-semibold text-primary-dark/85">
                    {tier.perks.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <div className="h-4.5 w-4.5 rounded-full bg-purple-100/70 text-primary-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span className="leading-tight">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                {!isUnlocked && (
                  <button
                    type="button"
                    id={`upgrade-tier-page-btn-${tier.level}`}
                    onClick={() => onUpgradeTier(tier.level)}
                    className="w-full mt-5 py-3 text-xs font-extrabold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-primary-dark hover:bg-primary-brand text-white active:scale-98"
                  >
                    <span>Request Level {tier.level} Upgrade</span>
                    <ChevronRight size={14} className="stroke-[3]" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
