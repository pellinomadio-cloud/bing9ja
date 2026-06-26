import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldAlert, UserX, UserCheck, Search, Users, 
  AlertTriangle, ShieldCheck, Check, X, FileText, Cpu, Coins 
} from 'lucide-react';
import { User, ActiveBing } from '../types';
import { formatNaira, BING_SERVICES, getCompanyDetails, saveCompanyDetails } from '../data';
import { UpgradeRequest } from './UpgradePaymentPage';
import { BingPurchaseRequest } from './BingPurchasePaymentPage';
import { setDocumentData } from '../firebase';

interface AdminPageProps {
  onBack: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function AdminPage({ onBack, addToast }: AdminPageProps) {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]); // Array of usernames
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [bingPurchaseRequests, setBingPurchaseRequests] = useState<BingPurchaseRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Company and Telegram channel details state
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [telegramChannel, setTelegramChannel] = useState('');

  // Fetch from localStorage
  useEffect(() => {
    const savedReg = localStorage.getItem('goldrush9ja_registered_users');
    if (savedReg) {
      setRegisteredUsers(JSON.parse(savedReg));
    }
    const savedBanned = localStorage.getItem('goldrush9ja_banned_users');
    if (savedBanned) {
      setBannedUsers(JSON.parse(savedBanned));
    }
    const savedReqs = localStorage.getItem('goldrush9ja_upgrade_requests');
    if (savedReqs) {
      setUpgradeRequests(JSON.parse(savedReqs));
    }
    const savedBingPurchases = localStorage.getItem('goldrush9ja_bing_purchase_requests');
    if (savedBingPurchases) {
      setBingPurchaseRequests(JSON.parse(savedBingPurchases));
    }

    // Load company details
    const details = getCompanyDetails();
    setBankName(details.bankName);
    setAccountNumber(details.accountNumber);
    setAccountName(details.accountName);
    setTelegramChannel(details.telegramChannel);
  }, []);

  const handleSaveCompanyDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const details = {
      bankName,
      accountNumber,
      accountName,
      telegramChannel
    };
    saveCompanyDetails(details);
    setDocumentData('system', 'company_details', {
      id: 'company_details',
      ...details
    });
    addToast('Company credentials & Telegram channel details updated successfully!', 'success');
  };

  const handleToggleBan = (username: string) => {
    const isBanned = bannedUsers.includes(username);
    let updatedBanned: string[];

    if (isBanned) {
      updatedBanned = bannedUsers.filter(u => u !== username);
      addToast(`User ${username} has been unbanned successfully!`, 'success');
    } else {
      updatedBanned = [...bannedUsers, username];
      addToast(`User ${username} has been permanently banned!`, 'error');
    }

    setBannedUsers(updatedBanned);
    localStorage.setItem('goldrush9ja_banned_users', JSON.stringify(updatedBanned));
    setDocumentData('system', 'banned_users', {
      id: 'banned_users',
      usernames: updatedBanned
    });
  };

  const handleApproveUpgrade = (reqId: string) => {
    const saved = localStorage.getItem('goldrush9ja_upgrade_requests');
    if (!saved) return;
    try {
      const reqs: UpgradeRequest[] = JSON.parse(saved);
      const reqIdx = reqs.findIndex(r => r.id === reqId);
      if (reqIdx === -1) return;

      const req = reqs[reqIdx];
      req.status = 'approved';

      // Update in localStorage upgrade requests
      localStorage.setItem('goldrush9ja_upgrade_requests', JSON.stringify(reqs));
      setUpgradeRequests(reqs);
      setDocumentData('upgrade_requests', req.id, req);

      // Upgrade the actual user's tier in the master database list
      const usersRaw = localStorage.getItem('goldrush9ja_registered_users');
      if (usersRaw) {
        const registered = JSON.parse(usersRaw);
        const uIdx = registered.findIndex((u: any) => u.username.toLowerCase() === req.username.toLowerCase());
        if (uIdx !== -1) {
          registered[uIdx].tier = req.targetTier;
          localStorage.setItem('goldrush9ja_registered_users', JSON.stringify(registered));
          setRegisteredUsers(registered);
          setDocumentData('users', registered[uIdx].username.toLowerCase(), registered[uIdx]);

          // Append a positive upgrade transaction log to the transaction logs so the ledger balances out
          const savedTx = localStorage.getItem('goldrush9ja_transactions');
          let txs: any[] = [];
          if (savedTx) {
            txs = JSON.parse(savedTx);
          }
          const upgradeTx = {
            id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
            type: 'upgrade',
            amount: req.cost,
            description: `Upgraded to Level ${req.targetTier} (Approved)`,
            timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
            reference: req.reference,
            username: req.username.toLowerCase()
          };
          txs = [upgradeTx, ...txs];
          localStorage.setItem('goldrush9ja_transactions', JSON.stringify(txs));
          setDocumentData('transactions', upgradeTx.id, upgradeTx);
        }
      }

      addToast(`Upgrade to Level ${req.targetTier} approved successfully for ${req.username}!`, 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineUpgrade = (reqId: string) => {
    const saved = localStorage.getItem('goldrush9ja_upgrade_requests');
    if (!saved) return;
    try {
      const reqs: UpgradeRequest[] = JSON.parse(saved);
      const reqIdx = reqs.findIndex(r => r.id === reqId);
      if (reqIdx === -1) return;

      const req = reqs[reqIdx];
      req.status = 'declined';

      localStorage.setItem('goldrush9ja_upgrade_requests', JSON.stringify(reqs));
      setUpgradeRequests(reqs);
      setDocumentData('upgrade_requests', req.id, req);

      // Append a failed/declined transaction to the user's transaction history so it is logged
      const savedTx = localStorage.getItem('goldrush9ja_transactions');
      let txs: any[] = [];
      if (savedTx) {
        txs = JSON.parse(savedTx);
      }
      const declineTx = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        type: 'upgrade',
        amount: req.cost,
        description: `Upgrade to Level ${req.targetTier} (Declined: Please upload right payment)`,
        timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
        status: 'failed',
        reference: req.reference,
        username: req.username.toLowerCase()
      };
      txs = [declineTx, ...txs];
      localStorage.setItem('goldrush9ja_transactions', JSON.stringify(txs));
      setDocumentData('transactions', declineTx.id, declineTx);

      addToast(`Upgrade request declined for ${req.username}.`, 'error');
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveBingPurchase = (reqId: string) => {
    const saved = localStorage.getItem('goldrush9ja_bing_purchase_requests');
    if (!saved) return;
    try {
      const reqs: BingPurchaseRequest[] = JSON.parse(saved);
      const reqIdx = reqs.findIndex(r => r.id === reqId);
      if (reqIdx === -1) return;

      const req = reqs[reqIdx];
      req.status = 'approved';

      // Update local storage requests
      localStorage.setItem('goldrush9ja_bing_purchase_requests', JSON.stringify(reqs));
      setBingPurchaseRequests(reqs);
      setDocumentData('bing_purchase_requests', req.id, req);

      // Find the corresponding service
      const service = BING_SERVICES.find(s => s.id === req.serviceId);
      if (!service) {
        addToast(`Error: GoldRush service not found!`, 'error');
        return;
      }

      // Add the active contract to the actual user's account
      const usersRaw = localStorage.getItem('goldrush9ja_registered_users');
      if (usersRaw) {
        const registered = JSON.parse(usersRaw);
        const uIdx = registered.findIndex((u: any) => u.username.toLowerCase() === req.username.toLowerCase());
        if (uIdx !== -1) {
          const userObj = registered[uIdx];
          
          const newActiveBing: ActiveBing = {
            id: 'active-' + Math.floor(100000 + Math.random() * 900000),
            serviceId: service.id,
            title: service.title,
            price: service.price,
            dailyIncome: service.dailyIncome,
            totalIncome: service.totalIncome,
            timestampBought: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
            durationDays: service.durationDays,
            lastClaimedTimestamp: new Date().toISOString(),
            accumulatedUnclaimed: 0,
            totalClaimed: 0,
            isCompleted: false
          };

          userObj.activeBings = [...(userObj.activeBings || []), newActiveBing];
          localStorage.setItem('goldrush9ja_registered_users', JSON.stringify(registered));
          setRegisteredUsers(registered);
          setDocumentData('users', userObj.username.toLowerCase(), userObj);

          // Append a positive purchase transaction log to user history
          const savedTx = localStorage.getItem('goldrush9ja_transactions');
          let txs: any[] = [];
          if (savedTx) {
            txs = JSON.parse(savedTx);
          }
          const purchaseTx = {
            id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
            type: 'purchase',
            amount: req.price,
            description: `Deployed ${service.title} (Approved)`,
            timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
            reference: req.reference,
            username: req.username.toLowerCase()
          };
          txs = [purchaseTx, ...txs];
          localStorage.setItem('goldrush9ja_transactions', JSON.stringify(txs));
          setDocumentData('transactions', purchaseTx.id, purchaseTx);
        }
      }

      addToast(`GoldRush contract for ${service.title} approved successfully for ${req.username}!`, 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineBingPurchase = (reqId: string) => {
    const saved = localStorage.getItem('goldrush9ja_bing_purchase_requests');
    if (!saved) return;
    try {
      const reqs: BingPurchaseRequest[] = JSON.parse(saved);
      const reqIdx = reqs.findIndex(r => r.id === reqId);
      if (reqIdx === -1) return;

      const req = reqs[reqIdx];
      req.status = 'declined';

      localStorage.setItem('goldrush9ja_bing_purchase_requests', JSON.stringify(reqs));
      setBingPurchaseRequests(reqs);
      setDocumentData('bing_purchase_requests', req.id, req);

      // Append a failed purchase transaction log to the transaction history so it shows up
      const savedTx = localStorage.getItem('goldrush9ja_transactions');
      let txs: any[] = [];
      if (savedTx) {
        txs = JSON.parse(savedTx);
      }
      const declineTx = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        type: 'purchase',
        amount: req.price,
        description: `GoldRush Purchase: ${req.serviceTitle} (Declined: Please upload right payment)`,
        timestamp: new Date().toLocaleDateString('en-NG', { hour: '2-digit', minute: '2-digit' }),
        status: 'failed',
        reference: req.reference,
        username: req.username.toLowerCase()
      };
      txs = [declineTx, ...txs];
      localStorage.setItem('goldrush9ja_transactions', JSON.stringify(txs));
      setDocumentData('transactions', declineTx.id, declineTx);

      addToast(`GoldRush purchase request declined for ${req.username}.`, 'error');
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = registeredUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingUpgrades = upgradeRequests.filter(r => r.status === 'pending');
  const pendingBingPurchases = bingPurchaseRequests.filter(r => r.status === 'pending');

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
          <h2 className="text-xl font-black tracking-tight text-rose-600">Administrator Console</h2>
          <p className="text-xs text-purple-400 font-medium">Overlord permission hub & security panel</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-primary-medium/10 shadow-sm text-center">
          <p className="text-[9px] uppercase font-bold tracking-wider text-purple-400">Total Users</p>
          <p className="text-xl font-black mt-0.5 text-primary-medium">{registeredUsers.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-primary-medium/10 shadow-sm text-center">
          <p className="text-[9px] uppercase font-bold tracking-wider text-emerald-600">Active</p>
          <p className="text-xl font-black mt-0.5 text-emerald-600">{registeredUsers.length - bannedUsers.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-primary-medium/10 shadow-sm text-center">
          <p className="text-[9px] uppercase font-bold tracking-wider text-rose-600">Banned</p>
          <p className="text-xl font-black mt-0.5 text-rose-600">{bannedUsers.length}</p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100 flex items-start gap-3">
        <AlertTriangle className="text-rose-600 h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-xs text-rose-900">Critical Access Control Warning</h4>
          <p className="text-[10px] text-rose-700/90 font-medium mt-0.5 leading-relaxed">
            As an administrator, you have permission to suspend accounts. Banned users are instantly denied access and logged out of their sessions. Use discretion.
          </p>
        </div>
      </div>

      {/* Company Details & Telegram Channel Settings */}
      <div className="bg-white rounded-3xl border border-primary-medium/10 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-purple-50 pb-3">
          <ShieldCheck className="text-rose-600 h-5 w-5" />
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-primary-medium">
              System & Gateway Settings
            </h4>
            <p className="text-[10px] text-purple-400 font-medium">Manage company bank accounts and Telegram handle shown to users</p>
          </div>
        </div>

        <form onSubmit={handleSaveCompanyDetails} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-purple-400 block">Settlement Bank Name</label>
              <input 
                type="text" 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-purple-50/40 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold text-primary-dark"
                placeholder="e.g. Wema Bank / ALAT"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-purple-400 block">Account Number</label>
              <input 
                type="text" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 bg-purple-50/40 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold text-primary-dark font-mono"
                placeholder="e.g. 0124982345"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-purple-400 block">Account Name (Beneficiary)</label>
              <input 
                type="text" 
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 bg-purple-50/40 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold text-primary-dark"
                placeholder="e.g. GOLDRUSH9JA FINANCIAL HUB CO."
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-purple-400 block">Telegram Channel Handle / Link</label>
              <input 
                type="text" 
                value={telegramChannel}
                onChange={(e) => setTelegramChannel(e.target.value)}
                className="w-full px-3 py-2 bg-purple-50/40 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold text-primary-dark"
                placeholder="e.g. @goldrush9ja"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all animate-pulse"
            >
              <Check size={12} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Upgrade Requests Queue Section */}
      <div className="bg-white rounded-3xl border border-primary-medium/10 p-5 shadow-sm space-y-4" id="admin-upgrade-verification-queue">
        <div className="flex justify-between items-center border-b border-purple-50 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="text-primary-brand h-4 w-4" />
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-primary-medium">
              Tier Upgrade Queue
            </h4>
          </div>
          <span className="text-[9px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold">
            Pending: {pendingUpgrades.length}
          </span>
        </div>

        {pendingUpgrades.length === 0 ? (
          <div className="text-center py-6 text-purple-300 text-xs font-semibold">
            No pending upgrade requests.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            {pendingUpgrades.map(req => {
              return (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                    req.status === 'pending' 
                      ? 'border-amber-100 bg-amber-50/10' 
                      : req.status === 'approved'
                      ? 'border-emerald-100 bg-emerald-50/10'
                      : 'border-purple-50 bg-purple-50/10 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-primary-dark">@{req.username.toUpperCase()}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-purple-100 text-purple-500'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-purple-400 mt-0.5">Ref: {req.reference} • {req.timestamp}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-primary-brand">{formatNaira(req.cost)}</p>
                      <p className="text-[9px] text-purple-500 font-bold">Level {req.currentTier} ➔ Level {req.targetTier}</p>
                    </div>
                  </div>

                  {/* Payment Receipt Image Box */}
                  {req.paymentProofUrl && (
                    <div className="space-y-1 bg-white p-2 rounded-xl border border-purple-50">
                      <span className="text-[9px] font-bold text-purple-400 block uppercase">Uploaded Payment Receipt Proof:</span>
                      <div className="rounded-lg overflow-hidden max-h-40 bg-purple-50 flex items-center justify-center">
                        <img 
                          src={req.paymentProofUrl} 
                          alt="Submitted Receipt Proof" 
                          className="object-contain max-h-40 w-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Admin Approve/Decline actions */}
                  {req.status === 'pending' && (
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => handleDeclineUpgrade(req.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <X size={12} />
                        <span>Decline</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveUpgrade(req.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <Check size={12} />
                        <span>Approve Upgrade</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bing Purchase Verification Queue */}
      <div className="bg-white rounded-3xl border border-primary-medium/10 p-5 shadow-sm space-y-4" id="admin-bing-purchase-queue">
        <div className="flex justify-between items-center border-b border-purple-50 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="text-primary-brand h-4 w-4" />
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-primary-medium">
              Bing Purchase Queue
            </h4>
          </div>
          <span className="text-[9px] bg-primary-brand text-white px-2 py-0.5 rounded-full font-bold">
            Pending: {pendingBingPurchases.length}
          </span>
        </div>

        {pendingBingPurchases.length === 0 ? (
          <div className="text-center py-6 text-purple-300 text-xs font-semibold">
            No pending bing purchases.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            {pendingBingPurchases.map(req => {
              return (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                    req.status === 'pending' 
                      ? 'border-amber-100 bg-amber-50/10' 
                      : req.status === 'approved'
                      ? 'border-emerald-100 bg-emerald-50/10'
                      : 'border-purple-50 bg-purple-50/10 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-primary-dark">@{req.username.toUpperCase()}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-purple-100 text-purple-500'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-purple-400 mt-0.5">Ref: {req.reference} • {req.timestamp}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-primary-brand">{formatNaira(req.price)}</p>
                      <p className="text-[9px] text-purple-500 font-bold">Deploy: {req.serviceTitle}</p>
                    </div>
                  </div>

                  {/* Payment Receipt Image Box */}
                  {req.paymentProofUrl && (
                    <div className="space-y-1 bg-white p-2 rounded-xl border border-purple-50">
                      <span className="text-[9px] font-bold text-purple-400 block uppercase">Uploaded Payment Receipt Proof:</span>
                      <div className="rounded-lg overflow-hidden max-h-40 bg-purple-50 flex items-center justify-center">
                        <img 
                          src={req.paymentProofUrl} 
                          alt="Submitted Receipt Proof" 
                          className="object-contain max-h-40 w-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Admin Approve/Decline actions */}
                  {req.status === 'pending' && (
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => handleDeclineBingPurchase(req.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <X size={12} />
                        <span>Decline</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveBingPurchase(req.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <Check size={12} />
                        <span>Approve Purchase</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-primary-medium/10 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300" />
          <input
            type="text"
            placeholder="Search registered directory by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-purple-50/40 border border-purple-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium text-primary-dark"
          />
        </div>
      </div>

      {/* Users Directory */}
      <div className="bg-white rounded-3xl border border-primary-medium/10 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-400">Registered Users Directory</h4>
          <span className="text-[9px] font-bold text-purple-400 font-mono">Count: {filtered.length}</span>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-purple-300 text-xs font-semibold">
              No registered user matching search.
            </div>
          ) : (
            filtered.map(usr => {
              const isBanned = bannedUsers.includes(usr.username);
              return (
                <div 
                  key={usr.username}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isBanned 
                      ? 'border-rose-100 bg-rose-50/15 text-rose-900 opacity-80' 
                      : 'border-purple-50 bg-purple-50/10 hover:bg-purple-50/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-primary-dark">{usr.username.toUpperCase()}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isBanned ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isBanned ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-400 font-mono">{usr.email}</p>
                    <p className="text-[9px] text-purple-400">
                      Balance: <span className="font-bold text-primary-medium">{formatNaira(usr.balance)}</span> • Tier: <span className="font-bold">Level {usr.tier}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleBan(usr.username)}
                    className={`p-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer font-bold text-[10px] uppercase border ${
                      isBanned 
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100' 
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100'
                    }`}
                  >
                    {isBanned ? (
                      <>
                        <UserCheck size={14} />
                        <span>Unban</span>
                      </>
                    ) : (
                      <>
                        <UserX size={14} />
                        <span>Ban User</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
