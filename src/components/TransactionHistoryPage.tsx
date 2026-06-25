import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Calendar, Filter, ArrowDownLeft, ArrowUpRight, CheckCircle, RefreshCw } from 'lucide-react';
import { Transaction } from '../types';
import { formatNaira } from '../data';

interface TransactionHistoryPageProps {
  transactions: Transaction[];
  onBack: () => void;
}

export default function TransactionHistoryPage({ transactions, onBack }: TransactionHistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'purchase' | 'earnings' | 'upgrade'>('all');

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

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
          <h2 className="text-xl font-black tracking-tight">Wallet Statements</h2>
          <p className="text-xs text-purple-400 font-medium">Real-time ledger audit trail</p>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-primary-medium/10 shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Total Transactions</p>
          <p className="text-2xl font-black mt-1 text-primary-medium">{transactions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-primary-medium/10 shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Filtered Count</p>
          <p className="text-2xl font-black mt-1 text-primary-medium">{filtered.length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-3xl border border-primary-medium/10 shadow-sm space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300" />
          <input
            type="text"
            placeholder="Search by description or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-purple-50/40 border border-purple-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-brand/20 font-medium text-primary-dark"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {([
            { id: 'all', label: 'All' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'purchase', label: 'Bings' },
            { id: 'earnings', label: 'Earnings' },
            { id: 'upgrade', label: 'Upgrades' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`text-[10px] px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex-shrink-0 ${
                typeFilter === tab.id 
                  ? 'bg-primary-medium text-white shadow-sm' 
                  : 'bg-purple-50 text-purple-400 hover:text-primary-brand'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger statement list */}
      <div className="bg-white rounded-3xl border border-primary-medium/10 p-5 shadow-sm space-y-3" id="ledger-statements-box">
        <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-400">Account Log Entries</h4>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-purple-300 text-xs font-semibold">
                No transactions matched your filter.
              </div>
            ) : (
              filtered.map(tx => {
                const isInflow = ['deposit', 'referral', 'earnings'].includes(tx.type);
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-between items-center p-3.5 bg-purple-50/20 hover:bg-purple-50/50 border border-purple-100/30 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isInflow ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isInflow ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-primary-dark">{tx.description}</h5>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                          <span className="text-[9px] text-purple-400 font-mono">{tx.reference}</span>
                          <span className="text-[9px] text-purple-300">•</span>
                          <span className="text-[9px] text-purple-400">{tx.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-black tracking-tight ${
                        isInflow ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isInflow ? '+' : '-'}{formatNaira(tx.amount)}
                      </span>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-purple-400 mt-0.5">
                        <CheckCircle size={10} className="text-emerald-500" />
                        <span className="font-bold uppercase tracking-wider">{tx.status}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
