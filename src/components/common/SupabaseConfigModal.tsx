import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Key, 
  Globe, 
  RefreshCw,
  Trash2
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveCustomSupabaseCredentials, 
  clearCustomSupabaseCredentials, 
  testSupabaseConnection 
} from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const current = getSupabaseCredentials();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [status, setStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setStatus({ loading: false, success: false, message: 'Please provide both Project URL and Anon Key.' });
      return;
    }

    setStatus({ loading: true, message: 'Testing connection to Supabase...' });
    const res = await testSupabaseConnection(url, key);

    if (res.success) {
      saveCustomSupabaseCredentials(url, key);
      setStatus({ loading: false, success: true, message: res.message });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setStatus({ loading: false, success: false, message: res.message });
    }
  };

  const handleReset = () => {
    clearCustomSupabaseCredentials();
    setUrl('');
    setKey('');
    setStatus({ loading: false, success: true, message: 'Reset to Local Realtime broadcast mode.' });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const copySqlToClipboard = async () => {
    try {
      const resp = await fetch('/supabase/schema.sql');
      const text = await resp.text();
      navigator.clipboard.writeText(text);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      navigator.clipboard.writeText(`-- Please copy from supabase/schema.sql in the project root`);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b1222] border border-slate-700/80 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Supabase Configuration</h3>
              <p className="text-xs text-slate-400">Connect your PostgreSQL database & Supabase Realtime</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Mode explanation box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Dual-Engine Mode</span>
            </div>
            <p>
              By default, CricBid Arena works completely offline and synchronizes across open tabs/windows via <span className="text-cyan-400 font-mono">BroadcastChannel</span>.
            </p>
            <p>
              To share private auctions across different internet devices anywhere in the world, enter your free <strong>Supabase Project URL</strong> and <strong>Anon Key</strong> below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supabase Project URL</span>
              </label>
              <input 
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyzabcdefghijklmnop.supabase.co"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Anon Public Key</span>
              </label>
              <input 
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition font-mono"
              />
            </div>

            {/* Status message */}
            {status && (
              <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                status.success 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : status.loading 
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-300' 
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}>
                {status.loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />
                ) : status.success ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Use Local Sync</span>
              </button>

              <button
                type="submit"
                disabled={status?.loading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-xs shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                {status?.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Test & Connect</span>
              </button>
            </div>
          </form>

          {/* Setup steps helper */}
          <div className="border-t border-slate-800 pt-5 space-y-3">
            <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
              Quick Setup Steps (Free Supabase Tier):
            </h4>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
              <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center">supabase.com <ExternalLink className="w-3 h-3 ml-0.5 inline" /></a></li>
              <li>Go to <strong>SQL Editor</strong> in your Supabase dashboard.</li>
              <li>Execute the SQL schema script provided in <code className="text-amber-400 font-mono">supabase/schema.sql</code>.</li>
              <li>Copy your <strong>Project URL</strong> and <strong>Anon Key</strong> from Project Settings &gt; API.</li>
            </ol>
            <button
              onClick={copySqlToClipboard}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Schema SQL Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copy SQL Schema Script to Clipboard</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

