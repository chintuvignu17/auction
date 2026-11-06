import React, { useState } from 'react';
import { Search, Trophy, Play, CheckCircle, XCircle, Clock, Filter, Zap } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency, formatRole, getRoleBadgeClass } from '../../lib/formatters';
import { PlayerStatus, PlayerRole } from '../../types/auction';

interface PlayerPoolViewProps {
  onCallPlayer?: (playerId: string) => void;
}

export const PlayerPoolView: React.FC<PlayerPoolViewProps> = ({ onCallPlayer }) => {
  const { players, teams, auction, userSession, startPlayerAuction, updatePlayer } = useAuction();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PlayerStatus>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | PlayerRole>('ALL');

  const unsoldPlayers = players.filter(p => p.status === 'UNSOLD');

  const handleStartAcceleratedRound = async () => {
    for (const player of unsoldPlayers) {
      await updatePlayer({
        ...player,
        status: 'UPCOMING'
      });
    }
  };

  // Filter players
  const filtered = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.role.toLowerCase().includes(search.toLowerCase()) ||
                          (p.country && p.country.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleStartAuction = async (playerId: string) => {
    if (onCallPlayer) {
      onCallPlayer(playerId);
    } else {
      await startPlayerAuction(playerId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-lg text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Cricket Player Pool ({filtered.length} Players)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Browse upcoming, sold, and unsold players in the auction draft
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players, roles..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Pills */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          {(['ALL', 'UPCOMING', 'SOLD', 'UNSOLD'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                statusFilter === st 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Role Pills */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          {(['ALL', 'BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'] as const).map(rl => (
            <button
              key={rl}
              onClick={() => setRoleFilter(rl)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                roleFilter === rl 
                  ? 'bg-slate-700 text-cyan-300' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {rl === 'ALL' ? 'All Roles' : formatRole(rl)}
            </button>
          ))}
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 italic">
            No players match the current filters.
          </div>
        ) : (
          filtered.map((player) => {
            const roleBadge = getRoleBadgeClass(player.role);
            const winningTeam = player.sold_to_team_id 
              ? teams.find(t => t.id === player.sold_to_team_id) 
              : null;

            const isUpcoming = player.status === 'UPCOMING';
            const isSold = player.status === 'SOLD';
            const isUnsold = player.status === 'UNSOLD';
            const isInAuction = player.status === 'IN_AUCTION';

            return (
              <div 
                key={player.id}
                className={`relative bg-[#0b1326] border rounded-2xl p-4 flex flex-col justify-between transition hover:border-slate-600 shadow-md ${
                  isInAuction ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Top: Role & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                      {formatRole(player.role)}
                    </span>

                    {/* Status Badge */}
                    {isSold ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        <span>SOLD</span>
                      </span>
                    ) : isUnsold ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        <XCircle className="w-3 h-3" />
                        <span>UNSOLD</span>
                      </span>
                    ) : isInAuction ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>LIVE NOW</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        UPCOMING
                      </span>
                    )}
                  </div>

                  {/* Player Photo & Details */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                      <img 
                        src={player.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60'} 
                        alt={player.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-white text-sm truncate">{player.name}</h4>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {player.country || 'India'}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {player.batting_style || 'Right-hand bat'}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-900 mb-3 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Base Price:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {formatCurrency(player.base_price, auction?.currency_symbol)}
                      </span>
                    </div>

                    {isSold && player.sold_price && (
                      <div className="flex justify-between items-center text-emerald-400 font-bold pt-1 border-t border-slate-900">
                        <span>Sold For:</span>
                        <span className="font-mono">
                          {formatCurrency(player.sold_price, auction?.currency_symbol)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Winning Team Banner */}
                  {isSold && winningTeam && (
                    <div 
                      className="p-2 rounded-lg border flex items-center space-x-2 text-xs font-bold text-white mb-2"
                      style={{ backgroundColor: `${winningTeam.color}20`, borderColor: `${winningTeam.color}50` }}
                    >
                      {winningTeam.logo_url ? (
                        <img src={winningTeam.logo_url} alt={winningTeam.short_code} className="w-4 h-4 object-contain shrink-0" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: winningTeam.color }} />
                      )}
                      <span className="truncate">{winningTeam.name}</span>
                    </div>
                  )}
                </div>

                {/* Admin Call to Stage Button */}
                {userSession?.isAdmin && !isInAuction && (
                  <button
                    onClick={() => handleStartAuction(player.id)}
                    className="w-full py-1.5 mt-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-black text-slate-300 font-bold text-xs border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Call to Stage</span>
                  </button>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

