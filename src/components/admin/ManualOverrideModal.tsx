import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency } from '../../lib/formatters';

interface ManualOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualOverrideModal: React.FC<ManualOverrideModalProps> = ({ isOpen, onClose }) => {
  const { players, teams, auction, manualOverride } = useAuction();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const [targetStatus, setTargetStatus] = useState<'UPCOMING' | 'SOLD' | 'UNSOLD'>('UPCOMING');
  const [targetTeamId, setTargetTeamId] = useState<string>(teams[0]?.id || '');
  const [targetPrice, setTargetPrice] = useState<number>(20000000);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const player = players.find(p => p.id === selectedPlayerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await manualOverride(
      selectedPlayerId,
      targetStatus,
      targetStatus === 'SOLD' ? targetTeamId : undefined,
      targetStatus === 'SOLD' ? Number(targetPrice) : undefined
    );

    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'Override failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b1222] border border-amber-500/40 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#080d19]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Manual Auction Override</h3>
              <p className="text-xs text-slate-400">Revert misclicks, edit sold records & restore budgets</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Overrides accurately restore the previous team's purse and update squad rosters in real time across all connected screens.
            </span>
          </div>

          {/* Player Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Player to Override
            </label>
            <select
              value={selectedPlayerId}
              onChange={e => {
                setSelectedPlayerId(e.target.value);
                setConfirmed(false);
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role}) - Currently: {p.status} {p.sold_price ? `(${formatCurrency(p.sold_price, auction?.currency_symbol)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* New Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Set New Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPCOMING', 'SOLD', 'UNSOLD'] as const).map(st => (
                <button
                  type="button"
                  key={st}
                  onClick={() => {
                    setTargetStatus(st);
                    setConfirmed(false);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    targetStatus === st
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* If Target Status is SOLD: choose team and price */}
          {targetStatus === 'SOLD' && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Assign to Winning Team
                </label>
                <select
                  value={targetTeamId}
                  onChange={e => setTargetTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Remaining Purse: {formatCurrency(t.purse_remaining, auction?.currency_symbol)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Sold Price ({auction?.currency_symbol})
                </label>
                <input 
                  type="number"
                  value={targetPrice}
                  onChange={e => setTargetPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Submit with confirmation step */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer ${
              confirmed 
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' 
                : 'bg-amber-500 hover:bg-amber-400 text-black'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
            ) : confirmed ? (
              '⚠️ Click Again to Confirm Override'
            ) : (
              'Apply Manual Override'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

