import React, { useState } from 'react';
import { X, Users, Edit, Check, Shield } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { Team } from '../../types/auction';
import { formatCurrency } from '../../lib/formatters';

interface ManageTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageTeamsModal: React.FC<ManageTeamsModalProps> = ({ isOpen, onClose }) => {
  const { teams, auction } = useAuction();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b1222] border border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#080d19]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Participating Teams ({teams.length})</h3>
              <p className="text-xs text-slate-400">Team codes, owners, and purse allocations</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teams List */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {teams.map(team => (
            <div 
              key={team.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md bg-slate-950 border border-slate-800 p-1 shrink-0"
                >
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.short_code} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ backgroundColor: team.color }}>
                      {team.short_code}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-bold text-white block text-sm">{team.name}</span>
                  <span className="text-[10px] text-slate-400">
                    Owner: <strong>{team.owner_name}</strong> {team.owner_pin ? `• PIN: ${team.owner_pin}` : ''}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-emerald-400 block">
                  {formatCurrency(team.purse_remaining, auction?.currency_symbol)}
                </span>
                <span className="text-[10px] text-slate-500">
                  Total: {formatCurrency(team.purse_total, auction?.currency_symbol)}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

