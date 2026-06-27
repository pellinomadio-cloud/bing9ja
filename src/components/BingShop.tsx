import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Award, ShoppingBag, Info, Coins, Calendar, ArrowRight,
  Sparkles, CheckCircle2, ShieldAlert, Cpu, Database, Network, Key, Layers, AlertCircle, XCircle, Clock
} from 'lucide-react';
import { User, BingService, ActiveBing } from '../types';
import { BING_SERVICES, formatNaira } from '../data';

interface BingShopProps {
  user: User;
  onBuyBing: (service: BingService) => void;
  onClaimEarning: (activeBingId: string) => void;
  onNavigate: (tab: string) => void;
}

export default function BingShop({ user, onBuyBing, onClaimEarning, onNavigate }: BingShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'shop' | 'my-nodes'>('shop');
  const [showDetailModal, setShowDetailModal] = useState<BingService | null>(null);
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);

  const categories = ['All', 'Cloud', 'Node', 'Server', 'Vault', 'Arbitrage'];

  // Load purchase requests
  useEffect(() => {
    const saved = localStorage.getItem('goldrush9ja_bing_purchase_requests');
    if (saved) {
      try {
        const requests = JSON.parse(saved);
        const userReqs = requests.filter((r: any) => r.username.toLowerCase() === user.username.toLowerCase());
        setPurchaseRequests(userReqs);
      } catch (e) {
        console.error(e);
      }
    }
  }, [user.username]);

  const isServiceOwnedOrPending = (serviceId: string): 'active' | 'pending' | null => {
    const hasActive = user.activeBings.some(b => b.serviceId === serviceId && !b.isCompleted);
    if (hasActive) return 'active';

    const hasPending = purchaseRequests.some(r => r.serviceId === serviceId && r.status === 'pending');
    if (hasPending) return 'pending';

    return null;
  };

  const filteredServices = BING_SERVICES.filter(service => {
    if (selectedCategory === 'All') return true;
    return service.category === selectedCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cloud': return <Cpu className="h-4 w-4" />;
      case 'Node': return <Network className="h-4 w-4" />;
      case 'Server': return <Database className="h-4 w-4" />;
      case 'Vault': return <Key className="h-4 w-4" />;
      case 'Arbitrage': return <Coins className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const pendingRequests = purchaseRequests.filter(r => r.status === 'pending');
  const declinedRequests = purchaseRequests.filter(r => r.status === 'declined');

  return (
    <div className="space-y-6 pb-24 font-sans text-primary-dark">
      {/* Top Shop Banner */}
      <div className="bg-gradient-to-br from-primary-medium to-purple-950 p-6 rounded-3xl text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-[-20%] right-[-10%] w-36 h-36 rounded-full bg-primary-accent/20 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-300" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-purple-200">The GoldRush Ecosystem</span>
            </div>
            <h1 className="text-2xl font-black mt-1">GoldRush Shop Portal</h1>
            <p className="text-purple-200 text-xs mt-1 max-w-sm">
              Deploy automated digital hardware nodes. Each node streams daily yields directly to your bankroll.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right">
            <p className="text-[10px] text-purple-300 font-bold uppercase">Your Balance</p>
            <p className="text-lg font-extrabold text-white">{formatNaira(user.balance)}</p>
          </div>
        </div>
      </div>

      {/* Mode Switches: Shop vs My Nodes */}
      <div className="flex p-1.5 bg-white rounded-2xl border border-purple-100 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('shop')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
            activeTab === 'shop'
              ? 'bg-primary-brand text-white shadow-md'
              : 'text-purple-400 hover:text-primary-brand'
          }`}
        >
          <ShoppingBag size={15} />
          <span>Browse 15 GoldRush Services</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my-nodes')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer relative ${
            activeTab === 'my-nodes'
              ? 'bg-primary-brand text-white shadow-md'
              : 'text-purple-400 hover:text-primary-brand'
          }`}
        >
          <Cpu size={15} />
          <span>My Purchased Nodes</span>
          {user.activeBings.filter(b => !b.isCompleted).length > 0 && (
            <span className="absolute top-2 right-4 h-5 w-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-bounce shadow">
              {user.activeBings.filter(b => !b.isCompleted).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'shop' ? (
        <>
          {/* Status of Pending Deployments */}
          {pendingRequests.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-black tracking-wider text-purple-400">Node Deployments In Progress</h4>
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-3 text-xs">
                  <Clock className="h-5 w-5 text-amber-500 animate-spin flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-amber-900">Pending Setup: {req.serviceTitle}</span>
                    <p className="text-amber-700 font-medium">
                      Your payment proof of <span className="font-bold">{formatNaira(req.price)}</span> is being reviewed by corporate management. Mining starts automatically on ledger clearance.
                    </p>
                    <p className="text-[9px] text-amber-600/90 font-mono font-bold mt-1">Ref: {req.reference} • Status: Pending Verification</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status of Declined Purchases with prominent warning */}
          {declinedRequests.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-black tracking-wider text-rose-500">Failed Lease Purchases</h4>
              {declinedRequests.map(req => (
                <div key={req.id} className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-3 text-xs animate-shake">
                  <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold text-rose-900">Declined Lease: {req.serviceTitle}</span>
                    <p className="text-rose-700/90 font-medium leading-relaxed">
                      ⚠️ Payment proof was rejected by Admin. Please make sure you upload the right payment receipt screenshot of your transfer showing a successful corporate settlement next time.
                    </p>
                    <p className="text-[9px] text-rose-500 font-mono font-bold">Ref: {req.reference} • Status: Declined by Overlord</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Categories Filters Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" id="categories-scroll">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                id={`cat-filter-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary-dark text-white'
                    : 'bg-white text-purple-400 hover:text-primary-brand border border-purple-100/60'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* Service Limit Warning Alert */}
          <div className="bg-purple-50 border border-purple-200/50 p-4 rounded-3xl flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-primary-brand flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-extrabold text-primary-dark">Cashout Security Alert: </span>
              <span className="text-purple-700 font-medium">
                Your current account tier has unlimited dashboard balance storage. However, you must upgrade your account to Tier 2 to unlock Commercial Bank Cashouts and retrieve your node earnings!
              </span>
            </div>
          </div>

          {/* 15 services list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="bings-services-grid">
            <AnimatePresence>
              {filteredServices.map((service, idx) => {
                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className="bg-white rounded-3xl overflow-hidden border border-purple-100/60 shadow-sm flex flex-col group hover:shadow-md transition-all duration-300"
                  >
                    {/* Upper decorative color gradient block */}
                    <div className={`bg-gradient-to-r ${service.color} p-4 text-white relative`}>
                      <div className="absolute top-[-50%] right-[-10%] w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
                      <div className="flex justify-between items-start">
                        <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase border border-white/10">
                          {service.category}
                        </span>
                        
                        {/* Popularity indicator */}
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          service.popularity === 'Hot' ? 'bg-rose-500 text-white animate-pulse' :
                          service.popularity === 'Trending' ? 'bg-amber-400 text-purple-950' :
                          service.popularity === 'VIP Only' ? 'bg-yellow-400 text-black border border-black/10' :
                          'bg-white/20 text-white'
                        }`}>
                          {service.popularity}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base mt-3 tracking-tight">{service.title}</h3>
                      <p className="text-[11px] text-white/80 line-clamp-1 mt-1 font-medium">{service.description}</p>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      {/* Detailed Return specs */}
                      <div className="grid grid-cols-2 gap-3 bg-purple-50/40 p-3 rounded-2xl border border-purple-100/20 mb-4 text-center">
                        <div>
                          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Purchase Price</p>
                          <p className="text-sm font-extrabold text-primary-dark mt-0.5">{formatNaira(service.price)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-primary-accent font-bold uppercase tracking-wider">Total Est. Income</p>
                          <p className="text-sm font-extrabold text-emerald-600 mt-0.5">{formatNaira(service.totalIncome)}</p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-purple-100/30 flex justify-between items-center text-[11px]">
                          <span className="text-purple-400 font-semibold flex items-center gap-1">
                            <Calendar size={12} />
                            <span>15 Days Duration</span>
                          </span>
                          <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-lg font-mono">
                            +{formatNaira(service.dailyIncome)}/day
                          </span>
                        </div>
                      </div>

                      {/* Buy Action Button */}
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          id={`info-btn-${service.id}`}
                          onClick={() => setShowDetailModal(service)}
                          className="px-3 bg-purple-50 hover:bg-purple-100 text-primary-medium rounded-2xl flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Info size={15} />
                        </button>
                        {(() => {
                          const status = isServiceOwnedOrPending(service.id);
                          if (status === 'active') {
                            return (
                              <button
                                type="button"
                                disabled
                                className="flex-1 py-3 text-xs font-extrabold rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1.5 opacity-90 cursor-not-allowed"
                              >
                                <CheckCircle2 size={14} className="text-emerald-600" />
                                <span>Active Node Deployed</span>
                              </button>
                            );
                          }
                          if (status === 'pending') {
                            return (
                              <button
                                type="button"
                                disabled
                                className="flex-1 py-3 text-xs font-extrabold rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center gap-1.5 opacity-90 cursor-not-allowed"
                              >
                                <Clock size={14} className="text-amber-600 animate-spin" />
                                <span>Pending Approval</span>
                              </button>
                            );
                          }
                          return (
                            <button
                              type="button"
                              id={`buy-btn-${service.id}`}
                              onClick={() => onBuyBing(service)}
                              className="flex-1 py-3 text-xs font-extrabold rounded-2xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 bg-primary-dark text-white hover:bg-primary-brand active:scale-[0.98]"
                            >
                              <span>Lease Node Contract</span>
                              <ArrowRight size={14} />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      ) : (
        /* My Purchased Active Contracts */
        <div className="space-y-4" id="my-purchased-contracts">
          {user.activeBings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-purple-100/50 shadow-sm space-y-3">
              <div className="h-14 w-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-primary-brand">
                <Cpu className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-base">No active contracts found</h3>
              <p className="text-xs text-purple-400 max-w-xs mx-auto">
                You haven't bought any GoldRush services yet! Go to the shop and deploy your first virtual machine node.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('shop')}
                className="px-5 py-2.5 bg-primary-brand text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-primary-dark transition-colors inline-block"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white px-5 py-3.5 rounded-2xl border border-purple-100/50 shadow-sm text-xs">
                <span className="font-bold text-purple-400">Deployed Cloud Bots:</span>
                <span className="font-extrabold text-primary-brand">{user.activeBings.length} Nodes Online</span>
              </div>

              {user.activeBings.map((contract) => {
                const totalProgress = Math.min((contract.totalClaimed / contract.totalIncome) * 100, 100);
                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-5 rounded-3xl border border-purple-100/50 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-primary-accent bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                          ONLINE & MINING
                        </span>
                        <h3 className="font-extrabold text-sm text-primary-dark mt-1">{contract.title}</h3>
                        <p className="text-[10px] text-purple-400 font-mono mt-0.5">Purchased: {contract.timestampBought}</p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-purple-400 font-bold block">DAILY EMISSION</span>
                        <span className="text-xs font-black text-emerald-600">+{formatNaira(contract.dailyIncome)}</span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-purple-400">
                        <span>Claim Yields Progression</span>
                        <span className="font-extrabold text-primary-dark">
                          {formatNaira(contract.totalClaimed)} / {formatNaira(contract.totalIncome)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-purple-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${totalProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Claims mechanics container */}
                    <div className="flex justify-between items-center pt-3 border-t border-purple-50">
                      <div>
                        <span className="text-[10px] text-purple-400 font-bold block">ACCUMULATED REVENUE</span>
                        <span className="text-sm font-extrabold text-amber-600 font-mono">
                          +{formatNaira(contract.accumulatedUnclaimed)}
                        </span>
                      </div>

                      <button
                        type="button"
                        id={`claim-node-btn-${contract.id}`}
                        disabled={contract.accumulatedUnclaimed <= 0}
                        onClick={() => onClaimEarning(contract.id)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer ${
                          contract.accumulatedUnclaimed > 0
                            ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                            : 'bg-purple-50 text-purple-300 pointer-events-none'
                        }`}
                      >
                        <CheckCircle2 size={13} />
                        <span>Claim Revenue</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Specs Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-100"
          >
            <div className={`bg-gradient-to-r ${showDetailModal.color} p-6 text-white text-center`}>
              <Cpu className="h-10 w-10 mx-auto bg-white/20 p-2 rounded-2xl mb-2 animate-bounce" />
              <h3 className="text-lg font-black">{showDetailModal.title}</h3>
              <p className="text-xs text-purple-200 mt-1 uppercase font-bold tracking-widest">{showDetailModal.category} Node Service</p>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-purple-500 font-medium leading-relaxed bg-purple-50 p-3 rounded-2xl">
                {showDetailModal.description}
              </p>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase text-purple-400 tracking-wider">Financial Yield Outline</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-primary-dark">
                  <div className="bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/30">
                    <span className="text-[10px] text-purple-400 block font-bold">COST PRICE</span>
                    <span className="text-sm font-extrabold">{formatNaira(showDetailModal.price)}</span>
                  </div>
                  <div className="bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/30">
                    <span className="text-[10px] text-primary-accent block font-bold">TOTAL PAYOUT</span>
                    <span className="text-sm font-extrabold text-emerald-600">{formatNaira(showDetailModal.totalIncome)}</span>
                  </div>
                  <div className="bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/30">
                    <span className="text-[10px] text-purple-400 block font-bold">DAILY EMISSION</span>
                    <span className="text-sm font-extrabold text-emerald-600">{formatNaira(showDetailModal.dailyIncome)}</span>
                  </div>
                  <div className="bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/30">
                    <span className="text-[10px] text-purple-400 block font-bold">CONTRACT LIFETIME</span>
                    <span className="text-sm font-extrabold">{showDetailModal.durationDays} Days</span>
                  </div>
                </div>
              </div>

              {/* Safety notice */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2.5 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Yield fully audited. Backed by goldrush9ja reserves.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  id="close-detail-modal"
                  onClick={() => setShowDetailModal(null)}
                  className="flex-1 py-3 bg-purple-50 hover:bg-purple-100 text-primary-medium text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                {(() => {
                  const status = isServiceOwnedOrPending(showDetailModal.id);
                  if (status === 'active') {
                    return (
                      <button
                        type="button"
                        disabled
                        className="flex-1 py-3 text-xs font-bold rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed flex items-center justify-center gap-1.5 opacity-90"
                      >
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Active Node</span>
                      </button>
                    );
                  }
                  if (status === 'pending') {
                    return (
                      <button
                        type="button"
                        disabled
                        className="flex-1 py-3 text-xs font-bold rounded-xl bg-amber-100 text-amber-700 border border-amber-200 cursor-not-allowed flex items-center justify-center gap-1.5 opacity-90"
                      >
                        <Clock size={13} className="text-amber-600 animate-spin" />
                        <span>Pending</span>
                      </button>
                    );
                  }
                  return (
                    <button
                      type="button"
                      id="buy-detail-modal"
                      onClick={() => {
                        onBuyBing(showDetailModal);
                        setShowDetailModal(null);
                      }}
                      className="flex-1 py-3 text-xs font-bold rounded-xl text-white bg-primary-dark hover:bg-primary-brand active:scale-[0.98] cursor-pointer"
                    >
                      Lease Now
                    </button>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
