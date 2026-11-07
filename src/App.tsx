import React, { useState, useEffect } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { Header } from './components/layout/Header';
import { MobileBottomNav, MobileTab } from './components/layout/MobileBottomNav';
import { PlayerSpotlight } from './components/auction/PlayerSpotlight';
import { BidControlPanel } from './components/auction/BidControlPanel';
import { LiveBidFeed } from './components/auction/LiveBidFeed';
import { TeamSquadsView } from './components/dashboard/TeamSquadsView';
import { PlayerPoolView } from './components/dashboard/PlayerPoolView';
import { AdminCockpitView } from './components/admin/AdminCockpitView';
import { AdminControlBar } from './components/admin/AdminControlBar';
import { SetupWizard } from './components/wizard/SetupWizard';
import { JoinRoomModal } from './components/home/JoinRoomModal';
import { HomePage } from './components/home/HomePage';
import { SupabaseConfigModal } from './components/common/SupabaseConfigModal';
import { PlayerPickerModal } from './components/admin/PlayerPickerModal';
import { ManagePlayersModal } from './components/admin/ManagePlayersModal';
import { ManageTeamsModal } from './components/admin/ManageTeamsModal';
import { ManualOverrideModal } from './components/admin/ManualOverrideModal';
import { AuctionSettingsModal } from './components/admin/AuctionSettingsModal';
import { AuctionSummaryModal } from './components/dashboard/AuctionSummaryModal';
import { SoldCelebrationModal } from './components/auction/SoldCelebrationModal';
import { UnsoldAlertModal } from './components/auction/UnsoldAlertModal';
import { LeaveRoomConfirmModal } from './components/common/LeaveRoomConfirmModal';
import { 
  Zap, 
  Users, 
  Trophy, 
  Activity, 
  Shield, 
  PlusCircle, 
  Sparkles 
} from 'lucide-react';

