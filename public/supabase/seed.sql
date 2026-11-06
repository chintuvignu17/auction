-- =====================================================================
-- CRICBID ARENA - SAMPLE SEED DATA
-- Demonstration Auction Room: "Premier Friends League 2025"
-- Room Code: DEMO25 | Admin PIN: 1234
-- =====================================================================

DO $$
DECLARE
    v_auction_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    v_team1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_team2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_team3_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_team4_id UUID := 'b0000000-0000-0000-0000-000000000004'::UUID;
BEGIN
    -- Insert Sample Auction Room
    INSERT INTO auctions (
        id, title, room_code, admin_pin, status, 
        timer_seconds, min_bid_increment, purse_per_team, 
        max_players_per_team, currency_symbol
    ) VALUES (
        v_auction_id, 
        'Premier Friends League 2025', 
        'DEMO25', 
        '1234', 
        'WAITING',
        25, 
        2000000, -- 20 Lakhs
        1000000000, -- 100 Crores
        15,
        '₹'
    ) ON CONFLICT (room_code) DO NOTHING;

    -- Insert Sample Teams
    INSERT INTO teams (id, auction_id, name, short_code, color, logo_url, owner_name, owner_pin, purse_total, purse_remaining)
    VALUES
        (v_team1_id, v_auction_id, 'Royal Challengers', 'RCB', '#ef4444', '🦁', 'Rahul (Captain)', '1111', 1000000000, 1000000000),
        (v_team2_id, v_auction_id, 'Super Kings', 'CSK', '#eab308', '👑', 'Dhoni Fans', '2222', 1000000000, 1000000000),
        (v_team3_id, v_auction_id, 'Mumbai Warriors', 'MI', '#3b82f6', '⚡', 'Rohit Squad', '3333', 1000000000, 1000000000),
        (v_team4_id, v_auction_id, 'Kolkata Knights', 'KKR', '#8b5cf6', '⚔️', 'Knight Riders', '4444', 1000000000, 1000000000)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Sample Players
    INSERT INTO players (auction_id, name, role, batting_style, bowling_style, country, base_price, status, order_index, image_url, custom_stats)
    VALUES
        (v_auction_id, 'Virat Kohli', 'BATSMAN', 'Right-hand bat', 'Right-arm medium', 'India', 20000000, 'UPCOMING', 1, 
         'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60',
         '{"matches": 240, "runs": 7800, "average": 38.5, "strike_rate": 131.2, "centuries": 8}'::jsonb),
         
        (v_auction_id, 'Jasprit Bumrah', 'BOWLER', 'Right-hand bat', 'Right-arm fast', 'India', 20000000, 'UPCOMING', 2,
         'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=500&auto=format&fit=crop&q=60',
         '{"matches": 135, "wickets": 165, "economy": 7.3, "best": "5/10"}'::jsonb),

        (v_auction_id, 'Hardik Pandya', 'ALL_ROUNDER', 'Right-hand bat', 'Right-arm fast-medium', 'India', 20000000, 'UPCOMING', 3,
         'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&auto=format&fit=crop&q=60',
         '{"matches": 137, "runs": 2525, "strike_rate": 145.8, "wickets": 64}'::jsonb),

        (v_auction_id, 'Heinrich Klaasen', 'WICKET_KEEPER', 'Right-hand bat', 'Off break', 'South Africa', 20000000, 'UPCOMING', 4,
         'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60',
         '{"matches": 45, "runs": 1250, "strike_rate": 174.5, "sixes": 72}'::jsonb),

        (v_auction_id, 'Rashid Khan', 'BOWLER', 'Right-hand bat', 'Right-arm legbreak', 'Afghanistan', 20000000, 'UPCOMING', 5,
         'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60',
         '{"matches": 121, "wickets": 149, "economy": 6.8, "strike_rate": 155.0}'::jsonb),

        (v_auction_id, 'Travis Head', 'BATSMAN', 'Left-hand bat', 'Right-arm offbreak', 'Australia', 20000000, 'UPCOMING', 6,
         'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60',
         '{"matches": 38, "runs": 1100, "strike_rate": 178.2, "fifties": 7}'::jsonb),

        (v_auction_id, 'Andre Russell', 'ALL_ROUNDER', 'Right-hand bat', 'Right-arm fast', 'West Indies', 15000000, 'UPCOMING', 7,
         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
         '{"matches": 127, "runs": 2484, "strike_rate": 174.0, "wickets": 115}'::jsonb),

        (v_auction_id, 'Rishabh Pant', 'WICKET_KEEPER', 'Left-hand bat', 'Wicket-keeper', 'India', 20000000, 'UPCOMING', 8,
         'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60',
         '{"matches": 111, "runs": 3284, "strike_rate": 148.9, "dismissals": 90}'::jsonb)
    ON CONFLICT DO NOTHING;

END $$;

