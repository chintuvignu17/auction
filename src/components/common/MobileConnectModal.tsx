import React, { useState } from 'react';
import { X, Smartphone, QrCode, Copy, Check, Wifi, ExternalLink } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileConnectModal: React.FC<MobileConnectModalProps> = ({ isOpen, onClose }) => {
  const { auction } = useAuction();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Network URL or current origin with room code
  const currentHost = window.location.hostname;
  const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';
  // Use current network IP or hostname
  const targetHost = isLocalhost ? '192.168.30.117' : currentHost;
  const port = window.location.port ? `:${window.location.port}` : '';
  const roomQuery = auction?.room_code ? `?room=${auction.room_code}` : '';
  
  const mobileUrl = `${window.location.protocol}//${targetHost}${port}/${roomQuery}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=0b1222&color=f59e0b&margin=10&data=${encodeURIComponent(mobileUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1222] border-2 border-amber-500/40 rounded-3xl max-w-sm w-full p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2 text-left">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-white">Scan to Open on Mobile</h3>
              <p className="text-[10px] text-slate-400">Join from any smartphone or tablet</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-950 p-4 rounded-2xl border-2 border-amber-500/30 inline-block mb-4 shadow-inner">
          <img 
            src={qrCodeUrl} 
            alt="Mobile Join QR Code"
            className="w-48 h-48 mx-auto rounded-xl"
            onError={(e) => {
              // Fallback if offline
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Wi-Fi Note */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-left text-xs text-slate-300 space-y-1.5 mb-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[11px]">
            <Wifi className="w-3.5 h-3.5" />
            <span>Connect to same Wi-Fi</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Ensure your phone is connected to your local Wi-Fi, then scan the QR code with your phone camera or browser.
          </p>
        </div>

        {/* Link & Copy */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 mb-4">
          <span className="truncate pr-2">{mobileUrl}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0 cursor-pointer"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
        >
          Done
        </button>

      </div>
    </div>
  );
};

