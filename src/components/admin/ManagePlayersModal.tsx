import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Edit, Trophy, Upload, Check, FileText, Camera, Crop } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { PlayerRole, Player } from '../../types/auction';
import { formatCurrency, formatRole } from '../../lib/formatters';
import { ImageCropperModal } from '../common/ImageCropperModal';

interface ManagePlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManagePlayersModal: React.FC<ManagePlayersModalProps> = ({ isOpen, onClose }) => {
  const { players, auction, addPlayer, updatePlayer, deletePlayer } = useAuction();

  const [activeTab, setActiveTab] = useState<'LIST' | 'ADD' | 'CSV'>('LIST');

  // Form states for Add / Edit
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState<PlayerRole>('BATSMAN');
  const [basePrice, setBasePrice] = useState<number>(20000000);
  const [imageUrl, setImageUrl] = useState('');
  const [country, setCountry] = useState('India');
  const [battingStyle, setBattingStyle] = useState('Right-hand bat');
  const [bowlingStyle, setBowlingStyle] = useState('Right-arm medium');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // CSV bulk import text
  const [csvText, setCsvText] = useState(
`Rohit Sharma,BATSMAN,20000000,India
Jasprit Bumrah,BOWLER,20000000,India
Glenn Maxwell,ALL_ROUNDER,15000000,Australia
Sanju Samson,WICKET_KEEPER,15000000,India`
  );
  const [importSuccess, setImportSuccess] = useState('');

  if (!isOpen) return null;

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlayerId) {
      const existing = players.find(p => p.id === editingPlayerId);
      if (existing) {
        await updatePlayer({
          ...existing,
          name: name.trim(),
          role,
          base_price: Number(basePrice) || 2000000,
          image_url: imageUrl.trim() || undefined,
          country: country.trim() || 'India',
          batting_style: battingStyle.trim() || undefined,
          bowling_style: bowlingStyle.trim() || undefined
        });
      }
      setEditingPlayerId(null);
    } else {
      await addPlayer({
        name: name.trim(),
        role,
        base_price: Number(basePrice) || 2000000,
        image_url: imageUrl.trim() || undefined,
        country: country.trim() || 'India',
        batting_style: battingStyle.trim() || undefined,
        bowling_style: bowlingStyle.trim() || undefined
      });
    }

    // Reset
    setName('');
    setImageUrl('');
    setActiveTab('LIST');
  };

  const startEdit = (player: Player) => {
    setEditingPlayerId(player.id);
    setName(player.name);
    setRole(player.role);
    setBasePrice(player.base_price);
    setImageUrl(player.image_url || '');
    setCountry(player.country || 'India');
    setBattingStyle(player.batting_style || 'Right-hand bat');
    setBowlingStyle(player.bowling_style || 'Right-arm medium');
    setActiveTab('ADD');
  };

  // Process CSV text
  const handleBulkImport = async () => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let count = 0;

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const pName = parts[0];
        const pRole = (parts[1].toUpperCase() as PlayerRole) || 'BATSMAN';
        const pPrice = parts[2] ? Number(parts[2]) : 20000000;
        const pCountry = parts[3] || 'India';

        await addPlayer({
          name: pName,
          role: pRole,
          base_price: isNaN(pPrice) ? 20000000 : pPrice,
          country: pCountry
        });
        count++;
      }
    }

    setImportSuccess(`Successfully imported ${count} players!`);
    setTimeout(() => {
      setImportSuccess('');
      setActiveTab('LIST');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b1222] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#080d19] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Manage Player Roster</h3>
              <p className="text-xs text-slate-400">{players.length} Players currently in draft</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center space-x-2 px-6 pt-4 border-b border-slate-800 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`pb-3 px-2 border-b-2 transition ${
              activeTab === 'LIST' 
                ? 'border-amber-400 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            All Players ({players.length})
          </button>
          <button
            onClick={() => {
              setEditingPlayerId(null);
              setName('');
              setImageUrl('');
              setActiveTab('ADD');
            }}
            className={`pb-3 px-2 border-b-2 transition flex items-center space-x-1 ${
              activeTab === 'ADD' 
                ? 'border-amber-400 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingPlayerId ? 'Edit Player' : 'Add Player'}</span>
          </button>
          <button
            onClick={() => setActiveTab('CSV')}
            className={`pb-3 px-2 border-b-2 transition flex items-center space-x-1 ${
              activeTab === 'CSV' 
                ? 'border-amber-400 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk CSV Import</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: LIST */}
          {activeTab === 'LIST' && (
            <div className="space-y-2">
              {players.map((p, idx) => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className="text-slate-500 font-mono w-6">{idx + 1}.</span>
                    <img 
                      src={p.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60'} 
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                    />
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400">{formatRole(p.role)} • {p.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="font-mono font-bold text-amber-400">
                      {formatCurrency(p.base_price, auction?.currency_symbol)}
                    </span>
                    <button
                      onClick={() => startEdit(p)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 transition"
                      title="Edit Player"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePlayer(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition"
                      title="Delete Player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ADD / EDIT */}
          {activeTab === 'ADD' && (
            <form onSubmit={handleSavePlayer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Player Full Name *
                  </label>
                  <input 
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Jasprit Bumrah"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Playing Role *
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as PlayerRole)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="BATSMAN">Batsman</option>
                    <option value="BOWLER">Bowler</option>
                    <option value="ALL_ROUNDER">All-Rounder</option>
                    <option value="WICKET_KEEPER">Wicket Keeper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Base Starting Price ({auction?.currency_symbol}) *
                  </label>
                  <input 
                    type="number"
                    value={basePrice}
                    onChange={e => setBasePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Country / State
                  </label>
                  <input 
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Batting Style
                  </label>
                  <input 
                    type="text"
                    value={battingStyle}
                    onChange={e => setBattingStyle(e.target.value)}
                    placeholder="Right-hand bat"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Bowling Style
                  </label>
                  <input 
                    type="text"
                    value={bowlingStyle}
                    onChange={e => setBowlingStyle(e.target.value)}
                    placeholder="Right-arm fast"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Player Photo (Upload & Crop or URL)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex items-center space-x-2">
                      {imageUrl ? (
                        <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-amber-500/40">
                          <img 
                            src={imageUrl} 
                            alt="Cropped Preview" 
                            className="w-7 h-7 rounded-full object-cover border border-amber-400" 
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
                            onClick={() => setImageUrl('')}
                            className="text-[10px] text-red-400 font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400 text-slate-200 text-xs font-bold transition cursor-pointer shrink-0"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>Upload & Crop Photo</span>
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
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  {editingPlayerId ? 'Save Changes' : 'Add Player to Draft'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BULK CSV IMPORT */}
          {activeTab === 'CSV' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block">CSV Format:</span>
                <p className="font-mono text-[11px] text-amber-400">
                  Player Name, Role (BATSMAN|BOWLER|ALL_ROUNDER|WICKET_KEEPER), Base Price, Country
                </p>
              </div>

              <textarea 
                rows={8}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-xs text-white font-mono focus:outline-none"
                placeholder="Paste CSV here..."
              />

              {importSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{importSuccess}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleBulkImport}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition"
              >
                Import Players from CSV
              </button>
            </div>
          )}

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
          setImageUrl(croppedBase64);
        }}
        title="Crop Player Photo"
      />
    </div>
  );
};

