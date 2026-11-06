import React, { useState } from 'react';
import { Clock, Plus, Minus, Zap, Sliders } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

export const CountdownTimer: React.FC = () => {
  const { 
    auction, 
    remainingSeconds, 
    isTimerRunning, 
    userSession, 
    setTimerDuration, 
    addSecondsToTimer 
  } = useAuction();

  const [showAdjuster, setShowAdjuster] = useState(false);

  if (!auction?.current_player_id) {
    return null;
  }

  const totalSeconds = auction.timer_seconds || 30;
  const progressPercent = Math.min(100, Math.max(0, (remainingSeconds / totalSeconds) * 100));

  // Determine stage alert text
  let stageText = 'BIDDING OPEN';
  let badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';

  if (remainingSeconds <= 5) {
    stageText = '⚠️ FINAL CALL!';
    badgeColor = 'text-red-400 bg-red-500/20 border-red-500/40 animate-pulse';
  } else if (remainingSeconds <= 12) {
    stageText = 'GOING TWICE...';
    badgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/40';
  } else if (remainingSeconds <= 20) {
    stageText = 'GOING ONCE...';
    badgeColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  }

  // Circular gauge circumference
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const timerPresets = [5, 10, 15, 20, 25, 30];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 px-4 shadow-inner">
      <div className="flex items-center space-x-3">
        {/* Mini SVG circular timer */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-14 h-14 -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="currentColor"
              strokeWidth="3.5"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="currentColor"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                remainingSeconds <= 5 
                  ? 'text-red-500' 
                  : remainingSeconds <= 12 
                  ? 'text-amber-500' 
                  : 'text-cyan-400'
              }`}
              fill="transparent"
            />
          </svg>

          {/* Center Countdown Digit */}
          <span className={`absolute font-mono font-black text-lg ${
            remainingSeconds <= 5 ? 'text-red-400 animate-ping' : 'text-white'
          }`}>
            {remainingSeconds}
          </span>
        </div>

        {/* Stage Badge & Auto-Hammer Note */}
        <div>
          <div className="flex items-center space-x-1.5">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${badgeColor}`}>
              {stageText}
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              ⚡ Auto-Sold at 0s
            </span>
          </div>
          
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{isTimerRunning ? `Clock (${auction.timer_seconds}s)` : 'Paused'}</span>
            {userSession?.isAdmin && (
              <button
                onClick={() => setShowAdjuster(!showAdjuster)}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline ml-1 cursor-pointer font-semibold"
              >
                {showAdjuster ? 'Hide Controls' : 'Change Timer'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Fast Timer Adjusters (Extends or alters the countdown live) */}
      {userSession?.isAdmin && (
        <div className={`flex flex-wrap items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3 ${showAdjuster ? 'block' : 'hidden sm:flex'}`}>
          <button
            onClick={() => addSecondsToTimer(10)}
            title="Add 10 seconds to current countdown"
            className="flex items-center space-x-0.5 px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer transition active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>10s</span>
          </button>

          <button
            onClick={() => addSecondsToTimer(-5)}
            title="Minus 5 seconds from current countdown"
            className="flex items-center space-x-0.5 px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[10px] font-bold cursor-pointer transition active:scale-95"
          >
            <Minus className="w-3 h-3" />
            <span>5s</span>
          </button>

          <div className="flex items-center space-x-1 ml-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {timerPresets.map(sec => (
              <button
                key={sec}
                onClick={() => setTimerDuration(sec)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  auction.timer_seconds === sec
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
