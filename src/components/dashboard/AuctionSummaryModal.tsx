import React from 'react';
import { X, Trophy, FileDown, Flame, DollarSign, Award } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { exportAuctionToCSV } from '../../lib/exportCsv';
import { formatCurrency, formatRole } from '../../lib/formatters';

interface AuctionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuctionSummaryModal: React.FC<AuctionSummaryModalProps> = ({ isOpen, onClose }) => {
  const { auction, players, teams } = useAuction();

  if (!isOpen || !auction) return null;

  const soldPlayers = players.filter(p => p.status === 'SOLD' && p.sold_price);
  const unsoldPlayers = players.filter(p => p.status === 'UNSOLD');
  const upcomingPlayers = players.filter(p => p.status === 'UPCOMING');

  // Sort sold players by price descending (Top Buys)
  const topBuys = [...soldPlayers].sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0)).slice(0, 5);

  // Total funds spent across auction
  const totalSpent = soldPlayers.reduce((acc, p) => acc + (p.sold_price || 0), 0);

  const handleExport = () => {
    exportAuctionToCSV(auction, players, teams);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1222] border border-amber-500/30 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#080d19] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Auction Leaderboard & Summary</h3>
              <p className="text-xs text-slate-400">{auction.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Spent</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {formatCurrency(totalSpent, auction.currency_symbol)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Players Sold</span>
              <span className="font-bold text-emerald-400 text-sm">{soldPlayers.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Unsold</span>
              <span className="font-bold text-red-400 text-sm">{unsoldPlayers.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Remaining</span>
              <span className="font-bold text-slate-300 text-sm">{upcomingPlayers.length}</span>
            </div>
          </div>

          {/* Top Buys Section */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Flame className="w-4 h-4" />
              <span>Highest Priced Signings</span>
            </h4>
            
            {topBuys.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No players sold yet</p>
            ) : (
              <div className="space-y-2">
                {topBuys.map((player, idx) => {
                  const winnerTeam = teams.find(t => t.id === player.sold_to_team_id);
                  return (
                    <div 
                      key={player.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <span className="font-mono font-bold text-amber-400 w-4">#{idx + 1}</span>
                        <img 
                          src={player.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60'} 
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                        />
                        <div className="truncate">
                          <span className="font-bold text-white block truncate">{player.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {formatRole(player.role)} • Bought by {winnerTeam?.name || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      <span className="font-mono font-black text-amber-400 text-sm shrink-0 ml-2">
                        {formatCurrency(player.sold_price || 0, auction.currency_symbol)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team Standings / Purse Leaderboard */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Team Purse & Squad Standings
            </h4>
            <div className="space-y-2">
              {teams.map(team => {
                const teamPlayers = players.filter(p => p.sold_to_team_id === team.id);
                const spent = team.purse_total - team.purse_remaining;

                return (
                  <div key={team.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px]"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.short_code}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{team.name}</span>
                        <span className="text-[10px] text-slate-400">Squad: {teamPlayers.length} players</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400 block">
                        Purse Left: {formatCurrency(team.purse_remaining, auction.currency_symbol)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Spent: {formatCurrency(spent, auction.currency_symbol)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080d19] flex items-center justify-between shrink-0">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition active:scale-95 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

