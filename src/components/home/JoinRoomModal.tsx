import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Shield, 
  Eye, 
  LogIn, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { INITIAL_DEMO_TEAMS } from '../../data/mockData';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomCode?: string;
  onJoined?: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ 
  isOpen, 
  onClose,
  initialRoomCode,
  onJoined
}) => {
  const { auction, teams, joinAuction, userSession } = useAuction();

  // Detect room code from prop, current auction, or URL query param
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlRoom = urlParams?.get('room');
  
  const [roomCode, setRoomCode] = useState(initialRoomCode || urlRoom || '');
  
  // Two clean options: 'PARTICIPANT' or 'SPECTATOR'
  const [joinType, setJoinType] = useState<'PARTICIPANT' | 'SPECTATOR'>('PARTICIPANT');
  const [displayName, setDisplayName] = useState(() => {
    if (userSession?.displayName && userSession.displayName !== 'Spectator' && userSession.displayName !== 'Room Admin') {
      return userSession.displayName;
    }
    return '';
  });
  const [selectedTeamId, setSelectedTeamId] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
    } else if (urlRoom) {
      setRoomCode(urlRoom);
    }
  }, [initialRoomCode, urlRoom]);

  // Always fallback to all 10 IPL franchises if room teams are empty or loading!
  const effectiveTeams = teams && teams.length > 0 ? teams : INITIAL_DEMO_TEAMS;
  const availableTeams = effectiveTeams.filter(t => !t.is_claimed && (!t.owner_name || t.owner_name.trim() === ''));
  const claimedTeams = effectiveTeams.filter(t => t.is_claimed || (t.owner_name && t.owner_name.trim() !== ''));

  // Auto-select first available team if current selection is invalid or taken
  useEffect(() => {
    if (availableTeams.length > 0 && (!selectedTeamId || !availableTeams.some(t => t.id === selectedTeamId))) {
      setSelectedTeamId(availableTeams[0].id);
    }
  }, [availableTeams, selectedTeamId]);

  if (!isOpen) return null;

  // Selected team object
  const selectedTeam = effectiveTeams.find(t => t.id === selectedTeamId) || availableTeams[0];

  // Submit Join as Participant
  const handleJoinParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!roomCode.trim()) {
      setErrorMsg('Please enter a valid room code');
      return;
    }

    if (!displayName.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }

    if (!selectedTeamId) {
      setErrorMsg('All teams are taken. You can join as a Spectator.');
      return;
    }

    setLoading(true);
    const result = await joinAuction(
      roomCode.trim().toUpperCase(),
      'TEAM_OWNER',
      selectedTeamId,
      undefined,
      displayName.trim()
    );
    setLoading(false);

    if (result.success) {
      if (onJoined) onJoined();
      onClose();
    } else {
      setErrorMsg(result.message || 'Failed to join auction');
    }
  };

  // Submit Join as Spectator
  const handleJoinSpectator = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!roomCode.trim()) {
      setErrorMsg('Please enter a valid room code');
      return;
    }

    setLoading(true);
    const result = await joinAuction(
      roomCode.trim().toUpperCase(),
      'VIEWER',
      undefined,
      undefined,
      displayName.trim() || 'Spectator'
    );
    setLoading(false);

    if (result.success) {
      if (onJoined) onJoined();
      onClose();
    } else {
      setErrorMsg(result.message || 'Failed to join as spectator');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1222] border-2 border-amber-500/40 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#080d19] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-white">
                Join Auction Room
              </h3>
              <p className="text-[11px] text-slate-400">
                Room: <span className="font-mono text-amber-400 font-bold">{roomCode}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TWO CLEAN TYPES TO JOIN: PARTICIPANT OR SPECTATOR */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Option Selector Pills */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setJoinType('PARTICIPANT');
                setErrorMsg('');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                joinType === 'PARTICIPANT'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Join as Participant</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setJoinType('SPECTATOR');
                setErrorMsg('');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                joinType === 'SPECTATOR'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Watch as Spectator</span>
            </button>
          </div>

          {/* TYPE 1: PARTICIPANT FORM */}
          {joinType === 'PARTICIPANT' && (
            <form onSubmit={handleJoinParticipant} className="space-y-4 animate-fadeIn">
              
              {/* Room Size & Available Teams Indicator */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Teams Joined:</span>
                  <strong className="text-white font-mono">{claimedTeams.length} / {effectiveTeams.length}</strong>
                </span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  availableTeams.length > 0 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                    : 'text-red-400 bg-red-500/10 border border-red-500/20'
                }`}>
                  {availableTeams.length > 0 ? `${availableTeams.length} Teams Available` : 'All Teams Taken!'}
                </span>
              </div>

              {/* Room Code */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Room Code *
                </label>
                <input 
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CRIC-1234"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-amber-400 font-mono font-bold uppercase tracking-wider focus:outline-none transition placeholder:text-slate-600"
                  required
                />
              </div>

              {/* 1. Display Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Your Name *
                </label>
                <input 
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Enter your name (e.g. Rahul, Rohit, Aman)"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none transition"
                  required
                />
              </div>

              {/* 2. Select from ONLY AVAILABLE TEAMS */}
              {availableTeams.length > 0 ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Pick Your IPL Team *</span>
                    <span className="text-[10px] text-amber-400">
                      {availableTeams.length} choices open
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {availableTeams.map((team) => {
                      const isSelected = selectedTeamId === team.id;
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => setSelectedTeamId(team.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-sm bg-slate-900 border border-slate-800 p-0.5"
                          >
                            {team.logo_url ? (
                              <img src={team.logo_url} alt={team.short_code} className="w-7 h-7 object-contain" />
                            ) : (
                              <div className="w-full h-full rounded flex items-center justify-center font-bold" style={{ backgroundColor: team.color }}>
                                {team.short_code}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-xs text-white block truncate leading-tight">
                              {team.name}
                            </span>
                            <span className="text-[9px] text-amber-400 font-mono font-bold block truncate">
                              {team.short_code}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* All teams taken message */
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-yellow-500/30 text-xs text-center space-y-2">
                  <p className="text-yellow-300 font-bold">
                    All 10 IPL franchises have been claimed by other players!
                  </p>
                  <p className="text-[11px] text-slate-400">
                    You can still join the room as a Spectator to watch all live bidding in real time.
                  </p>
                  <button
                    type="button"
                    onClick={() => setJoinType('SPECTATOR')}
                    className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs cursor-pointer shadow transition"
                  >
                    Switch to Spectator
                  </button>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Join as Participant Button */}
              <button
                type="submit"
                disabled={loading || availableTeams.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-black font-extrabold text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.4)] transition active:scale-98 cursor-pointer disabled:opacity-40 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Joining Room...' : `Join as ${selectedTeam?.name || 'Participant'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TYPE 2: SPECTATOR FORM */}
          {joinType === 'SPECTATOR' && (
            <form onSubmit={handleJoinSpectator} className="space-y-4 animate-fadeIn">
              
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-cyan-400 flex items-center space-x-1.5">
                  <Eye className="w-4 h-4" />
                  <span>Spectator Mode (Read-Only)</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Watch live countdowns, real-time bids, and hammer celebrations without managing a team budget.
                </p>
              </div>

              {/* Room Code */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Room Code *
                </label>
                <input 
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CRIC-1234"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-cyan-400 font-mono font-bold uppercase tracking-wider focus:outline-none transition placeholder:text-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Your Display Name (Optional)
                </label>
                <input 
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Spectator / Fan"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none transition"
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Watch Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 hover:from-cyan-400 text-black font-extrabold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] transition active:scale-98 cursor-pointer disabled:opacity-40 flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>{loading ? 'Entering Room...' : 'Watch Live Auction as Spectator'}</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
