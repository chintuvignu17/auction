export type PlayerRole = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';

export type PlayerStatus = 'UPCOMING' | 'IN_AUCTION' | 'SOLD' | 'UNSOLD';

export type AuctionStatus = 'DRAFT' | 'WAITING' | 'LIVE' | 'PAUSED' | 'COMPLETED';

export type UserRole = 'ADMIN' | 'TEAM_OWNER' | 'VIEWER';

export interface PlayerStats {
  matches?: number;
  runs?: number;
  wickets?: number;
  average?: number;
  strike_rate?: number;
  economy?: number;
  best?: string;
  fifties?: number;
  centuries?: number;
  sixes?: number;
  dismissals?: number;
}

export interface Player {
  id: string;
  auction_id: string;
  name: string;
  role: PlayerRole;
  batting_style?: string;
  bowling_style?: string;
  country?: string;
  image_url?: string;
  base_price: number;
  status: PlayerStatus;
  sold_price?: number | null;
  sold_to_team_id?: string | null;
  order_index: number;
  custom_stats?: PlayerStats;
  created_at?: string;
}

export interface Team {
  id: string;
  auction_id: string;
  name: string;
  short_code: string;
  color: string;
  logo_url?: string;
  owner_name: string;
  owner_pin?: string;
  purse_total: number;
  purse_remaining: number;
  is_claimed?: boolean;
  created_at?: string;
}

export interface Bid {
  id: string;
  auction_id: string;
  player_id: string;
  team_id: string;
  amount: number;
  bidder_name: string;
  created_at: string;
}

export interface AuctionLog {
  id: string;
  auction_id: string;
  action_type: 'BID_PLACED' | 'PLAYER_CALLED' | 'PLAYER_SOLD' | 'PLAYER_UNSOLD' | 'AUCTION_STARTED' | 'AUCTION_PAUSED' | 'AUCTION_RESUMED' | 'OVERRIDE_RESULT';
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Auction {
  id: string;
  title: string;
  room_code: string;
  admin_pin: string;
  status: AuctionStatus;
  timer_seconds: number;
  min_bid_increment: number;
  purse_per_team: number;
  max_players_per_team: number;
  currency_symbol: string;
  current_player_id?: string | null;
  current_bid: number;
  current_bidder_team_id?: string | null;
  timer_ends_at?: string | null;
  timer_paused_remaining?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ActiveUserSession {
  role: UserRole;
  teamId?: string | null;
  displayName: string;
  isAdmin: boolean;
  adminPin?: string;
  room_code?: string;
}

export interface BidValidationResult {
  valid: boolean;
  minAllowed: number;
  reason?: string;
}

export interface LastAuctionedResult {
  player: Player;
  status: 'SOLD' | 'UNSOLD';
  team?: Team | null;
  price?: number;
  leaderName?: string;
  timestamp: number;
}


