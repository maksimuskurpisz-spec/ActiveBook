import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';

interface RestTimerProps {
  onClose?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [initialSeconds, setInitialSeconds] = useState(90);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // safe fallback
    }
  };

  const setTimerPreset = (secs: number) => {
    setInitialSeconds(secs);
    setSecondsLeft(secs);
    setIsRunning(true);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = initialSeconds > 0 ? ((initialSeconds - secondsLeft) / initialSeconds) * 100 : 0;

  return (
    <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4 shadow-xl text-zinc-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-lime-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Stoper odpoczynku
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Zamknij stoper"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl font-mono font-bold tracking-tight text-white">
          {formatTime(secondsLeft)}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
              isRunning
                ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40 hover:bg-lime-400/30'
                : 'bg-lime-400 text-black hover:bg-lime-300 shadow-md shadow-lime-400/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pauza
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Start
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(initialSeconds);
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Zresetuj"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden mb-3">
        <div
          className="bg-lime-400 h-full transition-all duration-300 shadow-[0_0_8px_rgba(163,230,53,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quick presets */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-zinc-500 mr-1 text-[11px]">Szybki wybór:</span>
        {[45, 60, 90, 120, 180].map((s) => (
          <button
            key={s}
            onClick={() => setTimerPreset(s)}
            className={`px-2 py-1 rounded-md transition-colors font-mono ${
              initialSeconds === s
                ? 'bg-zinc-800 text-lime-400 border border-lime-400/40 font-bold'
                : 'bg-black text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {s < 60 ? `${s}s` : `${s / 60}m`}
          </button>
        ))}
      </div>
    </div>
  );
};
