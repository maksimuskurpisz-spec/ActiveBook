import React, { useState } from 'react';
import { LogIn, X, AlertTriangle, ShieldCheck, KeyRound, Mail, Smartphone, RefreshCw, Copy, Check } from 'lucide-react';
import { loginOrRegisterAccount, UserAccount } from '../authSync';
import { loginWithGooglePopup } from '../firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [identifier, setIdentifier] = useState('maksimus.kurpiszz@gmail.com');
  const [pin, setPin] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Wpisz swój adres e-mail lub nazwę profilu.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const account = await loginOrRegisterAccount(identifier.trim(), pin.trim() || '0000');
      onSuccess(account);
      onClose();
    } catch (err: any) {
      console.error('Account login error:', err);
      setErrorMessage(err?.message || 'Błąd logowania. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithGooglePopup();
      if (user) {
        const account: UserAccount = {
          userId: user.uid,
          email: user.email || 'user@activebook.app',
          displayName: user.displayName || user.email || 'Użytkownik',
        };
        onSuccess(account);
        onClose();
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setErrorMessage(
        'Logowanie Google wymaga włączonego Identity Toolkit w konsoli Google Cloud. Skorzystaj z formularza powyżej (E-mail + PIN), który działa od razu na wszystkich urządzeniach!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0e0e12] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center">
            <LogIn className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Logowanie & Synchronizacja</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Wpisz swój e-mail i PIN na każdym urządzeniu (telefonie i komputerze), aby mieć dokładnie te same foldery i statystyki.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-left">
            <div className="flex items-start gap-2 text-rose-300 text-xs font-bold mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Komunikat</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Form Login / Register */}
        <form onSubmit={handleAccountLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-lime-400" />
              <span>Twój E-mail lub Nazwa konta</span>
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="np. maksimus.kurpiszz@gmail.com"
              required
              className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-lime-400" />
              <span>Kod PIN / Hasło synchronizacji</span>
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="np. 1234"
              className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono tracking-widest transition-colors"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Jeśli to Twoje pierwsze logowanie, ten PIN zabezpieczy Twój profil w chmurze.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synchronizowanie konta...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Zaloguj i synchronizuj</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-[#0e0e12] px-3 text-zinc-500">Lub</span>
          </div>
        </div>

        {/* Google Login alternative */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Zaloguj przez Google</span>
        </button>

        {/* Copy link to open on second device */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2 bg-black border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-400 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-lime-400" />
                <span className="text-lime-400">Skopiowano link do otwarcia na drugim urządzeniu!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopiuj link do otwarcia na drugim urządzeniu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
