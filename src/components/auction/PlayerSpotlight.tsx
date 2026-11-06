import React from 'react';
import { 
  Trophy, 
  TrendingUp, 
  MapPin,
  Sparkles,
  Zap,
  Gavel,
  Flame,
  Play,
  Pause,
  Plus,
  SkipForward,
  ShieldCheck,
  ArrowRight,
  Clock,
  Users
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency, formatRole, getRoleBadgeClass } from '../../lib/formatters';
import { CountdownTimer } from './CountdownTimer';

interface PlayerSpotlightProps {
  onOpenPlayerPicker: () => void;
}

export const PlayerSpotlight: React.FC<PlayerSpotlightProps> = ({ onOpenPlayerPicker }) => {
  const { 
    auction, 
    currentPlayer, 
    highestBidderTeam, 
    userSession,
    players,
    togglePauseResume,
    addSecondsToTimer,
    startPlayerAuction,
    markSold
  } = useAuction();

  // If auction is completed
  if (auction?.status === 'COMPLETED') {
    return (
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#090f1f] to-[#060913] border-2 border-emerald-500/50 p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[300px] shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden">
        <div className="relative z-10 max-w-lg w-full space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
              AUCTION CONCLUDED! 🏆
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              All 10 IPL franchises have completed their bidding. Explore final squad rosters and team purses in the Squads tab.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If no player is in active bidding
  if (!currentPlayer) {
    // Find next upcoming player
    const nextPlayer = players.find(p => p.status === 'UPCOMING');

    return (
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#090f1f] to-[#060913] border-2 border-amber-500/50 p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[300px] shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {userSession?.isAdmin ? (
          /* ========================================================
             ADMIN MASTER STAGE: BIG UNMISSABLE START AUCTION PANEL
             ======================================================== */
          <div className="relative z-10 max-w-lg w-full space-y-4 animate-fadeIn">
            
            {/* Header Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest shadow-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Auction Command Center</span>
            </div>

            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
                {auction?.status === 'WAITING' ? 'IPL Auction Ready to Start!' : 'Stage Empty — Call Next Player'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                {auction?.status === 'WAITING' 
                  ? 'Click the button below to bring the 1st player to the auction stage and begin live bidding!'
                  : 'Call the next upcoming star or browse the roster to select a specific player.'}
              </p>
            </div>

            {/* Next Player Preview Box */}
            {nextPlayer ? (
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow-inner flex items-center justify-between gap-3 text-left">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border-2 border-amber-400/60 shadow shrink-0">
                    <img 
                      src={nextPlayer.image_url || '/images/players/virat-kohli.webp'} 
                      alt={nextPlayer.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block truncate">
                      {auction?.status === 'WAITING' ? '1st Player to Auction' : 'Next in Line'}
                    </span>
                    <h3 className="font-display font-black text-base text-white truncate">
                      {nextPlayer.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {formatRole(nextPlayer.role)} • Base: <strong className="text-emerald-400 font-mono">{formatCurrency(nextPlayer.base_price, auction?.currency_symbol)}</strong>
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                    Ready
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
                All registered players have been auctioned!
              </div>
            )}

            {/* UNMISSABLE GIANT START AUCTION BUTTON */}
            {nextPlayer && (
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => startPlayerAuction(nextPlayer.id)}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-display font-black text-sm sm:text-base tracking-wide shadow-[0_0_35px_rgba(245,158,11,0.5)] transition active:scale-98 cursor-pointer ring-2 ring-amber-300/50"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START AUCTION: Call {nextPlayer.name.split(' ')[0]} to Stage</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={onOpenPlayerPicker}
                  className="w-full sm:w-auto px-4 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
                  title="Pick a different player from the pool"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Choose Other Player</span>
                </button>
              </div>
            )}

          </div>
        ) : (
          /* ========================================================
             PARTICIPANT / VIEWER WAITING SCREEN
             ======================================================== */
          <div className="relative z-10 max-w-sm space-y-3 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>
            <h2 className="font-display font-black text-xl text-white">
              Waiting for Room Host
            </h2>
            <p className="text-xs text-slate-400">
              The auction admin will call the first player to stage shortly. Get your team budget ready!
            </p>
            {nextPlayer && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-mono font-bold">
                Next in line: {nextPlayer.name} ({formatRole(nextPlayer.role)})
              </div>
            )}
          </div>
        )}

      </div>
    );
  }

  const roleBadge = getRoleBadgeClass(currentPlayer.role);
  const currentBid = auction?.current_bid || 0;
  const isBiddingStarted = currentBid > 0;
  const pctOverBase = isBiddingStarted 
    ? Math.round(((currentBid - currentPlayer.base_price) / currentPlayer.base_price) * 100) 
    : 0;

  // Next player for admin quick advance
  const nextPlayer = players.find(p => p.status === 'UPCOMING' && p.id !== currentPlayer.id);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#0e162b] to-[#090e1c] border border-amber-500/25 p-3.5 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden space-y-3">
      
      {/* Background glow flares */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Role badge, Country & Countdown Timer */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
            {formatRole(currentPlayer.role)}
          </span>
          <span className="flex items-center space-x-1 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span>{currentPlayer.country || 'India'}</span>
          </span>
        </div>

        {/* Live Timer */}
        <CountdownTimer />
      </div>

      {/* Main Player Display: Avatar + Info + Current Highest Bid */}
      <div className="relative z-10 flex items-stretch gap-3">
        
        {/* Left: Player Avatar */}
        <div className="shrink-0 relative">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-400/50 shadow-xl">
            {currentPlayer.image_url ? (
              <img 
                src={currentPlayer.image_url} 
                alt={currentPlayer.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                <Trophy className="w-10 h-10 text-amber-500/40 mb-1" />
                <span className="text-[9px] font-bold uppercase text-slate-400">Cricket Star</span>
              </div>
            )}

            {/* Stage micro tag */}
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-amber-500/90 text-black text-[8px] font-black uppercase tracking-wider flex items-center space-x-0.5 shadow">
              <Flame className="w-2.5 h-2.5" />
              <span>LIVE</span>
            </div>
          </div>
        </div>

        {/* Right: Player Name, Base Price & CURRENT HIGHEST BID */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h1 className="font-display font-black text-lg sm:text-xl text-white tracking-wide truncate">
              {currentPlayer.name}
            </h1>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span>Base: <strong className="text-slate-200 font-mono">{formatCurrency(currentPlayer.base_price, auction?.currency_symbol)}</strong></span>
              {currentPlayer.batting_style && (
                <span className="text-slate-500">• {currentPlayer.batting_style}</span>
              )}
            </div>
          </div>

          {/* Current Bid Display Box */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-2 sm:p-2.5 shadow-inner mt-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-extrabold uppercase text-amber-400 flex items-center space-x-1 tracking-wider">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{isBiddingStarted ? 'HIGHEST BID' : 'STARTING BID'}</span>
              </span>
              {isBiddingStarted && pctOverBase > 0 && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  +{pctOverBase}%
                </span>
              )}
            </div>

            {/* Giant Gold Bid Figure */}
            <div className="font-display font-black text-xl sm:text-2xl text-amber-400 tracking-tight drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
              {isBiddingStarted 
                ? formatCurrency(currentBid, auction?.currency_symbol) 
                : formatCurrency(currentPlayer.base_price, auction?.currency_symbol)}
            </div>

            {/* Highest Bidding Team Chip */}
            <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between">
              {highestBidderTeam ? (
                <div className="flex items-center space-x-1.5 min-w-0">
                  {highestBidderTeam.logo_url ? (
                    <img src={highestBidderTeam.logo_url} alt={highestBidderTeam.short_code} className="w-5 h-5 object-contain shrink-0" />
                  ) : (
                    <div 
                      className="w-4 h-4 rounded flex items-center justify-center font-bold text-[9px] text-white shrink-0"
                      style={{ backgroundColor: highestBidderTeam.color }}
                    >
                      {highestBidderTeam.short_code}
                    </div>
                  )}
                  <span className="text-[11px] font-extrabold text-white truncate">
                    {highestBidderTeam.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    ({highestBidderTeam.owner_name})
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 italic">
                  Awaiting opening bid...
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Micro Stats Bar (Matches, Runs, Wickets, Strike Rate) */}
      {currentPlayer.custom_stats && (
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {currentPlayer.custom_stats.matches !== undefined && (
            <div className="py-1 px-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block leading-tight">Matches</span>
              <span className="font-mono font-bold text-white text-[11px]">{currentPlayer.custom_stats.matches}</span>
            </div>
          )}
          {currentPlayer.custom_stats.runs !== undefined && (
            <div className="py-1 px-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block leading-tight">Runs</span>
              <span className="font-mono font-bold text-amber-400 text-[11px]">{currentPlayer.custom_stats.runs}</span>
            </div>
          )}
          {currentPlayer.custom_stats.wickets !== undefined && (
            <div className="py-1 px-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block leading-tight">Wickets</span>
              <span className="font-mono font-bold text-emerald-400 text-[11px]">{currentPlayer.custom_stats.wickets}</span>
            </div>
          )}
          {currentPlayer.custom_stats.strike_rate !== undefined && (
            <div className="py-1 px-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block leading-tight">Strike Rate</span>
              <span className="font-mono font-bold text-cyan-400 text-[11px]">{currentPlayer.custom_stats.strike_rate}</span>
            </div>
          )}
        </div>
      )}

      {/* Admin Fast In-Stage Actions Bar */}
      {userSession?.isAdmin && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => addSecondsToTimer(10)}
              title="Add 10 seconds to clock"
              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition cursor-pointer active:scale-95"
            >
              +10s Clock
            </button>
            <button
              onClick={togglePauseResume}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition cursor-pointer active:scale-95 flex items-center space-x-1 ${
                auction?.status === 'PAUSED'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
              }`}
            >
              {auction?.status === 'PAUSED' ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
              <span>{auction?.status === 'PAUSED' ? 'Resume' : 'Pause'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-1.5">
            {isBiddingStarted && (
              <button
                onClick={() => markSold()}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-black text-[10px] font-black shadow transition active:scale-95 cursor-pointer flex items-center space-x-1"
              >
                <Gavel className="w-2.5 h-2.5" />
                <span>Hammer Sold</span>
              </button>
            )}
            {nextPlayer && (
              <button
                onClick={() => startPlayerAuction(nextPlayer.id)}
                title={`Next: ${nextPlayer.name}`}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold transition cursor-pointer active:scale-95 flex items-center space-x-1"
              >
                <span>Next</span>
                <SkipForward className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
