-- =====================================================================
-- CRICBID ARENA - PRODUCTION SUPABASE DATABASE SCHEMA
-- Private Friends Cricket Player Auction Web Application
-- =====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running migration
DROP TABLE IF EXISTS auction_logs CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;

-- 3. Auctions Table
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    room_code TEXT NOT NULL UNIQUE,
    admin_pin TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'WAITING', 'LIVE', 'PAUSED', 'COMPLETED')),
    timer_seconds INT NOT NULL DEFAULT 30,
    min_bid_increment BIGINT NOT NULL DEFAULT 2000000, -- 20 Lakhs
    purse_per_team BIGINT NOT NULL DEFAULT 1000000000, -- 100 Crores (in currency units)
    max_players_per_team INT NOT NULL DEFAULT 15,
    currency_symbol TEXT NOT NULL DEFAULT '₹',
    current_player_id UUID, -- References players(id) added via FK later
    current_bid BIGINT NOT NULL DEFAULT 0,
    current_bidder_team_id UUID, -- References teams(id) added via FK later
    timer_ends_at TIMESTAMPTZ,
    timer_paused_remaining INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Teams Table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_code VARCHAR(10) NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    logo_url TEXT,
    owner_name TEXT NOT NULL DEFAULT 'Team Owner',
    owner_pin VARCHAR(20),
    purse_total BIGINT NOT NULL,
    purse_remaining BIGINT NOT NULL,
    is_claimed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Players Table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER')),
    batting_style TEXT DEFAULT 'Right-hand bat',
    bowling_style TEXT DEFAULT 'Right-arm medium',
    country TEXT DEFAULT 'India',
    image_url TEXT,
    base_price BIGINT NOT NULL DEFAULT 2000000,
    status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'IN_AUCTION', 'SOLD', 'UNSOLD')),
    sold_price BIGINT,
    sold_to_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    order_index INT NOT NULL DEFAULT 0,
    custom_stats JSONB DEFAULT '{"matches": 0, "runs": 0, "wickets": 0, "strike_rate": 0, "economy": 0}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Circular FK additions for auctions
