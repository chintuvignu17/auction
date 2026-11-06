import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Check, X, Shield, Gavel } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency, formatRole } from '../../lib/formatters';

export const SoldCelebrationModal: React.FC = () => {
  const { soldPlayerEvent, dismissCelebration, auction } = useAuction();

  useEffect(() => {
    if (soldPlayerEvent) {
      // Fire multi-stage celebratory confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.6 }
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#3b82f6']
      });
      fire(0.2, {
        spread: 60,
        colors: ['#ffd700', '#06b6d4', '#ffffff']
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45
      });

      // Auto-dismiss celebration after 4.5 seconds
      const timer = setTimeout(() => {
        dismissCelebration();
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [soldPlayerEvent, dismissCelebration]);

  if (!soldPlayerEvent) return null;

  const { player, team, price } = soldPlayerEvent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative bg-gradient-to-b from-[#0e172e] via-[#090f1f] to-[#060913] border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.5)] overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={dismissCelebration}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dramatic SOLD Stamp Overlay */}
        <div className="inline-block transform -rotate-12 border-4 border-emerald-400 bg-emerald-950/80 text-emerald-400 px-6 py-2 rounded-2xl font-display font-black text-3xl sm:text-4xl tracking-widest uppercase shadow-[0_0_30px_rgba(16,185,129,0.5)] mb-6 animate-stamp-in">
          🔨 SOLD!
        </div>

        {/* Player Image with Golden Laurel Border */}
        <div className="relative w-36 h-36 mx-auto mb-4">
          <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <img 
              src={player.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60'} 
              alt={player.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Player Name and Role */}
        <h2 className="font-display font-black text-2xl text-white">
          {player.name}
        </h2>
        <p className="text-xs text-amber-400 uppercase tracking-widest font-bold mt-0.5">
          {formatRole(player.role)} • {player.country || 'India'}
        </p>

        {/* Final Price Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1">
            Winning Bid Amount
          </span>
          <div className="font-display font-black text-3xl sm:text-4xl text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            {formatCurrency(price, auction?.currency_symbol)}
          </div>
        </div>

        {/* Winning Team Banner with Team Leader Name */}
        <div 
          className="p-4 rounded-2xl border flex items-center justify-center space-x-3 text-white font-extrabold text-sm shadow-md"
          style={{ 
            backgroundColor: `${team.color}25`, 
            borderColor: team.color 
          }}
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black shadow bg-slate-950 p-1 border border-white/20 shrink-0"
          >
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.short_code} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-full h-full rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: team.color }}>
                {team.short_code}
              </div>
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-extrabold text-white">
              Sold to <span style={{ color: team.color }}>{team.name}</span>
            </div>
            <div className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 mt-0.5">
              <span className="text-slate-400 font-medium">Team Leader:</span>
              <span className="text-amber-300 font-black tracking-wide">{team.owner_name || 'Team Captain'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

