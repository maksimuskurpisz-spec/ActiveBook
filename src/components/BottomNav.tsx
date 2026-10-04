import React from 'react';
import { FolderKanban, History, TrendingUp } from 'lucide-react';

export type ActiveTab = 'plans' | 'history' | 'progress';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070709]/95 backdrop-blur-lg border-t border-zinc-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-lg mx-auto grid grid-cols-3 h-16 px-3">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'plans'
              ? 'text-lime-400 font-extrabold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'plans' ? 'bg-lime-400/10 shadow-[0_0_12px_rgba(163,230,53,0.3)]' : ''
            }`}
          >
            <FolderKanban className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] tracking-tight">Foldery</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'history'
              ? 'text-lime-400 font-extrabold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-lime-400/10 shadow-[0_0_12px_rgba(163,230,53,0.3)]' : ''
            }`}
          >
            <History className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] tracking-tight">Historia</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'progress'
              ? 'text-lime-400 font-extrabold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'progress' ? 'bg-lime-400/10 shadow-[0_0_12px_rgba(163,230,53,0.3)]' : ''
            }`}
          >
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] tracking-tight">Progres</span>
        </button>
      </div>
    </nav>
  );
};
