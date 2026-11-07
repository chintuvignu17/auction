import React from 'react';
import { LogOut, Home, Play, AlertTriangle, X } from 'lucide-react';

interface LeaveRoomConfirmModalProps {
  isOpen: boolean;
  roomCode?: string;
  onClose: () => void; // Stay in Auction
  onGoHome: () => void; // Browse Homepage while keeping room session active
  onExitCompletely: () => void; // Quit and leave room completely
}

export const LeaveRoomConfirmModal: React.FC<LeaveRoomConfirmModalProps> = ({
  isOpen,
  roomCode,
  onClose,
  onGoHome,
  onExitCompletely
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b1224] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* Glow flare */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close icon (stays in arena) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white">
              Leave Auction Room?
            </h3>
            <p className="text-xs text-slate-400">
              You are currently inside Room <span className="font-mono font-bold text-amber-400">{roomCode || 'Arena'}</span>
            </p>
          </div>
        </div>

        {/* Prompt Explanation */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
          Would you like to browse the <strong>Home page</strong> (your room will remain active so you can re-enter anytime), stay and continue bidding, or exit completely?
        </p>

        {/* Actions Grid */}
        <div className="space-y-2.5 pt-1">
          {/* 1. Stay in Auction (Primary default) */}
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-black font-extrabold text-xs shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Stay in Auction Arena</span>
          </button>

          {/* 2. Go to Home (Keep room session active) */}
          <button
            type="button"
            onClick={onGoHome}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span>Go to Home Page (Keep Room Active)</span>
          </button>

          {/* 3. Exit completely */}
          <button
            type="button"
            onClick={onExitCompletely}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Quit & Exit Room Completely</span>
          </button>
        </div>

      </div>
    </div>
  );
};

