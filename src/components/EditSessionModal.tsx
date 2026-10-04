import React, { useState } from 'react';
import { WorkoutSession, LoggedExercise, LoggedSet } from '../types';
import { X, Save, Plus, Trash2, Calendar, Clock, FileText, CheckCircle2, Dumbbell } from 'lucide-react';

interface EditSessionModalProps {
  session: WorkoutSession;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSession: WorkoutSession) => void;
}

const formatDateTimeLocal = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onSave,
}) => {
  const [workoutName, setWorkoutName] = useState(session.workoutName);
  const [dateTime, setDateTime] = useState(() => formatDateTimeLocal(session.date));
  const [durationMinutes, setDurationMinutes] = useState<string>(
    session.durationMinutes ? session.durationMinutes.toString() : ''
  );
  const [notes, setNotes] = useState(session.notes || '');
  const [exercises, setExercises] = useState<LoggedExercise[]>(() =>
    JSON.parse(JSON.stringify(session.exercises || []))
  );

  if (!isOpen) return null;

  // Handlers for exercises & sets
  const updateExerciseName = (exIdx: number, newName: string) => {
    setExercises((prev) => {
      const copy = [...prev];
      copy[exIdx] = { ...copy[exIdx], name: newName };
      return copy;
    });
  };

  const updateExerciseMode = (exIdx: number, mode: 'reps' | 'time') => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exIdx], mode };
      ex.sets = ex.sets.map((s) => ({
        ...s,
        ...(mode === 'time'
          ? { timeDisplay: s.timeDisplay || '60s' }
          : { reps: s.reps || 10 }),
      }));
      copy[exIdx] = ex;
      return copy;
    });
  };

  const removeExercise = (exIdx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        name: '',
        mode: 'reps',
        sets: [
          { setNumber: 1, reps: 10, weight: 0, completed: true },
          { setNumber: 2, reps: 10, weight: 0, completed: true },
          { setNumber: 3, reps: 10, weight: 0, completed: true },
        ],
      },
    ]);
  };

  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: keyof LoggedSet,
    val: any
  ) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const newSets = [...ex.sets];
      newSets[setIdx] = { ...newSets[setIdx], [field]: val };
      ex.sets = newSets;
      copy[exIdx] = ex;
      return copy;
    });
  };

  const addSet = (exIdx: number) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const newNumber = ex.sets.length + 1;
      const newSet: LoggedSet = {
        setNumber: newNumber,
        weight: lastSet ? lastSet.weight : 0,
        reps: ex.mode === 'reps' ? (lastSet?.reps || 10) : undefined,
        timeDisplay: ex.mode === 'time' ? (lastSet?.timeDisplay || '60s') : undefined,
        completed: true,
      };
      ex.sets = [...ex.sets, newSet];
      copy[exIdx] = ex;
      return copy;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      ex.sets = ex.sets
        .filter((_, i) => i !== setIdx)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      copy[exIdx] = ex;
      return copy;
    });
  };

  const handleSave = () => {
    const finalDate = dateTime ? new Date(dateTime).toISOString() : session.date;
    const finalDuration = durationMinutes ? parseInt(durationMinutes, 10) : undefined;

    // Filter valid exercises
    const validExercises = exercises
      .filter((e) => e.name.trim().length > 0)
      .map((e) => ({
        ...e,
        name: e.name.trim(),
        sets: e.sets.map((s, i) => ({
          ...s,
          setNumber: i + 1,
          weight: isNaN(Number(s.weight)) ? 0 : Number(s.weight),
        })),
      }));

    const updated: WorkoutSession = {
      ...session,
      workoutName: workoutName.trim() || session.workoutName,
      date: finalDate,
      durationMinutes: finalDuration,
      notes: notes.trim() || undefined,
      exercises: validExercises,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0b0b0e] border border-zinc-800 rounded-3xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-black/50 shrink-0">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-lime-400">
              Historia · {session.folderName}
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Edycja zrealizowanego treningu
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Workout Basics: Name, Date & Time, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Nazwa treningu
              </label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-lime-400" /> Data i godzina
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-lime-400" /> Czas (minuty)
              </label>
              <input
                type="number"
                min={0}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="np. 60"
                className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono transition-colors"
              />
            </div>
          </div>

          {/* Workout Note */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-lime-400" /> Notatka z sesji
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="np. Bardzo dobra pompa, lekki ból w lewym barku przy 3 serii..."
              className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 transition-colors"
            />
          </div>

          {/* Exercises & Sets */}
          <div className="space-y-4 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-lime-400" />
                Ćwiczenia i wykonane serie ({exercises.length})
              </h4>
              <button
                type="button"
                onClick={addExercise}
                className="px-3 py-1.5 text-xs font-bold text-lime-400 bg-lime-400/10 border border-lime-400/30 hover:bg-lime-400/20 rounded-xl transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Dodaj ćwiczenie
              </button>
            </div>

            {exercises.map((ex, exIdx) => (
              <div
                key={exIdx}
                className="bg-black/60 border border-zinc-800 rounded-2xl p-4 space-y-3"
              >
                {/* Exercise Name & Mode & Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-5 h-5 rounded bg-[#15151c] text-[11px] font-mono font-bold text-lime-400 flex items-center justify-center border border-zinc-800 shrink-0">
                      {exIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => updateExerciseName(exIdx, e.target.value)}
                      placeholder="Nazwa ćwiczenia..."
                      className="flex-1 bg-[#09090d] border border-zinc-700 focus:border-lime-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <div className="flex items-center bg-[#121217] rounded-lg p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => updateExerciseMode(exIdx, 'reps')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          ex.mode === 'reps'
                            ? 'bg-lime-400 text-black font-extrabold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Powtórzenia
                      </button>
                      <button
                        type="button"
                        onClick={() => updateExerciseMode(exIdx, 'time')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          ex.mode === 'time'
                            ? 'bg-lime-400 text-black font-extrabold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Czas
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExercise(exIdx)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Usuń to ćwiczenie z wpisu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sets Table */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-mono uppercase text-zinc-500 px-2 pb-1">
                    <span className="col-span-2">Seria</span>
                    <span className="col-span-3">Ciężar (kg)</span>
                    <span className="col-span-3">{ex.mode === 'reps' ? 'Powtórzenia' : 'Czas'}</span>
                    <span className="col-span-3 text-center">Status</span>
                    <span className="col-span-1 text-right">Usuń</span>
                  </div>

                  {ex.sets.map((st, setIdx) => (
                    <div
                      key={setIdx}
                      className="grid grid-cols-12 gap-2 items-center bg-[#09090d] border border-zinc-800/80 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                    >
                      <span className="col-span-2 text-zinc-400 font-bold">
                        #{st.setNumber}
                      </span>

                      <div className="col-span-3">
                        <input
                          type="number"
                          step="any"
                          value={st.weight}
                          onChange={(e) =>
                            updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-black border border-zinc-700 focus:border-lime-400 rounded-lg px-2 py-1 text-xs text-lime-400 font-bold text-center"
                        />
                      </div>

                      <div className="col-span-3">
                        {ex.mode === 'reps' ? (
                          <input
                            type="number"
                            min={0}
                            value={st.reps ?? 10}
                            onChange={(e) =>
                              updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full bg-black border border-zinc-700 focus:border-lime-400 rounded-lg px-2 py-1 text-xs text-white text-center"
                          />
                        ) : (
                          <input
                            type="text"
                            value={st.timeDisplay ?? '60s'}
                            onChange={(e) =>
                              updateSet(exIdx, setIdx, 'timeDisplay', e.target.value)
                            }
                            placeholder="np. 45s"
                            className="w-full bg-black border border-lime-500/40 focus:border-lime-400 rounded-lg px-2 py-1 text-xs text-lime-300 text-center"
                          />
                        )}
                      </div>

                      <div className="col-span-3 flex justify-center">
                        <button
                          type="button"
                          onClick={() => updateSet(exIdx, setIdx, 'completed', !st.completed)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                            st.completed
                              ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{st.completed ? 'Zrobiona' : 'Pominięta'}</span>
                        </button>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeSet(exIdx, setIdx)}
                          className="p-1 text-zinc-600 hover:text-rose-400 transition-colors"
                          title="Usuń serię"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSet(exIdx)}
                    className="mt-1 text-[11px] font-bold text-lime-400 hover:text-lime-300 py-1 px-2 rounded hover:bg-lime-400/10 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Dodaj serię
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-black/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-black text-black bg-lime-400 hover:bg-lime-300 rounded-xl transition-all shadow-lg shadow-lime-400/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  );
};
