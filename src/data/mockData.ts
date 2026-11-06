import { Auction, Team, Player } from '../types/auction';

export const INITIAL_DEMO_AUCTION: Auction = {
  id: 'demo-auction-1',
  title: 'TATA IPL Mega Auction 2025',
  room_code: 'CRIC25',
  admin_pin: '1234',
  status: 'WAITING',
  timer_seconds: 15, // Default to 15 seconds per requirement
  min_bid_increment: 2000000, // 20 Lakhs
  purse_per_team: 1000000000, // 100 Crores
  max_players_per_team: 15, // STRICT REQUIREMENT: exactly 15 players max capacity per team
  currency_symbol: '₹', // Fixed to Indian Rupee
  current_player_id: null,
  current_bid: 0,
  current_bidder_team_id: null,
  timer_ends_at: null,
  timer_paused_remaining: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// All 10 official IPL teams with full names, short codes, official logos and brand colors
export const ALL_10_IPL_TEAMS: Array<{
  name: string;
  shortCode: string;
  color: string;
  logo: string;
}> = [
    { name: 'Chennai Super Kings', shortCode: 'CSK', color: '#facc15', logo: '/images/teams/csk.png' },
    { name: 'Mumbai Indians', shortCode: 'MI', color: '#2563eb', logo: '/images/teams/mi.png' },
    { name: 'Royal Challengers Bengaluru', shortCode: 'RCB', color: '#ef4444', logo: '/images/teams/rcb.png' },
    { name: 'Kolkata Knight Riders', shortCode: 'KKR', color: '#8b5cf6', logo: '/images/teams/kkr.png' },
    { name: 'Sunrisers Hyderabad', shortCode: 'SRH', color: '#f97316', logo: '/images/teams/srh.png' },
    { name: 'Rajasthan Royals', shortCode: 'RR', color: '#ec4899', logo: '/images/teams/rr.png' },
    { name: 'Delhi Capitals', shortCode: 'DC', color: '#06b6d4', logo: '/images/teams/dc.png' },
    { name: 'Punjab Kings', shortCode: 'PBKS', color: '#dc2626', logo: '/images/teams/pbks.png' },
    { name: 'Gujarat Titans', shortCode: 'GT', color: '#0ea5e9', logo: '/images/teams/gt.png' },
    { name: 'Lucknow Super Giants', shortCode: 'LSG', color: '#38bdf8', logo: '/images/teams/lsg.png' },
  ];

export const INITIAL_DEMO_TEAMS: Team[] = ALL_10_IPL_TEAMS.map((t, idx) => ({
  id: `team-${t.shortCode.toLowerCase()}`,
  auction_id: 'demo-auction-1',
  name: t.name,
  short_code: t.shortCode,
  color: t.color,
  logo_url: t.logo,
  owner_name: '',
  owner_pin: `${idx + 1}${idx + 1}${idx + 1}${idx + 1}`,
  purse_total: 1000000000,
  purse_remaining: 1000000000,
  is_claimed: false,
}));

export interface CatalogPlayer {
  name: string;
  role: 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
  basePrice: number;
  country: string;
  team: string;
  imageUrl: string;
  battingStyle: string;
  bowlingStyle: string;
}

// Complete 150 IPL players catalog covering all 10 franchises (15 players per team)
export const IPL_PLAYERS_CATALOG: CatalogPlayer[] = [
  {
    "name": "MS Dhoni",
    "role": "WICKET_KEEPER",
    "basePrice": 20000000,
    "country": "India",
    "team": "CSK",
    "imageUrl": "/images/players/ms-dhoni.webp",
    "battingStyle": "Right-hand power finisher",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Ravindra Jadeja",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "India",
    "team": "CSK",
    "imageUrl": "/images/players/ravindra-jadeja.webp",
    "battingStyle": "Left-hand aggressive bat",
    "bowlingStyle": "Slow left-arm orthodox"
  },
  {
    "name": "Ruturaj Gaikwad",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "India",
    "team": "CSK",
    "imageUrl": "/images/players/ruturaj-gaikwad.jpg",
    "battingStyle": "Right-hand opening anchor",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Shivam Dube",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "India",
    "team": "CSK",
    "imageUrl": "/images/players/shivam-dube.jpg",
    "battingStyle": "Left-hand spin destroyer",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Deepak Chahar",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "CSK",
    "imageUrl": "/images/players/deepak-chahar.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm swing bowler"
  },
  {
    "name": "Rachin Ravindra",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "New Zealand",
    "team": "CSK",
    "imageUrl": "/images/players/rachin-ravindra.jpg",
    "battingStyle": "Left-hand dynamic bat",
    "bowlingStyle": "Slow left-arm orthodox"
  },
  {
    "name": "Shardul Thakur",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "India",
    "team": "CSK",
    "imageUrl": "/images/players/shardul-thakur.jpg",
    "battingStyle": "Right-hand batsman",
    "bowlingStyle": "Right-arm medium fast"
  },
  {
    "name": "Matheesha Pathirana",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "Sri Lanka",
    "team": "CSK",
    "imageUrl": "/images/players/matheesha-pathirana.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm sling yorker"
  },
  {
    "name": "Ajinkya Rahane",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "India",
    "team": "CSK",
    "imageUrl": "/images/players/ajinkya-rahane.png",
    "battingStyle": "Right-hand classical strokeplay",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Mitchell Santner",
    "role": "ALL_ROUNDER",
    "basePrice": 10000000,
    "country": "New Zealand",
    "team": "CSK",
    "imageUrl": "/images/players/mitchell-santner.png",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Slow left-arm orthodox"
  },
  {
    "name": "Moeen Ali",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "England",
    "team": "CSK",
    "imageUrl": "/images/players/moeen-ali.jpg",
    "battingStyle": "Left-hand aggressive hitter",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Devon Conway",
    "role": "WICKET_KEEPER",
    "basePrice": 15000000,
    "country": "New Zealand",
    "team": "CSK",
    "imageUrl": "/images/players/devon-conway.jpg",
    "battingStyle": "Left-hand opening batter",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Tushar Deshpande",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "CSK",
    "imageUrl": "/images/players/tushar-deshpande.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm fast medium"
  },
  {
    "name": "Mustafizur Rahman",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "Bangladesh",
    "team": "CSK",
    "imageUrl": "/images/players/mustafizur-rahman.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm cutter specialist"
  },
  {
    "name": "Sameer Rizvi",
    "role": "BATSMAN",
    "basePrice": 5000000,
    "country": "India",
    "team": "CSK",
    "imageUrl": "/images/players/sameer-rizvi.jpg",
    "battingStyle": "Right-hand power hitter",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Rohit Sharma",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/rohit-sharma.webp",
    "battingStyle": "Right-hand puller",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Jasprit Bumrah",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/jasprit-bumrah.webp",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm fast pinpoint yorker"
  },
  {
    "name": "Suryakumar Yadav",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/suryakumar-yadav.webp",
    "battingStyle": "Right-hand 360-degree bat",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Hardik Pandya",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/hardik-pandya.webp",
    "battingStyle": "Right-hand explosive hitter",
    "bowlingStyle": "Right-arm fast medium"
  },
  {
    "name": "Ishan Kishan",
    "role": "WICKET_KEEPER",
    "basePrice": 20000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/ishan-kishan.jpg",
    "battingStyle": "Left-hand explosive opener",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Tilak Varma",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/tilak-varma.png",
    "battingStyle": "Left-hand stylish bat",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Tim David",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "Australia",
    "team": "MI",
    "imageUrl": "/images/players/tim-david.jpg",
    "battingStyle": "Right-hand power finisher",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Gerald Coetzee",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "South Africa",
    "team": "MI",
    "imageUrl": "/images/players/gerald-coetzee.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm express fast"
  },
  {
    "name": "Piyush Chawla",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/piyush-chawla.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Right-arm legbreak googly"
  },
  {
    "name": "Romario Shepherd",
    "role": "ALL_ROUNDER",
    "basePrice": 10000000,
    "country": "West Indies",
    "team": "MI",
    "imageUrl": "/images/players/romario-shepherd.jpg",
    "battingStyle": "Right-hand hard hitter",
    "bowlingStyle": "Right-arm fast medium"
  },
  {
    "name": "Nuwan Thushara",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "Sri Lanka",
    "team": "MI",
    "imageUrl": "/images/players/nuwan-thushara.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm sling yorker"
  },
  {
    "name": "Nehal Wadhera",
    "role": "BATSMAN",
    "basePrice": 5000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/nehal-wadhera.jpg",
    "battingStyle": "Left-hand aggressive bat",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Naman Dhir",
    "role": "ALL_ROUNDER",
    "basePrice": 5000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/naman-dhir.jpg",
    "battingStyle": "Right-hand power hitter",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Akash Madhwal",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "India",
    "team": "MI",
    "imageUrl": "/images/players/akash-madhwal.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm fast medium"
  },
  {
    "name": "Luke Wood",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "England",
    "team": "MI",
    "imageUrl": "/images/players/luke-wood.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm fast swing"
  },
  {
    "name": "Virat Kohli",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "India",
    "team": "RCB",
    "imageUrl": "/images/players/virat-kohli.webp",
    "battingStyle": "Right-hand master chaser",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Faf du Plessis",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "South Africa",
    "team": "RCB",
    "imageUrl": "/images/players/faf-du-plessis.png",
    "battingStyle": "Right-hand opening anchor",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Glenn Maxwell",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "Australia",
    "team": "RCB",
    "imageUrl": "/images/players/glenn-maxwell.png",
    "battingStyle": "Right-hand 360 powerhouse",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Mohammed Siraj",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "India",
    "team": "RCB",
    "imageUrl": "/images/players/mohammed-siraj.webp",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm fast seam"
  },
  {
    "name": "Dinesh Karthik",
    "role": "WICKET_KEEPER",
    "basePrice": 15000000,
    "country": "India",
    "team": "RCB",
    "imageUrl": "/images/players/dinesh-karthik.png",
    "battingStyle": "Right-hand clutch finisher",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Cameron Green",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "Australia",
    "team": "RCB",
    "imageUrl": "/images/players/cameron-green.jpg",
    "battingStyle": "Right-hand tall hard hitter",
    "bowlingStyle": "Right-arm fast"
  },
  {
    "name": "Will Jacks",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "England",
    "team": "RCB",
    "imageUrl": "/images/players/will-jacks.jpg",
    "battingStyle": "Right-hand explosive hitter",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Lockie Ferguson",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "New Zealand",
    "team": "RCB",
    "imageUrl": "/images/players/lockie-ferguson.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm express 150kmph"
  },
  {
    "name": "Rajat Patidar",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "India",
    "team": "RCB",
    "imageUrl": "/images/players/rajat-patidar.jpg",
    "battingStyle": "Right-hand spin attacker",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Yash Dayal",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "RCB",
    "imageUrl": "/images/players/yash-dayal.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm fast swing"
  },
  {
    "name": "Anuj Rawat",
    "role": "WICKET_KEEPER",
    "basePrice": 5000000,
    "country": "India",
    "team": "RCB",
    "imageUrl": "/images/players/anuj-rawat.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Mahipal Lomror",
    "role": "ALL_ROUNDER",
    "basePrice": 5000000,
    "country": "India",
    "team": "RCB",
    "imageUrl": "/images/players/mahipal-lomror.jpg",
    "battingStyle": "Left-hand power hitter",
    "bowlingStyle": "Slow left-arm orthodox"
  },
  {
    "name": "Karn Sharma",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "India",
    "team": "RCB",
    "imageUrl": "/images/players/karn-sharma.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Reece Topley",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "England",
    "team": "RCB",
    "imageUrl": "/images/players/reece-topley.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Left-arm fast bounce"
  },
  {
    "name": "Vijaykumar Vyshak",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "India",
    "team": "RCB",
    "imageUrl": "/images/players/vijaykumar-vyshak.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm medium knuckle"
  },
  {
    "name": "Shreyas Iyer",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/shreyas-iyer.webp",
    "battingStyle": "Right-hand anchor captain",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Andre Russell",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "West Indies",
    "team": "KKR",
    "imageUrl": "/images/players/andre-russell.png",
    "battingStyle": "Right-hand muscle giant",
    "bowlingStyle": "Right-arm fast bowler"
  },
  {
    "name": "Sunil Narine",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "West Indies",
    "team": "KKR",
    "imageUrl": "/images/players/sunil-narine.jpg",
    "battingStyle": "Left-hand pinch opener",
    "bowlingStyle": "Right-arm mystery spin"
  },
  {
    "name": "Mitchell Starc",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "Australia",
    "team": "KKR",
    "imageUrl": "/images/players/mitchell-starc.webp",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm lethal yorker"
  },
  {
    "name": "Rinku Singh",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/rinku-singh.jpg",
    "battingStyle": "Left-hand 5-sixes finisher",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Venkatesh Iyer",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/venkatesh-iyer.png",
    "battingStyle": "Left-hand dynamic bat",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Phil Salt",
    "role": "WICKET_KEEPER",
    "basePrice": 15000000,
    "country": "England",
    "team": "KKR",
    "imageUrl": "/images/players/phil-salt.jpg",
    "battingStyle": "Right-hand blazing opener",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Varun Chakravarthy",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/varun-chakravarthy.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm mystery carrom spin"
  },
  {
    "name": "Nitish Rana",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/nitish-rana.jpg",
    "battingStyle": "Left-hand stroke maker",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Harshit Rana",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/harshit-rana.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm fast aggressive"
  },
  {
    "name": "Rahmanullah Gurbaz",
    "role": "WICKET_KEEPER",
    "basePrice": 10000000,
    "country": "Afghanistan",
    "team": "KKR",
    "imageUrl": "/images/players/rahmanullah-gurbaz.png",
    "battingStyle": "Right-hand attacking opener",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Vaibhav Arora",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/vaibhav-arora.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm fast seam"
  },
  {
    "name": "Ramandeep Singh",
    "role": "ALL_ROUNDER",
    "basePrice": 5000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/ramandeep-singh.jpg",
    "battingStyle": "Right-hand death hitter",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Suyash Sharma",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/suyash-sharma.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Chetan Sakariya",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "India",
    "team": "KKR",
    "imageUrl": "/images/players/chetan-sakariya.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm fast medium"
  },
  {
    "name": "Pat Cummins",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "Australia",
    "team": "SRH",
    "imageUrl": "/images/players/pat-cummins.webp",
    "battingStyle": "Right-hand clutch lower order",
    "bowlingStyle": "Right-arm fast bowler"
  },
  {
    "name": "Travis Head",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "Australia",
    "team": "SRH",
    "imageUrl": "/images/players/travis-head.webp",
    "battingStyle": "Left-hand demolition opener",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Heinrich Klaasen",
    "role": "WICKET_KEEPER",
    "basePrice": 20000000,
    "country": "South Africa",
    "team": "SRH",
    "imageUrl": "/images/players/heinrich-klaasen.webp",
    "battingStyle": "Right-hand monstrous hitter",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Bhuvneshwar Kumar",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/bhuvneshwar-kumar.png",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm swing king"
  },
  {
    "name": "Abhishek Sharma",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/abhishek-sharma.jpg",
    "battingStyle": "Left-hand powerplay blaster",
    "bowlingStyle": "Slow left-arm orthodox"
  },
  {
    "name": "T Natarajan",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/t-natarajan.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm yorker king"
  },
  {
    "name": "Nitish Kumar Reddy",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/nitish-kumar-reddy.jpg",
    "battingStyle": "Right-hand versatile bat",
    "bowlingStyle": "Right-arm medium fast"
  },
  {
    "name": "Aiden Markram",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "South Africa",
    "team": "SRH",
    "imageUrl": "/images/players/aiden-markram.png",
    "battingStyle": "Right-hand elegant stroke maker",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Rahul Tripathi",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/rahul-tripathi.jpg",
    "battingStyle": "Right-hand counter-attacker",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Umran Malik",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/umran-malik.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm raw pace 157kmph"
  },
  {
    "name": "Mayank Agarwal",
    "role": "BATSMAN",
    "basePrice": 10000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/mayank-agarwal.jpg",
    "battingStyle": "Right-hand aggressive opener",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Abdul Samad",
    "role": "BATSMAN",
    "basePrice": 10000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/abdul-samad.jpg",
    "battingStyle": "Right-hand explosive finisher",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Shahbaz Ahmed",
    "role": "ALL_ROUNDER",
    "basePrice": 10000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/shahbaz-ahmed.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Slow left-arm orthodox"
  },
  {
    "name": "Jaydev Unadkat",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "SRH",
    "imageUrl": "/images/players/jaydev-unadkat.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Left-arm fast medium cutter"
  },
  {
    "name": "Glenn Phillips",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "New Zealand",
    "team": "SRH",
    "imageUrl": "/images/players/glenn-phillips.jpg",
    "battingStyle": "Right-hand athletic hitter",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Sanju Samson",
    "role": "WICKET_KEEPER",
    "basePrice": 20000000,
    "country": "India",
    "team": "RR",
    "imageUrl": "/images/players/sanju-samson.webp",
    "battingStyle": "Right-hand effortless strokeplay",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Yashasvi Jaiswal",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "India",
    "team": "RR",
    "imageUrl": "/images/players/yashasvi-jaiswal.webp",
    "battingStyle": "Left-hand fearless opener",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Jos Buttler",
    "role": "WICKET_KEEPER",
    "basePrice": 20000000,
    "country": "England",
    "team": "RR",
    "imageUrl": "/images/players/jos-buttler.jpg",
    "battingStyle": "Right-hand century machine",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Yuzvendra Chahal",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "India",
    "team": "RR",
    "imageUrl": "/images/players/yuzvendra-chahal.png",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm legbreak magician"
  },
  {
    "name": "Trent Boult",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "New Zealand",
    "team": "RR",
    "imageUrl": "/images/players/trent-boult.png",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Left-arm first-over assassin"
  },
  {
    "name": "Ravichandran Ashwin",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "India",
    "team": "RR",
    "imageUrl": "/images/players/ravichandran-ashwin.png",
    "battingStyle": "Right-hand tactical bat",
    "bowlingStyle": "Right-arm carrom ball"
  },
  {
    "name": "Shimron Hetmyer",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "West Indies",
    "team": "RR",
    "imageUrl": "/images/players/shimron-hetmyer.jpg",
    "battingStyle": "Left-hand death-overs hitter",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Riyan Parag",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "India",
    "team": "RR",
    "imageUrl": "/images/players/riyan-parag.jpg",
    "battingStyle": "Right-hand fearless bat",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Dhruv Jurel",
    "role": "WICKET_KEEPER",
    "basePrice": 10000000,
    "country": "India",
    "team": "RR",
    "imageUrl": "/images/players/dhruv-jurel.jpg",
    "battingStyle": "Right-hand composed finisher",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Avesh Khan",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "RR",
    "imageUrl": "/images/players/avesh-khan.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm fast hit-the-deck"
  },
  {
    "name": "Sandeep Sharma",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "RR",
    "imageUrl": "/images/players/sandeep-sharma.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm death knuckle bowler"
  },
  {
    "name": "Rovman Powell",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "West Indies",
    "team": "RR",
    "imageUrl": "/images/players/rovman-powell.jpg",
    "battingStyle": "Right-hand West Indies captain power",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Nandre Burger",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "South Africa",
    "team": "RR",
    "imageUrl": "/images/players/nandre-burger.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm express 148kmph"
  },
  {
    "name": "Kuldeep Sen",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "India",
    "team": "RR",
    "imageUrl": "/images/players/kuldeep-sen.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm fast"
  },
  {
    "name": "Tom Kohler-Cadmore",
    "role": "BATSMAN",
    "basePrice": 5000000,
    "country": "England",
    "team": "RR",
    "imageUrl": "/images/players/tom-kohler-cadmore.jpg",
    "battingStyle": "Right-hand attacking bat",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Rishabh Pant",
    "role": "WICKET_KEEPER",
    "basePrice": 20000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/rishabh-pant.webp",
    "battingStyle": "Left-hand audacious innovator",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Axar Patel",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/axar-patel.png",
    "battingStyle": "Left-hand clutch hitter",
    "bowlingStyle": "Slow left-arm orthodox"
  },
  {
    "name": "Kuldeep Yadav",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/kuldeep-yadav.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm wrist spin wizard"
  },
  {
    "name": "David Warner",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "Australia",
    "team": "DC",
    "imageUrl": "/images/players/david-warner.png",
    "battingStyle": "Left-hand IPL all-time great",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Prithvi Shaw",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/prithvi-shaw.png",
    "battingStyle": "Right-hand attacking opener",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Jake Fraser-McGurk",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "Australia",
    "team": "DC",
    "imageUrl": "/images/players/jake-fraser-mcgurk.jpg",
    "battingStyle": "Right-hand boundary machine",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Khaleel Ahmed",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/khaleel-ahmed.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Left-arm fast swing"
  },
  {
    "name": "Tristan Stubbs",
    "role": "WICKET_KEEPER",
    "basePrice": 15000000,
    "country": "South Africa",
    "team": "DC",
    "imageUrl": "/images/players/tristan-stubbs.jpg",
    "battingStyle": "Right-hand explosive finisher",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Mukesh Kumar",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/mukesh-kumar.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm accurate yorker"
  },
  {
    "name": "Ishant Sharma",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/ishant-sharma.png",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm tall bounce"
  },
  {
    "name": "Anrich Nortje",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "South Africa",
    "team": "DC",
    "imageUrl": "/images/players/anrich-nortje.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm lightning 150kmph"
  },
  {
    "name": "Abhishek Porel",
    "role": "WICKET_KEEPER",
    "basePrice": 5000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/abhishek-porel.jpg",
    "battingStyle": "Left-hand attacking keeper",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Lalit Yadav",
    "role": "ALL_ROUNDER",
    "basePrice": 5000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/lalit-yadav.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Shai Hope",
    "role": "WICKET_KEEPER",
    "basePrice": 10000000,
    "country": "West Indies",
    "team": "DC",
    "imageUrl": "/images/players/shai-hope.jpg",
    "battingStyle": "Right-hand solid bat",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Rasikh Salam",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "India",
    "team": "DC",
    "imageUrl": "/images/players/rasikh-salam.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm medium fast"
  },
  {
    "name": "Shikhar Dhawan",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "India",
    "team": "PBKS",
    "imageUrl": "/images/players/shikhar-dhawan.png",
    "battingStyle": "Left-hand Gabbar opener",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Arshdeep Singh",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "India",
    "team": "PBKS",
    "imageUrl": "/images/players/arshdeep-singh.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm death overs specialist"
  },
  {
    "name": "Sam Curran",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "England",
    "team": "PBKS",
    "imageUrl": "/images/players/sam-curran.png",
    "battingStyle": "Left-hand fighting bat",
    "bowlingStyle": "Left-arm medium swing"
  },
  {
    "name": "Kagiso Rabada",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "South Africa",
    "team": "PBKS",
    "imageUrl": "/images/players/kagiso-rabada.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Right-arm express pace"
  },
  {
    "name": "Harshal Patel",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "PBKS",
    "imageUrl": "/images/players/harshal-patel.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm dipping slower yorker"
  },
  {
    "name": "Jonny Bairstow",
    "role": "WICKET_KEEPER",
    "basePrice": 20000000,
    "country": "England",
    "team": "PBKS",
    "imageUrl": "/images/players/jonny-bairstow.png",
    "battingStyle": "Right-hand aggressive batter",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Liam Livingstone",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "England",
    "team": "PBKS",
    "imageUrl": "/images/players/liam-livingstone.jpg",
    "battingStyle": "Right-hand monster six hitter",
    "bowlingStyle": "Right-arm spin leg/off"
  },
  {
    "name": "Jitesh Sharma",
    "role": "WICKET_KEEPER",
    "basePrice": 15000000,
    "country": "India",
    "team": "PBKS",
    "imageUrl": "/images/players/jitesh-sharma.jpg",
    "battingStyle": "Right-hand fearless finisher",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Shashank Singh",
    "role": "BATSMAN",
    "basePrice": 10000000,
    "country": "India",
    "team": "PBKS",
    "imageUrl": "/images/players/shashank-singh.jpg",
    "battingStyle": "Right-hand clutch match-winner",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Ashutosh Sharma",
    "role": "BATSMAN",
    "basePrice": 10000000,
    "country": "India",
    "team": "PBKS",
    "imageUrl": "/images/players/ashutosh-sharma.jpg",
    "battingStyle": "Right-hand sweep 6-hitter",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Rahul Chahar",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "PBKS",
    "imageUrl": "/images/players/rahul-chahar.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm sharp legbreak"
  },
  {
    "name": "Chris Woakes",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "England",
    "team": "PBKS",
    "imageUrl": "/images/players/chris-woakes.png",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm fast medium swing"
  },
  {
    "name": "Prabhsimran Singh",
    "role": "BATSMAN",
    "basePrice": 10000000,
    "country": "India",
    "team": "PBKS",
    "imageUrl": "/images/players/prabhsimran-singh.jpg",
    "battingStyle": "Right-hand blazing opener",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Harpreet Brar",
    "role": "ALL_ROUNDER",
    "basePrice": 10000000,
    "country": "India",
    "team": "PBKS",
    "imageUrl": "/images/players/harpreet-brar.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Slow left-arm orthodox"
  },
  {
    "name": "Rilee Rossouw",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "South Africa",
    "team": "PBKS",
    "imageUrl": "/images/players/rilee-rossouw.jpg",
    "battingStyle": "Left-hand explosive batter",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Shubman Gill",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/shubman-gill.webp",
    "battingStyle": "Right-hand classical stroke maker",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Rashid Khan",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "Afghanistan",
    "team": "GT",
    "imageUrl": "/images/players/rashid-khan.webp",
    "battingStyle": "Right-hand snake-shot batter",
    "bowlingStyle": "Right-arm rapid legbreak googly"
  },
  {
    "name": "Mohammed Shami",
    "role": "BOWLER",
    "basePrice": 20000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/mohammed-shami.png",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm seam king"
  },
  {
    "name": "David Miller",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "South Africa",
    "team": "GT",
    "imageUrl": "/images/players/david-miller.jpg",
    "battingStyle": "Left-hand Killer Miller finisher",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Sai Sudharsan",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/sai-sudharsan.jpg",
    "battingStyle": "Left-hand composed run machine",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Rahul Tewatia",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/rahul-tewatia.jpg",
    "battingStyle": "Left-hand 5-sixes ice cool finisher",
    "bowlingStyle": "Right-arm legbreak"
  },
  {
    "name": "Mohit Sharma",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/mohit-sharma.png",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm back-of-the-hand slower"
  },
  {
    "name": "Kane Williamson",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "New Zealand",
    "team": "GT",
    "imageUrl": "/images/players/kane-williamson.png",
    "battingStyle": "Right-hand master strategist",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Umesh Yadav",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/umesh-yadav.png",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm genuine pace"
  },
  {
    "name": "Noor Ahmad",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "Afghanistan",
    "team": "GT",
    "imageUrl": "/images/players/noor-ahmad.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Left-arm wrist spin"
  },
  {
    "name": "Shahrukh Khan",
    "role": "ALL_ROUNDER",
    "basePrice": 10000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/shahrukh-khan.jpg",
    "battingStyle": "Right-hand big hitter",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Spencer Johnson",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "Australia",
    "team": "GT",
    "imageUrl": "/images/players/spencer-johnson.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm express 145kmph"
  },
  {
    "name": "Wriddhiman Saha",
    "role": "WICKET_KEEPER",
    "basePrice": 10000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/wriddhiman-saha.jpg",
    "battingStyle": "Right-hand powerplay opener",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Vijay Shankar",
    "role": "ALL_ROUNDER",
    "basePrice": 10000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/vijay-shankar.jpg",
    "battingStyle": "Right-hand 3D bat",
    "bowlingStyle": "Right-arm medium"
  },
  {
    "name": "Sai Kishore",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "GT",
    "imageUrl": "/images/players/sai-kishore.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Slow left-arm orthodox height"
  },
  {
    "name": "KL Rahul",
    "role": "BATSMAN",
    "basePrice": 20000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/kl-rahul.webp",
    "battingStyle": "Right-hand dependable anchor",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Nicholas Pooran",
    "role": "WICKET_KEEPER",
    "basePrice": 20000000,
    "country": "West Indies",
    "team": "LSG",
    "imageUrl": "/images/players/nicholas-pooran.jpg",
    "battingStyle": "Left-hand six hitter",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Marcus Stoinis",
    "role": "ALL_ROUNDER",
    "basePrice": 20000000,
    "country": "Australia",
    "team": "LSG",
    "imageUrl": "/images/players/marcus-stoinis.png",
    "battingStyle": "Right-hand match-winning all-rounder",
    "bowlingStyle": "Right-arm medium fast"
  },
  {
    "name": "Quinton de Kock",
    "role": "WICKET_KEEPER",
    "basePrice": 20000000,
    "country": "South Africa",
    "team": "LSG",
    "imageUrl": "/images/players/quinton-de-kock.jpg",
    "battingStyle": "Left-hand wicket-keeper opener",
    "bowlingStyle": "Wicket-keeper"
  },
  {
    "name": "Krunal Pandya",
    "role": "ALL_ROUNDER",
    "basePrice": 15000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/krunal-pandya.jpg",
    "battingStyle": "Left-hand street-smart bat",
    "bowlingStyle": "Slow left-arm orthodox"
  },
  {
    "name": "Ravi Bishnoi",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/ravi-bishnoi.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm quick googly"
  },
  {
    "name": "Mayank Yadav",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/mayank-yadav.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm thunderbolt 156.7kmph"
  },
  {
    "name": "Devdutt Padikkal",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/devdutt-padikkal.jpg",
    "battingStyle": "Left-hand stylish tall strokeplayer",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Deepak Hooda",
    "role": "ALL_ROUNDER",
    "basePrice": 10000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/deepak-hooda.jpg",
    "battingStyle": "Right-hand power striker",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Ayush Badoni",
    "role": "BATSMAN",
    "basePrice": 10000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/ayush-badoni.jpg",
    "battingStyle": "Right-hand baby AB finisher",
    "bowlingStyle": "Right-arm offbreak"
  },
  {
    "name": "Naveen-ul-Haq",
    "role": "BOWLER",
    "basePrice": 15000000,
    "country": "Afghanistan",
    "team": "LSG",
    "imageUrl": "/images/players/naveen-ul-haq.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm deceptive slower cutter"
  },
  {
    "name": "Mohsin Khan",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/mohsin-khan.jpg",
    "battingStyle": "Left-hand bat",
    "bowlingStyle": "Left-arm fast swing"
  },
  {
    "name": "Yash Thakur",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/yash-thakur.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm 5-wicket yorker"
  },
  {
    "name": "Amit Mishra",
    "role": "BOWLER",
    "basePrice": 5000000,
    "country": "India",
    "team": "LSG",
    "imageUrl": "/images/players/amit-mishra.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm 3-IPL-hattricks legbreak"
  },
  {
    "name": "Shamar Joseph",
    "role": "BOWLER",
    "basePrice": 10000000,
    "country": "West Indies",
    "team": "LSG",
    "imageUrl": "/images/players/shamar-joseph.jpg",
    "battingStyle": "Right-hand bat",
    "bowlingStyle": "Right-arm Caribbean express 150kmph"
  }
];

// 150 Initial Demo Players
export const INITIAL_DEMO_PLAYERS: Player[] = IPL_PLAYERS_CATALOG.map((p, idx) => ({
  id: `p-${idx + 1}`,
  auction_id: 'demo-auction-1',
  name: p.name,
  role: p.role,
  batting_style: p.battingStyle,
  bowling_style: p.bowlingStyle,
  country: p.country,
  base_price: p.basePrice,
  status: 'UPCOMING',
  order_index: idx + 1,
  image_url: p.imageUrl,
  custom_stats: {
    matches: 70 + (idx * 3) % 160,
    runs: p.role === 'BOWLER' ? 120 + (idx * 7) : 1600 + (idx * 75),
    wickets: p.role === 'BATSMAN' ? 0 : 50 + (idx * 2) % 130,
    strike_rate: p.role === 'BOWLER' ? 118 : 138 + (idx % 28),
    average: p.role === 'BOWLER' ? 24.2 : 33.4 + (idx % 14)
  }
}));
