import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Layers, Copy, Check } from 'lucide-react';
import { User, TierInfo } from '../types';
import { formatNaira, getCompanyDetails } from '../data';
import { setDocumentData } from '../firebase';

export interface UpgradeRequest {
  id: string;
  username: string;
  currentTier: number;
  targetTier: number;
  cost: number;
  paymentProofUrl?: string; // base64 encoded image or placeholder
  status: 'pending' | 'approved' | 'declined';
  timestamp: string;
  reference: string;
}

interface UpgradePaymentPageProps {
  user: User;
  selectedTier: TierInfo;
  onBack: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  upgradeRequests: any[];
  onUpgradeSubmitted: (newRequest: UpgradeRequest) => void;
}

export default function UpgradePaymentPage({ 
  user, 
  selectedTier, 
  onBack,
  addToast,
  upgradeRequests,
  onUpgradeSubmitted
}: UpgradePaymentPageProps) {
  const company = getCompanyDetails();
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<UpgradeRequest | null>(null);
  const [declinedRequest, setDeclinedRequest] = useState<UpgradeRequest | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Check for any existing request of this user
  useEffect(() => {
    const userReq = upgradeRequests.find(r => r.username.toLowerCase() === user.username.toLowerCase() && r.status === 'pending');
    if (userReq) {
      setPendingRequest(userReq);
      setDeclinedRequest(null);
    } else {
      setPendingRequest(null);
      // Find if there's any declined request for this target level
      const userDec = upgradeRequests.find(r => r.username.toLowerCase() === user.username.toLowerCase() && r.status === 'declined' && r.targetTier === selectedTier.level);
      if (userDec) {
        setDeclinedRequest(userDec);
      } else {
        setDeclinedRequest(null);
      }
    }
  }, [user.username, selectedTier.level, upgradeRequests]);

  const handleCopy = (text: string, type: 'acc' | 'name') => {
    navigator.clipboard.writeText(text);
    if (type === 'acc') {
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    } else {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    }
    addToast('Copied to clipboard!', 'success');
    setShowWarningModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Proof image must be less than 2MB', 'error');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Proof image must be less than 2MB', 'error');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileBase64) {
      addToast('Please upload an image screenshot of your payment receipt.', 'error');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const newRequest: UpgradeRequest = {
        id: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
        username: user.username,
        currentTier: user.tier,
        targetTier: selectedTier.level,
        cost: selectedTier.cost,
        paymentProofUrl: fileBase64,
        status: 'pending',
        timestamp: new Date().toLocaleString('en-NG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', year: 'numeric' }),
        reference: 'UPG-' + Math.floor(10000000 + Math.random() * 90000000)
      };

      const saved = localStorage.getItem('goldrush9ja_upgrade_requests');
      let requests: UpgradeRequest[] = [];
      if (saved) {
        try {
          requests = JSON.parse(saved);
        } catch (e) {
          requests = [];
        }
      }

      // Filter out older pending/declined ones from the same target to clean database
      const filtered = requests.filter(r => !(r.username.toLowerCase() === user.username.toLowerCase() && r.targetTier === selectedTier.level));
      filtered.push(newRequest);

      localStorage.setItem('goldrush9ja_upgrade_requests', JSON.stringify(filtered));
      
      // Save directly to Firestore immediately
      setDocumentData('upgrade_requests', newRequest.id, newRequest).catch(err => {
        console.error('Error saving upgrade request directly:', err);
      });

      if (onUpgradeSubmitted) {
        onUpgradeSubmitted(newRequest);
      }

      setPendingRequest(newRequest);
      setDeclinedRequest(null); // Clear active decline warning upon re-submission
      setSubmitting(false);
      addToast('Payment proof submitted successfully! Review processing initialized.', 'success');
    }, 1500);
  };

  if (pendingRequest) {
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
            <h2 className="text-xl font-black tracking-tight">Upgrade Status</h2>
            <p className="text-xs text-purple-400 font-medium">Clearance desk verification channel</p>
          </div>
        </div>

        {/* Processing State Card */}
        <div className="bg-white rounded-3xl border border-primary-medium/10 p-6 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <RefreshCw size={32} className="animate-spin duration-3000" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-base text-primary-medium">Request Status: Processing</h3>
            <p className="text-xs text-purple-400 font-medium max-w-sm mx-auto leading-relaxed">
              Your payment proof for <span className="font-bold text-primary-brand">{selectedTier.name}</span> has been uploaded and submitted to the Admin Panel.
            </p>
            <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 text-[11px] text-purple-500 font-semibold max-w-xs mx-auto leading-relaxed mt-2">
              ⚠️ Our verification desk is validating the bank ledger settlement. Please come back and check this page later.
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-purple-50/30 border border-purple-100/50 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-purple-100/40 pb-2">
              <span className="text-purple-400 font-medium">Request Reference:</span>
              <span className="font-mono font-bold text-primary-dark">{pendingRequest.reference}</span>
            </div>
            <div className="flex justify-between border-b border-purple-100/40 pb-2">
              <span className="text-purple-400 font-medium">Target Tier:</span>
              <span className="font-bold text-primary-dark">Level {pendingRequest.targetTier} ({selectedTier.name})</span>
            </div>
            <div className="flex justify-between border-b border-purple-100/40 pb-2">
              <span className="text-purple-400 font-medium">Amount Required:</span>
              <span className="font-bold text-primary-brand">{formatNaira(pendingRequest.cost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400 font-medium">Submitted Time:</span>
              <span className="font-semibold text-purple-500">{pendingRequest.timestamp}</span>
            </div>
          </div>

          {/* Proof Preview */}
          {pendingRequest.paymentProofUrl && (
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">Uploaded Payment Screenshot</span>
              <div className="border border-purple-100 rounded-2xl overflow-hidden max-h-48 flex items-center justify-center bg-purple-50">
                <img 
                  src={pendingRequest.paymentProofUrl} 
                  alt="Payment Proof Receipt" 
                  className="object-contain max-h-48 w-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          <button
            onClick={onBack}
            className="w-full py-3 bg-primary-dark hover:bg-black text-white rounded-2xl font-bold text-xs transition-all uppercase tracking-wider"
          >
            Return to Dashboard
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
          <h2 className="text-xl font-black tracking-tight">Upgrade Checkout</h2>
          <p className="text-xs text-purple-400 font-medium">Secure company ledger payment</p>
        </div>
      </div>

      {/* Decline warning alert if any */}
      {declinedRequest && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-3xl flex items-start gap-3 text-xs animate-shake">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-rose-900 uppercase tracking-wide">Previous Attempt Declined</h4>
            <p className="text-rose-700/90 font-medium leading-relaxed">
              Your previous payment proof for Level {declinedRequest.targetTier} was declined by Admin. Please make sure you transferred the exact amount to our bank account and upload a valid, successful transaction receipt.
            </p>
            <p className="text-[10px] text-rose-500 font-semibold italic mt-1">
              Ref: {declinedRequest.reference} • Status: Declined by Overlord
            </p>
          </div>
        </div>
      )}

      {/* Info Header Banner */}
      <div className="bg-white rounded-3xl border border-primary-medium/10 p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-primary-brand" />
            <h3 className="font-black text-xs uppercase tracking-wider text-purple-400">Selected Level</h3>
          </div>
          <span className="text-xs font-black text-primary-brand bg-purple-50 px-2.5 py-1 rounded-full uppercase">
            {selectedTier.name}
          </span>
        </div>
        <p className="text-[11px] text-purple-400 font-medium leading-relaxed">
          Unlock commercial bank cashout permissions and retrieve accumulated node profits. Upgrading requires verification of funds transferred directly to the designated company bank account.
        </p>
      </div>

      {/* Payment Guide & Company Bank Details */}
      <div className="bg-primary-dark text-white p-5 rounded-3xl border border-purple-950 space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-amber-400 text-primary-dark font-black text-xs flex items-center justify-center">1</div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-400">Step 1: Wire Upgrade Fee</h4>
        </div>

        <p className="text-xs leading-relaxed text-purple-200">
          Please transfer the exact upgrade fee of <span className="text-white font-black">{formatNaira(selectedTier.cost)}</span> to the verified company account below:
        </p>

        {/* Bank Credentials Copyable Card */}
        <div className="bg-white/10 border border-white/5 p-4 rounded-2xl space-y-3 text-xs">
          <div className="flex justify-between border-b border-white/10 pb-2.5">
            <span className="text-purple-300 font-medium">Settlement Bank:</span>
            <span className="font-black text-white">{company.bankName}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2.5 items-center">
            <span className="text-purple-300 font-medium">Account Number:</span>
            <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors border border-white/10">
              <span className="font-mono font-black text-amber-300 tracking-wider text-sm select-all">{company.accountNumber}</span>
              <button 
                type="button"
                onClick={() => handleCopy(company.accountNumber, 'acc')}
                className="text-purple-300 hover:text-white cursor-pointer"
              >
                {copiedAcc ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-300 font-medium">Account Name:</span>
            <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors border border-white/10 max-w-[180px]">
              <span className="font-black text-white text-[11px] truncate">{company.accountName}</span>
              <button 
                type="button"
                onClick={() => handleCopy(company.accountName, 'name')}
                className="text-purple-300 hover:text-white cursor-pointer flex-shrink-0"
              >
                {copiedName ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-purple-300 italic">
          *Ensure to transfer the exact amount. Transfers are vetted automatically on settlement logs.
        </p>
      </div>

      {/* Proof Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-primary-medium/10 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary-brand text-white font-black text-xs flex items-center justify-center">2</div>
          <h4 className="font-black text-xs uppercase tracking-wider text-purple-400">Step 2: Upload Proof receipt</h4>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-purple-100 rounded-2xl hover:border-primary-brand hover:bg-purple-50/20 transition-all p-6 text-center cursor-pointer relative"
        >
          <input 
            type="file" 
            accept="image/*"
            id="payment-proof-input"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="space-y-2.5 pointer-events-none">
            <div className="w-12 h-12 bg-purple-50 text-primary-brand rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Upload size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-primary-medium">
                {fileName ? `Selected: ${fileName}` : 'Click or Drag & Drop screenshot here'}
              </p>
              <p className="text-[10px] text-purple-400 mt-1">
                Supports PNG, JPEG, or JPG (Max 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Image Preview if selected */}
        {fileBase64 && (
          <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100/50 space-y-1.5">
            <p className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">Image Preview</p>
            <div className="border border-purple-100 rounded-xl overflow-hidden max-h-36 flex items-center justify-center bg-white">
              <img 
                src={fileBase64} 
                alt="Uploaded proof preview" 
                className="object-contain max-h-36"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !fileBase64}
          className="w-full mt-2 py-3 bg-primary-brand hover:bg-black disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <CheckCircle2 size={13} />
              <span>Submit Payment Proof</span>
            </>
          )}
        </button>
      </form>

      {/* Warning Notice Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWarningModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            />
            
            {/* Content Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-100 shadow-2xl relative z-10 text-center space-y-4"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-black text-lg text-rose-950 uppercase tracking-tight">CRITICAL PAYMENT NOTICE</h3>
                <p className="text-xs font-semibold text-rose-700/90 leading-relaxed bg-rose-50 p-3.5 rounded-2xl border border-rose-100">
                  ⚠️ Please do NOT use <span className="font-extrabold text-rose-900 underline">OPay</span> or <span className="font-extrabold text-rose-900 underline">PalmPay</span> to make payments/transfers for any activation or upgrade!
                </p>
                <p className="text-xs text-primary-medium/80 leading-relaxed">
                  Our automated bank settlement ledgers are incompatible with OPay and PalmPay transfer routes. Any funds sent via these channels will be rejected or lost. Use standard commercial banks only.
                </p>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] text-emerald-700 font-bold leading-normal">
                  ✅ NOTE: You can withdraw your earnings to any bank account, including OPay and PalmPay without any restrictions.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-rose-600/20 transition-all uppercase tracking-wider cursor-pointer"
              >
                I Understand, Proceed
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
