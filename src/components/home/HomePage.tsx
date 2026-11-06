import React, { useState } from 'react';
import { 
  Gavel, 
  Trophy, 
  Users, 
  LogIn, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Share2,
  ArrowRight,
  Shield,
  Database
} from 'lucide-react';
import { ALL_10_IPL_TEAMS } from '../../data/mockData';

interface HomePageProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomCode?: string) => void;
  onOpenSupabaseConfig?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onCreateRoom,
  onJoinRoom,
  onOpenSupabaseConfig
}) => {
  const [inputRoomCode, setInputRoomCode] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinRoom(inputRoomCode.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#070b15]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-400/40">
              <Gavel className="w-5 h-5 text-black" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#070b15]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-black text-lg tracking-wider bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
                  CRICBID
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 tracking-widest">
                  ARENA
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Status */}
          <div className="flex items-center space-x-2">
            {onOpenSupabaseConfig && (
              <button
                onClick={onOpenSupabaseConfig}
                title="Connect Supabase Cloud Database"
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer active:scale-95"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Supabase</span>
              </button>
            )}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>IPL 2025 Edition</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Hero & Options Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center space-y-8 animate-fadeIn">
        
        {/* Hero Title & Badge */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Private Friends IPL Auction Room</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Live IPL Cricket <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              Player Auction
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Create private auction rooms with friends. Bid in real-time, experience automated countdown timers, and manage all 10 official IPL franchises.
          </p>
        </div>

        {/* 10 Official IPL Teams Showcase Pills */}
        <div className="w-full max-w-2xl bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 shadow-inner">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center mb-2">
            10 Official IPL Franchises Supported
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {ALL_10_IPL_TEAMS.map((team) => (
              <div 
                key={team.shortCode}
                className="flex items-center space-x-1.5 px-2 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-white shadow-sm hover:border-slate-700 transition"
              >
                {team.logo ? (
                  <img src={team.logo} alt={team.shortCode} className="w-4 h-4 object-contain shrink-0" />
                ) : (
                  <div 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: team.color }} 
                  />
                )}
                <span>{team.shortCode}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TWO PRIMARY USER OPTIONS (Create Room & Join Room) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl">
          
          {/* OPTION 1: CREATE ROOM FOR IPL AUCTION */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#090f1f] to-[#070c17] border-2 border-amber-500/40 p-6 flex flex-col justify-between shadow-[0_0_35px_rgba(245,158,11,0.15)] hover:border-amber-400 transition-all duration-300 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <Trophy className="w-6 h-6" />
              </div>
              
              <div>
                <h2 className="font-display font-black text-xl text-white">
                  Create Room for IPL Auction
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Host an auction room. Configure timer (5s, 10s, 15s default, 20s, 25s, 30s), invite friends, and choose to bid or watch.
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Configurable 5s - 30s Auto-Sold Timer</span>
                </div>
                <div className="flex items-center space-x-1.5 text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Host can Bid as Participant or Watch as Neutral Admin</span>
                </div>
              </div>
            </div>

            <button
              onClick={onCreateRoom}
              className="mt-6 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.4)] transition active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Create Room for IPL Auction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* OPTION 2: JOIN ROOM */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#090f1f] to-[#070c17] border-2 border-cyan-500/30 p-6 flex flex-col justify-between shadow-[0_0_35px_rgba(6,182,212,0.15)] hover:border-cyan-400 transition-all duration-300 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <LogIn className="w-6 h-6" />
              </div>

              <div>
                <h2 className="font-display font-black text-xl text-white">
                  Join Room
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Have a room code or invitation link from a friend? Enter your display name, pick your IPL team, and join the action.
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center space-x-1.5 text-cyan-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>Simple 1-Step Friend Joining (No complex PINs)</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose any of the 10 IPL franchises or Watch as Spectator</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleJoinSubmit} className="mt-6 space-y-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  value={inputRoomCode}
                  onChange={e => setInputRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CRIC-1234"
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs text-amber-400 placeholder:text-slate-600 font-mono font-bold uppercase tracking-wider focus:outline-none shadow-inner transition"
                />
                <button
                  type="submit"
                  className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer shrink-0"
                >
                  Join Room
                </button>
              </div>
            </form>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-900 bg-[#04070e] text-center text-xs text-slate-500">
        <p>CricBid Arena • Private Friends Cricket Player Auction</p>
      </footer>

    </div>
  );
};