ALTER TABLE auctions 
    ADD CONSTRAINT fk_auction_current_player 
    FOREIGN KEY (current_player_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE auctions 
    ADD CONSTRAINT fk_auction_current_bidder 
    FOREIGN KEY (current_bidder_team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- 6. Bids Table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    bidder_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Auction Activity Logs Table
CREATE TABLE auction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Indexes for ultra-fast query and realtime performance
CREATE INDEX idx_auctions_room_code ON auctions(room_code);
CREATE INDEX idx_teams_auction_id ON teams(auction_id);
CREATE INDEX idx_players_auction_id ON players(auction_id);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_sold_to ON players(sold_to_team_id);
CREATE INDEX idx_bids_player_id ON bids(player_id);
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_auction_logs_auction_id ON auction_logs(auction_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active auctions and associated data
CREATE POLICY "Public can view auctions by room_code" ON auctions FOR SELECT USING (true);
CREATE POLICY "Public can insert auctions" ON auctions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update auctions" ON auctions FOR UPDATE USING (true);

CREATE POLICY "Public can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public can insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update teams" ON teams FOR UPDATE USING (true);

CREATE POLICY "Public can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Public can insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update players" ON players FOR UPDATE USING (true);
CREATE POLICY "Public can delete players" ON players FOR DELETE USING (true);

CREATE POLICY "Public can view bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Public can insert bids" ON bids FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view auction_logs" ON auction_logs FOR SELECT USING (true);
CREATE POLICY "Public can insert auction_logs" ON auction_logs FOR INSERT WITH CHECK (true);

-- Enable Supabase Realtime Publication
BEGIN;
  -- Drop publication if exists or add tables
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE auctions, teams, players, bids, auction_logs;
COMMIT;

-- =====================================================================
-- ATOMIC BIDDING RPC FUNCTION
-- Safe concurrent execution with row-level locks
-- =====================================================================
CREATE OR REPLACE FUNCTION place_bid(
    p_auction_id UUID,
    p_player_id UUID,
    p_team_id UUID,
    p_bid_amount BIGINT,
    p_bidder_name TEXT,
    p_owner_pin TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auction RECORD;
    v_team RECORD;
    v_player RECORD;
    v_min_allowed BIGINT;
    v_player_count INT;
BEGIN
    -- 1. Lock auction row to serialize concurrent bids
    SELECT * INTO v_auction
    FROM auctions
    WHERE id = p_auction_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'AUCTION_NOT_FOUND', 'message', 'Auction not found');
    END IF;

    -- Check auction status
    IF v_auction.status != 'LIVE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'AUCTION_NOT_LIVE', 'message', 'Auction is not currently LIVE');
    END IF;

    -- Check active player
    IF v_auction.current_player_id IS NULL OR v_auction.current_player_id != p_player_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'PLAYER_MISMATCH', 'message', 'Player is not currently under bidding');
    END IF;

    -- Check if this team is ALREADY the highest bidder
    IF v_auction.current_bidder_team_id = p_team_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'ALREADY_HIGHEST', 'message', 'Your team already has the highest bid');
    END IF;

    -- 2. Lock player row
    SELECT * INTO v_player
    FROM players
    WHERE id = p_player_id
    FOR UPDATE;

    IF NOT FOUND OR v_player.status != 'IN_AUCTION' THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_PLAYER_STATE', 'message', 'Player is not in active bidding state');
    END IF;

    -- 3. Calculate minimum allowed bid
    IF v_auction.current_bid = 0 THEN
        v_min_allowed := v_player.base_price;
    ELSE
        v_min_allowed := v_auction.current_bid + v_auction.min_bid_increment;
    END IF;

    IF p_bid_amount < v_min_allowed THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'BID_TOO_LOW', 
            'message', 'Bid must be at least ' || v_min_allowed,
            'min_allowed', v_min_allowed
        );
    END IF;

    -- 4. Lock team row
    SELECT * INTO v_team
    FROM teams
    WHERE id = p_team_id AND auction_id = p_auction_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'TEAM_NOT_FOUND', 'message', 'Team does not belong to this auction');
    END IF;

    -- Check team PIN if configured on the team
    IF v_team.owner_pin IS NOT NULL AND v_team.owner_pin != '' THEN
        IF p_owner_pin IS NULL OR p_owner_pin != v_team.owner_pin THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_PIN', 'message', 'Unauthorized: Invalid team owner PIN');
        END IF;
    END IF;

    -- Check remaining budget
    IF v_team.purse_remaining < p_bid_amount THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'INSUFFICIENT_PURSE', 
            'message', 'Bid exceeds team remaining budget (' || v_team.purse_remaining || ' available)'
        );
    END IF;

    -- Check squad limit
    SELECT COUNT(*) INTO v_player_count
    FROM players
    WHERE auction_id = p_auction_id AND sold_to_team_id = p_team_id;

    IF v_player_count >= v_auction.max_players_per_team THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'SQUAD_FULL', 
            'message', 'Team squad limit of ' || v_auction.max_players_per_team || ' players reached'
        );
    END IF;

    -- 5. Atomic Update Auction State
    UPDATE auctions
    SET 
        current_bid = p_bid_amount,
        current_bidder_team_id = p_team_id,
        timer_ends_at = NOW() + (v_auction.timer_seconds || ' seconds')::INTERVAL,
        updated_at = NOW()
    WHERE id = p_auction_id;

    -- 6. Insert into Bids history
    INSERT INTO bids (auction_id, player_id, team_id, amount, bidder_name)
    VALUES (p_auction_id, p_player_id, p_team_id, p_bid_amount, p_bidder_name);

    -- 7. Insert Activity Log
    INSERT INTO auction_logs (auction_id, action_type, description, metadata)
    VALUES (
        p_auction_id, 
        'BID_PLACED', 
        v_team.name || ' bid ' || v_auction.currency_symbol || p_bid_amount || ' for ' || v_player.name,
        jsonb_build_object(
            'player_id', p_player_id,
            'player_name', v_player.name,
            'team_id', p_team_id,
            'team_name', v_team.name,
            'amount', p_bid_amount,
            'bidder_name', p_bidder_name
        )
    );

    RETURN jsonb_build_object(
        'success', true, 
        'new_bid', p_bid_amount,
        'team_id', p_team_id,
        'team_name', v_team.name,
        'timer_seconds', v_auction.timer_seconds
    );
