import React, { useState } from 'react';
import { 
  Gavel, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Sliders, 
  Settings, 
  Users, 
  FileDown, 
  ShieldAlert,
  Edit,
  ArrowRight,
  Clock,
  Plus,
  Zap
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { exportAuctionToCSV } from '../../lib/exportCsv';

interface AdminControlBarProps {
  onOpenPlayerPicker: () => void;
  onOpenManagePlayers: () => void;
  onOpenManageTeams: () => void;
  onOpenManualOverride: () => void;
  onOpenSettings: () => void;
}

export const AdminControlBar: React.FC<AdminControlBarProps> = ({
  onOpenPlayerPicker,
  onOpenManagePlayers,
  onOpenManageTeams,
  onOpenManualOverride,
  onOpenSettings
}) => {
  const { 
    auction, 
    currentPlayer, 
    highestBidderTeam, 
    userSession, 
    players, 
    teams,
    markSold, 
    markUnsold, 
    togglePauseResume, 
    resetTimer,
    startPlayerAuction,
    setTimerDuration,
    addSecondsToTimer,
    isAutoAdvance,
    setIsAutoAdvance,
    endAuction
  } = useAuction();

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmUnsold, setConfirmUnsold] = useState(false);

  if (!userSession?.isAdmin) {
    return null;
  }

  const isLive = auction?.status === 'LIVE';
  const isPaused = auction?.status === 'PAUSED';
  const hasCurrentPlayer = Boolean(currentPlayer);
  const hasBids = (auction?.current_bid || 0) > 0 && Boolean(auction?.current_bidder_team_id);

  // Mark Sold Handler
  const handleMarkSold = async () => {
    if (!hasBids) return;
    setActionLoading(true);
    await markSold();
    setActionLoading(false);
  };

  // Mark Unsold Handler
  const handleMarkUnsold = async () => {
    if (!confirmUnsold && hasBids) {
      setConfirmUnsold(true);
      setTimeout(() => setConfirmUnsold(false), 4000);
      return;
    }
    setActionLoading(true);
    await markUnsold();
    setActionLoading(false);
    setConfirmUnsold(false);
  };

  // Call Next Upcoming Player automatically
  const handleNextUpcomingPlayer = async () => {
    const nextPlayer = players.find(p => p.status === 'UPCOMING');
    if (nextPlayer) {
      await startPlayerAuction(nextPlayer.id);
    } else {
      onOpenPlayerPicker();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (auction) {
      exportAuctionToCSV(auction, players, teams);
    }
  };

  return (
    <div className="sticky bottom-0 z-30 bg-[#070b15]/95 backdrop-blur-md border-t-2 border-amber-500/40 p-3 sm:p-4 shadow-[0_-10px_35px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Admin Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
              ADMIN CONTROL DOCK
            </span>
            <span className="text-[10px] text-slate-400">
              {hasCurrentPlayer 
                ? `Auctioning: ${currentPlayer?.name}` 
                : 'Stage Empty - Ready to call player'}
            </span>
          </div>
        </div>

        {/* Center: Primary Hammer and Stage Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {hasCurrentPlayer ? (
            <>
              {/* SOLD BUTTON (Requires at least 1 bid) */}
              <button
                onClick={handleMarkSold}
                disabled={!hasBids || actionLoading}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-display font-black text-xs shadow-lg transition active:scale-95 cursor-pointer ${
                  hasBids
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-black shadow-emerald-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Gavel className="w-4 h-4" />
                <span>HAMMER: SOLD!</span>
              </button>

              {/* UNSOLD BUTTON */}
              <button
                onClick={handleMarkUnsold}
                disabled={actionLoading}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition active:scale-95 cursor-pointer ${
                  confirmUnsold
                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>{confirmUnsold ? 'Confirm Unsold?' : 'Mark Unsold'}</span>
              </button>

              {/* PAUSE / RESUME */}
              <button
                onClick={togglePauseResume}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              {/* RESET TIMER */}
              <button
                onClick={resetTimer}
                title="Restart countdown clock to full duration"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
              </button>

              {/* QUICK +10s TIMER EXTEND */}
              <button
                onClick={() => addSecondsToTimer(10)}
                title="Add 10 seconds to active countdown"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>10s</span>
              </button>
            </>
          ) : (
            /* CALL NEXT PLAYER BUTTON / START AUCTION */
            <button
              onClick={handleNextUpcomingPlayer}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-black font-extrabold text-xs shadow-[0_0_25px_rgba(245,158,11,0.5)] transition active:scale-95 cursor-pointer ring-1 ring-amber-300"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{auction?.status === 'WAITING' || !currentPlayer ? '🚀 START AUCTION' : 'Call Next Player'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Quick Timer Presets Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={auction?.timer_seconds || 15}
              onChange={e => setTimerDuration(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold text-xs focus:outline-none cursor-pointer"
              title="Change default countdown timer per player"
            >
              <option value={5} className="bg-slate-900 text-white">⏱️ 5s</option>
              <option value={10} className="bg-slate-900 text-white">⏱️ 10s</option>
              <option value={15} className="bg-slate-900 text-white">⏱️ 15s (Default)</option>
              <option value={20} className="bg-slate-900 text-white">⏱️ 20s</option>
              <option value={25} className="bg-slate-900 text-white">⏱️ 25s</option>
              <option value={30} className="bg-slate-900 text-white">⏱️ 30s</option>
            </select>
          </div>

          {/* Auto-Next Player Toggle */}
          <button
            onClick={() => setIsAutoAdvance(!isAutoAdvance)}
            title="Automatically bring next upcoming player to auction after sold/unsold"
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isAutoAdvance
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Next:</span>
            <span>{isAutoAdvance ? 'ON' : 'OFF'}</span>
          </button>

          {/* Player Picker / Roster Selector */}
          <button
            onClick={onOpenPlayerPicker}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            <span>Roster</span>
          </button>
        </div>

        {/* Right: Management & Overrides Menu */}
        <div className="flex items-center space-x-2">
          
          {/* Manual Override */}
          <button
            onClick={onOpenManualOverride}
            title="Undo sold, re-assign team, restore purse"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-amber-300 border border-amber-500/30 transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Override</span>
          </button>

          {/* Manage Players */}
          <button
            onClick={onOpenManagePlayers}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Players</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Auction Settings & Rules"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
            title="Export Auction Results to CSV"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* End Auction */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to end the auction? This will conclude bidding and finalize all squads.')) {
                endAuction();
              }
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-xs text-red-300 border border-red-500/30 transition cursor-pointer font-bold"
            title="End Auction & Finalize Squads"
          >
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">End</span>
          </button>

        </div>

      </div>
    </div>
  );
};

