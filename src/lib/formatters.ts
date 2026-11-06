/**
 * Format currency in cricket auction notation (Crores, Lakhs, Thousands, or Pts)
 */
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${symbol}0`;
  }

  // If using points or non-Indian currency, handle standard notation
  if (symbol.toLowerCase().includes('pt') || symbol === 'Pts') {
    return `${amount.toLocaleString()} Pts`;
  }

  const absAmount = Math.abs(amount);

  // 1 Crore = 10,000,000 (100 Lakhs)
  if (absAmount >= 10000000) {
    const cr = amount / 10000000;
    // Format to 2 decimal places if needed, trim trailing zeros
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '');
    return `${symbol}${formatted} Cr`;
  }

  // 1 Lakh = 100,000
  if (absAmount >= 100000) {
    const lk = amount / 100000;
    const formatted = lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(2).replace(/\.?0+$/, '');
    return `${symbol}${formatted} L`;
  }

  // Thousands
  if (absAmount >= 1000) {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }

  return `${symbol}${amount}`;
}

/**
 * Format full exact currency for accounting / breakdowns
 */
export function formatExactCurrency(amount: number, symbol: string = '₹'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

/**
 * Return human readable role name
 */
export function formatRole(role: string): string {
  switch (role) {
    case 'BATSMAN':
      return 'Batsman';
    case 'BOWLER':
      return 'Bowler';
    case 'ALL_ROUNDER':
      return 'All-Rounder';
    case 'WICKET_KEEPER':
      return 'Wicket Keeper';
    default:
      return role;
  }
}

/**
 * Role badge styling
 */
export function getRoleBadgeClass(role: string): { bg: string; text: string; border: string; glow: string } {
  switch (role) {
    case 'BATSMAN':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]'
      };
    case 'BOWLER':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]'
      };
    case 'ALL_ROUNDER':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        glow: 'shadow-[0_0_12px_rgba(59,130,246,0.25)]'
      };
    case 'WICKET_KEEPER':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        glow: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]'
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        glow: ''
      };
  }
}