END;
$$;

-- =====================================================================
-- ADMIN RPC FUNCTIONS
-- =====================================================================

-- Start Auction on Player
CREATE OR REPLACE FUNCTION admin_start_player(
    p_auction_id UUID,
    p_player_id UUID,
    p_admin_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auction RECORD;
    v_player RECORD;
BEGIN
    SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'message', 'Auction not found'); END IF;
    IF v_auction.admin_pin != p_admin_pin THEN RETURN jsonb_build_object('success', false, 'message', 'Invalid Admin PIN'); END IF;

    SELECT * INTO v_player FROM players WHERE id = p_player_id AND auction_id = p_auction_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'message', 'Player not found'); END IF;

    -- Update player to IN_AUCTION
    UPDATE players SET status = 'IN_AUCTION' WHERE id = p_player_id;

    -- Update auction
    UPDATE auctions
    SET 
        status = 'LIVE',
        current_player_id = p_player_id,
        current_bid = 0,
        current_bidder_team_id = NULL,
        timer_ends_at = NOW() + (v_auction.timer_seconds || ' seconds')::INTERVAL,
        updated_at = NOW()
    WHERE id = p_auction_id;

    INSERT INTO auction_logs (auction_id, action_type, description, metadata)
    VALUES (
        p_auction_id,
        'PLAYER_CALLED',
        v_player.name || ' (' || v_player.role || ') is now up for bidding!',
        jsonb_build_object('player_id', p_player_id, 'player_name', v_player.name, 'base_price', v_player.base_price)
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Mark Player SOLD
CREATE OR REPLACE FUNCTION admin_mark_sold(
    p_auction_id UUID,
    p_player_id UUID,
    p_admin_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auction RECORD;
    v_player RECORD;
    v_team RECORD;
    v_final_price BIGINT;
    v_winner_id UUID;
BEGIN
    SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'message', 'Auction not found'); END IF;
    IF v_auction.admin_pin != p_admin_pin THEN RETURN jsonb_build_object('success', false, 'message', 'Invalid Admin PIN'); END IF;

    IF v_auction.current_bidder_team_id IS NULL OR v_auction.current_bid <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'No valid bids placed yet. Cannot mark SOLD without a bidder.');
    END IF;

    v_final_price := v_auction.current_bid;
    v_winner_id := v_auction.current_bidder_team_id;

    SELECT * INTO v_player FROM players WHERE id = p_player_id AND auction_id = p_auction_id FOR UPDATE;
    SELECT * INTO v_team FROM teams WHERE id = v_winner_id FOR UPDATE;

    -- Update player
    UPDATE players
    SET 
        status = 'SOLD',
        sold_price = v_final_price,
        sold_to_team_id = v_winner_id
    WHERE id = p_player_id;

    -- Deduct from team purse
    UPDATE teams
    SET purse_remaining = purse_remaining - v_final_price
    WHERE id = v_winner_id;

    -- Reset auction active slot
    UPDATE auctions
    SET 
        current_player_id = NULL,
        current_bid = 0,
        current_bidder_team_id = NULL,
        timer_ends_at = NULL,
        updated_at = NOW()
    WHERE id = p_auction_id;

    -- Log
    INSERT INTO auction_logs (auction_id, action_type, description, metadata)
    VALUES (
        p_auction_id,
        'PLAYER_SOLD',
        '🔨 SOLD! ' || v_player.name || ' sold to ' || v_team.name || ' for ' || v_auction.currency_symbol || v_final_price,
        jsonb_build_object(
            'player_id', p_player_id, 
            'player_name', v_player.name, 
            'team_id', v_winner_id, 
            'team_name', v_team.name, 
            'amount', v_final_price
        )
    );

    RETURN jsonb_build_object('success', true, 'player_id', p_player_id, 'winner', v_team.name, 'price', v_final_price);
