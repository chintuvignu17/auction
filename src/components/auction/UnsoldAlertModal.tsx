import React from 'react';
import { XCircle, X } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency, formatRole } from '../../lib/formatters';

export const UnsoldAlertModal: React.FC = () => {
  const { unsoldPlayerEvent, dismissUnsold, auction, startNextUpcomingPlayer } = useAuction();

  if (!unsoldPlayerEvent) return null;

  const { player } = unsoldPlayerEvent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative bg-[#0d111d] border-2 border-red-500/60 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={dismissUnsold}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dramatic UNSOLD Stamp */}
        <div className="inline-block transform -rotate-12 border-4 border-red-500 bg-red-950/80 text-red-400 px-6 py-2 rounded-2xl font-display font-black text-3xl tracking-widest uppercase shadow-[0_0_30px_rgba(239,68,68,0.4)] mb-6 animate-stamp-in">
          ❌ UNSOLD
        </div>

        {/* Player Photo */}
        <div className="w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-red-500/40 grayscale">
          <img 
            src={player.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60'} 
            alt={player.name}
            className="w-full h-full object-cover object-top"
          />
        </div>

        <h2 className="font-display font-black text-xl text-white">
          {player.name}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {formatRole(player.role)} • Base Price: <strong className="text-amber-400 font-mono">{formatCurrency(player.base_price, auction?.currency_symbol)}</strong>
        </p>

        <p className="text-xs text-slate-400 my-5 bg-slate-950 p-3 rounded-xl border border-slate-800">
          No bids were placed for this player. The player has been added to the <strong>Unsold Pool</strong> and can be re-auctioned later in an accelerated round!
        </p>

        <button
          onClick={startNextUpcomingPlayer}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
        >
          Next Player Coming Up ⚡ (Click to Advance Now)
        </button>

      </div>
    </div>
  );
};

