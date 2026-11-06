import React, { useState } from 'react';
import { Users, Wallet, Trophy, ChevronDown, ChevronUp, Shield, UserX } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency, formatRole, getRoleBadgeClass } from '../../lib/formatters';

export const TeamSquadsView: React.FC = () => {
  const { teams, players, auction, userSession, kickParticipant } = useAuction();
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId(prev => (prev === teamId ? null : teamId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-extrabold text-lg text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Team Purses & Squad Rosters</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time tracking of team budgets, remaining funds, and acquired players
          </p>
        </div>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((team) => {
          const teamPlayers = players.filter(p => p.sold_to_team_id === team.id);
          const spent = team.purse_total - team.purse_remaining;
          const spentPct = Math.min(100, Math.round((spent / team.purse_total) * 100));
          const isExpanded = expandedTeamId === team.id;

          return (
            <div 
              key={team.id}
              className="bg-[#0b1326] border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                {/* Team Header */}
                <div className="flex items-center justify-between space-x-2 mb-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0 bg-slate-950 border border-slate-800 p-1"
                    >
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.short_code} className="w-9 h-9 object-contain" />
                      ) : (
                        <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ backgroundColor: team.color }}>
                          {team.short_code}
                        </div>
                      )}
                    </div>
                    <div className="truncate min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">{team.name}</h3>
                      <span className="text-[10px] text-slate-400 block truncate">
                        Owner: {team.owner_name || 'Unclaimed'}
                      </span>
                    </div>
                  </div>

                  {userSession?.isAdmin && team.is_claimed && team.owner_name && team.id !== userSession?.teamId && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Kick ${team.owner_name} from ${team.name}?`)) {
                          kickParticipant(team.id);
                        }
                      }}
                      title={`Kick ${team.owner_name}`}
                      className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Purse Status */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-900 mb-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Remaining:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatCurrency(team.purse_remaining, auction?.currency_symbol)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Spent: {formatCurrency(spent, auction?.currency_symbol)}</span>
                    <span>Total: {formatCurrency(team.purse_total, auction?.currency_symbol)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${spentPct}%`,
                        backgroundColor: team.color 
                      }}
                    />
                  </div>
                </div>

                {/* Squad Count & Role Distribution */}
                <div className="flex items-center justify-between text-xs px-1 mb-2">
                  <span className="text-slate-400">
                    Squad: <strong className="text-white">{teamPlayers.length}</strong> / {auction?.max_players_per_team || 15}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    {spentPct}% Purse Used
                  </span>
                </div>
              </div>

              {/* Collapsible Squad List */}
              <div className="border-t border-slate-800/80 pt-2.5 mt-2">
                <button
                  onClick={() => toggleExpand(team.id)}
                  className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition py-1 cursor-pointer"
                >
                  <span className="font-semibold">
                    {teamPlayers.length === 0 ? 'No players yet' : `View ${teamPlayers.length} Players`}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && teamPlayers.length > 0 && (
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {teamPlayers.map(p => {
                      const badge = getRoleBadgeClass(p.role);
                      return (
                        <div 
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-900 text-xs"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${badge.bg} ${badge.text}`}>
                              {p.role[0]}
                            </span>
                            <span className="font-medium text-slate-200 truncate">{p.name}</span>
                          </div>
                          <span className="font-mono font-bold text-amber-400 text-[11px] shrink-0 ml-2">
                            {formatCurrency(p.sold_price || 0, auction?.currency_symbol)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

