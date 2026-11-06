import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Clock, 
  Users, 
  Trophy, 
  Settings, 
  Edit3, 
  FileDown, 
  Sparkles, 
  Zap, 
  Sliders,
  CheckCircle,
  Database,
  ShieldCheck,
  Plus,
  UserX,
  XCircle
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { exportAuctionToCSV } from '../../lib/exportCsv';
import { formatCurrency, formatRole } from '../../lib/formatters';

interface AdminCockpitViewProps {
  onOpenPlayerPicker: () => void;
  onOpenManagePlayers: () => void;
  onOpenManageTeams: () => void;
  onOpenManualOverride: () => void;
  onOpenSettings: () => void;
  onOpenSupabaseConfig: () => void;
  onSwitchToArena: () => void;
}

export const AdminCockpitView: React.FC<AdminCockpitViewProps> = ({
  onOpenPlayerPicker,
  onOpenManagePlayers,
  onOpenManageTeams,
  onOpenManualOverride,
  onOpenSettings,
  onOpenSupabaseConfig,
  onSwitchToArena
}) => {
  const { 
    auction, 
    currentPlayer, 
    userSession, 
    players, 
    teams,
    togglePauseResume, 
    resetTimer,
    startPlayerAuction,
    setTimerDuration,
    addSecondsToTimer,
    isAutoAdvance,
    setIsAutoAdvance,
    markSold,
    markUnsold,
    kickParticipant,
    endAuction
  } = useAuction();

  const [copiedPin, setCopiedPin] = useState(false);

  if (!userSession?.isAdmin) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="font-display font-black text-xl text-white">Admin Access Only</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          You are currently in spectator or team owner mode. Room creators have full access to auction controls.
        </p>
      </div>
    );
  }

  const isLive = auction?.status === 'LIVE';
  const hasCurrentPlayer = Boolean(currentPlayer);
  const nextPlayer = players.find(p => p.status === 'UPCOMING');
  const timerPresets = [5, 10, 15, 20, 25, 30];

  const handleNextUpcomingPlayer = async () => {
    if (nextPlayer) {
      await startPlayerAuction(nextPlayer.id);
      onSwitchToArena();
    } else {
      onOpenPlayerPicker();
    }
  };

  const copyPin = () => {
    if (!auction?.admin_pin) return;
    navigator.clipboard.writeText(auction.admin_pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-[#0e162e] border border-amber-500/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-black shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-black text-sm text-white">Room Admin Cockpit</h2>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span>Room: <strong className="text-amber-400 font-mono">{auction?.room_code}</strong></span>
              <span>•</span>
              <button 
                onClick={copyPin}
                className="text-[10px] text-slate-300 hover:text-white underline cursor-pointer"
              >
                PIN: {auction?.admin_pin || '1234'} {copiedPin ? '(Copied!)' : ''}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onSwitchToArena}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow transition active:scale-95 cursor-pointer flex items-center space-x-1"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Live Arena</span>
        </button>
      </div>

      {/* SECTION 1: Active Stage Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Active Stage Status</span>
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            isLive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          }`}>
            {auction?.status || 'IDLE'}
          </span>
        </div>

        {hasCurrentPlayer ? (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Currently Bidding</span>
              <span className="font-display font-black text-sm text-white">{currentPlayer?.name}</span>
              <span className="text-[11px] text-amber-400 block font-mono">
                Current Bid: {formatCurrency(auction?.current_bid || 0, auction?.currency_symbol)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => markSold()}
                disabled={(auction?.current_bid || 0) === 0}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-extrabold shadow disabled:opacity-40 cursor-pointer active:scale-95"
              >
                Hammer Sold
              </button>
              <button
                onClick={() => markUnsold()}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold hover:bg-red-500/30 cursor-pointer active:scale-95"
              >
                Unsold
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              {nextPlayer?.image_url && (
                <img 
                  src={nextPlayer.image_url} 
                  alt={nextPlayer.name} 
                  className="w-10 h-10 rounded-xl object-cover object-top border border-amber-400"
                />
              )}
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  {auction?.status === 'WAITING' ? '1st Player Ready' : 'Next in Line'}
                </span>
                <span className="text-xs font-black text-white">{nextPlayer ? nextPlayer.name : 'All Players Auctioned'}</span>
              </div>
            </div>
            <button
              onClick={handleNextUpcomingPlayer}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-black text-xs font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer active:scale-95 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{auction?.status === 'WAITING' ? '🚀 START AUCTION' : `Call ${nextPlayer?.name?.split(' ')[0] || 'Next'}`}</span>
            </button>
          </div>
        )}

        {/* Play/Pause & Reset Clock */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={togglePauseResume}
            className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95 ${
              auction?.status === 'PAUSED'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
            }`}
          >
            {auction?.status === 'PAUSED' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{auction?.status === 'PAUSED' ? 'Resume Auction' : 'Pause Auction'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Clock</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Live Timer Settings & Bump */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Timer Control ({auction?.timer_seconds}s)</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ⚡ Auto-Sold at 0s Active
          </span>
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 block font-semibold">Change Player Countdown Duration:</span>
          <div className="grid grid-cols-5 gap-1.5">
            {timerPresets.map(sec => (
              <button
                key={sec}
                onClick={() => setTimerDuration(sec)}
                className={`py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                  auction?.timer_seconds === sec
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Live +10s / -5s Bumps */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => addSecondsToTimer(10)}
            className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center space-x-1 transition active:scale-95 cursor-pointer"
          >
            <span>+10s to Live Clock</span>
          </button>
          <button
            onClick={() => addSecondsToTimer(-5)}
            className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold flex items-center justify-center space-x-1 transition active:scale-95 cursor-pointer"
          >
            <span>-5s from Live Clock</span>
          </button>
        </div>

        {/* Auto-Advance Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-xs font-bold text-white block">Auto-Advance Next Player</span>
            <span className="text-[10px] text-slate-400">Automatically call next player 4.5s after hammer</span>
          </div>
          <button
            onClick={() => setIsAutoAdvance(!isAutoAdvance)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              isAutoAdvance ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              isAutoAdvance ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* SECTION 3: Roster & Auction Actions */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center space-x-1.5">
          <Settings className="w-3.5 h-3.5" />
          <span>Rosters & Management</span>
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenManagePlayers}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-xs font-bold text-white block">Players Pool</span>
            <span className="text-[10px] text-slate-400">{players.length} players listed</span>
          </button>

          <button
            onClick={onOpenManageTeams}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-xs font-bold text-white block">Teams & Budgets</span>
            <span className="text-[10px] text-slate-400">{teams.length} teams registered</span>
          </button>

          <button
            onClick={onOpenManualOverride}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-yellow-400 mb-1" />
            <span className="text-xs font-bold text-white block">Manual Override</span>
            <span className="text-[10px] text-slate-400">Edit sold price / team</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-xs font-bold text-white block">Auction Rules</span>
            <span className="text-[10px] text-slate-400">Increments & squads</span>
          </button>
        </div>

        {/* Secondary actions: Export CSV */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => auction && exportAuctionToCSV(auction, players, teams)}
            className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Export Auction Results to CSV</span>
          </button>
        </div>

        {/* End Auction & Database Config */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to end the auction? This will conclude bidding and finalize all team squads.')) {
                endAuction();
              }
            }}
            className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>End Auction</span>
          </button>

          <button
            onClick={onOpenSupabaseConfig}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Database Config</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: Active Participants & Kick Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Room Participants ({teams.filter(t => t.is_claimed && t.owner_name).length}/10 Teams Claimed)</span>
          </span>
        </div>

        <div className="space-y-2">
          {teams.filter(t => t.is_claimed && t.owner_name).length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-400">
              No participants have claimed a team yet. Share your room code <strong className="text-amber-400 font-mono">{auction?.room_code}</strong> with friends.
            </div>
          ) : (
            teams.filter(t => t.is_claimed && t.owner_name).map(t => {
              const isMe = t.id === userSession?.teamId;
              return (
                <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.short_code}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="font-extrabold text-xs text-white truncate">{t.name}</span>
                        {isMe && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/30">
                            YOU (HOST)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">Leader: {t.owner_name}</span>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Kick ${t.owner_name} from ${t.name}? This frees up the team for other friends.`)) {
                          kickParticipant(t.id);
                        }
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Kick</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
