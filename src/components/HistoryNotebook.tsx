import React, { useState, useEffect } from 'react';
import { WorkoutSession } from '../types';
import {
  History,
  Calendar,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  BarChart3,
  Dumbbell,
  Layers,
  Flame,
  FileJson,
  Edit2,
} from 'lucide-react';
import logoImg from '../assets/images/activebook_icon_1790898482765.jpg';
import { EditSessionModal } from './EditSessionModal';

interface WorkoutHistoryProps {
  history: WorkoutSession[];
  resetKey?: number;
  onOpenBackup?: () => void;
  onUpdateSession?: (session: WorkoutSession) => void;
  onRequestDeleteSession: (session: WorkoutSession) => void;
  onSelectExerciseForProgress?: (exerciseName: string) => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  history,
  resetKey,
  onOpenBackup,
  onUpdateSession,
  onRequestDeleteSession,
  onSelectExerciseForProgress,
}) => {
  // Treningi w historii są zwinięte od razu domyślnie
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});
  const [filterQuery, setFilterQuery] = useState('');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [sessionToEdit, setSessionToEdit] = useState<WorkoutSession | null>(null);

  // Reset do pierwszej strony po kliknięciu w dolny pasek nawigacji
  useEffect(() => {
    if (resetKey !== undefined) {
      setExpandedSessionIds({});
      setFilterQuery('');
      setShowStats(false);
      setSessionToEdit(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [resetKey]);

  const toggleExpand = (id: string) => {
    setExpandedSessionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredHistory = history
    .filter((session) => {
      const matchName = session.workoutName.toLowerCase().includes(filterQuery.toLowerCase());
      const matchFolder = session.folderName.toLowerCase().includes(filterQuery.toLowerCase());
      const matchExercise = session.exercises.some((e) =>
        e.name.toLowerCase().includes(filterQuery.toLowerCase())
      );
      return matchName || matchFolder || matchExercise;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aggregate stats calculations
  const totalSessions = history.length;
  const totalSetsLogged = history.reduce(
    (sum, s) =>
      sum +
      s.exercises.reduce(
        (exSum, ex) => exSum + ex.sets.filter((st) => st.completed).length,
        0
      ),
    0
  );
  const totalExercisesLogged = history.reduce(
    (sum, s) => sum + s.exercises.length,
    0
  );
  const totalVolume = history.reduce(
    (sum, s) =>
      sum +
      s.exercises.reduce(
        (exSum, ex) =>
          exSum +
          ex.sets
            .filter((st) => st.completed)
            .reduce((stSum, st) => stSum + (st.weight || 0) * (st.reps || 1), 0),
        0
      ),
    0
  );
  const sessionsWithDuration = history.filter((s) => s.durationMinutes && s.durationMinutes > 0);
  const avgDuration =
    sessionsWithDuration.length > 0
      ? Math.round(
          sessionsWithDuration.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) /
            sessionsWithDuration.length
        )
      : 0;
  const avgSetsPerSession =
    totalSessions > 0 ? (totalSetsLogged / totalSessions).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-lime-400" /> Historia treningów
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Wszystkie zapisane treningi z wykonanymi seriami, ciężarami i powtórzeniami.
          </p>
        </div>

        {/* Przyciski akcji: Kopia / Eksport oraz Statystyki & Tonaż */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {onOpenBackup && (
            <button
              type="button"
              onClick={onOpenBackup}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-[#101015] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700"
              title="Eksportuj lub importuj kopię zapasową treningów (.json)"
            >
              <FileJson className="w-4 h-4 text-lime-400" />
              <span>Eksport / Import</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowStats(!showStats)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                showStats
                  ? 'bg-lime-400 text-black border-lime-400 shadow-lg shadow-lime-400/20'
                  : 'bg-[#101015] hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${showStats ? 'text-black' : 'text-lime-400'}`} />
              <span>Statystyki & Tonaż</span>
              {showStats ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Rozwijana zakładka ze statystykami, tonażem itp. (otwiera się po kliknięciu przycisku) */}
      {showStats && (
        <div className="bg-[#0b0b0f] border border-zinc-800 rounded-3xl p-5 md:p-6 animate-in fade-in zoom-in-95 duration-150 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-lime-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Podsumowanie Statystyk & Tonaż
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              Z {totalSessions} {totalSessions === 1 ? 'treningu' : 'treningów'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* 1. Zrealizowane Treningi */}
            <div className="bg-black/60 border border-zinc-800/90 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                <span>Zrealizowane</span>
              </div>
              <div className="text-xl font-mono font-black text-white">{totalSessions}</div>
              <span className="text-[10px] text-zinc-500">treningów</span>
            </div>

            {/* 2. Wykonane Serie */}
            <div className="bg-black/60 border border-zinc-800/90 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                <Layers className="w-3.5 h-3.5 text-lime-400" />
                <span>Wykonane serie</span>
              </div>
              <div className="text-xl font-mono font-black text-lime-400">{totalSetsLogged}</div>
              <span className="text-[10px] text-zinc-500">zliczone serie</span>
            </div>

            {/* 3. Łączny Tonaż */}
            <div className="bg-black/60 border border-lime-400/20 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-lime-400 text-[11px] mb-1 font-semibold">
                <Flame className="w-3.5 h-3.5 text-lime-400" />
                <span>Łączny Tonaż</span>
              </div>
              <div className="text-xl font-mono font-black text-white">
                {Math.round(totalVolume).toLocaleString('pl-PL')}
              </div>
              <span className="text-[10px] text-zinc-500">kg podniesione łącznie</span>
            </div>

            {/* 4. Ćwiczenia */}
            <div className="bg-black/60 border border-zinc-800/90 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                <Dumbbell className="w-3.5 h-3.5 text-lime-400" />
                <span>Ćwiczenia</span>
              </div>
              <div className="text-xl font-mono font-black text-white">{totalExercisesLogged}</div>
              <span className="text-[10px] text-zinc-500">zapisanych pozycji</span>
            </div>

            {/* 5. Średnio serii na trening */}
            <div className="bg-black/60 border border-zinc-800/90 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Średnio serii</span>
              </div>
              <div className="text-xl font-mono font-black text-white">{avgSetsPerSession}</div>
              <span className="text-[10px] text-zinc-500">serii na trening</span>
            </div>

            {/* 6. Średni czas */}
            <div className="bg-black/60 border border-zinc-800/90 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Średni czas</span>
              </div>
              <div className="text-xl font-mono font-black text-white">
                {avgDuration > 0 ? `${avgDuration} min` : '—'}
              </div>
              <span className="text-[10px] text-zinc-500">czas trwania sesji</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter / Search Bar */}
      {history.length > 0 && (
        <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-3">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Szukaj po nazwie treningu, folderu lub ćwiczenia..."
            className="w-full bg-black border border-zinc-800 focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 transition-colors"
          />
        </div>
      )}

      {/* Session Entries or Clean Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="bg-[#0b0b0e] border border-zinc-800 rounded-3xl p-10 md:p-12 text-center max-w-lg mx-auto shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden border border-lime-400/30 bg-black">
            <img src={logoImg} alt="ActiveBook" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Brak wpisów w historii treningów</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {filterQuery
              ? 'Brak treningów pasujących do wyszukiwania.'
              : 'Gdy ukończysz trening w folderze, kliknij "Zapisz zrobiony trening", a pojawi się w tym miejscu.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredHistory.map((session) => {
            const isExpanded = !!expandedSessionIds[session.id];
            const sessionDate = new Date(session.date);
            const dateStr = sessionDate.toLocaleDateString('pl-PL', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timeStr = sessionDate.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const completedSetsCount = session.exercises.reduce(
              (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
              0
            );

            return (
              <div
                key={session.id}
                className="bg-[#0c0c10] border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all shadow-xl"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{session.workoutName}</h3>
                        <span className="text-xs text-zinc-400 font-medium">
                          ({session.folderName})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" /> {dateStr}, {timeStr}
                        </span>
                        {session.durationMinutes && (
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-zinc-500" /> {session.durationMinutes} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                        Wykonano
                      </span>
                      <span className="text-xs font-mono font-bold text-lime-400">
                        {session.exercises.length} ćw. · {completedSetsCount} serii
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToEdit(session);
                      }}
                      className="p-2 text-zinc-500 hover:text-lime-400 hover:bg-lime-400/10 rounded-lg transition-colors"
                      title="Edytuj ten trening"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDeleteSession(session);
                      }}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Usuń ten wpis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      className="p-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 border-t border-zinc-800/80 bg-black/40">
                    {session.notes && (
                      <div className="mb-4 mt-2 p-3 bg-[#0d0d11] border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-zinc-400 font-semibold block text-[11px] mb-0.5">
                            Notatka z treningu:
                          </strong>
                          {session.notes}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {session.exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="bg-[#0e0e13] border border-zinc-800/80 rounded-xl p-3.5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded bg-black text-[10px] font-mono text-lime-400 flex items-center justify-center border border-zinc-800">
                                {exIdx + 1}
                              </span>
                              {ex.name}
                            </h4>
                            {onSelectExerciseForProgress && (
                              <button
                                onClick={() => onSelectExerciseForProgress(ex.name)}
                                className="text-[11px] text-lime-400 hover:text-lime-300 hover:underline font-semibold"
                              >
                                Pokaż Progres →
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {ex.sets.map((st, stIdx) => (
                              <div
                                key={stIdx}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                                  st.completed
                                    ? 'bg-black border-lime-500/40 text-lime-400'
                                    : 'bg-black/60 border-zinc-800 text-zinc-500'
                                }`}
                              >
                                <span className="text-zinc-500 mr-1 text-[10px]">#{st.setNumber}:</span>
                                <strong className="font-bold text-white">{st.weight}</strong>
                                <span className="text-zinc-400 ml-1">
                                  × {ex.mode === 'reps' ? `${st.reps} powtórzeń` : st.timeDisplay}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal edycji zapisanego treningu */}
      {sessionToEdit && (
        <EditSessionModal
          session={sessionToEdit}
          isOpen={!!sessionToEdit}
          onClose={() => setSessionToEdit(null)}
          onSave={(updated) => {
            if (onUpdateSession) onUpdateSession(updated);
            setSessionToEdit(null);
          }}
        />
      )}
    </div>
  );
};
