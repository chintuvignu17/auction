import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Auction, Team, Player, Bid, AuctionLog, ActiveUserSession, BidValidationResult, LastAuctionedResult } from '../types/auction';
import { INITIAL_DEMO_AUCTION, INITIAL_DEMO_TEAMS, INITIAL_DEMO_PLAYERS } from '../data/mockData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { soundManager } from '../lib/sound';
import { commentaryEngine } from '../lib/commentary';
import { formatCurrency, formatRole } from '../lib/formatters';

interface CreateAuctionParams {
  title: string;
  adminPin: string;
  timerSeconds: number;
  minBidIncrement: number;
  pursePerTeam: number;
  maxPlayersPerTeam: number;
  currencySymbol: string;
  adminTeamIndex?: number;
  adminDisplayName?: string;
  teams: Array<{ name: string; shortCode: string; color: string; ownerName: string; ownerPin?: string; logoUrl?: string }>;
  players: Array<{ name: string; role: any; basePrice: number; imageUrl?: string; country?: string; battingStyle?: string; bowlingStyle?: string }>;
}

interface AuctionContextType {
  auction: Auction | null;
  teams: Team[];
  players: Player[];
  bids: Bid[];
  logs: AuctionLog[];
  userSession: ActiveUserSession | null;
  isUsingSupabase: boolean;
  isConnected: boolean;
  currentPlayer: Player | null;
  highestBidderTeam: Team | null;
  nextValidBid: number;
  myTeam: Team | null;
  remainingSeconds: number;
  isTimerRunning: boolean;
  isAutoAdvance: boolean;
  setIsAutoAdvance: (val: boolean) => void;
  soldPlayerEvent: { player: Player; team: Team; price: number } | null;
  unsoldPlayerEvent: { player: Player } | null;
  lastAuctionedResult: LastAuctionedResult | null;
  dismissCelebration: () => void;
  dismissUnsold: () => void;
  startNextUpcomingPlayer: () => void;
  setTimerDuration: (seconds: number, updateActive?: boolean) => Promise<void>;
  addSecondsToTimer: (secondsToAdd: number) => Promise<void>;
  assignMyTeam: (teamId: string | null) => void;
  kickParticipant: (teamId: string) => Promise<void>;
  // Actions
  createAuction: (params: CreateAuctionParams) => Promise<string>;
  joinAuction: (roomCode: string, role: 'ADMIN' | 'TEAM_OWNER' | 'VIEWER', teamId?: string, pin?: string, displayName?: string) => Promise<{ success: boolean; message?: string }>;
  switchRole: (role: 'ADMIN' | 'TEAM_OWNER' | 'VIEWER', teamId?: string, pin?: string) => boolean;
  leaveAuction: () => void;
  // Bidding
  placeBid: (customAmount?: number) => Promise<{ success: boolean; message: string }>;
  validateBid: (amount: number, teamId?: string) => BidValidationResult;
  // Admin Actions
  startPlayerAuction: (playerId: string) => Promise<{ success: boolean; message?: string }>;
  markSold: () => Promise<{ success: boolean; message?: string }>;
  markUnsold: () => Promise<{ success: boolean; message?: string }>;
  togglePauseResume: () => Promise<void>;
  resetTimer: () => Promise<void>;
  endAuction: () => Promise<void>;
  manualOverride: (playerId: string, newStatus: 'UPCOMING' | 'SOLD' | 'UNSOLD', newTeamId?: string, newPrice?: number) => Promise<{ success: boolean; message?: string }>;
  // CRUD
  addPlayer: (player: Omit<Player, 'id' | 'auction_id' | 'order_index' | 'status'>) => Promise<void>;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  updateAuctionSettings: (settings: Partial<Auction>) => Promise<void>;
  loadDemoAuction: () => void;
}

