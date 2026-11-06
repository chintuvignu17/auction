import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Search, 
  Trophy, 
  Plus, 
  Sparkles, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Camera,
  Crop
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency, formatRole, getRoleBadgeClass } from '../../lib/formatters';
import { IPL_PLAYERS_CATALOG } from '../../data/mockData';
import { PlayerRole } from '../../types/auction';
import { ImageCropperModal } from '../common/ImageCropperModal';

interface PlayerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerPickerModal: React.FC<PlayerPickerModalProps> = ({ isOpen, onClose }) => {
  const { players, startPlayerAuction, auction, addPlayer } = useAuction();
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Manual player addition state
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('BATSMAN');
  const [newPlayerBasePrice, setNewPlayerBasePrice] = useState<number>(20000000); // 2 Cr
  const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
  const [showCatalogChips, setShowCatalogChips] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Filter players
  const filtered = players.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (playerId: string) => {
    setLoadingId(playerId);
    await startPlayerAuction(playerId);
    setLoadingId(null);
    onClose();
  };

  // Handle Manual Player Add
  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    await addPlayer({
      name: newPlayerName.trim(),
      role: newPlayerRole,
      base_price: Number(newPlayerBasePrice) || 20000000,
      image_url: newPlayerPhoto.trim() || undefined,
      country: 'India'
    });

    setNewPlayerName('');
    setNewPlayerPhoto('');
    setShowManualAdd(false);
  };

  // Quick Add IPL Star from Catalog
  const handleQuickAddStar = async (star: typeof IPL_PLAYERS_CATALOG[0]) => {
    await addPlayer({
      name: star.name,
      role: star.role as PlayerRole,
      base_price: star.basePrice,
      image_url: star.imageUrl,
      country: star.country
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1222] border-2 border-amber-500/40 rounded-3xl max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#080d19] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-white">Call Player to Stage</h3>
              <p className="text-xs text-slate-400">Select an IPL player or add a custom player</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Bar & Search */}
        <div className="p-3 sm:p-4 border-b border-slate-800 space-y-2.5 shrink-0 bg-slate-950/60">
          
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search IPL players, roles..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            <button
              onClick={() => setShowManualAdd(!showManualAdd)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showManualAdd ? 'Close Add' : '+ Add Player'}</span>
            </button>
          </div>

          {/* REQUIREMENT 3: Manual Player Addition Form Drawer */}
          {showManualAdd && (
            <form onSubmit={handleManualAddSubmit} className="p-3 bg-slate-900 border border-amber-500/30 rounded-2xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  Manual Player Addition
                </span>
                <button
                  type="button"
                  onClick={() => setShowCatalogChips(!showCatalogChips)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                >
                  {showCatalogChips ? 'Hide IPL Catalog' : 'Pick from IPL Stars Catalog'}
                </button>
              </div>

              {/* IPL Star Catalog Chips */}
              {showCatalogChips && (
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                  {IPL_PLAYERS_CATALOG.filter(c => !players.some(p => p.name === c.name)).map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleQuickAddStar(c)}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>{c.name}</span>
                      <span className="text-[9px] text-amber-400 font-mono">({c.team})</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input 
                  type="text"
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  placeholder="Player Name *"
                  className="bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-white"
                  required
                />
                <select
                  value={newPlayerRole}
                  onChange={e => setNewPlayerRole(e.target.value as PlayerRole)}
                  className="bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-2 py-1.5 text-xs text-white"
                >
                  <option value="BATSMAN">Batsman</option>
                  <option value="BOWLER">Bowler</option>
                  <option value="ALL_ROUNDER">All-Rounder</option>
                  <option value="WICKET_KEEPER">Wicket Keeper</option>
                </select>
                <input 
                  type="number"
                  value={newPlayerBasePrice}
                  onChange={e => setNewPlayerBasePrice(Number(e.target.value))}
                  placeholder="Starting Price (Base)"
                  className="bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  {newPlayerPhoto ? (
                    <div className="flex items-center space-x-2 bg-slate-950 px-2 py-1 rounded-xl border border-amber-500/40">
                      <img 
                        src={newPlayerPhoto} 
                        alt="Preview" 
                        className="w-6 h-6 rounded-full object-cover border border-amber-400" 
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] text-cyan-400 font-bold underline cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPlayerPhoto('')}
                        className="text-[10px] text-red-400 font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400 text-slate-200 text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload & Crop</span>
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
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition cursor-pointer shrink-0"
                >
                  Save & Add
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Scrollable Player List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filtered.map(p => {
            const roleBadge = getRoleBadgeClass(p.role);
            const isSold = p.status === 'SOLD';
            const isUnsold = p.status === 'UNSOLD';
            const isInAuction = p.status === 'IN_AUCTION';

            return (
              <div 
                key={p.id}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition text-xs"
              >
                <div className="flex items-center space-x-3 truncate">
                  <img 
                    src={p.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60'} 
                    alt={p.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="truncate">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-white truncate">{p.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${roleBadge.bg} ${roleBadge.text}`}>
                        {formatRole(p.role)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Base: <strong className="text-amber-400">{formatCurrency(p.base_price, auction?.currency_symbol)}</strong>
                      {p.country && ` • ${p.country}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isSold ? (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      SOLD
                    </span>
                  ) : isInAuction ? (
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                      ON STAGE
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelect(p.id)}
                      disabled={loadingId === p.id}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs shadow transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isUnsold ? 'Re-Auction' : 'Call'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

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
        title="Crop Player Photo"
      />
    </div>
  );
};