function AuctionDashboard() {
  const { auction, userSession, logs, startPlayerAuction, leaveAuction } = useAuction();

  // REQUIREMENT 1: When users open main URL, show Homepage first.
  // When opening a valid invitation link (?room=...), go directly to that room's joining page.
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialRoomQuery = urlParams?.get('room');

  const [currentView, setCurrentView] = useState<'HOME' | 'AUCTION'>(
    initialRoomQuery ? 'AUCTION' : 'HOME'
  );
  const [initialJoinRoomCode, setInitialJoinRoomCode] = useState<string | undefined>(
    initialRoomQuery || undefined
  );

  // Active navigation tab (Shared between desktop top tabs & mobile bottom nav)
  const [activeTab, setActiveTab] = useState<MobileTab>('ARENA');

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(() => {
    // Only open join modal if following an invite link AND user does not already have a claimed team
    if (!initialRoomQuery) return false;
    const saved = localStorage.getItem(`cricbid_user_session_${initialRoomQuery.toUpperCase()}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.teamId || parsed.isAdmin) return false;
      } catch {}
    }
    return true;
  });
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [isPlayerPickerOpen, setIsPlayerPickerOpen] = useState(false);
  const [isManagePlayersOpen, setIsManagePlayersOpen] = useState(false);
  const [isManageTeamsOpen, setIsManageTeamsOpen] = useState(false);
  const [isManualOverrideOpen, setIsManualOverrideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // If room parameter arrives in URL later or changes (open join modal ONLY if NOT already in active session for this room)
  useEffect(() => {
    if (initialRoomQuery) {
      const code = initialRoomQuery.toUpperCase();
      setCurrentView('AUCTION');
      setInitialJoinRoomCode(code);
      const saved = localStorage.getItem(`cricbid_user_session_${code}`);
      let hasTeam = false;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.teamId || parsed.isAdmin) hasTeam = true;
        } catch {}
      }
      if (!hasTeam && (!userSession || (!userSession.teamId && !userSession.isAdmin))) {
        setIsJoinOpen(true);
      }
    }
  }, [initialRoomQuery, userSession]);

  // Handlers for Homepage actions
  const handleOpenCreateRoom = () => {
    setIsSetupOpen(true);
  };

  const handleOpenJoinRoom = (code?: string) => {
    if (code) {
      setInitialJoinRoomCode(code);
    }
    setCurrentView('AUCTION');
    setIsJoinOpen(true);
  };

  return (
    <>
      {/* 1. HOMEPAGE VIEW (Shown first on main website URL) */}
      {currentView === 'HOME' ? (
        <HomePage 
          onCreateRoom={handleOpenCreateRoom}
          onJoinRoom={(code) => handleOpenJoinRoom(code)}
          onResumeRoom={() => setCurrentView('AUCTION')}
        />
      ) : (
        /* 2. LIVE AUCTION ROOM VIEW: Full Responsive Desktop + Mobile */
        <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col justify-start selection:bg-amber-500 selection:text-black">
          
          {/* Top Desktop Helper Banner: Notice */}
          <aside aria-label="Auction info banner" className="hidden lg:flex items-center justify-between w-full max-w-7xl mx-auto py-1.5 px-4 bg-slate-900/80 border-b border-amber-500/20 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">IPL Auction Live Room</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-mono font-bold">Room: {auction?.room_code || 'CRIC25'}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
              <span>Squad Limit: <strong className="text-amber-300">15 Players Max</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Live Synchronized</span>
            </div>
          </aside>

          {/* Main Top Header */}
          <Header 
            onOpenSetup={() => setIsSetupOpen(true)}
            onOpenJoin={() => {
              if (!userSession?.isAdmin) setIsJoinOpen(true);
            }}
            onOpenSummary={() => setIsSummaryOpen(true)}
            onGoHome={() => setIsLeaveModalOpen(true)}
            onConfirmLeave={() => setIsLeaveModalOpen(true)}
          />

          {/* DESKTOP / TABLET SUB-NAVIGATION BAR (Hidden on Mobile) */}
          <div className="hidden md:block bg-[#080d1a]/95 border-b border-slate-800/80 sticky top-[53px] z-30 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              
              {/* Tab Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('ARENA')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wide transition cursor-pointer ${
                    activeTab === 'ARENA'
                      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>LIVE ARENA</span>
                </button>

                <button
                  onClick={() => setActiveTab('SQUADS')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                    activeTab === 'SQUADS'
                      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>SQUADS & PURSES</span>
                </button>

                <button
                  onClick={() => setActiveTab('PLAYERS')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                    activeTab === 'PLAYERS'
                      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>PLAYER POOL</span>
                </button>

                <button
                  onClick={() => setActiveTab('FEED')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                    activeTab === 'FEED'
                      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>LIVE FEED</span>
                  {logs.length > 0 && (
                    <span className="bg-cyan-500 text-black text-[9px] font-black rounded-full px-1.5 py-0.2">
                      {logs.length}
                    </span>
                  )}
                </button>

                {userSession?.isAdmin && (
                  <button
                    onClick={() => setActiveTab('ADMIN')}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                      activeTab === 'ADMIN'
                        ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>ADMIN COCKPIT</span>
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Main Stage & Tabs Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4 pb-20 md:pb-8">
            
            {/* TAB 1: LIVE ARENA */}
            {activeTab === 'ARENA' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-fadeIn">
                
                {/* Left 8 Cols (or Full width on mobile): Player Spotlight & Bidding Dock */}
                <div className="lg:col-span-8 space-y-4">
                  <PlayerSpotlight onOpenPlayerPicker={() => setIsPlayerPickerOpen(true)} />
                  <BidControlPanel onOpenJoinModal={() => setIsJoinOpen(true)} />
                  
                  {/* Mobile-only activity feed ticker below dock */}
                  <div className="lg:hidden pt-1">
                    <LiveBidFeed compact={true} />
                  </div>
                </div>

                {/* Right 4 Cols (Desktop): Live Activity Stream & Hammer Log */}
                <div className="hidden lg:block lg:col-span-4 space-y-4">
                  <LiveBidFeed compact={false} />
                </div>

              </div>
            )}

            {/* TAB 2: TEAM SQUADS & PURSES */}
            {activeTab === 'SQUADS' && (
              <div className="animate-fadeIn">
                <TeamSquadsView />
              </div>
            )}

            {/* TAB 3: PLAYER POOL */}
            {activeTab === 'PLAYERS' && (
              <div className="animate-fadeIn">
                <PlayerPoolView onCallPlayer={async (id) => {
                  await startPlayerAuction(id);
                  setActiveTab('ARENA');
                }} />
              </div>
            )}

            {/* TAB 4: LIVE ACTIVITY FEED */}
            {activeTab === 'FEED' && (
              <div className="animate-fadeIn max-w-3xl mx-auto">
                <LiveBidFeed compact={false} />
              </div>
            )}

            {/* TAB 5: ADMIN COCKPIT */}
            {activeTab === 'ADMIN' && (
              <div className="animate-fadeIn max-w-3xl mx-auto">
                {userSession?.isAdmin ? (
                  <AdminCockpitView 
                    onOpenPlayerPicker={() => setIsPlayerPickerOpen(true)}
                    onOpenManagePlayers={() => setIsManagePlayersOpen(true)}
                    onOpenManageTeams={() => setIsManageTeamsOpen(true)}
                    onOpenManualOverride={() => setIsManualOverrideOpen(true)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onSwitchToArena={() => setActiveTab('ARENA')}
                  />
                ) : (
                  <div className="p-8 text-center space-y-4 bg-slate-900/80 border border-slate-800 rounded-3xl">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                      <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="font-display font-black text-xl text-white">Admin Controls Restricted</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Auction controls are managed by the room creator. Please enjoy bidding in the live arena.
                    </p>
                    <button
                      onClick={() => setActiveTab('ARENA')}
                      className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
                    >
                      Return to Arena
                    </button>
                  </div>
                )}
              </div>
            )}

          </main>

          {/* Admin Command Dock: Visible whenever logged in as Admin */}
          {userSession?.isAdmin && (
            <div className="sticky bottom-14 md:bottom-0 z-30">
              <AdminControlBar 
                onOpenPlayerPicker={() => setIsPlayerPickerOpen(true)}
                onOpenManagePlayers={() => setIsManagePlayersOpen(true)}
                onOpenManageTeams={() => setIsManageTeamsOpen(true)}
                onOpenManualOverride={() => setIsManualOverrideOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          )}

          {/* MOBILE BOTTOM NAVIGATION BAR (Only visible on screens < 768px) */}
          <div className="md:hidden">
            <MobileBottomNav 
              activeTab={activeTab} 
              onSelectTab={(tab) => setActiveTab(tab)}
              feedCount={logs.length > 0 ? logs.length : undefined}
            />
          </div>

        </div>
      )}

      {/* Global Modals & Celebrations */}
      <SetupWizard 
        isOpen={isSetupOpen} 
        onCreated={() => {
          setIsSetupOpen(false);
          setIsJoinOpen(false);
          setCurrentView('AUCTION');
        }}
        onClose={() => setIsSetupOpen(false)} 
      />
      
      <JoinRoomModal 
        isOpen={isJoinOpen} 
        initialRoomCode={initialJoinRoomCode}
        onJoined={() => {
          setIsJoinOpen(false);
          setCurrentView('AUCTION');
        }}
        onClose={() => setIsJoinOpen(false)} 
      />

      <SupabaseConfigModal isOpen={isSupabaseConfigOpen} onClose={() => setIsSupabaseConfigOpen(false)} />
      <PlayerPickerModal isOpen={isPlayerPickerOpen} onClose={() => setIsPlayerPickerOpen(false)} />
      <ManagePlayersModal isOpen={isManagePlayersOpen} onClose={() => setIsManagePlayersOpen(false)} />
      <ManageTeamsModal isOpen={isManageTeamsOpen} onClose={() => setIsManageTeamsOpen(false)} />
      <ManualOverrideModal isOpen={isManualOverrideOpen} onClose={() => setIsManualOverrideOpen(false)} />
      <AuctionSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AuctionSummaryModal isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} />

      {/* Dramatic Event Animation Modals */}
      <SoldCelebrationModal />
      <UnsoldAlertModal />

      {/* Leave Room Confirmation Modal */}
      <LeaveRoomConfirmModal
        isOpen={isLeaveModalOpen}
        roomCode={auction?.room_code}
        onClose={() => setIsLeaveModalOpen(false)}
        onGoHome={() => {
          setIsLeaveModalOpen(false);
          setCurrentView('HOME');
        }}
        onExitCompletely={() => {
          setIsLeaveModalOpen(false);
          leaveAuction();
          setCurrentView('HOME');
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <AuctionProvider>
      <AuctionDashboard />
    </AuctionProvider>
  );
}
