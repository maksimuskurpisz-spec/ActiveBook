import React, { useState } from 'react';
import { WorkoutPlan, ExerciseSlot, ExerciseMode } from '../types';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, X, FileText } from 'lucide-react';

interface WorkoutEditorProps {
  workout?: WorkoutPlan | null;
  folderId: string;
  folderName: string;
  existingExerciseNames?: string[];
  onSave: (updatedWorkout: WorkoutPlan) => void;
  onCancel: () => void;
}

export const WorkoutEditor: React.FC<WorkoutEditorProps> = ({
  workout,
  folderId,
  folderName,
  existingExerciseNames = [],
  onSave,
  onCancel,
}) => {
  const [workoutName, setWorkoutName] = useState(workout ? workout.name : '');
  const [workoutNotes, setWorkoutNotes] = useState(workout?.notes || '');
  const [exercises, setExercises] = useState<ExerciseSlot[]>(
    workout && workout.exercises.length > 0
      ? workout.exercises
      : [
          {
            id: `ex-${Date.now()}-1`,
            name: '',
            sets: 4,
            mode: 'reps',
            reps: '10',
            weight: '0',
          },
        ]
  );
  const [errors, setErrors] = useState<{ name?: string; exercises?: string }>({});

  // Active autocomplete dropdown index
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);

  const handleAddExercise = () => {
    const newId = `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newSlot: ExerciseSlot = {
      id: newId,
      name: '',
      sets: 3,
      mode: 'reps',
      reps: '10',
      weight: '0',
    };
    setExercises([...exercises, newSlot]);
  };

  const handleRemoveExercise = (index: number) => {
    if (exercises.length <= 1) {
      setExercises([
        {
          id: `ex-${Date.now()}`,
          name: '',
          sets: 3,
          mode: 'reps',
          reps: '10',
          weight: '0',
        },
      ]);
      return;
    }
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === exercises.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newExercises = [...exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[targetIndex];
    newExercises[targetIndex] = temp;
    setExercises(newExercises);
  };

  const updateExercise = (index: number, field: keyof ExerciseSlot, value: any) => {
    const newExercises = [...exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: value,
    };
    setExercises(newExercises);
  };

  const handleToggleMode = (index: number, newMode: ExerciseMode) => {
    const newExercises = [...exercises];
    const current = newExercises[index];
    if (newMode === 'time') {
      current.mode = 'time';
      current.timeDisplay = current.timeDisplay || '60s';
      delete current.reps;
    } else {
      current.mode = 'reps';
      current.reps = current.reps || '10';
      delete current.timeDisplay;
    }
    setExercises(newExercises);
  };

  const handleSelectSuggestion = (index: number, suggestion: string) => {
    updateExercise(index, 'name', suggestion);
    setActiveSuggestionIndex(null);
  };

  const handleSave = () => {
    const trimmedName = workoutName.trim();
    if (!trimmedName) {
      setErrors({ name: 'Wpisz nazwę treningu' });
      return;
    }

    const hasFilledExercise = exercises.some((e) => e.name.trim().length > 0);
    if (!hasFilledExercise) {
      setErrors({ exercises: 'Wpisz nazwę przynajmniej jednego ćwiczenia' });
      return;
    }

    const validExercises = exercises
      .filter((e) => e.name.trim().length > 0)
      .map((e) => ({
        ...e,
        name: e.name.trim(),
        sets: Math.max(1, Number(e.sets) || 1),
        weight: e.weight.toString().trim() || '0',
        ...(e.mode === 'reps'
          ? { reps: (e.reps || '10').toString().trim() }
          : { timeDisplay: (e.timeDisplay || '60s').toString().trim() }),
      }));

    const finalWorkout: WorkoutPlan = {
      id: workout ? workout.id : `workout-${Date.now()}`,
      folderId,
      name: trimmedName,
      notes: workoutNotes.trim() || undefined,
      exercises: validExercises,
      updatedAt: new Date().toISOString(),
    };

    onSave(finalWorkout);
  };

  return (
    <div className="bg-[#0b0b0e] border border-zinc-800 rounded-3xl p-5 md:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="text-xs uppercase font-extrabold tracking-wider text-lime-400 mb-1">
            Folder: {folderName}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {workout ? 'Edycja Treningu' : 'Nowy Trening'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Wpisz nazwę treningu, krótką notatkę oraz ćwiczenia z seriami, powtórzeniami i ciężarem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" /> Anuluj
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-black text-black bg-lime-400 hover:bg-lime-300 rounded-xl transition-all shadow-lg shadow-lime-400/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Zapisz trening
          </button>
        </div>
      </div>

      {/* Workout Name Field & Optional Workout Note */}
      <div className="mt-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
            Nazwa Treningu <span className="text-lime-400">*</span>
          </label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => {
              setWorkoutName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder="np. Trening A - Klatka & Barki, FBW Zestaw 1, Nogi..."
            className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-colors"
          />
          {errors.name && (
            <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-lime-400" />
            <span>Krótka notatka o treningu (opcjonalnie)</span>
          </label>
          <input
            type="text"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="np. Przerwy 90s, rozgrzewka rotatorów, skupienie na technice..."
            className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* Exercise Slots Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Ćwiczenia ({exercises.length})
            </h3>
          </div>
          <button
            onClick={handleAddExercise}
            className="px-3.5 py-1.5 text-xs font-bold text-lime-400 bg-lime-400/10 border border-lime-400/30 hover:bg-lime-400/20 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Dodaj ćwiczenie
          </button>
        </div>

        {errors.exercises && (
          <p className="text-xs text-rose-400 mb-3 font-medium">{errors.exercises}</p>
        )}

        <div className="space-y-3.5">
          {exercises.map((slot, index) => {
            // Find autocomplete suggestions from existing exercise names
            const query = (slot.name || '').trim().toLowerCase();
            const suggestions =
              query.length > 0
                ? existingExerciseNames.filter(
                    (name) =>
                      name.toLowerCase().includes(query) &&
                      name.toLowerCase() !== query
                  )
                : [];

            return (
              <div
                key={slot.id}
                className="bg-black/70 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  {/* Index & Reorder */}
                  <div className="flex items-center justify-between lg:justify-start gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#141419] border border-zinc-800 text-lime-400 text-xs font-mono font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors"
                        title="Przesuń wyżej"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === exercises.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors"
                        title="Przesuń niżej"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Slot 1: Nazwa ćwiczenia (with auto-complete suggestion dropdown) */}
                  <div className="flex-1 min-w-[200px] relative">
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 lg:hidden">
                      Nazwa ćwiczenia
                    </label>
                    <input
                      type="text"
                      value={slot.name}
                      onFocus={() => setActiveSuggestionIndex(index)}
                      onChange={(e) => {
                        updateExercise(index, 'name', e.target.value);
                        setActiveSuggestionIndex(index);
                      }}
                      onBlur={() => {
                        setTimeout(() => setActiveSuggestionIndex(null), 250);
                      }}
                      placeholder="Wpisz nazwę ćwiczenia (np. Zerchery)..."
                      className="w-full bg-[#0c0c10] border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-600 transition-colors"
                    />

                    {/* Autocomplete suggestions dropdown */}
                    {activeSuggestionIndex === index && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#121217] border border-lime-400/40 rounded-xl shadow-2xl max-h-48 overflow-y-auto py-1">
                        <div className="px-3 py-1 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-800">
                          Podpowiedzi ze stworzonych ćwiczeń:
                        </div>
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSuggestion(index, suggestion);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-white hover:text-black hover:bg-lime-400 font-semibold transition-colors flex items-center justify-between"
                          >
                            <span>{suggestion}</span>
                            <span className="text-[10px] opacity-75 font-mono">Wybierz ↵</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Row of Serie, Powtórzenia/Czas, Ciężar - ALWAYS in one line */}
                  <div className="flex items-end gap-2 w-full lg:w-auto shrink-0 flex-nowrap">
                    {/* Slot 2: Ilość serii */}
                    <div className="w-16 sm:w-20 shrink-0">
                      <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 truncate">
                        Serie
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        value={slot.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                        className="w-full bg-[#0c0c10] border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-2 py-2 text-sm text-white font-mono text-center transition-colors"
                      />
                    </div>

                    {/* Slot 3: Powtórzenia LUB Czas */}
                    <div className="flex-1 sm:w-44 shrink-0 min-w-[130px]">
                      <div className="flex items-center justify-between mb-1 gap-1">
                        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider truncate">
                          {slot.mode === 'reps' ? 'Powtórzenia' : 'Czas'}
                        </label>
                        <div className="flex items-center bg-[#141419] rounded-md p-0.5 text-[9px] shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleMode(index, 'reps')}
                            className={`px-1.5 py-0.5 rounded transition-colors ${
                              slot.mode === 'reps'
                                ? 'bg-lime-400 text-black font-extrabold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Powtórzenia
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMode(index, 'time')}
                            className={`px-1.5 py-0.5 rounded transition-colors ${
                              slot.mode === 'time'
                                ? 'bg-lime-400 text-black font-extrabold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Czas
                          </button>
                        </div>
                      </div>

                      {slot.mode === 'reps' ? (
                        <input
                          type="text"
                          value={slot.reps || ''}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          placeholder="np. 8-10"
                          className="w-full bg-[#0c0c10] border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3 py-2 text-sm text-white font-mono text-center placeholder:text-zinc-600 transition-colors"
                        />
                      ) : (
                        <input
                          type="text"
                          value={slot.timeDisplay || ''}
                          onChange={(e) => updateExercise(index, 'timeDisplay', e.target.value)}
                          placeholder="np. 45s lub 60s"
                          className="w-full bg-[#0c0c10] border border-lime-500/40 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3 py-2 text-sm text-lime-300 font-mono text-center placeholder:text-zinc-600 transition-colors"
                        />
                      )}
                    </div>

                    {/* Slot 4: Ciężar */}
                    <div className="w-20 sm:w-28 shrink-0">
                      <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 truncate">
                        Ciężar
                      </label>
                      <input
                        type="text"
                        value={slot.weight}
                        onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                        placeholder="0"
                        className="w-full bg-[#0c0c10] border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-2 sm:px-3 py-2 text-sm text-lime-400 font-mono font-bold text-center placeholder:text-zinc-600 transition-colors"
                      />
                    </div>

                    {/* Slot delete button */}
                    <div className="shrink-0 pb-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(index)}
                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        title="Usuń to ćwiczenie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add another exercise button */}
        <button
          onClick={handleAddExercise}
          className="mt-4 w-full py-3.5 border-2 border-dashed border-zinc-800 hover:border-lime-400/60 hover:bg-lime-400/5 rounded-2xl text-zinc-400 hover:text-lime-300 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Dodaj kolejne ćwiczenie
        </button>
      </div>

      {/* Bottom Save & Cancel */}
      <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Anuluj
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 text-xs font-black text-black bg-lime-400 hover:bg-lime-300 rounded-xl transition-all shadow-lg shadow-lime-400/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Zapisz trening
        </button>
      </div>
    </div>
  );
};
