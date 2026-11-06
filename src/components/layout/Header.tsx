import React, { useState } from 'react';
import { 
  Gavel, 
  Share2, 
  Volume2, 
  VolumeX, 
  Database, 
  PlusCircle, 
  UserCheck, 
  Copy, 
  Check, 
  Shield, 
  Users,
  Mic
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { soundManager } from '../../lib/sound';
import { commentaryEngine } from '../../lib/commentary';

interface HeaderProps {
  onOpenSetup: () => void;
  onOpenJoin: () => void;
  onOpenSupabaseConfig: () => void;
  onOpenSummary: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSetup,
  onOpenJoin,
  onOpenSupabaseConfig,
  onOpenSummary,
  onGoHome
}) => {
  const { auction, userSession, myTeam, isUsingSupabase } = useAuction();
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(commentaryEngine.getIsEnabled());
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    const newState = soundManager.toggleMute();
    setIsMuted(newState);
  };

  const toggleVoice = () => {
    const newState = commentaryEngine.toggle();
    setIsVoiceEnabled(newState);
  };

  const copyRoomCode = () => {
    if (!auction?.room_code) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${auction.room_code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070b15]/95 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto w-full px-1 sm:px-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={onGoHome}
          className="flex items-center space-x-2 shrink-0 cursor-pointer group"
          title={onGoHome ? "Back to Homepage" : undefined}
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-400/40 group-hover:scale-105 transition">
            <Gavel className="w-4 h-4 text-black" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full border border-[#070b15]" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-display font-black text-base tracking-wider bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
                CRICBID
              </span>
              <span className="text-[9px] uppercase font-black px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                ARENA
              </span>
            </div>
          </div>
        </div>

        {/* Center: Room Code Chip (1-tap copy link) */}
        {auction && (
          <button
            onClick={copyRoomCode}
            title="Tap to copy invite link"
            className="flex items-center space-x-1.5 bg-slate-900/95 border border-slate-700/80 hover:border-amber-500/40 rounded-xl px-2.5 py-1 text-xs transition cursor-pointer active:scale-95 shadow-inner"
          >
            <span className="text-[10px] text-slate-400 uppercase font-bold">Room:</span>
            <span className="font-mono font-black text-amber-400 text-xs tracking-wider">
              {auction.room_code}
            </span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Share2 className="w-3 h-3 text-slate-400" />
            )}
          </button>
        )}

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          
          {/* My Team / Admin Pill */}
          <button 
            onClick={onOpenJoin}
            title="Tap to switch team or role"
            className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-xs cursor-pointer active:scale-95 transition"
          >
            {userSession?.isAdmin && myTeam ? (
              <>
                <Shield className="w-3 h-3 text-amber-400" />
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: myTeam.color }} 
                />
                <span className="font-black text-white text-[11px] max-w-[55px] truncate">
                  {myTeam.short_code}
                </span>
              </>
            ) : userSession?.isAdmin ? (
              <>
                <Shield className="w-3 h-3 text-amber-400" />
                <span className="font-black text-amber-400 text-[11px]">ADMIN</span>
              </>
            ) : myTeam ? (
              <>
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: myTeam.color }} 
                />
                <span className="font-bold text-white text-[11px] max-w-[60px] truncate">
                  {myTeam.short_code}
                </span>
              </>
            ) : (
              <>
                <Users className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-300 text-[11px]">Viewer</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition cursor-pointer active:scale-90"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* AI Voice Toggle */}
          <button
            onClick={toggleVoice}
            title={isVoiceEnabled ? 'Voice Commentary Active' : 'Voice Commentary Off'}
            className={`p-1.5 rounded-xl border transition cursor-pointer active:scale-90 ${
              isVoiceEnabled
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-500'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Supabase Cloud Database */}
          <button
            onClick={onOpenSupabaseConfig}
            title={isUsingSupabase ? 'Supabase Database Connected' : 'Configure Supabase Cloud Database'}
            className={`relative p-1.5 rounded-xl border transition cursor-pointer active:scale-90 ${
              isUsingSupabase 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${isUsingSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          </button>

        </div>

      </div>
    </header>
  );
};
