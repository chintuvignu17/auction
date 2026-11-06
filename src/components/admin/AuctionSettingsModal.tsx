import React, { useState } from 'react';
import { X, Settings, Clock, DollarSign, Users, Check } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

interface AuctionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuctionSettingsModal: React.FC<AuctionSettingsModalProps> = ({ isOpen, onClose }) => {
  const { auction, updateAuctionSettings } = useAuction();

  const [title, setTitle] = useState(auction?.title || '');
  const [timerSeconds, setTimerSeconds] = useState(auction?.timer_seconds || 30);
  const [minBidIncrement, setMinBidIncrement] = useState(auction?.min_bid_increment || 2000000);
  const [maxPlayers, setMaxPlayers] = useState(auction?.max_players_per_team || 15);
  const currencySymbol = '₹';
  const [saved, setSaved] = useState(false);

  if (!isOpen || !auction) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAuctionSettings({
      title,
      timer_seconds: Number(timerSeconds),
      min_bid_increment: Number(minBidIncrement),
      max_players_per_team: Number(maxPlayers),
      currency_symbol: currencySymbol
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b1222] border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#080d19]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Auction Rules & Settings</h3>
              <p className="text-xs text-slate-400">Modify dynamic rules for this room</p>
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
        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Auction Title
            </label>
            <input 
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Countdown Timer per Player (seconds)</span>
            </label>
            <select
              value={timerSeconds}
              onChange={e => setTimerSeconds(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value={15}>15 seconds (Blitz)</option>
              <option value={20}>20 seconds (Fast)</option>
              <option value={30}>30 seconds (Standard)</option>
              <option value={45}>45 seconds (Relaxed)</option>
              <option value={60}>60 seconds (Extended)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Minimum Bid Increment</span>
            </label>
            <select
              value={minBidIncrement}
              onChange={e => setMinBidIncrement(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value={500000}>5 Lakhs / 50,000</option>
              <option value={1000000}>10 Lakhs / 100,000</option>
              <option value={2000000}>20 Lakhs (IPL Standard)</option>
              <option value={2500000}>25 Lakhs</option>
              <option value={5000000}>50 Lakhs</option>
              <option value={10000000}>1 Crore</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Max Players per Team</span>
            </label>
            <input 
              type="number"
              min={5}
              max={30}
              value={maxPlayers}
              onChange={e => setMaxPlayers(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {saved && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            Save Settings
          </button>
        </form>

      </div>
    </div>
  );
};

