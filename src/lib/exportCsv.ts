import { Player, Team, Auction } from '../types/auction';
import { formatExactCurrency } from './formatters';

export function exportAuctionToCSV(auction: Auction, players: Player[], teams: Team[]) {
  // Build Teams lookup map
  const teamMap = new Map<string, Team>();
  teams.forEach(t => teamMap.set(t.id, t));

  const rows: string[][] = [];

  // Header 1: Metadata
  rows.push(['CRICBID ARENA - AUCTION REPORT']);
  rows.push(['Auction Title', auction.title]);
  rows.push(['Room Code', auction.room_code]);
  rows.push(['Generated At', new Date().toLocaleString()]);
  rows.push(['Currency', auction.currency_symbol]);
  rows.push([]);

  // Section 1: Team Purse & Squad Breakdown
  rows.push(['=== TEAM SQUADS & PURSE BREAKDOWN ===']);
  rows.push(['Team Name', 'Short Code', 'Owner', 'Total Purse', 'Spent', 'Remaining Purse', 'Total Players']);

  teams.forEach(t => {
    const spent = t.purse_total - t.purse_remaining;
    const teamPlayers = players.filter(p => p.sold_to_team_id === t.id);
    rows.push([
      `"${t.name}"`,
      t.short_code,
      `"${t.owner_name}"`,
      formatExactCurrency(t.purse_total, auction.currency_symbol),
      formatExactCurrency(spent, auction.currency_symbol),
      formatExactCurrency(t.purse_remaining, auction.currency_symbol),
      teamPlayers.length.toString()
    ]);
  });

  rows.push([]);

  // Section 2: Detailed Player List
  rows.push(['=== DETAILED PLAYER AUCTION RESULTS ===']);
  rows.push(['Order', 'Player Name', 'Role', 'Country', 'Base Price', 'Status', 'Sold Price', 'Winning Team']);

  players.forEach((p, index) => {
    const winningTeam = p.sold_to_team_id ? teamMap.get(p.sold_to_team_id)?.name || 'Unknown' : '-';
    rows.push([
      (index + 1).toString(),
      `"${p.name}"`,
      p.role,
      p.country || 'India',
      formatExactCurrency(p.base_price, auction.currency_symbol),
      p.status,
      p.sold_price ? formatExactCurrency(p.sold_price, auction.currency_symbol) : '-',
      `"${winningTeam}"`
    ]);
  });

  // Convert to CSV string
  const csvContent = rows.map(e => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Trigger download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedTitle = auction.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  link.setAttribute('download', `${sanitizedTitle}_auction_results_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

