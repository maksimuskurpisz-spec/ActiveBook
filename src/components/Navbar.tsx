import React from 'react';
import { LogIn, LogOut, RefreshCw } from 'lucide-react';
import logoImg from '../assets/images/activebook_icon_1790898482765.jpg';
import { UserAccount } from '../authSync';

interface NavbarProps {
  account: UserAccount | null;
  isLoadingAuth: boolean;
  isSyncing?: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onManualSync?: () => void;
  onOpenBackup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  account,
  isLoadingAuth,
  isSyncing,
  onLogin,
  onLogout,
  onManualSync,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#070709]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        {/* Left: Brand */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-black border border-lime-400/40 shadow-lg shadow-lime-400/10 shrink-0">
              <img
                src={logoImg}
                alt="ActiveBook"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icon.png';
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-lime-400 rounded-full border-2 border-black animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-sans italic">
            <span className="text-white">Active</span>
            <span className="text-lime-400 drop-shadow-[0_0_12px_rgba(163,230,53,0.35)]">
              Book
            </span>
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* Sync & Login Status */}
          {isLoadingAuth ? (
            <div className="w-24 h-8 bg-zinc-900 animate-pulse rounded-xl" />
          ) : account ? (
            <div className="flex items-center gap-2">
              {/* Cloud Sync Button */}
              <button
                type="button"
                onClick={onManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 rounded-xl text-[11px] font-mono text-lime-400 font-semibold transition-colors disabled:opacity-50"
                title="Kliknij, aby odświeżyć i zsynchronizować dane z chmurą"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{isSyncing ? 'Synchronizacja...' : 'Synchronizuj'}</span>
              </button>

              {/* User Avatar & Name */}
              <div className="flex items-center gap-2 bg-[#101015] border border-zinc-800 rounded-xl py-1 px-2.5">
                <div className="w-6 h-6 rounded-full bg-lime-400 text-black font-extrabold text-[11px] flex items-center justify-center">
                  {(account.displayName || account.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-zinc-200 max-w-[120px] truncate hidden lg:inline">
                  {account.displayName || account.email}
                </span>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
                  title="Wyloguj się"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="px-3.5 py-1.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-lime-400/20 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Zaloguj się</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