END;
$$;

-- Mark Player UNSOLD
CREATE OR REPLACE FUNCTION admin_mark_unsold(
    p_auction_id UUID,
    p_player_id UUID,
    p_admin_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auction RECORD;
    v_player RECORD;
BEGIN
    SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'message', 'Auction not found'); END IF;
    IF v_auction.admin_pin != p_admin_pin THEN RETURN jsonb_build_object('success', false, 'message', 'Invalid Admin PIN'); END IF;

    SELECT * INTO v_player FROM players WHERE id = p_player_id AND auction_id = p_auction_id FOR UPDATE;

    -- Update player
    UPDATE players
    SET 
        status = 'UNSOLD',
        sold_price = NULL,
        sold_to_team_id = NULL
    WHERE id = p_player_id;

    -- Reset auction active slot
    UPDATE auctions
    SET 
        current_player_id = NULL,
        current_bid = 0,
        current_bidder_team_id = NULL,
        timer_ends_at = NULL,
        updated_at = NOW()
    WHERE id = p_auction_id;

    -- Log
    INSERT INTO auction_logs (auction_id, action_type, description, metadata)
    VALUES (
        p_auction_id,
        'PLAYER_UNSOLD',
        '❌ UNSOLD! ' || v_player.name || ' remains unsold.',
        jsonb_build_object('player_id', p_player_id, 'player_name', v_player.name)
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Manual Override Result (undo sold, re-assign, restore purse)
CREATE OR REPLACE FUNCTION admin_override_player(
    p_auction_id UUID,
    p_player_id UUID,
    p_new_status TEXT,
    p_new_team_id UUID,
    p_new_price BIGINT,
    p_admin_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auction RECORD;
    v_player RECORD;
    v_old_team_id UUID;
    v_old_price BIGINT;
BEGIN
    SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'message', 'Auction not found'); END IF;
    IF v_auction.admin_pin != p_admin_pin THEN RETURN jsonb_build_object('success', false, 'message', 'Invalid Admin PIN'); END IF;

    SELECT * INTO v_player FROM players WHERE id = p_player_id AND auction_id = p_auction_id FOR UPDATE;
    v_old_team_id := v_player.sold_to_team_id;
    v_old_price := COALESCE(v_player.sold_price, 0);

    -- If previously sold to a team, restore that team's purse
    IF v_old_team_id IS NOT NULL AND v_old_price > 0 THEN
        UPDATE teams
        SET purse_remaining = purse_remaining + v_old_price
        WHERE id = v_old_team_id;
    END IF;

    -- Apply new status
    IF p_new_status = 'SOLD' AND p_new_team_id IS NOT NULL THEN
        UPDATE players
        SET status = 'SOLD', sold_price = p_new_price, sold_to_team_id = p_new_team_id
        WHERE id = p_player_id;

        UPDATE teams
        SET purse_remaining = purse_remaining - p_new_price
        WHERE id = p_new_team_id;
    ELSE
        UPDATE players
        SET status = p_new_status, sold_price = NULL, sold_to_team_id = NULL
        WHERE id = p_player_id;
    END IF;

    INSERT INTO auction_logs (auction_id, action_type, description, metadata)
    VALUES (
        p_auction_id,
        'OVERRIDE_RESULT',
        'Admin manually updated ' || v_player.name || ' status to ' || p_new_status,
        jsonb_build_object('player_id', p_player_id, 'new_status', p_new_status, 'price', p_new_price)
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