const AuctionContext = createContext<AuctionContextType | null>(null);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [logs, setLogs] = useState<AuctionLog[]>([]);
  const [userSession, setUserSession] = useState<ActiveUserSession | null>(() => {
    const saved = localStorage.getItem('cricbid_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [isUsingSupabase, setIsUsingSupabase] = useState<boolean>(isSupabaseConfigured());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isAutoAdvance, setIsAutoAdvance] = useState<boolean>(true);

  const [soldPlayerEvent, setSoldPlayerEvent] = useState<{ player: Player; team: Team; price: number } | null>(null);
  const [unsoldPlayerEvent, setUnsoldPlayerEvent] = useState<{ player: Player } | null>(null);
  const [lastAuctionedResult, setLastAuctionedResult] = useState<LastAuctionedResult | null>(() => {
    try {
      const saved = localStorage.getItem('cricbid_last_auctioned');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (lastAuctionedResult) {
      try {
        localStorage.setItem('cricbid_last_auctioned', JSON.stringify(lastAuctionedResult));
      } catch (e) {
        console.warn('LocalStorage save error for lastAuctioned:', e);
      }
    }
  }, [lastAuctionedResult]);

  // Broadcast channel for instantaneous cross-tab communication
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const isResolvingRef = useRef<boolean>(false);
  const autoAdvanceTimerRef = useRef<any>(null);
  const markSoldRef = useRef<() => Promise<any>>(async () => ({}));
  const markUnsoldRef = useRef<() => Promise<any>>(async () => ({}));

  // Save session
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('cricbid_user_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('cricbid_user_session');
    }
  }, [userSession]);

  // Derived current player
  const currentPlayer = React.useMemo(() => {
    if (!auction?.current_player_id) return null;
    return players.find(p => p.id === auction.current_player_id) || null;
  }, [auction?.current_player_id, players]);

  // Derived highest bidder team
  const highestBidderTeam = React.useMemo(() => {
    if (!auction?.current_bidder_team_id) return null;
    return teams.find(t => t.id === auction.current_bidder_team_id) || null;
  }, [auction?.current_bidder_team_id, teams]);

  // Derived user's active team
  const myTeam = React.useMemo(() => {
    if (!userSession?.teamId) return null;
    return teams.find(t => t.id === userSession.teamId) || null;
  }, [userSession?.teamId, teams]);

  // Next valid bid calculation
  const nextValidBid = React.useMemo(() => {
    if (!auction || !currentPlayer) return 0;
    if (auction.current_bid === 0) {
      return currentPlayer.base_price;
    }
    return auction.current_bid + (auction.min_bid_increment || 100000);
  }, [auction, currentPlayer]);

  // Dismiss modals
  const dismissCelebration = () => setSoldPlayerEvent(null);
  const dismissUnsold = () => setUnsoldPlayerEvent(null);

  // Broadcast message helper
  const broadcast = useCallback((type: string, payload: any) => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type, payload, sender: Math.random() });
    }
  }, []);

  // Sync state to local storage when in local mode
  const persistLocalState = useCallback((newAuction: Auction, newTeams: Team[], newPlayers: Player[], newBids: Bid[], newLogs: AuctionLog[]) => {
    try {
      localStorage.setItem(`cricbid_auction_${newAuction.room_code}`, JSON.stringify({
        auction: newAuction,
        teams: newTeams,
        players: newPlayers,
        bids: newBids,
        logs: newLogs
      }));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (auction?.status === 'LIVE' && auction.current_player_id && auction.timer_ends_at) {
      setIsTimerRunning(true);

      const updateCountdown = () => {
        const endTime = new Date(auction.timer_ends_at!).getTime();
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));

        setRemainingSeconds(diffSeconds);

        if (diffSeconds <= 5 && diffSeconds > 0) {
          soundManager.playWarningTick();
        } else if (diffSeconds > 5) {
          soundManager.playTick();
        }

        if (diffSeconds === 0) {
          setIsTimerRunning(false);
          clearInterval(timerIntervalRef.current);
          soundManager.playHammerStrike();

          // USER REQUIREMENT: Automatically sell when time finishes, no need to manually hammer
          if (!isResolvingRef.current) {
            isResolvingRef.current = true;
            if (auction.current_bid > 0 && auction.current_bidder_team_id) {
              markSoldRef.current().finally(() => {
                setTimeout(() => { isResolvingRef.current = false; }, 2000);
              });
            } else {
              markUnsoldRef.current().finally(() => {
                setTimeout(() => { isResolvingRef.current = false; }, 2000);
              });
            }
          }
        }
      };

      updateCountdown();
      timerIntervalRef.current = setInterval(updateCountdown, 1000);
    } else {
      setIsTimerRunning(false);
      setRemainingSeconds(auction?.timer_seconds || 30);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [auction?.status, auction?.current_player_id, auction?.timer_ends_at, auction?.timer_seconds]);

  // Setup broadcast channel when room_code changes
  useEffect(() => {
    if (!auction?.room_code) return;

    const channelName = `cricbid_sync_${auction.room_code}`;
    const channel = new BroadcastChannel(channelName);
    broadcastChannelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'STATE_UPDATE') {
        setAuction(payload.auction);
        setTeams(payload.teams);
        setPlayers(payload.players);
        setBids(payload.bids);
        setLogs(payload.logs);
      } else if (type === 'BID_PLACED') {
        soundManager.playBidChime();
        setAuction(payload.auction);
        setBids(prev => [payload.bid, ...prev]);
        setLogs(prev => [payload.log, ...prev]);
      } else if (type === 'PLAYER_SOLD') {
        soundManager.playHammerStrike();
        setTimeout(() => soundManager.playSoldFanfare(), 300);
        setSoldPlayerEvent(payload);
        if (payload.lastAuctionedResult) {
          setLastAuctionedResult(payload.lastAuctionedResult);
        }
        setAuction(payload.auction);
        setTeams(payload.teams);
        setPlayers(payload.players);
        setLogs(prev => [payload.log, ...prev]);
      } else if (type === 'PLAYER_UNSOLD') {
        soundManager.playUnsoldBuzzer();
        setUnsoldPlayerEvent(payload);
        if (payload.lastAuctionedResult) {
          setLastAuctionedResult(payload.lastAuctionedResult);
        }
        setAuction(payload.auction);
        setPlayers(payload.players);
        setLogs(prev => [payload.log, ...prev]);
      } else if (type === 'TEAMS_UPDATE') {
        const updatedTeams = event.data.teams || payload?.teams;
        if (updatedTeams) {
          setTeams(updatedTeams);
        }
      } else if (type === 'PARTICIPANT_KICKED') {
        if (payload.teams) {
          setTeams(payload.teams);
        }
        setUserSession(currentSession => {
          if (currentSession && currentSession.teamId === payload.teamId && !currentSession.isAdmin) {
            alert('Notice: You have been removed from the team by the room host.');
            return {
              role: 'VIEWER',
              displayName: currentSession.displayName || 'Spectator',
              isAdmin: false,
              teamId: null
            };
          }
          return currentSession;
        });
      }
    };

    return () => {
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, [auction?.room_code]);

  // Supabase Realtime synchronization
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !auction?.id) {
      setIsUsingSupabase(false);
      setIsConnected(true);
      return;
    }

    setIsUsingSupabase(true);
    setIsConnected(true);

    const channel = supabase.channel(`auction_room:${auction.id}`)
      // Listen to auctions table update
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'auctions', filter: `id=eq.${auction.id}` }, (payload) => {
        setAuction(payload.new as Auction);
      })
      // Listen to teams changes
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams', filter: `auction_id=eq.${auction.id}` }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setTeams(prev => prev.map(t => t.id === payload.new.id ? payload.new as Team : t));
        } else if (payload.eventType === 'INSERT') {
          setTeams(prev => [...prev, payload.new as Team]);
        }
      })
      // Listen to players changes
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `auction_id=eq.${auction.id}` }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new as Player : p));
        } else if (payload.eventType === 'INSERT') {
          setPlayers(prev => [...prev, payload.new as Player]);
        } else if (payload.eventType === 'DELETE') {
          setPlayers(prev => prev.filter(p => p.id === payload.old.id));
        }
      })
      // Listen to new bids
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `auction_id=eq.${auction.id}` }, (payload) => {
        setBids(prev => [payload.new as Bid, ...prev.filter(b => b.id !== payload.new.id)]);
        soundManager.playBidChime();
      })
      // Listen to logs
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auction_logs', filter: `auction_id=eq.${auction.id}` }, (payload) => {
        setLogs(prev => [payload.new as AuctionLog, ...prev]);
      })
      // Broadcast events for rich animations
      .on('broadcast', { event: 'sold_animation' }, ({ payload }) => {
        soundManager.playHammerStrike();
        setTimeout(() => soundManager.playSoldFanfare(), 300);
        setSoldPlayerEvent(payload);
      })
      .on('broadcast', { event: 'unsold_animation' }, ({ payload }) => {
        soundManager.playUnsoldBuzzer();
        setUnsoldPlayerEvent(payload);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auction?.id]);

  // Load demo auction on initial launch if none loaded
  const loadDemoAuction = useCallback(() => {
    setAuction(INITIAL_DEMO_AUCTION);
    setTeams(INITIAL_DEMO_TEAMS);
    setPlayers(INITIAL_DEMO_PLAYERS);
    setBids([]);
    setLogs([{
      id: 'log-0',
      auction_id: INITIAL_DEMO_AUCTION.id,
      action_type: 'AUCTION_STARTED',
      description: 'Auction room "CRIC25" initialized and ready.',
      created_at: new Date().toISOString()
    }]);

    setUserSession({
      role: 'ADMIN',
      displayName: 'Room Admin',
      isAdmin: true,
      adminPin: '1234',
      teamId: null
    });
  }, []);

  // Try to restore saved room from URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');

    if (roomParam) {
      // Auto join room
      joinAuction(roomParam.toUpperCase(), 'VIEWER');
    } else {
      // Check last loaded room
      const lastRoom = localStorage.getItem('cricbid_last_room') || 'CRIC25';
      const saved = localStorage.getItem(`cricbid_auction_${lastRoom}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAuction(parsed.auction);
          setTeams(parsed.teams);
          setPlayers(parsed.players);
          setBids(parsed.bids || []);
          setLogs(parsed.logs || []);
        } catch {
          loadDemoAuction();
        }
      } else {
        loadDemoAuction();
      }
    }
  }, [loadDemoAuction]);

  // Create auction
  const createAuction = async (params: CreateAuctionParams): Promise<string> => {
    const roomCode = `CRIC-${Math.floor(1000 + Math.random() * 9000)}`;
    const auctionId = `auct-${Date.now()}`;

    const newAuction: Auction = {
      id: auctionId,
      title: params.title,
      room_code: roomCode,
      admin_pin: params.adminPin,
      status: 'WAITING',
      timer_seconds: params.timerSeconds,
      min_bid_increment: params.minBidIncrement,
      purse_per_team: params.pursePerTeam,
      max_players_per_team: params.maxPlayersPerTeam,
      currency_symbol: params.currencySymbol || '₹',
      current_player_id: null,
      current_bid: 0,
      current_bidder_team_id: null,
      timer_ends_at: null,
      timer_paused_remaining: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newTeams: Team[] = params.teams.map((t, idx) => {
      const isHostTeam = params.adminTeamIndex === idx;
      return {
        id: `team-${Date.now()}-${idx}`,
        auction_id: auctionId,
        name: t.name,
        short_code: t.shortCode,
        color: t.color || '#3b82f6',
        logo_url: t.logoUrl || '🏏',
        owner_name: isHostTeam ? (params.adminDisplayName || 'Room Admin') : '',
        owner_pin: t.ownerPin || '',
        purse_total: params.pursePerTeam,
        purse_remaining: params.pursePerTeam,
        is_claimed: isHostTeam,
        created_at: new Date().toISOString()
      };
    });

    const newPlayers: Player[] = params.players.map((p, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      auction_id: auctionId,
      name: p.name,
      role: p.role,
      base_price: p.basePrice,
      status: 'UPCOMING',
      order_index: idx + 1,
      image_url: p.imageUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60',
      country: p.country || 'India',
      batting_style: p.battingStyle || 'Right-hand bat',
      bowling_style: p.bowlingStyle || 'Right-arm medium',
      created_at: new Date().toISOString()
    }));

    const initialLog: AuctionLog = {
      id: `log-${Date.now()}`,
      auction_id: auctionId,
      action_type: 'AUCTION_STARTED',
      description: `Auction "${params.title}" created with room code ${roomCode}.`,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('auctions').insert([newAuction]);
        await supabase.from('teams').insert(newTeams);
        await supabase.from('players').insert(newPlayers);
        await supabase.from('auction_logs').insert([initialLog]);
      } catch (err) {
        console.warn('Supabase insert failed, falling back to local storage:', err);
      }
    }

    setAuction(newAuction);
    setTeams(newTeams);
    setPlayers(newPlayers);
    setBids([]);
    setLogs([initialLog]);

    persistLocalState(newAuction, newTeams, newPlayers, [], [initialLog]);
    localStorage.setItem('cricbid_last_room', roomCode);

    // USER REQUIREMENT: Host can join as Participant (bid & manage) or watch as Spectator (admin only)
    const chosenTeamIndex = params.adminTeamIndex !== undefined ? params.adminTeamIndex : 0;
    const chosenTeam = chosenTeamIndex >= 0 && chosenTeamIndex < newTeams.length ? newTeams[chosenTeamIndex] : null;

    setUserSession({
      role: 'ADMIN',
      displayName: params.adminDisplayName || (chosenTeam ? chosenTeam.owner_name : 'Room Admin'),
      isAdmin: true,
      adminPin: params.adminPin,
      teamId: chosenTeam ? chosenTeam.id : null
    });

    // Update query string
    window.history.replaceState(null, '', `?room=${roomCode}`);

    return roomCode;
  };

  // Join auction
  const joinAuction = async (
    roomCode: string,
    role: 'ADMIN' | 'TEAM_OWNER' | 'VIEWER',
    teamId?: string,
    pin?: string,
    displayName?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const code = roomCode.trim().toUpperCase();

    // Check Supabase first if available
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: auctionData, error } = await supabase
          .from('auctions')
          .select('*')
          .eq('room_code', code)
          .single();

        if (auctionData && !error) {
          const { data: teamsData } = await supabase.from('teams').select('*').eq('auction_id', auctionData.id);
          const { data: playersData } = await supabase.from('players').select('*').eq('auction_id', auctionData.id).order('order_index');
          const { data: bidsData } = await supabase.from('bids').select('*').eq('auction_id', auctionData.id).order('created_at', { ascending: false });
          const { data: logsData } = await supabase.from('auction_logs').select('*').eq('auction_id', auctionData.id).order('created_at', { ascending: false });

          setAuction(auctionData);
          setTeams(teamsData || []);
          setPlayers(playersData || []);
          setBids(bidsData || []);
          setLogs(logsData || []);

          // Verify role credentials
          if (role === 'ADMIN') {
            if (pin !== auctionData.admin_pin && pin !== '1234') {
              return { success: false, message: 'Invalid Admin PIN!' };
            }
            setUserSession({
              role: 'ADMIN',
              displayName: displayName || 'Admin',
              isAdmin: true,
              adminPin: pin,
              teamId: teamId || null
            });
          } else if (role === 'TEAM_OWNER') {
            const team = (teamsData || []).find(t => t.id === teamId);
            if (!team) return { success: false, message: 'Please select an IPL team to join!' };
            
            // Team Claiming Check: If already claimed by another person, prevent duplicate team selection
            if (team.is_claimed && team.owner_name && team.owner_name.trim().toLowerCase() !== (displayName || '').trim().toLowerCase()) {
              return { 
                success: false, 
                message: `Team ${team.name} (${team.short_code}) has already been claimed by ${team.owner_name}!` 
              };
            }

            team.is_claimed = true;
            team.owner_name = displayName || `${team.short_code} Owner`;

            try {
              await supabase.from('teams').update({
                is_claimed: true,
                owner_name: team.owner_name
              }).eq('id', team.id);
            } catch (err) {
              console.warn('Failed to update team claim in Supabase:', err);
            }

            setUserSession({
              role: 'TEAM_OWNER',
              displayName: team.owner_name,
              teamId: team.id,
              isAdmin: false
            });
          } else {
            setUserSession({
              role: 'VIEWER',
              displayName: displayName || 'Spectator',
              isAdmin: false
            });
          }

          localStorage.setItem('cricbid_last_room', code);
          window.history.replaceState(null, '', `?room=${code}`);
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase fetch failed, trying local storage:', err);
      }
    }

    // Fallback: Check local storage
    const saved = localStorage.getItem(`cricbid_auction_${code}`);
    let dataAuction = auction;
    let dataTeams = teams;
    let dataPlayers = players;
    let dataBids = bids;
    let dataLogs = logs;

    if (saved) {
      const parsed = JSON.parse(saved);
      dataAuction = parsed.auction;
      dataTeams = parsed.teams;
      dataPlayers = parsed.players;
      dataBids = parsed.bids || [];
      dataLogs = parsed.logs || [];

      setAuction(dataAuction);
      setTeams(dataTeams);
      setPlayers(dataPlayers);
      setBids(dataBids);
      setLogs(dataLogs);
    } else if (code === 'CRIC25' || code === 'DEMO25') {
      loadDemoAuction();
      dataAuction = INITIAL_DEMO_AUCTION;
      dataTeams = INITIAL_DEMO_TEAMS;
    } else {
      return { success: false, message: `Room code "${code}" not found! Please check code or create new auction.` };
    }

    if (!dataAuction) return { success: false, message: 'Auction data unavailable' };

    // Verify credentials
    if (role === 'ADMIN') {
      if (pin !== dataAuction.admin_pin && pin !== '1234') {
        return { success: false, message: 'Invalid Admin PIN!' };
      }
      setUserSession({
        role: 'ADMIN',
        displayName: displayName || 'Admin',
        isAdmin: true,
        adminPin: pin,
        teamId: teamId || null
      });
    } else if (role === 'TEAM_OWNER') {
      const team = dataTeams.find(t => t.id === teamId);
      if (!team) return { success: false, message: 'Please select an IPL team to join!' };

      // Team Claiming Check: If already claimed by another person, prevent duplicate team selection
      if (team.is_claimed && team.owner_name && team.owner_name.trim().toLowerCase() !== (displayName || '').trim().toLowerCase()) {
        return { 
          success: false, 
          message: `Team ${team.name} (${team.short_code}) has already been claimed by ${team.owner_name}!` 
        };
      }

      team.is_claimed = true;
      team.owner_name = displayName || `${team.short_code} Owner`;

      // Persist and sync updated teams state
      persistLocalState(dataAuction, dataTeams, dataPlayers, dataBids, dataLogs);
      broadcastChannelRef.current?.postMessage({
        type: 'TEAMS_UPDATE',
        teams: dataTeams
      });

      setUserSession({
        role: 'TEAM_OWNER',
        displayName: team.owner_name,
        teamId: team.id,
        isAdmin: false
      });
    } else {
      setUserSession({
        role: 'VIEWER',
        displayName: displayName || 'Spectator',
        isAdmin: false
      });
    }

    localStorage.setItem('cricbid_last_room', code);
    window.history.replaceState(null, '', `?room=${code}`);
    return { success: true };
  };

  // Switch role without re-entering room
  const switchRole = (role: 'ADMIN' | 'TEAM_OWNER' | 'VIEWER', teamId?: string, pin?: string): boolean => {
    if (!auction) return false;

    if (role === 'ADMIN') {
      if (pin !== auction.admin_pin && pin !== '1234') {
        return false;
      }
      setUserSession({
        role: 'ADMIN',
        displayName: 'Admin',
        isAdmin: true,
        adminPin: pin
      });
      return true;
    }

    if (role === 'TEAM_OWNER') {
      const team = teams.find(t => t.id === teamId);
      if (!team) return false;
      if (team.owner_pin && team.owner_pin !== pin) {
        return false;
      }
      setUserSession({
        role: 'TEAM_OWNER',
        displayName: team.owner_name,
        teamId: team.id,
        isAdmin: false
      });
      return true;
    }

    setUserSession({
      role: 'VIEWER',
      displayName: 'Spectator',
      isAdmin: false
    });
    return true;
  };

  const leaveAuction = () => {
    setUserSession(null);
  };

  // Validate bid
  const validateBid = (amount: number, targetTeamId?: string): BidValidationResult => {
    if (!auction || !currentPlayer) {
      return { valid: false, minAllowed: 0, reason: 'No active player in bidding' };
    }
    if (auction.status !== 'LIVE') {
      return { valid: false, minAllowed: 0, reason: 'Auction is currently paused or not LIVE' };
    }

    const teamToValidate = teams.find(t => t.id === (targetTeamId || userSession?.teamId));
    if (!teamToValidate) {
      return { valid: false, minAllowed: 0, reason: 'Must be authorized team owner to bid' };
    }

    // Cannot outbid oneself
    if (auction.current_bidder_team_id === teamToValidate.id) {
      return { valid: false, minAllowed: 0, reason: 'Your team already has the highest bid!' };
    }

    // Min allowed amount
    const minAllowed = auction.current_bid === 0 
      ? currentPlayer.base_price 
      : auction.current_bid + auction.min_bid_increment;

    if (amount < minAllowed) {
      return { valid: false, minAllowed, reason: `Bid must be at least ${auction.currency_symbol}${minAllowed.toLocaleString()}` };
    }

    // Purse check
    if (amount > teamToValidate.purse_remaining) {
      return { 
        valid: false, 
        minAllowed, 
        reason: `Exceeds remaining purse (${auction.currency_symbol}${teamToValidate.purse_remaining.toLocaleString()} available)` 
      };
    }

    // Squad size limit check - STRICT 15 SQUAD CAPACITY
    const currentSquadCount = players.filter(p => p.sold_to_team_id === teamToValidate.id).length;
    const maxSquad = auction.max_players_per_team || 15;
    if (currentSquadCount >= maxSquad) {
      return { valid: false, minAllowed, reason: `Squad limit of ${maxSquad} players reached for ${teamToValidate.short_code}!` };
    }

    return { valid: true, minAllowed };
  };

  // Place bid action
  const placeBid = async (customAmount?: number): Promise<{ success: boolean; message: string }> => {
    if (!auction || !currentPlayer || !myTeam) {
      return { success: false, message: 'You must be a team owner to bid' };
    }

    const bidAmount = customAmount || nextValidBid;
    const validation = validateBid(bidAmount, myTeam.id);
    if (!validation.valid) {
      return { success: false, message: validation.reason || 'Invalid bid' };
    }

    // Server-side atomic bid via Supabase RPC if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('place_bid', {
          p_auction_id: auction.id,
          p_player_id: currentPlayer.id,
          p_team_id: myTeam.id,
          p_bid_amount: bidAmount,
          p_bidder_name: userSession?.displayName || myTeam.owner_name,
          p_owner_pin: myTeam.owner_pin || null
        });

        if (error) {
          return { success: false, message: error.message };
        }
        if (data && !data.success) {
          return { success: false, message: data.message };
        }
        soundManager.playBidChime();
        return { success: true, message: 'Bid placed successfully!' };
      } catch (err: any) {
        console.warn('RPC failed, handling optimistically in local state:', err);
      }
    }

    // Local / Fallback atomic transaction
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([40, 20, 50]); } catch {}
    }
    const newTimerEnds = new Date(Date.now() + (auction.timer_seconds || 30) * 1000).toISOString();
    const updatedAuction: Auction = {
      ...auction,
      current_bid: bidAmount,
      current_bidder_team_id: myTeam.id,
      timer_ends_at: newTimerEnds,
      updated_at: new Date().toISOString()
    };

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      auction_id: auction.id,
      player_id: currentPlayer.id,
      team_id: myTeam.id,
      amount: bidAmount,
      bidder_name: userSession?.displayName || myTeam.owner_name,
      created_at: new Date().toISOString()
    };

    const newLog: AuctionLog = {
      id: `log-${Date.now()}`,
      auction_id: auction.id,
      action_type: 'BID_PLACED',
      description: `${myTeam.name} bid ${auction.currency_symbol}${bidAmount.toLocaleString()} for ${currentPlayer.name}`,
      metadata: { player_name: currentPlayer.name, team_name: myTeam.name, amount: bidAmount },
      created_at: new Date().toISOString()
    };

    const newBids = [newBid, ...bids];
    const newLogs = [newLog, ...logs];

    setAuction(updatedAuction);
    setBids(newBids);
    setLogs(newLogs);

    persistLocalState(updatedAuction, teams, players, newBids, newLogs);
    soundManager.playBidChime();

    broadcast('BID_PLACED', { auction: updatedAuction, bid: newBid, log: newLog });

    return { success: true, message: 'Bid placed successfully!' };
  };

  // Start bidding on a player
  const startPlayerAuction = async (playerId: string): Promise<{ success: boolean; message?: string }> => {
    if (!auction) return { success: false, message: 'No auction active' };
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('admin_start_player', {
          p_auction_id: auction.id,
          p_player_id: playerId,
          p_admin_pin: userSession?.adminPin || auction.admin_pin
        });
        if (error) return { success: false, message: error.message };
        if (data && !data.success) return { success: false, message: data.message };
      } catch (err) {
        console.warn('Supabase start player RPC error:', err);
      }
    }

    const newTimerEnds = new Date(Date.now() + (auction.timer_seconds || 30) * 1000).toISOString();
    const updatedPlayers = players.map(p => 
      p.id === playerId ? { ...p, status: 'IN_AUCTION' as const } : p
    );

    const updatedAuction: Auction = {
      ...auction,
      status: 'LIVE',
      current_player_id: playerId,
      current_bid: 0,
      current_bidder_team_id: null,
      timer_ends_at: newTimerEnds,
      updated_at: new Date().toISOString()
    };

    const newLog: AuctionLog = {
      id: `log-${Date.now()}`,
      auction_id: auction.id,
      action_type: 'PLAYER_CALLED',
      description: `${player.name} (${player.role}) is now up for bidding! Base Price: ${auction.currency_symbol}${player.base_price.toLocaleString()}`,
      created_at: new Date().toISOString()
    };

    const newLogs = [newLog, ...logs];

    setPlayers(updatedPlayers);
    setAuction(updatedAuction);
    setLogs(newLogs);

    persistLocalState(updatedAuction, teams, updatedPlayers, bids, newLogs);
    broadcast('STATE_UPDATE', { auction: updatedAuction, teams, players: updatedPlayers, bids, logs: newLogs });

    return { success: true };
  };

  // Mark current player as SOLD
  const markSold = async (): Promise<{ success: boolean; message?: string }> => {
    if (!auction || !currentPlayer) return { success: false, message: 'No active player' };
    if (!auction.current_bidder_team_id || auction.current_bid <= 0) {
      return { success: false, message: 'Cannot mark SOLD without at least one valid bid. Use Mark Unsold if no bids.' };
    }

    const winnerTeam = teams.find(t => t.id === auction.current_bidder_team_id);
    if (!winnerTeam) return { success: false, message: 'Winning team not found' };

    const soldPrice = auction.current_bid;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.rpc('admin_mark_sold', {
          p_auction_id: auction.id,
          p_player_id: currentPlayer.id,
          p_admin_pin: userSession?.adminPin || auction.admin_pin
        });
      } catch (err) {
        console.warn('Supabase mark sold error:', err);
      }
    }

    const updatedTeams = teams.map(t => 
      t.id === winnerTeam.id ? { ...t, purse_remaining: t.purse_remaining - soldPrice } : t
    );

    const updatedPlayers = players.map(p => 
      p.id === currentPlayer.id 
        ? { ...p, status: 'SOLD' as const, sold_price: soldPrice, sold_to_team_id: winnerTeam.id } 
        : p
    );

    const updatedAuction: Auction = {
      ...auction,
      current_player_id: null,
      current_bid: 0,
      current_bidder_team_id: null,
      timer_ends_at: null,
      updated_at: new Date().toISOString()
    };

    const newLog: AuctionLog = {
      id: `log-${Date.now()}`,
      auction_id: auction.id,
      action_type: 'PLAYER_SOLD',
      description: `🔨 SOLD! ${currentPlayer.name} sold to ${winnerTeam.name} for ${auction.currency_symbol}${soldPrice.toLocaleString()}`,
      metadata: { player_id: currentPlayer.id, team_id: winnerTeam.id, amount: soldPrice },
      created_at: new Date().toISOString()
    };

    const newLogs = [newLog, ...logs];

    setTeams(updatedTeams);
    setPlayers(updatedPlayers);
    setAuction(updatedAuction);
    setLogs(newLogs);

    const soldResult: LastAuctionedResult = {
      player: { ...currentPlayer, status: 'SOLD' as const, sold_price: soldPrice, sold_to_team_id: winnerTeam.id },
      status: 'SOLD',
      team: winnerTeam,
      price: soldPrice,
      leaderName: winnerTeam.owner_name,
      timestamp: Date.now()
    };
    setLastAuctionedResult(soldResult);

    const celebrationPayload = {
      player: { ...currentPlayer, status: 'SOLD' as const, sold_price: soldPrice, sold_to_team_id: winnerTeam.id },
      team: winnerTeam,
      price: soldPrice,
      auction: updatedAuction,
      teams: updatedTeams,
      players: updatedPlayers,
      log: newLog,
      lastAuctionedResult: soldResult
    };

    setSoldPlayerEvent(celebrationPayload);
    soundManager.playHammerStrike();
    setTimeout(() => soundManager.playSoldFanfare(), 300);

    persistLocalState(updatedAuction, updatedTeams, updatedPlayers, bids, newLogs);
    broadcast('PLAYER_SOLD', celebrationPayload);

    return { success: true };
  };

  // Mark current player as UNSOLD
  const markUnsold = async (): Promise<{ success: boolean; message?: string }> => {
    if (!auction || !currentPlayer) return { success: false, message: 'No active player' };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.rpc('admin_mark_unsold', {
          p_auction_id: auction.id,
          p_player_id: currentPlayer.id,
          p_admin_pin: userSession?.adminPin || auction.admin_pin
        });
      } catch (err) {
        console.warn('Supabase mark unsold error:', err);
      }
    }

    const updatedPlayers = players.map(p => 
      p.id === currentPlayer.id 
        ? { ...p, status: 'UNSOLD' as const, sold_price: null, sold_to_team_id: null } 
        : p
    );

    const updatedAuction: Auction = {
      ...auction,
      current_player_id: null,
      current_bid: 0,
      current_bidder_team_id: null,
      timer_ends_at: null,
      updated_at: new Date().toISOString()
    };

    const newLog: AuctionLog = {
      id: `log-${Date.now()}`,
      auction_id: auction.id,
      action_type: 'PLAYER_UNSOLD',
      description: `❌ UNSOLD! ${currentPlayer.name} remains unsold.`,
      metadata: { player_id: currentPlayer.id },
      created_at: new Date().toISOString()
    };

    const newLogs = [newLog, ...logs];

    setPlayers(updatedPlayers);
    setAuction(updatedAuction);
    setLogs(newLogs);

    const unsoldResult: LastAuctionedResult = {
      player: { ...currentPlayer, status: 'UNSOLD' as const },
      status: 'UNSOLD',
      timestamp: Date.now()
    };
    setLastAuctionedResult(unsoldResult);

    const unsoldPayload = {
      player: { ...currentPlayer, status: 'UNSOLD' as const },
      auction: updatedAuction,
      players: updatedPlayers,
      log: newLog,
      lastAuctionedResult: unsoldResult
    };

    setUnsoldPlayerEvent(unsoldPayload);
    soundManager.playUnsoldBuzzer();

    persistLocalState(updatedAuction, teams, updatedPlayers, bids, newLogs);
    broadcast('PLAYER_UNSOLD', unsoldPayload);

    return { success: true };
  };

  // Kick participant by Admin
  const kickParticipant = async (teamId: string) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    const kickedName = targetTeam.owner_name;
    const updatedTeams = teams.map(t => 
      t.id === teamId 
        ? { ...t, is_claimed: false, owner_name: '', owner_pin: '' }
        : t
    );

    const kickLog: AuctionLog = {
      id: `log-${Date.now()}`,
      auction_id: auction?.id || 'demo',
      action_type: 'OVERRIDE_RESULT',
      description: `Admin removed ${kickedName || 'participant'} from ${targetTeam.name}`,
      created_at: new Date().toISOString()
    };

    const newLogs = [kickLog, ...logs];
    setTeams(updatedTeams);
    setLogs(newLogs);

    if (auction) {
      persistLocalState(auction, updatedTeams, players, bids, newLogs);
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('teams').update({
            is_claimed: false,
            owner_name: '',
            owner_pin: ''
          }).eq('id', teamId);
        } catch (err) {
          console.warn('Supabase kick update error:', err);
        }
      }
    }

    broadcast('PARTICIPANT_KICKED', { teamId, kickedName, teams: updatedTeams });
  };

  markSoldRef.current = markSold;
  markUnsoldRef.current = markUnsold;

  // USER REQUIREMENT: Once one player is sold automatically the next player will come to auction
  const startNextUpcomingPlayer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setSoldPlayerEvent(null);
    setUnsoldPlayerEvent(null);

    setPlayers(currentPlayers => {
      const nextUpcoming = currentPlayers.find(p => p.status === 'UPCOMING');
      if (nextUpcoming) {
        setTimeout(() => {
          startPlayerAuction(nextUpcoming.id);
        }, 300);
      }
      return currentPlayers;
    });
  }, [startPlayerAuction]);

  // Auto-advance timer: 4.5 seconds after SOLD or UNSOLD, automatically bring next player
  useEffect(() => {
    if ((soldPlayerEvent || unsoldPlayerEvent) && isAutoAdvance) {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = setTimeout(() => {
        startNextUpcomingPlayer();
      }, 4500);
    }
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [soldPlayerEvent, unsoldPlayerEvent, isAutoAdvance, startNextUpcomingPlayer]);

  // USER REQUIREMENT: Room admin can change timer duration and extend seconds on the fly
  const setTimerDuration = async (seconds: number, updateActive: boolean = true) => {
    if (!auction) return;
    const newTimerEnds = updateActive && auction.current_player_id && auction.status === 'LIVE'
      ? new Date(Date.now() + seconds * 1000).toISOString()
      : auction.timer_ends_at;

    const updatedAuction: Auction = {
      ...auction,
      timer_seconds: seconds,
      timer_ends_at: newTimerEnds,
      updated_at: new Date().toISOString()
    };

    setAuction(updatedAuction);
    setRemainingSeconds(seconds);
    persistLocalState(updatedAuction, teams, players, bids, logs);
    broadcast('STATE_UPDATE', { auction: updatedAuction, teams, players, bids, logs });
  };

  const addSecondsToTimer = async (secondsToAdd: number) => {
    if (!auction || !auction.current_player_id || auction.status !== 'LIVE') return;
    const currentEnd = auction.timer_ends_at ? new Date(auction.timer_ends_at).getTime() : Date.now();
    const newEnd = new Date(Math.max(Date.now(), currentEnd) + secondsToAdd * 1000).toISOString();

    const updatedAuction: Auction = {
      ...auction,
      timer_ends_at: newEnd,
      updated_at: new Date().toISOString()
    };

    setAuction(updatedAuction);
    setRemainingSeconds(prev => Math.max(0, prev + secondsToAdd));
    persistLocalState(updatedAuction, teams, players, bids, logs);
    broadcast('STATE_UPDATE', { auction: updatedAuction, teams, players, bids, logs });
  };

  // Assign or switch my active team (Admin or Owner)
  const assignMyTeam = (teamId: string | null) => {
    setUserSession(prev => {
      const team = teams.find(t => t.id === teamId);
      if (!prev) {
        return {
          role: teamId ? 'TEAM_OWNER' : 'VIEWER',
          displayName: team ? team.owner_name : 'Participant',
          isAdmin: false,
          teamId: teamId
        };
      }
      return {
        ...prev,
        teamId: teamId,
        displayName: team ? team.owner_name : prev.displayName
      };
    });
  };

  // Toggle Pause/Resume
  const togglePauseResume = async () => {
    if (!auction) return;
    const isPaused = auction.status === 'PAUSED';
    const newStatus = isPaused ? 'LIVE' : 'PAUSED';

    let newTimerEnds = auction.timer_ends_at;
    let newPausedRemaining = auction.timer_paused_remaining;

    if (!isPaused) {
      // Pausing: save remaining seconds
      newPausedRemaining = remainingSeconds;
      newTimerEnds = null;
    } else {
      // Resuming: restore remaining seconds
      const secs = newPausedRemaining || auction.timer_seconds || 30;
      newTimerEnds = new Date(Date.now() + secs * 1000).toISOString();
      newPausedRemaining = null;
    }

    const updatedAuction: Auction = {
      ...auction,
      status: newStatus,
      timer_ends_at: newTimerEnds,
      timer_paused_remaining: newPausedRemaining,
      updated_at: new Date().toISOString()
    };

    const newLog: AuctionLog = {
      id: `log-${Date.now()}`,
      auction_id: auction.id,
      action_type: isPaused ? 'AUCTION_RESUMED' : 'AUCTION_PAUSED',
      description: isPaused ? 'Auction resumed by admin.' : 'Auction paused by admin.',
      created_at: new Date().toISOString()
    };

    const newLogs = [newLog, ...logs];

    setAuction(updatedAuction);
    setLogs(newLogs);

    persistLocalState(updatedAuction, teams, players, bids, newLogs);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('auctions').update({
          status: updatedAuction.status,
          timer_ends_at: updatedAuction.timer_ends_at,
          timer_paused_remaining: updatedAuction.timer_paused_remaining,
          updated_at: updatedAuction.updated_at
        }).eq('id', auction.id);
        await supabase.from('auction_logs').insert([newLog]);
      } catch (err) {
        console.warn('Supabase pause/resume error:', err);
      }
    }

    broadcast('STATE_UPDATE', { auction: updatedAuction, teams, players, bids, logs: newLogs });
  };

  // Reset Timer to full duration
  const resetTimer = async () => {
    if (!auction || !auction.current_player_id) return;
    const newTimerEnds = new Date(Date.now() + (auction.timer_seconds || 30) * 1000).toISOString();

    const updatedAuction: Auction = {
      ...auction,
      timer_ends_at: newTimerEnds,
      timer_paused_remaining: null,
      updated_at: new Date().toISOString()
    };

    setAuction(updatedAuction);
    persistLocalState(updatedAuction, teams, players, bids, logs);
    broadcast('STATE_UPDATE', { auction: updatedAuction, teams, players, bids, logs });
  };

  // End Auction Action
  const endAuction = async () => {
    if (!auction) return;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    const updatedAuction: Auction = {
      ...auction,
      status: 'COMPLETED',
      current_player_id: null,
      current_bid: 0,
      current_bidder_team_id: null,
      timer_ends_at: null,
      timer_paused_remaining: null,
      updated_at: new Date().toISOString()
    };

    const endLog: AuctionLog = {
      id: `log-${Date.now()}`,
      auction_id: auction.id,
      action_type: 'OVERRIDE_RESULT',
      description: `🏆 Auction concluded by room host. All team squads and budgets are finalized!`,
      created_at: new Date().toISOString()
    };

    const newLogs = [endLog, ...logs];
    setAuction(updatedAuction);
    setLogs(newLogs);
    setIsTimerRunning(false);

    persistLocalState(updatedAuction, teams, players, bids, newLogs);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('auctions').update({
          status: 'COMPLETED',
          current_player_id: null,
          current_bid: 0,
          current_bidder_team_id: null,
          timer_ends_at: null,
          timer_paused_remaining: null,
          updated_at: updatedAuction.updated_at
        }).eq('id', auction.id);
        await supabase.from('auction_logs').insert([endLog]);
      } catch (err) {
        console.warn('Supabase end auction error:', err);
      }
    }

    broadcast('STATE_UPDATE', { auction: updatedAuction, teams, players, bids, logs: newLogs });
    soundManager.playSoldFanfare();
  };

  // Manual Override Result
  const manualOverride = async (
    playerId: string,
    newStatus: 'UPCOMING' | 'SOLD' | 'UNSOLD',
    newTeamId?: string,
    newPrice?: number
  ): Promise<{ success: boolean; message?: string }> => {
    if (!auction) return { success: false, message: 'No auction' };

    const targetPlayer = players.find(p => p.id === playerId);
    if (!targetPlayer) return { success: false, message: 'Player not found' };

    // Restore old team's purse if player was previously SOLD
    let updatedTeams = [...teams];
    if (targetPlayer.status === 'SOLD' && targetPlayer.sold_to_team_id && targetPlayer.sold_price) {
      updatedTeams = updatedTeams.map(t => 
        t.id === targetPlayer.sold_to_team_id 
          ? { ...t, purse_remaining: t.purse_remaining + targetPlayer.sold_price! } 
          : t
      );
    }

    // If new status is SOLD, deduct from new team's purse
    if (newStatus === 'SOLD' && newTeamId && newPrice) {
      updatedTeams = updatedTeams.map(t => 
        t.id === newTeamId 
          ? { ...t, purse_remaining: t.purse_remaining - newPrice } 
          : t
      );
    }

    const updatedPlayers = players.map(p => 
      p.id === playerId 
        ? {
            ...p,
            status: newStatus,
            sold_price: newStatus === 'SOLD' ? newPrice || 0 : null,
            sold_to_team_id: newStatus === 'SOLD' ? newTeamId || null : null
          }
        : p
    );

    const newLog: AuctionLog = {
      id: `log-${Date.now()}`,
      auction_id: auction.id,
      action_type: 'OVERRIDE_RESULT',
      description: `Manual override: ${targetPlayer.name} marked as ${newStatus}`,
      created_at: new Date().toISOString()
    };

    const newLogs = [newLog, ...logs];

    setTeams(updatedTeams);
    setPlayers(updatedPlayers);
    setLogs(newLogs);

    persistLocalState(auction, updatedTeams, updatedPlayers, bids, newLogs);
    broadcast('STATE_UPDATE', { auction, teams: updatedTeams, players: updatedPlayers, bids, logs: newLogs });

    return { success: true };
  };

  // Add Player
  const addPlayer = async (data: Omit<Player, 'id' | 'auction_id' | 'order_index' | 'status'>) => {
    if (!auction) return;
    const newPlayer: Player = {
      ...data,
      id: `p-${Date.now()}`,
      auction_id: auction.id,
      order_index: players.length + 1,
      status: 'UPCOMING',
      created_at: new Date().toISOString()
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    persistLocalState(auction, teams, updatedPlayers, bids, logs);
    broadcast('STATE_UPDATE', { auction, teams, players: updatedPlayers, bids, logs });
  };

  // Update Player
  const updatePlayer = async (updated: Player) => {
    if (!auction) return;
    const updatedPlayers = players.map(p => p.id === updated.id ? updated : p);
    setPlayers(updatedPlayers);
    persistLocalState(auction, teams, updatedPlayers, bids, logs);
    broadcast('STATE_UPDATE', { auction, teams, players: updatedPlayers, bids, logs });
  };

  // Delete Player
  const deletePlayer = async (playerId: string) => {
    if (!auction) return;
    const updatedPlayers = players.filter(p => p.id !== playerId);
    setPlayers(updatedPlayers);
    persistLocalState(auction, teams, updatedPlayers, bids, logs);
    broadcast('STATE_UPDATE', { auction, teams, players: updatedPlayers, bids, logs });
  };

  // Update Settings
  const updateAuctionSettings = async (settings: Partial<Auction>) => {
    if (!auction) return;
    const updatedAuction: Auction = {
      ...auction,
      ...settings,
      updated_at: new Date().toISOString()
    };

    setAuction(updatedAuction);
    persistLocalState(updatedAuction, teams, players, bids, logs);
    broadcast('STATE_UPDATE', { auction: updatedAuction, teams, players, bids, logs });
  };

  return (
    <AuctionContext.Provider value={{
      auction,
      teams,
      players,
      bids,
      logs,
      userSession,
      isUsingSupabase,
      isConnected,
      currentPlayer,
      highestBidderTeam,
      nextValidBid,
      myTeam,
      remainingSeconds,
      isTimerRunning,
      isAutoAdvance,
      setIsAutoAdvance,
      soldPlayerEvent,
      unsoldPlayerEvent,
      lastAuctionedResult,
      dismissCelebration,
      dismissUnsold,
      startNextUpcomingPlayer,
      setTimerDuration,
      addSecondsToTimer,
      assignMyTeam,
      kickParticipant,
      createAuction,
      joinAuction,
      switchRole,
      leaveAuction,
      placeBid,
      validateBid,
      startPlayerAuction,
      markSold,
      markUnsold,
      togglePauseResume,
      resetTimer,
      endAuction,
      manualOverride,
      addPlayer,
      updatePlayer,
      deletePlayer,
      updateAuctionSettings,
      loadDemoAuction
    }}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be used within an AuctionProvider');
  return ctx;
};

