import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Lock, CheckCircle2, Globe, Copy, RefreshCw, Smartphone, MailOpen } from 'lucide-react';
import { User } from '../types';
import { formatNaira } from '../data';

interface ExlPageProps {
  user: User;
  onPurchase: (amount: number, description: string) => void;
  onBack: () => void;
  onUpgradeRequest: () => void;
}

export default function ExlPage({ user, onPurchase, onBack, onUpgradeRequest }: ExlPageProps) {
  const isTierLocked = user.tier < 3;

  const [selectedCountry, setSelectedCountry] = useState<'us' | 'uk' | 'ca' | 'fr' | 'de'>('us');
  const [selectedService, setSelectedService] = useState('whatsapp');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchasedNumber, setPurchasedNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState('');

  const price = 1500; // 1,500 Naira per number

  const countries = [
    { id: 'us', name: 'United States', flag: '🇺🇸', code: '+1', prefix: '213' },
    { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', code: '+44', prefix: '7700' },
    { id: 'ca', name: 'Canada', flag: '🇨🇦', code: '+1', prefix: '416' },
    { id: 'fr', name: 'France', flag: '🇫🇷', code: '+33', prefix: '600' },
    { id: 'de', name: 'Germany', flag: '🇩🇪', code: '+49', prefix: '150' },
  ];

  const services = [
    { id: 'whatsapp', name: 'WhatsApp Business', icon: '💬' },
    { id: 'telegram', name: 'Telegram Messenger', icon: '✈️' },
    { id: 'google', name: 'Google / Gmail', icon: '📧' },
    { id: 'discord', name: 'Discord', icon: '🎮' },
    { id: 'tinder', name: 'Tinder Dating', icon: '🔥' },
  ];

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.balance < price) {
      alert('Insufficient wallet balance to purchase this virtual phone number.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Generate a clean fake phone number
      const countryObj = countries.find(c => c.id === selectedCountry)!;
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const fakeNum = `${countryObj.code} (${countryObj.prefix}) ${String(randomDigits).substring(0,3)}-${String(randomDigits).substring(3)}`;
      
      const desc = `Purchased Virtual ${countryObj.name} Phone Number for ${selectedService.toUpperCase()}`;
      onPurchase(price, desc);

      setPurchasedNumber(fakeNum);
      
      // Generate a fake OTP 
      const otp = Math.floor(100000 + Math.random() * 900000);
      setReceivedOtp(String(otp));
      
      setSuccess(true);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(purchasedNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <h2 className="text-xl font-black tracking-tight">EXL Virtual Telecom</h2>
        </div>

        {/* Lock Banner */}
        <div className="bg-white rounded-3xl border border-primary-medium/10 p-8 shadow-sm text-center space-y-6" id="tier-locked-exl-container">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto animate-pulse">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-primary-medium">Access Suspended (Requires Lvl 3)</h3>
            <p className="text-xs text-purple-400 font-medium max-w-sm mx-auto leading-relaxed">
              Virtual foreign verification phone numbers (EXL system) require premium clearance level. Please upgrade your level tier to Tier 3 or higher.
            </p>
          </div>
          
          <button
            onClick={onUpgradeRequest}
            className="w-full max-w-xs py-3 bg-primary-brand hover:bg-black text-white rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Upgrade Account to Lvl 3
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
          <h2 className="text-xl font-black tracking-tight">EXL Foreign Numbers</h2>
          <p className="text-xs text-purple-400 font-medium">Sleek virtual verification system</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
            id="exl-success-screen"
          >
            {/* Number Purchased Receipt */}
            <div className="bg-white rounded-3xl border border-primary-medium/10 p-6 text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Your Virtual Phone Number</p>
                <div className="flex items-center justify-center gap-2 bg-purple-50 px-4 py-3.5 rounded-2xl border border-purple-100">
                  <span className="text-lg font-black tracking-wider text-primary-medium font-mono">{purchasedNumber}</span>
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copied && (
                  <span className="text-[9px] text-emerald-600 font-bold block">Copied to clipboard!</span>
                )}
              </div>
            </div>

            {/* Virtual SMS OTP Box */}
            <div className="bg-primary-dark p-5 rounded-3xl text-white space-y-3.5 border border-purple-950">
              <div className="flex items-center gap-2">
                <MailOpen size={16} className="text-amber-400 animate-pulse" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-400">Incoming Virtual Inbox</h4>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] opacity-75 font-mono">
                  <span>Sender: {selectedService.toUpperCase()}_OTP</span>
                  <span>Just now</span>
                </div>
                <p className="text-xs font-bold leading-relaxed text-purple-100">
                  Use code <span className="text-amber-400 font-extrabold text-sm tracking-wider font-mono bg-white/15 px-2 py-0.5 rounded">{receivedOtp}</span> to verify your new account device configuration. Do not share.
                </p>
              </div>

              <button
                onClick={() => setSuccess(false)}
                className="w-full py-2.5 bg-white text-primary-dark hover:bg-purple-100 transition-all font-bold text-xs rounded-xl cursor-pointer"
              >
                Buy Another Line (₦1,500.00)
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Rates Banner */}
            <div className="bg-gradient-to-r from-primary-medium to-primary-brand text-white p-4 rounded-3xl shadow-sm border border-white/10 flex justify-between items-center">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-purple-300 font-bold">EXL Member Rate</p>
                <p className="text-sm font-black mt-0.5">Flat Rate: <span className="text-amber-300">₦1,500.00</span> / Number</p>
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Unlimited Stock
              </span>
            </div>

            <form onSubmit={handlePurchase} className="bg-white p-5 rounded-3xl border border-primary-medium/10 shadow-sm space-y-5">
              {/* Select Country */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Select Country Line</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {countries.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCountry(c.id as any)}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        selectedCountry === c.id 
                          ? 'border-primary-brand bg-purple-50/40 font-black' 
                          : 'border-gray-100 bg-white hover:border-purple-100'
                      }`}
                    >
                      <span className="text-xl">{c.flag}</span>
                      <div className="text-left">
                        <p className="text-[10px] text-primary-dark font-black">{c.name}</p>
                        <p className="text-[8px] text-purple-400 font-mono">{c.code}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Platform Service */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Select OTP Target Service</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {services.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedService(s.id)}
                      className={`p-3 rounded-2xl border flex items-center gap-2 transition-all cursor-pointer ${
                        selectedService === s.id 
                          ? 'border-primary-brand bg-purple-50/40 font-black' 
                          : 'border-gray-100 bg-white hover:border-purple-100'
                      }`}
                    >
                      <span className="text-base">{s.icon}</span>
                      <span className="text-[10px] text-primary-dark font-bold">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-brand hover:bg-black disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Globe size={13} />
                    <span>Purchase foreign number (₦1,500.00)</span>
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
