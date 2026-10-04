import React, { useState } from 'react';
import { PlanFolder, WorkoutPlan } from '../types';
import {
  Plus,
  Edit2,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Dumbbell,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface FolderDetailProps {
  folder: PlanFolder;
  workouts: WorkoutPlan[];
  onBack: () => void;
  onEditWorkout: (workout: WorkoutPlan) => void;
  onLogCompletedWorkout: (workout: WorkoutPlan) => void;
  onRequestDeleteWorkout: (workout: WorkoutPlan) => void;
  onRequestDeleteFolder: (folder: PlanFolder) => void;
  onCreateWorkout: () => void;
  onSaveWorkout?: (workout: WorkoutPlan) => void;
}

export const FolderDetail: React.FC<FolderDetailProps> = ({
  folder,
  workouts,
  onBack,
  onEditWorkout,
  onLogCompletedWorkout,
  onRequestDeleteWorkout,
  onRequestDeleteFolder,
  onCreateWorkout,
}) => {
  // State for which workout is currently opened/clicked
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  const selectedWorkout = workouts.find((w) => w.id === selectedWorkoutId) || null;

  // VIEW 1: WORKOUT DETAILS PANEL (Shown ONLY after clicking on a specific workout)
  if (selectedWorkout) {
    return (
      <div className="space-y-6">
        {/* Back navigation button to workouts list in this folder */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <button
            onClick={() => setSelectedWorkoutId(null)}
            className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Wróć do treningów w folderze
          </button>
          <span className="text-xs text-zinc-500 font-mono">{folder.name}</span>
        </div>

        {/* Workout Detail Card with Action Buttons & Exercise Slots Preview */}
        <div className="bg-[#0c0c10] border border-zinc-800 rounded-3xl p-5 md:p-6 transition-all shadow-xl">
          {/* Header row with title & action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center shrink-0">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{selectedWorkout.name}</h3>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 font-mono">
                  <span>{selectedWorkout.exercises.length} ćw.</span>
                </div>
              </div>
            </div>

            {/* Action buttons: Edytuj, Zapisz zrobiony trening, Usuń */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => onEditWorkout(selectedWorkout)}
                className="px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors flex items-center gap-1.5"
                title="Edytuj sloty ćwiczeń i nazwę treningu"
              >
                <Edit2 className="w-3.5 h-3.5 text-lime-400" />
                Edytuj
              </button>

              <button
                onClick={() => onLogCompletedWorkout(selectedWorkout)}
                className="px-4 py-2 text-xs font-black text-black bg-lime-400 hover:bg-lime-300 rounded-xl transition-all shadow-md shadow-lime-400/20 flex items-center gap-1.5"
                title="Kliknij po ukończeniu treningu, aby zapisać go w historii"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                Zrobiony
              </button>

              <button
                onClick={() => {
                  onRequestDeleteWorkout(selectedWorkout);
                  setSelectedWorkoutId(null);
                }}
                className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Usuń trening"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notatka o treningu (jeśli została dodana) */}
          {selectedWorkout.notes && (
            <div className="mt-4 p-3.5 bg-[#101015] border border-zinc-800 rounded-2xl flex items-start gap-3">
              <FileText className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">
                  Notatka o treningu:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed">{selectedWorkout.notes}</p>
              </div>
            </div>
          )}

          {/* Exercise slots preview */}
          <div className="mt-5">
            <div className="mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Ćwiczenia ({selectedWorkout.exercises.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {selectedWorkout.exercises.map((slot, index) => (
                <div
                  key={slot.id || index}
                  className="bg-black/60 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-3.5 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    {/* Name & index */}
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-[#121217] border border-zinc-800 text-[11px] font-mono font-bold text-lime-400 flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-zinc-100 text-sm">{slot.name}</span>
                    </div>

                    {/* Clean slots: Serie · Powtórzenia / Czas · Ciężar - ALWAYS in one line */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 flex-nowrap shrink-0 text-xs font-mono whitespace-nowrap overflow-x-auto">
                      <div className="bg-[#101014] border border-zinc-800 px-2 sm:px-2.5 py-1 rounded-lg shrink-0 flex items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-sans mr-1">
                          Serie:
                        </span>
                        <strong className="text-zinc-100 font-bold">{slot.sets}</strong>
                      </div>

                      <div className="bg-[#101014] border border-zinc-800 px-2 sm:px-2.5 py-1 rounded-lg shrink-0 flex items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-sans mr-1">
                          {slot.mode === 'reps' ? 'Powtórzenia:' : 'Czas:'}
                        </span>
                        <strong
                          className={
                            slot.mode === 'time'
                              ? 'text-lime-300 font-bold'
                              : 'text-zinc-100 font-bold'
                          }
                        >
                          {slot.mode === 'reps' ? slot.reps || '10' : slot.timeDisplay || '60s'}
                        </strong>
                      </div>

                      <div className="bg-[#101014] border border-zinc-800 px-2 sm:px-2.5 py-1 rounded-lg shrink-0 flex items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-sans mr-1">
                          Ciężar:
                        </span>
                        <strong className="text-lime-400 font-bold">
                          {slot.weight || '0'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: LIST OF WORKOUTS IN FOLDER (Initial state when folder is opened)
  return (
    <div className="space-y-6">
      {/* Folder Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Wróć do folderów
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: folder.color || '#84cc16' }}
              />
              <h2 className="text-2xl font-bold text-white tracking-tight">{folder.name}</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              {workouts.length} {workouts.length === 1 ? 'trening' : 'treningi'}
            </p>
          </div>
        </div>

        {/* Delete Folder button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onRequestDeleteFolder(folder)}
            className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors flex items-center gap-1.5"
            title="Usuń ten folder"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Usuń folder</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {workouts.length === 0 ? (
        <div className="bg-[#0b0b0e] border border-zinc-800 rounded-3xl p-10 text-center max-w-lg mx-auto shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-lime-400 flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Brak zaplanowanych treningów</h3>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Ten folder jest jeszcze pusty. Utwórz swój pierwszy plan treningowy z ćwiczeniami, seriami,
            powtórzeniami lub czasem oraz ciężarem!
          </p>
          <button
            onClick={onCreateWorkout}
            className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 shadow-lg shadow-lime-400/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Dodaj trening do folderu
          </button>
        </div>
      ) : (
        /* Workouts List: Clean clickable cards */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => setSelectedWorkoutId(workout.id)}
                className="group bg-[#0c0c10] border border-zinc-800 hover:border-lime-400/50 hover:bg-[#111116] rounded-2xl p-5 cursor-pointer transition-all duration-150 flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-black border border-zinc-800 group-hover:border-lime-400/40 text-lime-400 flex items-center justify-center shrink-0 transition-colors">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-lime-400 transition-colors">
                      {workout.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 font-mono">
                      <span>{workout.exercises.length} ćw.</span>
                      {workout.notes && (
                        <>
                          <span>·</span>
                          <span className="text-lime-400/80 font-sans truncate max-w-[140px]">
                            {workout.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-lime-400/40 text-zinc-400 group-hover:text-lime-400 flex items-center justify-center transition-all group-hover:translate-x-0.5">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Single bottom button to add a workout to this folder */}
          <button
            onClick={onCreateWorkout}
            className="w-full py-4 border-2 border-dashed border-zinc-800 hover:border-lime-400/50 hover:bg-lime-400/5 rounded-2xl text-zinc-400 hover:text-lime-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Dodaj trening do folderu
          </button>
        </div>
      )}
    </div>
  );
};
