import React, { useState, useMemo, useEffect } from 'react';
import { WorkoutSession, WorkoutPlan } from '../types';
import { TrendingUp, Trophy, Calendar, Dumbbell, Search, ArrowLeft, ChevronRight } from 'lucide-react';
import logoImg from '../assets/images/activebook_icon_1790898482765.jpg';

interface ProgressProps {
  history: WorkoutSession[];
  workouts: WorkoutPlan[];
  initialSelectedExercise?: string;
  resetKey?: number;
  onClearInitialSelectedExercise?: () => void;
}

export const ProgressionTracker: React.FC<ProgressProps> = ({
  history,
  workouts,
  initialSelectedExercise,
  resetKey,
  onClearInitialSelectedExercise,
}) => {
  // Aggregate all exercise names from workouts and history
  const allExerciseNames = useMemo(() => {
    const namesSet = new Set<string>();

    history.forEach((session) => {
      session.exercises.forEach((ex) => {
        if (ex.name.trim()) namesSet.add(ex.name.trim());
      });
    });

    workouts.forEach((plan) => {
      plan.exercises.forEach((ex) => {
        if (ex.name.trim()) namesSet.add(ex.name.trim());
      });
    });

    return Array.from(namesSet).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [history, workouts]);

  // Initially selected exercise is null unless passed explicitly
  const [selectedExercise, setSelectedExercise] = useState<string | null>(() => {
    return initialSelectedExercise || null;
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Reset to first page (exercise list) when resetKey triggers (e.g. clicking bottom nav)
  useEffect(() => {
    if (resetKey !== undefined) {
      setSelectedExercise(null);
      setSearchQuery('');
      if (onClearInitialSelectedExercise) onClearInitialSelectedExercise();
    }
  }, [resetKey]);

  useEffect(() => {
    if (initialSelectedExercise && allExerciseNames.includes(initialSelectedExercise)) {
      setSelectedExercise(initialSelectedExercise);
    }
  }, [initialSelectedExercise, allExerciseNames]);

  const filteredNames = useMemo(() => {
    if (!searchQuery.trim()) return allExerciseNames;
    return allExerciseNames.filter((n) =>
      n.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allExerciseNames, searchQuery]);

  // Occurrences in planned workouts
  const plannedOccurrences = useMemo(() => {
    if (!selectedExercise) return [];
    const occurrences: Array<{
      workoutName: string;
      folderId: string;
      sets: number;
      reps?: string;
      timeDisplay?: string;
      weight: string;
      mode: 'reps' | 'time';
    }> = [];

    workouts.forEach((plan) => {
      plan.exercises.forEach((ex) => {
        if (ex.name.trim().toLowerCase() === selectedExercise.trim().toLowerCase()) {
          occurrences.push({
            workoutName: plan.name,
            folderId: plan.folderId,
            sets: ex.sets,
            reps: ex.reps,
            timeDisplay: ex.timeDisplay,
            weight: ex.weight,
            mode: ex.mode,
          });
        }
      });
    });

    return occurrences;
  }, [workouts, selectedExercise]);

  // Progression stats from history for selected exercise
  const stats = useMemo(() => {
    if (!selectedExercise) return null;

    const points: Array<{
      maxWeight: number;
      setsCount: number;
    }> = [];

    history.forEach((session) => {
      const match = session.exercises.find(
        (ex) => ex.name.trim().toLowerCase() === selectedExercise.trim().toLowerCase()
      );
      if (match && match.sets.length > 0) {
        const completedSets = match.sets.filter((s) => s.completed);
        const activeSets = completedSets.length > 0 ? completedSets : match.sets;
        const maxWeight = Math.max(...activeSets.map((s) => s.weight || 0), 0);

        points.push({
          maxWeight,
          setsCount: activeSets.length,
        });
      }
    });

    if (points.length === 0) return null;

    const maxWeight = Math.max(...points.map((p) => p.maxWeight));
    const firstWeight = points[0]?.maxWeight || 0;
    const lastWeight = points[points.length - 1]?.maxWeight || 0;
    const weightDiff = lastWeight - firstWeight;
    const totalSetsCompleted = points.reduce((sum, p) => sum + p.setsCount, 0);

    return {
      maxWeight,
      lastWeight,
      sessionsCount: points.length,
      weightDiff,
      totalSetsCompleted,
    };
  }, [history, selectedExercise]);

  // Empty state when no exercises exist in plans or history
  if (allExerciseNames.length === 0) {
    return (
      <div className="bg-[#0b0b0e] border border-zinc-800 rounded-3xl p-10 md:p-14 text-center max-w-lg mx-auto shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden border border-lime-400/30 bg-black">
          <img src={logoImg} alt="ActiveBook" className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Brak ćwiczeń w ActiveBook</h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Gdy utworzysz trening i wpiszesz ćwiczenie (np. <span className="text-lime-400 font-semibold">&quot;Zerchery&quot;</span>), pojawi się ono na liście do kliknięcia i sprawdzenia statystyk!
        </p>
      </div>
    );
  }

  // 1. LIST OF EXERCISES VIEW (When no exercise is currently selected)
  if (!selectedExercise) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-lime-400" /> Progres
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kliknij na konkretne ćwiczenie z listy poniżej, aby wyświetlić jego statystyki.
          </p>
        </div>

        {/* Search bar */}
        <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj ćwiczenia (np. Zerchery)..."
              className="w-full bg-black border border-zinc-800 focus:border-lime-400 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-600 transition-colors"
            />
          </div>
        </div>

        {/* Exercises Grid to click */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredNames.map((name) => {
            // Count completed sessions
            const sessionsCount = history.filter((s) =>
              s.exercises.some((e) => e.name.trim().toLowerCase() === name.toLowerCase())
            ).length;

            return (
              <button
                key={name}
                onClick={() => setSelectedExercise(name)}
                className="bg-[#0c0c10] border border-zinc-800 hover:border-lime-400/60 hover:bg-[#121217] rounded-2xl p-4 text-left transition-all duration-150 flex items-center justify-between group shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black border border-zinc-800 text-lime-400 flex items-center justify-center shrink-0 group-hover:border-lime-400/40">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-lime-400 transition-colors">
                      {name}
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {sessionsCount > 0 ? `${sessionsCount} zrobionych` : 'W planie'}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-lime-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. SELECTED EXERCISE STATS VIEW (Only shown after user clicks an exercise!)
  return (
    <div className="space-y-6">
      {/* Back button to exercise list */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800">
        <button
          onClick={() => {
            setSelectedExercise(null);
            if (onClearInitialSelectedExercise) onClearInitialSelectedExercise();
          }}
          className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Wróć do listy ćwiczeń
        </button>
        <span className="text-xs text-zinc-500 font-mono">Progres · Statystyki</span>
      </div>

      {/* Selected Exercise Header Title */}
      <div className="bg-[#0c0c10] border border-zinc-800 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center shrink-0">
            <Dumbbell className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-lime-400 block font-mono">
              Statystyki Ćwiczenia
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight">{selectedExercise}</h3>
          </div>
        </div>

        {/* Planned Target indicator if configured */}
        {plannedOccurrences.length > 0 && (
          <div className="text-xs text-zinc-400 flex items-center gap-2 bg-black/70 px-3.5 py-2 rounded-xl border border-zinc-800">
            <span className="text-zinc-500">W planie:</span>
            {plannedOccurrences.map((occ, i) => (
              <span key={i} className="text-zinc-200 font-mono">
                {occ.sets} × {occ.mode === 'reps' ? `${occ.reps} powtórzeń` : occ.timeDisplay} @{' '}
                <strong className="text-lime-400">{occ.weight}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Clean Stats Cards (No chart, no all attempts table) */}
      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Rekord Ciężaru (PR)</span>
              <Trophy className="w-4 h-4 text-lime-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {stats.maxWeight}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Najwyższy zaliczony ciężar</div>
          </div>

          <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Ostatni Ciężar</span>
              <TrendingUp className="w-4 h-4 text-lime-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-lime-400">
              {stats.lastWeight}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              Progres: {stats.weightDiff >= 0 ? `+${stats.weightDiff}` : stats.weightDiff}
            </div>
          </div>

          <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Zaliczone Serie</span>
              <Dumbbell className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {stats.totalSetsCompleted}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">W historii treningów</div>
          </div>

          <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Liczba Treningów</span>
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {stats.sessionsCount}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Wykonane sesje</div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0b0b0e] border border-zinc-800 rounded-2xl p-6 text-center shadow-lg">
          <p className="text-sm text-zinc-300 font-semibold mb-1">
            Ćwiczenie &quot;{selectedExercise}&quot; jest dodane w planie treningowym!
          </p>
          <p className="text-xs text-zinc-500">
            Gdy zrobisz trening i klikniesz &quot;Zapisz zrobiony trening&quot;, w tym miejscu
            pojawią się Twoje statystyki i rekordy.
          </p>
        </div>
      )}
    </div>
  );
};
