# 🏏 CricBid Arena - Private Friends Cricket Player Auction Web Application

A complete, production-ready private friends cricket player auction web application inspired by real-time sports auctions (such as the IPL Mega Auction). Built with an original premium dark sports-auction design, real-time cross-device bidding synchronization, atomic database transaction guarantees, and dual-engine architecture (Supabase Cloud + Local BroadcastChannel sync).

---

## 🚀 Key Features

### 1. User Roles
- **Admin (Tournament Director / Auctioneer)**: Full auction room control, starting bids, hammer down (SOLD / UNSOLD), timer adjustments, manual override, player and team management.
- **Team Owners (Friends)**: Authorized bidding for assigned teams, real-time purse deduction, 1-click quick bids, budget limit enforcement.
- **Spectators / Viewers**: Read-only live stream of bids, countdowns, and sales activity.

### 2. Auction Setup Wizard (Step-by-Step)
- **Step 1: Auction Rules & Info**: Room Name, Admin Master PIN, Timer duration (15s–60s), Minimum Bid Increment, Purse per Team (e.g. ₹100 Cr or 10,000 Pts), Currency selector (₹, Pts, $), Max squad limits.
- **Step 2: Teams & Purses**: Configure team names, short codes, custom color picker, owner names, and team PINs.
- **Step 3: Player Pool**: Add individual players with photos & stats, load the 1-click "8 IPL All-Stars" pre-built template, or bulk import via CSV. Skip optional fields and edit anytime later.
- **Step 4: Review & Launch**: Instant private room code generation (e.g., `CRIC-7824`).

### 3. Live Auction Engine & Sports UI
- **Player Spotlight**: Hero stage with high-resolution photo, luxury gold border, playing role badge (Batsman, Bowler, All-Rounder, Wicket Keeper), batting/bowling style, base price, and IPL cricket stats.
- **Dynamic Bidding Dock**:
  - 1-click Master Quick Bid (`BID ₹5.20 Cr`).
  - Fast-increment ladder buttons (`+20L`, `+50L`, `+1 Cr`, `+2 Cr`).
  - Custom bid input with real-time budget validation.
  - Prevention of self-outbidding and over-budget bids.
- **IPL-Style Countdown Timer**: Circular SVG gauge with color transitions (Cyan > Amber > Pulsing Crimson) and visual warning flags ("Going Once", "Going Twice", "Final Call!").
- **Offline Web Audio API Sound Effects**: Gavel/hammer strike, ascending bid chime, countdown clock ticks, final warning clicks, SOLD brass fanfare, and UNSOLD buzzer (zero external audio dependencies).
- **Celebration Animations**: Golden SOLD stamp overlay with confetti explosions (`canvas-confetti`) and dramatic UNSOLD stamp.
- **Live Activity Ticker**: Real-time streaming log of every bid placed and player sold.

### 4. Dashboards & Analytics
- **Team Squads View**: Live remaining purse tracker, total spent, squad limits, and expandable lists of acquired players.
- **Player Pool View**: Filterable by Status (All, Upcoming, Sold, Unsold) and Role with search bar.
- **Auction Summary & Leaderboard**: Top buys ranking, purse spent leaderboard, and 1-click **Export to CSV**.
- **Admin Manual Override**: Undo accidental sales, reassign winning teams, adjust sold prices, and automatically recalculate team budgets.

---

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Bundler & Tooling**: Vite 5
- **Styling**: Tailwind CSS (Custom luxury sports dark theme: `#050811`, gold `#f59e0b`, electric blue `#06b6d4`)
- **Icons**: Lucide React
- **Animations**: Canvas Confetti, Tailwind CSS keyframes
- **Sound**: Web Audio API Synthesizer
- **Database & Realtime**: Supabase PostgreSQL with Row Level Security (RLS) & Realtime Channels
- **Deployment**: Vercel-ready with `vercel.json` rewrites and optimized chunking

---

## 🗄️ Database Architecture & Security

The database schema (`supabase/schema.sql`) implements:
- **`auctions`**: Room settings, status (`WAITING`, `LIVE`, `PAUSED`, `COMPLETED`), current player, current bid, leading bidder team, timer timestamps.
- **`teams`**: Team identity, colors, owner authentication PIN, `purse_total`, and `purse_remaining`.
- **`players`**: Player metadata, role, base price, status (`UPCOMING`, `IN_AUCTION`, `SOLD`, `UNSOLD`), `sold_price`, and `sold_to_team_id`.
- **`bids`**: Immutable audit log of every bid placed.
- **`auction_logs`**: Chronological event logs for real-time live feeds.
- **Atomic Concurrency Protection**:
  - `place_bid` PostgreSQL function uses `FOR UPDATE` row locks to eliminate race conditions if two friends bid simultaneously.
  - Server-side validation prevents bids below minimum increment, bids exceeding purse, or outbidding one's own team.

---

## ⚡ Quick Start (Local Run)

```bash
# 1. Install dependencies
npm install

# 2. Run test suite
npm test

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **💡 Multi-Tab Testing (No Supabase Needed!)**:
> CricBid Arena features a built-in `BroadcastChannel` synchronization engine. Open three browser windows side-by-side:
> 1. Window 1: Join as **Admin** (PIN: `1234`).
> 2. Window 2: Join as **Team Owner (CSK)** (PIN: `2222`).
> 3. Window 3: Join as **Team Owner (RCB)** (PIN: `1111`).
> Place bids in Window 2 and watch the amounts, leading team badges, timers, and audio chimes instantly sync across all three windows in real time!

---

## 🌐 Supabase Configuration (Free Tier)

To enable cross-network live synchronization across different devices and friends on their mobile phones:

1. Create a free Supabase project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository, paste its contents, and click **Run**.
4. (Optional) Run `supabase/seed.sql` to populate a demo room (`CRIC25`).
5. In your Supabase Project Settings > **API**, copy your:
   - **Project URL** (`https://xyz.supabase.co`)
   - **Anon Public Key** (`eyJhbGci...`)
6. In CricBid Arena, click the **Supabase / Local Sync** button in the header and paste your URL and Key (or save them in `.env`).

---

## 🚀 Vercel Deployment

1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In Project Settings > **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **Deploy**. Vercel will build the project using `npm run build` and serve it with the included `vercel.json` rewrites.

