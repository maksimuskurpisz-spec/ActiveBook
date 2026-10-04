import React, { useState } from 'react';
import { WorkoutPlan, WorkoutSession, LoggedExercise, LoggedSet, PlanFolder } from '../types';
import { Check, Plus, Trash2, Save, Calendar, Clock, CheckCircle2, FileText } from 'lucide-react';
import { RestTimer } from './RestTimer';

interface WorkoutSessionLoggerProps {
  workout: WorkoutPlan;
  folder?: PlanFolder;
  onSave: (session: WorkoutSession) => void;
  onCancel: () => void;
}

export const WorkoutSessionLogger: React.FC<WorkoutSessionLoggerProps> = ({
  workout,
  folder,
  onSave,
  onCancel,
}) => {
  const [sessionDate, setSessionDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState<string>('');
  const [showRestTimer, setShowRestTimer] = useState<boolean>(false);

  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>(() => {
    return workout.exercises.map((ex) => {
      const defaultWeight = parseFloat(ex.weight) || 0;
      const defaultReps = ex.mode === 'reps' ? parseInt(ex.reps || '10') || 10 : undefined;
      const defaultTime = ex.mode === 'time' ? ex.timeDisplay || '60s' : undefined;

      const sets: LoggedSet[] = [];
      for (let i = 1; i <= (ex.sets || 3); i++) {
        sets.push({
          setNumber: i,
          weight: defaultWeight,
          reps: defaultReps,
          timeDisplay: defaultTime,
          completed: true,
        });
      }

      return {
        name: ex.name,
        mode: ex.mode,
        sets,
      };
    });
  });

  const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    const updated = [...loggedExercises];
    const targetSet = updated[exerciseIndex].sets[setIndex];
    targetSet.completed = !targetSet.completed;
    setLoggedExercises(updated);
  };

  const updateSetWeight = (exerciseIndex: number, setIndex: number, weight: number) => {
    const updated = [...loggedExercises];
    updated[exerciseIndex].sets[setIndex].weight = isNaN(weight) ? 0 : weight;
    setLoggedExercises(updated);
  };

  const updateSetReps = (exerciseIndex: number, setIndex: number, reps: number) => {
    const updated = [...loggedExercises];
    updated[exerciseIndex].sets[setIndex].reps = isNaN(reps) ? 0 : reps;
    setLoggedExercises(updated);
  };

  const updateSetTime = (exerciseIndex: number, setIndex: number, timeStr: string) => {
    const updated = [...loggedExercises];
    updated[exerciseIndex].sets[setIndex].timeDisplay = timeStr;
    setLoggedExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...loggedExercises];
    const sets = updated[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({
      setNumber: sets.length + 1,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      timeDisplay: lastSet ? lastSet.timeDisplay : '60s',
      completed: true,
    });
    setLoggedExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...loggedExercises];
    if (updated[exerciseIndex].sets.length <= 1) return;
    updated[exerciseIndex].sets = updated[exerciseIndex].sets
      .filter((_, i) => i !== setIndex)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    setLoggedExercises(updated);
  };

  const handleSave = () => {
    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      workoutPlanId: workout.id,
      workoutName: workout.name,
      folderName: folder ? folder.name : 'Folder',
      date: new Date(sessionDate).toISOString(),
      durationMinutes: duration > 0 ? duration : undefined,
      exercises: loggedExercises,
      notes: notes.trim() || undefined,
    };
    onSave(session);
  };

  const totalCompletedSets = loggedExercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalPlannedSets = loggedExercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className="bg-[#0b0b0e] border border-zinc-800 rounded-3xl p-5 md:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-lime-400">
              Zapisz wykonany trening
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-400">{folder?.name}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-lime-400 stroke-[2.5]" />
            {workout.name}
          </h2>
          <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
            <span>
              Ukończono:{' '}
              <strong className="text-lime-400 font-mono">
                {totalCompletedSets}/{totalPlannedSets}
              </strong>
            </span>
          </div>

          {/* Notatka o treningu jeśli została wpisana w planie */}
          {workout.notes && (
            <div className="mt-3 p-3 bg-[#111116] border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-start gap-2">
              <FileText className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">
                  Notatka o treningu:
                </span>
                <p className="text-zinc-200">{workout.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-black text-black bg-lime-400 hover:bg-lime-300 rounded-xl transition-all shadow-lg shadow-lime-400/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Zapisz trening
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left 2 Cols: Exercises & Sets */}
        <div className="lg:col-span-2 space-y-6">
          {loggedExercises.map((exercise, exIndex) => {
            return (
              <div
                key={exIndex}
                className="bg-black/70 border border-zinc-800 rounded-2xl p-4 md:p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-lime-400 w-5 h-5 rounded bg-[#121217] border border-zinc-800 flex items-center justify-center">
                        {exIndex + 1}
                      </span>
                      {exercise.name}
                    </h3>
                    <span className="text-xs text-zinc-400">
                      {exercise.mode === 'reps' ? 'Powtórzenia' : 'Czas'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addSet(exIndex)}
                    className="px-2.5 py-1 text-xs text-lime-400 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 rounded-lg transition-colors flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Dodaj serię
                  </button>
                </div>

              {/* Sets Table: without 'kg' or 'serii' labels */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2">
                  <div className="col-span-2">Seria</div>
                  <div className="col-span-4">Ciężar</div>
                  <div className="col-span-4">
                    {exercise.mode === 'reps' ? 'Powtórzenia' : 'Czas'}
                  </div>
                  <div className="col-span-2 text-right">Zrobione</div>
                </div>

                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-colors ${
                      set.completed
                        ? 'bg-lime-500/10 border-lime-500/40 text-white'
                        : 'bg-[#0f0f13] border-zinc-800/90 text-zinc-200'
                    }`}
                  >
                    <div className="col-span-2 font-mono text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      #{set.setNumber}
                    </div>

                    {/* Weight slot without 'kg' suffix */}
                    <div className="col-span-4">
                      <input
                        type="number"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) =>
                          updateSetWeight(exIndex, setIndex, parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-lg py-1 px-2 text-xs font-mono text-lime-400 font-bold text-center"
                      />
                    </div>

                    {/* Reps or Time slot */}
                    <div className="col-span-4">
                      {exercise.mode === 'reps' ? (
                        <input
                          type="number"
                          min="1"
                          value={set.reps || ''}
                          onChange={(e) =>
                            updateSetReps(exIndex, setIndex, parseInt(e.target.value) || 0)
                          }
                          className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-lg py-1 px-2 text-xs font-mono text-white text-center"
                        />
                      ) : (
                        <input
                          type="text"
                          value={set.timeDisplay || ''}
                          onChange={(e) => updateSetTime(exIndex, setIndex, e.target.value)}
                          placeholder="60s"
                          className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-lg py-1 px-2 text-xs font-mono text-lime-300 text-center"
                        />
                      )}
                    </div>

                    {/* Completion Checkmark & delete */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleSetCompleted(exIndex, setIndex)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          set.completed
                            ? 'bg-lime-400 text-black font-extrabold shadow-md shadow-lime-400/30'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        }`}
                        title={set.completed ? 'Odznacz serię' : 'Zalicz serię'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      {exercise.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSet(exIndex, setIndex)}
                          className="p-1 text-zinc-600 hover:text-rose-400 transition-colors"
                          title="Usuń serię"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            );
          })}
        </div>

        {/* Right Col: Session Details & Rest Timer */}
        <div className="space-y-6">
          {showRestTimer && <RestTimer onClose={() => setShowRestTimer(false)} />}

          {!showRestTimer && (
            <button
              onClick={() => setShowRestTimer(true)}
              className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Clock className="w-4 h-4 text-lime-400" /> Włącz stoper odpoczynku
            </button>
          )}

          <div className="bg-black/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Szczegóły zapisu
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Data i godzina
              </label>
              <input
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-[#0d0d11] border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" /> Czas trwania (minuty)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0d0d11] border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Notatka / Uwagi (opcjonalnie)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="np. Dobry trening, zapas w seriach..."
                className="w-full bg-[#0d0d11] border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Zapisz trening
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
