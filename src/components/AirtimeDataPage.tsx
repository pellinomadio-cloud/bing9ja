import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldAlert, Wifi, PhoneCall, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { User } from '../types';
import { formatNaira } from '../data';

interface AirtimeDataPageProps {
  user: User;
  onPurchase: (amount: number, description: string) => void;
  onBack: () => void;
  onUpgradeRequest: () => void;
}

export default function AirtimeDataPage({ user, onPurchase, onBack, onUpgradeRequest }: AirtimeDataPageProps) {
  const isTierLocked = user.tier < 2;

  const [activeSubTab, setActiveSubTab] = useState<'airtime' | 'data'>('airtime');
  const [selectedNetwork, setSelectedNetwork] = useState<'MTN' | 'Airtel' | 'Glo' | '9mobile'>('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedBundleId, setSelectedBundleId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const networks = [
    { name: 'MTN', logo: '🟡', bg: 'bg-amber-100 border-amber-300 text-amber-900' },
    { name: 'Airtel', logo: '🔴', bg: 'bg-rose-100 border-rose-300 text-rose-900' },
    { name: 'Glo', logo: '🟢', bg: 'bg-emerald-100 border-emerald-300 text-emerald-900' },
    { name: '9mobile', logo: '🟢⚪', bg: 'bg-teal-100 border-teal-300 text-teal-900' }
  ];

  const airtimeBundles = [
    { id: 'a1', label: '₦1,000 Airtime', price: 850, saving: 150 },
    { id: 'a2', label: '₦2,000 Airtime', price: 1700, saving: 300 },
    { id: 'a3', label: '₦5,000 Airtime', price: 4250, saving: 750 },
  ];

  const dataBundles = [
    { id: 'd1', label: '1.5GB SME (30 Days)', price: 200, saving: 1000 },
    { id: 'd2', label: '5GB SME (30 Days)', price: 600, saving: 2400 },
    { id: 'd3', label: '15GB Giga (30 Days)', price: 1500, saving: 5000 },
  ];

  const currentBundles = activeSubTab === 'airtime' ? airtimeBundles : dataBundles;
  const selectedBundle = currentBundles.find(b => b.id === selectedBundleId);

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number.');
      return;
    }
    if (!selectedBundle) {
      alert('Please select a purchase bundle.');
      return;
    }
    if (user.balance < selectedBundle.price) {
      alert('Insufficient wallet balance to complete this purchase.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const desc = activeSubTab === 'airtime'
        ? `Discounted ${selectedNetwork} ₦${(selectedBundle.price + selectedBundle.saving).toLocaleString()} Airtime to ${phoneNumber}`
        : `Discounted ${selectedNetwork} ${selectedBundle.label.split(' ')[0]} Data to ${phoneNumber}`;

      onPurchase(selectedBundle.price, desc);
      setSuccessMsg(`Successfully credited ${selectedNetwork} bundle to ${phoneNumber}. Deducted ${formatNaira(selectedBundle.price)}!`);
      setSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setPhoneNumber('');
    setSelectedBundleId('');
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
          <h2 className="text-xl font-black tracking-tight">Utility Portal</h2>
        </div>

        {/* Lock Banner */}
        <div className="bg-white rounded-3xl border border-primary-medium/10 p-8 shadow-sm text-center space-y-6" id="tier-locked-airtime-container">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto animate-pulse">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-primary-medium">Access Suspended (Requires Lvl 2)</h3>
            <p className="text-xs text-purple-400 font-medium max-w-sm mx-auto leading-relaxed">
              Discounted VTU services including airtime purchases and premium internet bundles are locked for Tier 1 users. Upgrade to Tier 2 level to save up to 15% immediately!
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
          <h2 className="text-xl font-black tracking-tight">Airtime & Mobile Data</h2>
          <p className="text-xs text-purple-400 font-medium">Premium discount VTU service</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-3xl border border-primary-medium/10 p-8 text-center space-y-5 shadow-sm"
            id="vtu-success-screen"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-primary-medium">VTU Broadcast Successful</h3>
              <p className="text-xs text-purple-400 font-medium mt-1 leading-relaxed max-w-sm mx-auto">
                {successMsg}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full max-w-xs py-3 bg-primary-brand hover:bg-black text-white rounded-2xl font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              Perform Another Purchase
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Tab switch */}
            <div className="flex bg-white p-1 rounded-2xl border border-primary-medium/10 shadow-sm">
              <button
                onClick={() => { setActiveSubTab('airtime'); setSelectedBundleId(''); }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === 'airtime' ? 'bg-primary-medium text-white shadow-sm' : 'text-purple-400 hover:text-primary-brand'
                }`}
              >
                <PhoneCall size={14} />
                <span>Airtime</span>
              </button>
              <button
                onClick={() => { setActiveSubTab('data'); setSelectedBundleId(''); }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === 'data' ? 'bg-primary-medium text-white shadow-sm' : 'text-purple-400 hover:text-primary-brand'
                }`}
              >
                <Wifi size={14} />
                <span>Mobile Data</span>
              </button>
            </div>

            {/* Selection Form */}
            <form onSubmit={handlePurchase} className="bg-white p-5 rounded-3xl border border-primary-medium/10 shadow-sm space-y-4">
              {/* Select Network */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Select Network Provider</label>
                <div className="grid grid-cols-4 gap-2">
                  {networks.map(net => (
                    <button
                      key={net.name}
                      type="button"
                      onClick={() => setSelectedNetwork(net.name as any)}
                      className={`py-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedNetwork === net.name 
                          ? 'border-primary-brand bg-purple-50/50 scale-102 font-extrabold' 
                          : 'border-gray-100 bg-white hover:border-purple-200'
                      }`}
                    >
                      <span className="text-lg">{net.logo}</span>
                      <span className="text-[10px] text-primary-dark font-black">{net.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enter Phone Number */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Recipient Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08012345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-purple-50/40 border border-purple-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-brand/20 font-bold tracking-wider text-primary-dark"
                />
              </div>

              {/* Select Bundle */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Select Cheaper Plan</label>
                <div className="space-y-2.5">
                  {currentBundles.map(bundle => (
                    <div
                      key={bundle.id}
                      onClick={() => setSelectedBundleId(bundle.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedBundleId === bundle.id
                          ? 'border-primary-brand bg-purple-50/30 font-black'
                          : 'border-gray-100 bg-white hover:border-purple-100'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-primary-dark">{bundle.label}</p>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">Save {formatNaira(bundle.saving)} instantly!</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-primary-brand">{formatNaira(bundle.price)}</p>
                        <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase">Discount applied</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execute Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-primary-brand hover:bg-black disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Pay {selectedBundle ? formatNaira(selectedBundle.price) : ''}</span>
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
