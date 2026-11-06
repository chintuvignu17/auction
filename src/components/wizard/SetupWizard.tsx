import React, { useState, useRef } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Trophy, 
  Users, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Check,
  Camera,
  Crop,
  Upload,
  Search
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { ALL_10_IPL_TEAMS, IPL_PLAYERS_CATALOG } from '../../data/mockData';
import { PlayerRole } from '../../types/auction';
import { formatCurrency } from '../../lib/formatters';
import { ImageCropperModal } from '../common/ImageCropperModal';

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ isOpen, onClose, onCreated }) => {
  const { createAuction } = useAuction();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Auction Details
  const [title, setTitle] = useState('TATA IPL Mega Auction 2025');
  const [adminPin, setAdminPin] = useState('1234');
  const currencySymbol = '₹';
  // REQUIREMENT 6: timer selection 5, 10, 15, 20, 25, 30 seconds. Default to 15 seconds.
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [minBidIncrement, setMinBidIncrement] = useState<number>(2000000); // 20 Lakhs
  const [pursePerTeam, setPursePerTeam] = useState<number>(1000000000); // 100 Cr
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState<number>(15);

  // Step 2: REQUIREMENT 2: All 10 official IPL teams with full & short names + official crests
  const [teams, setTeams] = useState(
    ALL_10_IPL_TEAMS.map((t) => ({
      name: t.name,
      shortCode: t.shortCode,
      color: t.color,
      logoUrl: t.logo,
      ownerName: '',
      ownerPin: '1234'
    }))
  );

  // Step 3: REQUIREMENT 3: Selected IPL Players + Manual Addition
  const [catalogTeamFilter, setCatalogTeamFilter] = useState<string>('ALL');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [players, setPlayers] = useState<Array<{
    name: string;
    role: PlayerRole;
    basePrice: number;
    imageUrl?: string;
    country?: string;
  }>>(
    // All 72 IPL players across all 10 franchises included by default
    IPL_PLAYERS_CATALOG.map(p => ({
      name: p.name,
      role: p.role as PlayerRole,
      basePrice: p.basePrice,
      imageUrl: p.imageUrl,
      country: p.country
    }))
  );

  // Manual player inputs & client-side file cropper
  const [customPlayers, setCustomPlayers] = useState<Array<{
    name: string;
    role: PlayerRole;
    basePrice: number;
    imageUrl?: string;
    country?: string;
  }>>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('BATSMAN');
  const [newPlayerPrice, setNewPlayerPrice] = useState<number>(20000000); // 2 Cr
  const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 4: REQUIREMENT 5: Host Participation choice
  // 'PARTICIPANT' = enter name + select team + bid; 'SPECTATOR' = control room without bidding
  const [hostMode, setHostMode] = useState<'PARTICIPANT' | 'SPECTATOR'>('PARTICIPANT');
  const [hostDisplayName, setHostDisplayName] = useState('');
  const [adminTeamIndex, setAdminTeamIndex] = useState<number>(0);

  if (!isOpen) return null;

  // Add / remove manual player
  const handleAddManualPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newCustom = {
      name: newPlayerName.trim(),
      role: newPlayerRole,
      basePrice: Number(newPlayerPrice) || 20000000,
      imageUrl: newPlayerPhoto.trim() || undefined,
      country: 'India'
    };

    setCustomPlayers(prev => [...prev, newCustom]);
    setPlayers(prev => [...prev, newCustom]);

    setNewPlayerName('');
    setNewPlayerPhoto('');
  };

  const removeCustomPlayer = (index: number) => {
    const toRemove = customPlayers[index];
    setCustomPlayers(prev => prev.filter((_, i) => i !== index));
    if (toRemove) {
      setPlayers(prev => prev.filter(p => p.name !== toRemove.name));
    }
  };

  const removePlayerRow = (index: number) => {
    setPlayers(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle IPL catalog player into pool
  const toggleCatalogPlayer = (catalogPlayer: typeof IPL_PLAYERS_CATALOG[0]) => {
    const exists = players.some(p => p.name === catalogPlayer.name);
    if (exists) {
      setPlayers(prev => prev.filter(p => p.name !== catalogPlayer.name));
    } else {
      setPlayers(prev => [
        ...prev,
        {
          name: catalogPlayer.name,
          role: catalogPlayer.role as PlayerRole,
          basePrice: catalogPlayer.basePrice,
          imageUrl: catalogPlayer.imageUrl,
          country: catalogPlayer.country
        }
      ]);
    }
  };

  const selectAllCatalogPlayers = () => {
    setPlayers(
      IPL_PLAYERS_CATALOG.map(p => ({
        name: p.name,
        role: p.role as PlayerRole,
        basePrice: p.basePrice,
        imageUrl: p.imageUrl,
        country: p.country
      }))
    );
  };

  // Launch Auction
  const handleLaunchAuction = async () => {
    setLoading(true);
    try {
      await createAuction({
        title,
        adminPin,
        timerSeconds,
        minBidIncrement,
        pursePerTeam,
        maxPlayersPerTeam,
        currencySymbol,
        // If participant: pass chosen team index; if spectator: pass -1 (no team)
        adminTeamIndex: hostMode === 'PARTICIPANT' ? adminTeamIndex : -1,
        adminDisplayName: hostDisplayName.trim() || 'Room Admin',
        teams,
        players
      });
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1224] border-2 border-amber-500/30 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(245,158,11,0.2)] overflow-hidden">
        
        {/* Wizard Header & Stepper */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#080d1a] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Step {step} of 4
              </span>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-white">
                {step === 1 && '1. Auction Rules & Timer'}
                {step === 2 && '2. 10 Official IPL Teams'}
                {step === 3 && '3. IPL Player Selection & Draft'}
                {step === 4 && '4. Host Role & Launch'}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {step === 1 && 'Set countdown timer (5-30s), minimum increment, and team budgets'}
              {step === 2 && 'All 10 official IPL franchises ready for friends to claim'}
              {step === 3 && 'Select star players or add custom players with custom base price'}
              {step === 4 && 'Choose whether to bid as a participant or manage as a spectator'}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1">
          <div 
            className="bg-gradient-to-r from-amber-500 to-cyan-400 h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* STEP 1: Basic Info, Rules & Timer Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Auction Room Title *
                  </label>
                  <input 
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. TATA IPL Mega Auction 2025"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition"
                  />
                </div>

                {/* REQUIREMENT 6: Timer Selection: 5, 10, 15, 20, 25, or 30 seconds. Default 15s */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-amber-300">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Countdown Timer per Player (seconds) *</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-semibold">
                      Selected: {timerSeconds}s
                    </span>
                  </label>

                  <div className="grid grid-cols-6 gap-2">
                    {[5, 10, 15, 20, 25, 30].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setTimerSeconds(sec)}
                        className={`py-3 rounded-xl border text-center font-display font-extrabold text-sm transition cursor-pointer active:scale-95 ${
                          timerSeconds === sec
                            ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {sec}s
                        {sec === 15 && (
                          <span className="block text-[8px] font-bold uppercase tracking-tighter opacity-80">
                            Default
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    When timer reaches 0s, the player is automatically SOLD to the highest bidder (or marked UNSOLD).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Admin Master PIN *</span>
                    <span className="text-[10px] text-amber-400">Controls room</span>
                  </label>
                  <input 
                    type="text"
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    placeholder="1234"
                    maxLength={10}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition font-mono tracking-widest font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>Minimum Bid Increment</span>
                  </label>
                  <select
                    value={minBidIncrement}
                    onChange={e => setMinBidIncrement(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition"
                  >
                    <option value={1000000}>₹10 Lakhs</option>
                    <option value={2000000}>₹20 Lakhs (IPL Standard)</option>
                    <option value={2500000}>₹25 Lakhs</option>
                    <option value={5000000}>₹50 Lakhs</option>
                    <option value={10000000}>₹1 Crore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Purse Budget per Team
                  </label>
                  <select
                    value={pursePerTeam}
                    onChange={e => setPursePerTeam(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition"
                  >
                    <option value={1000000000}>₹100 Crores (100 Cr - Mega Auction)</option>
                    <option value={1200000000}>₹120 Crores (120 Cr)</option>
                    <option value={500000000}>₹50 Crores</option>
                    <option value={10000}>10,000 Points</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: REQUIREMENT 2: 10 Official IPL Teams */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>10 Official IPL Teams ({teams.length} Franchises)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Each team starts with a purse of {formatCurrency(pursePerTeam, currencySymbol)}.
                  </p>
                </div>
              </div>

              {/* 10 IPL Teams Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {teams.map((team, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3"
                  >
                    {/* Team Official Logo / Crest */}
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0 bg-slate-950 border border-slate-800 p-1"
                    >
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.shortCode} className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-full h-full rounded-lg flex items-center justify-center font-bold" style={{ backgroundColor: team.color }}>
                          {team.shortCode}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold text-xs text-white block truncate">
                        {team.name}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">
                        {team.shortCode} • Purse: {formatCurrency(pursePerTeam, currencySymbol)}
                      </span>
                    </div>

                    {/* Owner Name editable */}
                    <input 
                      type="text"
                      value={team.ownerName}
                      onChange={e => {
                        const updated = [...teams];
                        updated[idx].ownerName = e.target.value;
                        setTeams(updated);
                      }}
                      placeholder="Assign Friend"
                      className="w-28 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: 150 Official IPL Stars Pre-Loaded + Manual Custom Player Addition */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Header Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-[#0e172e] border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center shadow-lg font-black shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      150 Official IPL Stars Pre-Loaded
                    </h4>
                    <p className="text-xs text-slate-400">
                      All 10 IPL franchises (15 stars per team) are already included with official headshots and base prices.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0">
                  ✓ {players.length} Total Players
                </div>
              </div>

              {/* Manual Player Addition Form */}
              <form onSubmit={handleAddManualPlayer} className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider block flex items-center space-x-1.5">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Manually Add Custom Player</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Add extra local players, friends, or cricket legends
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Player Name *
                    </label>
                    <input 
                      type="text"
                      value={newPlayerName}
                      onChange={e => setNewPlayerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar / MS Dhoni (Legend)"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Role *
                    </label>
                    <select
                      value={newPlayerRole}
                      onChange={e => setNewPlayerRole(e.target.value as PlayerRole)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="BATSMAN">Batsman</option>
                      <option value="BOWLER">Bowler</option>
                      <option value="ALL_ROUNDER">All-Rounder</option>
                      <option value="WICKET_KEEPER">Wicket Keeper</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Starting Price (₹)
                    </label>
                    <input 
                      type="number"
                      value={newPlayerPrice}
                      onChange={e => setNewPlayerPrice(Number(e.target.value))}
                      placeholder="20000000"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                  {/* Photo Upload & Crop */}
                  <div className="flex items-center space-x-2">
                    {newPlayerPhoto ? (
                      <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-amber-500/40">
                        <img 
                          src={newPlayerPhoto} 
                          alt="Cropped Preview" 
                          className="w-7 h-7 rounded-full object-cover border border-amber-400" 
                        />
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                          >
                            Change
                          </button>
                          <span className="text-slate-600">•</span>
                          <button
                            type="button"
                            onClick={() => setNewPlayerPhoto('')}
                            className="text-red-400 hover:text-red-300 font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer shrink-0"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload Photo & Crop</span>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedImageFile(e.target.files[0]);
                          setIsCropperOpen(true);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-black font-extrabold text-xs transition cursor-pointer shrink-0 shadow-md"
                  >
                    + Add Custom Player
                  </button>
                </div>
              </form>

              {/* Custom Players Added List (Only if user added any) */}
              {customPlayers.length > 0 && (
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Custom Players Added ({customPlayers.length})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {customPlayers.map((player, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          {player.imageUrl ? (
                            <img src={player.imageUrl} alt={player.name} className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-[10px] shrink-0">
                              {player.name[0]}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-white block truncate">{player.name}</span>
                            <span className="text-[9px] text-slate-400">{player.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {formatCurrency(player.basePrice, currencySymbol)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCustomPlayer(idx)}
                            className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 4: REQUIREMENT 5: Host Participation Choice & Launch */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* REQUIREMENT 5: Host Participation Radio Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-amber-300 uppercase tracking-wider">
                  How will you (the Host) participate in this auction? *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Option 1: Join as Participant */}
                  <div 
                    onClick={() => setHostMode('PARTICIPANT')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                      hostMode === 'PARTICIPANT'
                        ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-white flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Join as Participant</span>
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        hostMode === 'PARTICIPANT' ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                      }`}>
                        {hostMode === 'PARTICIPANT' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Own an IPL team and bid against friends live, while maintaining full admin controls.
                    </p>

                    {hostMode === 'PARTICIPANT' && (
                      <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                            Your Name (Team Owner):
                          </label>
                          <input 
                            type="text"
                            value={hostDisplayName}
                            onChange={e => setHostDisplayName(e.target.value)}
                            placeholder="Enter your name (e.g. Aman, Rahul)"
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                            Pick Your IPL Team to Own:
                          </label>
                          <select
                            value={adminTeamIndex}
                            onChange={e => setAdminTeamIndex(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                          >
                            {teams.map((t, idx) => (
                              <option key={idx} value={idx}>
                                👑 {t.name} ({t.shortCode})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Watch as Spectator */}
                  <div 
                    onClick={() => setHostMode('SPECTATOR')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                      hostMode === 'SPECTATOR'
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-white flex items-center space-x-1.5">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>Watch as Spectator</span>
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        hostMode === 'SPECTATOR' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                      }`}>
                        {hostMode === 'SPECTATOR' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Act as the neutral auctioneer/host. Control timer, stage & hammer without bidding for any team.
                    </p>

                    {hostMode === 'SPECTATOR' && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/20">
                        <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                          Host / Auctioneer Name:
                        </label>
                        <input 
                          type="text"
                          value={hostDisplayName}
                          onChange={e => setHostDisplayName(e.target.value)}
                          placeholder="Enter your name (e.g. Aman, Rahul)"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                        />
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Summary Stats Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Teams</span>
                  <span className="font-extrabold text-white">{teams.length} IPL</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Purse/Team</span>
                  <span className="font-extrabold text-amber-400">{formatCurrency(pursePerTeam, currencySymbol)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Timer</span>
                  <span className="font-extrabold text-cyan-400">{timerSeconds}s Auto</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Draft Pool</span>
                  <span className="font-extrabold text-emerald-400">{players.length} Players</span>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
                <span className="font-black block">Admin PIN: {adminPin}</span>
                <p className="text-[11px] text-slate-400">
                  You will automatically enter as Admin. You can also share the generated invite link with friends!
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-[#080d1a] flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-1 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleLaunchAuction}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 hover:from-amber-400 text-black font-extrabold text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Creating IPL Room...' : 'Launch IPL Auction!'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Interactive Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setSelectedImageFile(null);
        }}
        initialFile={selectedImageFile}
        onCropComplete={(croppedBase64) => {
          setNewPlayerPhoto(croppedBase64);
        }}
        title="Crop Player Photo for Auction"
      />
    </div>
  );
};
