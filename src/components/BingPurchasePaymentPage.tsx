import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, FileText, CheckCircle2, Copy, Check, RefreshCw, Cpu, Coins, AlertCircle } from 'lucide-react';
import { User, BingService, ActiveBing } from '../types';
import { formatNaira, getCompanyDetails } from '../data';
import { setDocumentData } from '../firebase';

export interface BingPurchaseRequest {
  id: string;
  username: string;
  serviceId: string;
  serviceTitle: string;
  price: number;
  paymentProofUrl?: string; // base64 receipt
  status: 'pending' | 'approved' | 'declined';
  timestamp: string;
  reference: string;
}

interface BingPurchasePaymentPageProps {
  user: User;
  selectedService: BingService;
  onBack: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function BingPurchasePaymentPage({
  user,
  selectedService,
  onBack,
  addToast
}: BingPurchasePaymentPageProps) {
  const company = getCompanyDetails();
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<BingPurchaseRequest | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Check for existing pending request for this specific service
  useEffect(() => {
    const saved = localStorage.getItem('goldrush9ja_bing_purchase_requests');
    if (saved) {
      try {
        const requests: BingPurchaseRequest[] = JSON.parse(saved);
        const userReq = requests.find(r => 
          r.username.toLowerCase() === user.username.toLowerCase() && 
          r.serviceId === selectedService.id && 
          r.status === 'pending'
        );
        if (userReq) {
          setPendingRequest(userReq);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [user.username, selectedService.id]);

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
      const newRequest: BingPurchaseRequest = {
        id: 'BPR-' + Math.floor(100000 + Math.random() * 900000),
        username: user.username,
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        price: selectedService.price,
        paymentProofUrl: fileBase64,
        status: 'pending',
        timestamp: new Date().toLocaleString('en-NG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', year: 'numeric' }),
        reference: 'GR9-' + Math.floor(10000000 + Math.random() * 90000000)
      };

      const saved = localStorage.getItem('goldrush9ja_bing_purchase_requests');
      let requests: BingPurchaseRequest[] = [];
      if (saved) {
        try {
          requests = JSON.parse(saved);
        } catch (e) {
          requests = [];
        }
      }

      // Filter out older non-pending ones of the same service to keep localstorage lightweight
      const filtered = requests.filter(r => !(r.username.toLowerCase() === user.username.toLowerCase() && r.serviceId === selectedService.id && r.status !== 'pending'));
      filtered.push(newRequest);

      localStorage.setItem('goldrush9ja_bing_purchase_requests', JSON.stringify(filtered));
      
      // Save directly to Firestore immediately
      setDocumentData('bing_purchase_requests', newRequest.id, newRequest).catch(err => {
        console.error('Error saving purchase request directly:', err);
      });

      setPendingRequest(newRequest);
      setSubmitting(false);
      addToast(`Purchase proof submitted! Pending Admin verification.`, 'success');
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
            <h2 className="text-xl font-black tracking-tight">Contract Setup</h2>
            <p className="text-xs text-purple-400 font-medium font-mono">Status verification link</p>
          </div>
        </div>

        {/* Processing State Card */}
        <div className="bg-white rounded-3xl border border-primary-medium/10 p-6 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-purple-50 text-primary-brand rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <RefreshCw size={32} className="animate-spin duration-3000 text-primary-brand" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-base text-primary-medium">Node Deployment Pending</h3>
            <p className="text-xs text-purple-400 font-medium max-w-sm mx-auto leading-relaxed">
              Your payment proof of <span className="font-bold text-primary-brand">{formatNaira(selectedService.price)}</span> for the <span className="font-bold text-primary-brand">{selectedService.title}</span> is pending review.
            </p>
            <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 text-[11px] text-purple-600 font-semibold max-w-xs mx-auto leading-relaxed mt-2">
              ⚙️ System administrators are verifying the deposit. The mining yield starts automatically once approved.
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-purple-50/30 border border-purple-100/50 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-purple-100/40 pb-2">
              <span className="text-purple-400 font-medium">Tracking Reference:</span>
              <span className="font-mono font-bold text-primary-dark">{pendingRequest.reference}</span>
            </div>
            <div className="flex justify-between border-b border-purple-100/40 pb-2">
              <span className="text-purple-400 font-medium">Contract Type:</span>
              <span className="font-bold text-primary-dark">{pendingRequest.serviceTitle}</span>
            </div>
            <div className="flex justify-between border-b border-purple-100/40 pb-2">
              <span className="text-purple-400 font-medium">Verification Price:</span>
              <span className="font-bold text-primary-brand">{formatNaira(pendingRequest.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400 font-medium">Initiated Date:</span>
              <span className="font-semibold text-purple-500">{pendingRequest.timestamp}</span>
            </div>
          </div>

          {pendingRequest.paymentProofUrl && (
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">Uploaded Receipt Screenshot</span>
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
            Back to Bing Shop
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
          <h2 className="text-xl font-black tracking-tight">Contract Purchase</h2>
          <p className="text-xs text-purple-400 font-medium">Verify direct node leasing deposit</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-white rounded-3xl border border-primary-medium/10 p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-primary-brand animate-pulse" />
            <h3 className="font-black text-xs uppercase tracking-wider text-purple-400">Bing Service Node</h3>
          </div>
          <span className="text-xs font-black text-white bg-primary-dark px-2.5 py-1 rounded-full uppercase">
            {selectedService.title}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs pt-2">
          <div className="bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/30">
            <span className="text-[9px] text-purple-400 block font-bold uppercase">Required Payment:</span>
            <span className="text-sm font-extrabold text-primary-brand">{formatNaira(selectedService.price)}</span>
          </div>
          <div className="bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/30">
            <span className="text-[9px] text-purple-400 block font-bold uppercase">Estimated Return:</span>
            <span className="text-sm font-extrabold text-emerald-600">+{formatNaira(selectedService.totalIncome)}</span>
          </div>
        </div>
      </div>

      {/* Company Bank Details with Copy button */}
      <div className="bg-primary-dark text-white p-5 rounded-3xl border border-purple-950 space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-amber-400 text-primary-dark font-black text-xs flex items-center justify-center">1</div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-400">Step 1: Transfer Funds</h4>
        </div>

        <p className="text-xs leading-relaxed text-purple-200">
          Leasing requires settlement directly to our corporate bank account. Transfer exactly <span className="text-white font-black">{formatNaira(selectedService.price)}</span> below:
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
      </div>

      {/* Proof Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-primary-medium/10 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary-brand text-white font-black text-xs flex items-center justify-center">2</div>
          <h4 className="font-black text-xs uppercase tracking-wider text-purple-400">Step 2: Submit screenshot</h4>
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
            id="bing-proof-input"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="space-y-2.5">
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

        {/* Image Preview */}
        {fileBase64 && (
          <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100/50 space-y-1.5">
            <p className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">Receipt Preview</p>
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
              <span>Submit Purchase Proof</span>
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
