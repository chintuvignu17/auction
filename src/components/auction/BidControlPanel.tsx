import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Wallet, 
  Users, 
  ShieldCheck,
  LogIn,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency } from '../../lib/formatters';

interface BidControlPanelProps {
  onOpenJoinModal: () => void;
}

export const BidControlPanel: React.FC<BidControlPanelProps> = ({ onOpenJoinModal }) => {
  const { 
    auction, 
    currentPlayer, 
    highestBidderTeam, 
    myTeam, 
    userSession, 
    nextValidBid, 
    placeBid, 
    players,
    teams,
    assignMyTeam,
    togglePauseResume,
    addSecondsToTimer,
    markSold,
    markUnsold,
    startPlayerAuction
  } = useAuction();

  const [customBidAmount, setCustomBidAmount] = useState<string>('');
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showClaimTeamDropdown, setShowClaimTeamDropdown] = useState(false);

  // If no current player or not live/paused
  if (!currentPlayer || (auction?.status !== 'LIVE' && auction?.status !== 'PAUSED')) {
    const nextPlayer = players.find(p => p.status === 'UPCOMING');

    return (
      <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400">
        {userSession?.isAdmin ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="font-extrabold text-amber-300 block text-xs truncate">
                  {auction?.status === 'WAITING' ? 'Stage Ready — Start Auction' : 'Stage Waiting for Next Player'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {nextPlayer ? `Next: ${nextPlayer.name}` : 'Draft pool completed'}
                </span>
              </div>
            </div>

            {nextPlayer && (
              <button
                type="button"
                onClick={() => startPlayerAuction(nextPlayer.id)}
                className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Call {nextPlayer.name.split(' ')[0]}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-400 truncate">
              {nextPlayer ? `Next: ${nextPlayer.name}` : 'Waiting for live player...'}
            </div>
            {nextPlayer && (
              <button
                type="button"
                onClick={() => startPlayerAuction(nextPlayer.id)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow transition active:scale-95 cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Call {nextPlayer.name.split(' ')[0]}</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // If Host chose to be a Spectator / Auctioneer (Admin without a team)
  if (userSession?.isAdmin && !myTeam) {
    const hasBids = (auction?.current_bid || 0) > 0 && Boolean(auction?.current_bidder_team_id);

    return (
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-[#0b1328] border border-amber-500/30 rounded-2xl p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-amber-300 flex items-center space-x-1.5">
                <span>Room Host & Auctioneer Dock</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  Spectating
                </span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Presiding over the auction. Bidding is open for participating team owners.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowClaimTeamDropdown(!showClaimTeamDropdown)}
            className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer shrink-0 ml-2"
          >
            {showClaimTeamDropdown ? 'Hide Teams' : 'Participate & Bid'}
          </button>
        </div>

        {/* Quick Auctioneer Controls right inside dock */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => addSecondsToTimer(10)}
            className="py-2 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs transition cursor-pointer active:scale-95 flex items-center justify-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>+10s Clock</span>
          </button>

          <button
            type="button"
            onClick={togglePauseResume}
            className={`py-2 px-2.5 rounded-xl border font-extrabold text-xs transition cursor-pointer active:scale-95 flex items-center justify-center space-x-1 ${
              auction?.status === 'PAUSED'
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <span>{auction?.status === 'PAUSED' ? 'Resume' : 'Pause'}</span>
          </button>

          {hasBids ? (
            <button
              type="button"
              onClick={() => markSold()}
              className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs shadow transition cursor-pointer active:scale-95 flex items-center justify-center space-x-1"
            >
              <span>Hammer SOLD</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => markUnsold()}
              className="py-2 px-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-extrabold text-xs transition cursor-pointer active:scale-95 flex items-center justify-center space-x-1"
            >
              <span>Pass UNSOLD</span>
            </button>
          )}
        </div>

        {/* If host wants to jump in and pick an available team */}
        {showClaimTeamDropdown && (
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 animate-fadeIn">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              Claim an Available Team to Bid:
            </span>
            <select
              onChange={e => e.target.value && assignMyTeam(e.target.value)}
              defaultValue=""
              className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
            >
              <option value="" disabled>-- Pick Your Team to Participate --</option>
              {teams.filter(t => !t.is_claimed).map(t => (
                <option key={t.id} value={t.id}>
                  👑 Bid as {t.name} ({t.short_code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  // If User is a Spectator
  if (!myTeam || userSession?.role === 'VIEWER') {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-[#0e172e] to-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-xs text-white flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spectator Mode</span>
          </h4>
          <p className="text-[10px] text-slate-400">
            Join as a team owner to participate in live bidding.
          </p>
        </div>

        <button
          onClick={onOpenJoinModal}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow transition active:scale-95 cursor-pointer shrink-0"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Join Team</span>
        </button>
      </div>
    );
  }

  // Calculate my team squad size
  const myBoughtPlayers = players.filter(p => p.sold_to_team_id === myTeam.id);
  const isHighestBidder = highestBidderTeam?.id === myTeam.id;
  const isSquadFull = myBoughtPlayers.length >= (auction.max_players_per_team || 15);
  const canAffordNextBid = myTeam.purse_remaining >= nextValidBid;

  // Handle Quick Bid (1-click)
  const handleQuickBid = async (amount?: number) => {
    const targetAmount = amount || nextValidBid;
    setBiddingLoading(true);
    setFeedback(null);

    const res = await placeBid(targetAmount);
    setBiddingLoading(false);
    setFeedback({ success: res.success, message: res.message });

    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  // Handle Custom Bid Submit
  const handleCustomBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customBidAmount);
    if (!amount || isNaN(amount)) return;

    await handleQuickBid(amount);
    setCustomBidAmount('');
    setShowCustomInput(false);
  };

  // Increments for fast bidding buttons (+min increment, +50L, +1 Cr, +2 Cr)
  const increments = [
    { label: `+${formatCurrency(auction.min_bid_increment, auction.currency_symbol)}`, value: nextValidBid },
    { label: `+${formatCurrency(5000000, auction.currency_symbol)}`, value: (auction.current_bid || currentPlayer.base_price) + 5000000 },
    { label: `+${formatCurrency(10000000, auction.currency_symbol)}`, value: (auction.current_bid || currentPlayer.base_price) + 10000000 },
    { label: `+${formatCurrency(20000000, auction.currency_symbol)}`, value: (auction.current_bid || currentPlayer.base_price) + 20000000 },
  ];

  return (
    <div className="bg-gradient-to-b from-[#0b1328] to-[#070b16] border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3">
      
      {/* Top Banner: My Team Purse & Squad Status */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow shrink-0"
            style={{ backgroundColor: myTeam.color }}
          >
            {myTeam.short_code}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="font-extrabold text-xs text-white truncate">{myTeam.name}</span>
              {userSession?.isAdmin && (
                <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/40">
                  ADMIN
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-slate-400 flex items-center space-x-1">
                <Wallet className="w-3 h-3 text-emerald-400" />
                <strong className="text-emerald-400 font-mono font-bold">
                  {formatCurrency(myTeam.purse_remaining, auction.currency_symbol)}
                </strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-[10px]">
                Squad: <strong className="text-white">{myBoughtPlayers.length}</strong>/{auction.max_players_per_team}
              </span>
            </div>
          </div>
        </div>

        {/* State Indicator */}
        {isHighestBidder ? (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black animate-pulse shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>LEADING</span>
          </div>
        ) : !canAffordNextBid ? (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-black shrink-0">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>LOW PURSE</span>
          </div>
        ) : isSquadFull ? (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] font-black shrink-0">
            <AlertCircle className="w-3 h-3 text-yellow-400" />
            <span>FULL</span>
          </div>
        ) : null}
      </div>

      {/* Main 1-Click Master Bid Button */}
      <button
        onClick={() => handleQuickBid()}
        disabled={isHighestBidder || !canAffordNextBid || isSquadFull || biddingLoading}
        className={`w-full py-3.5 px-4 rounded-xl font-display font-black text-base sm:text-lg tracking-wide flex items-center justify-center space-x-2 shadow-xl transition-all duration-200 cursor-pointer ${
          isHighestBidder
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            : !canAffordNextBid || isSquadFull
            ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-98 animate-glow-pulse'
        }`}
      >
        <Zap className="w-5 h-5 text-black fill-current" />
        <span>
          {isHighestBidder
            ? 'Leading Bid (Waiting for Outbid)'
            : biddingLoading
            ? 'Placing Bid...'
            : `BID: ${formatCurrency(nextValidBid, auction.currency_symbol)}`}
        </span>
      </button>

      {/* Quick Increment Chips Bar */}
      <div className="grid grid-cols-4 gap-1.5">
        {increments.map((inc, i) => {
          const isValid = inc.value <= myTeam.purse_remaining && !isHighestBidder && !isSquadFull;
          return (
            <button
              key={i}
              onClick={() => handleQuickBid(inc.value)}
              disabled={!isValid || biddingLoading}
              className={`py-2 px-1 rounded-lg border text-[11px] font-bold flex items-center justify-center space-x-0.5 transition cursor-pointer ${
                isValid
                  ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/30 text-amber-300 hover:border-amber-400'
                  : 'bg-slate-950/60 border-slate-800/60 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>{formatCurrency(inc.value, auction.currency_symbol)}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Bid Accordion Toggle */}
      <div className="pt-0.5">
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-amber-400 transition cursor-pointer mx-auto"
        >
          <span>{showCustomInput ? 'Hide Custom Amount' : 'Enter Custom Bid Amount'}</span>
          {showCustomInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showCustomInput && (
          <form onSubmit={handleCustomBidSubmit} className="flex items-center space-x-1.5 pt-2 animate-fadeIn">
            <input 
              type="number"
              step={auction.min_bid_increment}
              value={customBidAmount}
              onChange={e => setCustomBidAmount(e.target.value)}
              placeholder={`Min: ${formatCurrency(nextValidBid, auction.currency_symbol)}`}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none transition font-mono"
            />
            <button
              type="submit"
              disabled={!customBidAmount || isHighestBidder || isSquadFull}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-amber-500/30 transition disabled:opacity-40 cursor-pointer shrink-0"
            >
              Submit
            </button>
          </form>
        )}
      </div>

      {/* Real-time Bid Feedback Toast */}
      {feedback && (
        <div className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2 animate-fadeIn ${
          feedback.success 
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
            : 'bg-red-950/50 border-red-500/40 text-red-300'
        }`}>
          {feedback.success ? (
            <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

    </div>
  );
};
