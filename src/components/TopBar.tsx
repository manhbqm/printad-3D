import React from 'react';
import { ZoneId } from '../types/office';

interface TopBarProps {
  activeZoneId: ZoneId;
  onSelectZone: (zoneId: ZoneId) => void;
  onOpenNewTaskModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeZoneId,
  onSelectZone,
  onOpenNewTaskModal
}) => {
  const navItems: { id: ZoneId; label: string }[] = [
    { id: 'overview', label: 'Toàn cảnh' },
    { id: 'lobby', label: 'Sảnh chính' },
    { id: 'coworking', label: 'Khu làm việc chung' },
    { id: 'meeting', label: 'Phòng họp' },
    { id: 'sales_quoting', label: 'Phân khu Bộ phận' }
  ];

  return (
    <header className="relative z-20 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/95 border-b border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#overview"
        onClick={(e) => {
          e.preventDefault();
          onSelectZone('overview');
        }}
        className="text-lg font-bold tracking-tight text-slate-100 font-display whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400"
      >
        PrintAd 3D Office
      </a>

      {/* Zone 2: 5 concise single-line text navigation links */}
      <nav
        aria-label="Điều hướng không gian 3D"
        className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
      >
        {navItems.map((item) => {
          const isDepartmentGroup =
            item.id === 'sales_quoting' &&
            ['sales_quoting', 'accounting', 'design_tech', 'marketing', 'hr_ops'].includes(
              activeZoneId
            );
          const isActive = activeZoneId === item.id || isDepartmentGroup;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectZone(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                isActive
                  ? 'text-amber-400 border-amber-400 font-semibold'
                  : 'text-slate-300 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          Ra chỉ thị Giám đốc
        </button>
      </div>
    </header>
  );
};
