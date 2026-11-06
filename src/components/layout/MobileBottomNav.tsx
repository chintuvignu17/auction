import React from 'react';
import { Zap, Users, Trophy, Activity, Shield } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

export type MobileTab = 'ARENA' | 'SQUADS' | 'PLAYERS' | 'FEED' | 'ADMIN';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  feedCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  feedCount = 0
}) => {
  const { userSession } = useAuction();

  const handleTabClick = (tab: MobileTab) => {
    // Subtle haptic vibration on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
    onSelectTab(tab);
  };

  interface NavItem {
    id: MobileTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    isSpecial?: boolean;
  }

  const baseNavItems: NavItem[] = [
    { id: 'ARENA', label: 'Arena', icon: Zap },
    { id: 'SQUADS', label: 'Squads', icon: Users },
    { id: 'PLAYERS', label: 'Pool', icon: Trophy },
    { id: 'FEED', label: 'Feed', icon: Activity, badge: feedCount > 0 ? feedCount : undefined },
  ];

  const navItems: NavItem[] = userSession?.isAdmin
    ? [
        ...baseNavItems,
        { 
          id: 'ADMIN', 
          label: 'Admin', 
          icon: Shield,
          isSpecial: true 
        },
      ]
    : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070c18]/95 backdrop-blur-xl border-t border-slate-800/90 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active glow pill background */}
              {isActive && (
                <div className="absolute inset-0 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.2)] pointer-events-none" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'scale-100'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-cyan-500 text-black text-[9px] font-black rounded-full px-1 min-w-[14px] text-center">
                    {item.badge}
                  </span>
                )}
                {item.isSpecial && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-amber-400 font-black' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

