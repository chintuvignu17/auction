import React from 'react';
import { Pin, Zap } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency } from '../../lib/formatters';

export const LiveBidFeed: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { bids, teams, lastAuctionedResult, auction } = useAuction();

  return (
    <div className={`rounded-2xl bg-[#0a0f20]/90 border border-slate-800 p-3.5 sm:p-4 shadow-xl flex flex-col ${
      compact ? 'h-[280px]' : 'min-h-[460px] h-full'
    } overflow-hidden`}>
      
      {/* Header with live pulse */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="relative w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <h3 className="font-display font-extrabold text-xs text-white tracking-wider uppercase">
            Live Bids Feed
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'}
        </span>
      </div>

      {/* Pinned Card: Last Auctioned Player (Pinned up to next player auction completes) */}
      {lastAuctionedResult && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-cyan-500/10 border border-amber-500/40 text-xs shadow-md shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-amber-400 tracking-wider">
              <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>PINNED • LAST AUCTIONED</span>
            </div>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
              lastAuctionedResult.status === 'SOLD' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}>
              {lastAuctionedResult.status === 'SOLD' ? '🔨 SOLD' : '❌ UNSOLD'}
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
              <img 
                src={lastAuctionedResult.player.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60'} 
                alt={lastAuctionedResult.player.name}
                className="w-full h-full object-cover object-top" 
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-white text-xs truncate">
                {lastAuctionedResult.player.name}
              </div>
              {lastAuctionedResult.status === 'SOLD' && lastAuctionedResult.team ? (
                <div className="text-[11px] text-slate-300 flex items-center space-x-1.5 truncate mt-0.5">
                  <span className="font-extrabold text-amber-400">
                    {formatCurrency(lastAuctionedResult.price || 0, auction?.currency_symbol)}
                  </span>
                  <span className="text-slate-500">to</span>
                  <span className="font-black" style={{ color: lastAuctionedResult.team.color }}>
                    {lastAuctionedResult.team.short_code}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    (Leader: {lastAuctionedResult.leaderName || lastAuctionedResult.team.owner_name || 'Captain'})
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-red-300 mt-0.5">
                  Passed Unsold (Base: {formatCurrency(lastAuctionedResult.player.base_price, auction?.currency_symbol)})
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Live Bids Only */}
      <div className="flex-1 overflow-y-auto space-y-2 pt-2.5 pr-0.5">
        {bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-xs italic space-y-1">
            <Zap className="w-5 h-5 opacity-30 text-amber-400" />
            <span>No bids placed yet in this round</span>
          </div>
        ) : (
          bids.map((bid) => {
            const bidderTeam = teams.find(t => t.id === bid.team_id);
            const teamColor = bidderTeam?.color || '#3b82f6';
            const teamCode = bidderTeam?.short_code || 'BID';
            const teamName = bidderTeam?.name || 'IPL Team';

            return (
              <div 
                key={bid.id}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] transition hover:border-slate-700 flex items-center justify-between gap-2"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shadow shrink-0"
                    style={{ backgroundColor: teamColor }}
                  >
                    {teamCode}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white text-xs truncate block">
                      {teamName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      bidder: {bid.bidder_name}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-display font-extrabold text-xs text-amber-400">
                    {formatCurrency(bid.amount, auction?.currency_symbol)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(bid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
