import React, { useState } from 'react';
import { PlanFolder, WorkoutPlan } from '../types';
import { Folder, Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import logoImg from '../assets/images/activebook_icon_1790898482765.jpg';

interface FolderGridProps {
  folders: PlanFolder[];
  workouts: WorkoutPlan[];
  isCreatingFolder: boolean;
  setIsCreatingFolder: (v: boolean) => void;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string, color: string) => void;
  onUpdateFolder: (id: string, newName: string, newColor: string) => void;
  onRequestDeleteFolder: (folder: PlanFolder) => void;
}

const PRESET_COLORS = [
  '#84cc16', // Lime (ActiveBook default)
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#f43f5e', // Rose
];

export const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  workouts,
  isCreatingFolder,
  setIsCreatingFolder,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onRequestDeleteFolder,
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  // Rename modal state
  const [editingFolder, setEditingFolder] = useState<PlanFolder | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), selectedColor);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder || !editName.trim()) return;
    onUpdateFolder(editingFolder.id, editName.trim(), editColor);
    setEditingFolder(null);
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Foldery Treningowe</span>
        </h2>
      </div>

      {/* Inline Create Folder Card */}
      {isCreatingFolder && (
        <form
          onSubmit={handleCreate}
          className="bg-[#0e0e12] border border-lime-400/40 rounded-3xl p-5 md:p-6 shadow-2xl transition-all"
        >
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Folder className="w-4 h-4 text-lime-400" />
            Utwórz nowy folder treningowy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Nazwa folderu
              </label>
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="np. Push Pull Legs, Góra / Dół, FBW, Siła..."
                className="w-full bg-black border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Kolor akcentu
              </label>
              <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedColor === c
                        ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreatingFolder(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={!newFolderName.trim()}
              className="px-5 py-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-lime-400/20"
            >
              Utwórz folder
            </button>
          </div>
        </form>
      )}

      {/* Rename Modal */}
      {editingFolder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-[#0e0e12] border border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-lime-400" />
              Zmień nazwę folderu
            </h3>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Nowa nazwa folderu
              </label>
              <input
                type="text"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-black border border-zinc-700 focus:border-lime-400 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Kolor akcentu
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setEditColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      editColor === c
                        ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingFolder(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={!editName.trim()}
                className="px-5 py-2 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl transition-all"
              >
                Zapisz zmiany
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State when no folders exist yet */}
      {folders.length === 0 && !isCreatingFolder ? (
        <div className="bg-[#0b0b0e] border border-zinc-800/80 rounded-3xl p-8 md:p-12 text-center max-w-lg mx-auto shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl overflow-hidden border border-lime-400/40 shadow-xl shadow-lime-400/10 bg-black">
            <img src={logoImg} alt="ActiveBook" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Twój ActiveBook jest czysty</h3>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Stwórz swój pierwszy folder (np. <span className="text-lime-300 font-semibold">&quot;Push Pull Legs&quot;</span> lub <span className="text-lime-300 font-semibold">&quot;FBW&quot;</span>), aby dodać do niego zaplanowane treningi.
          </p>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-lime-400/20 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Utwórz pierwszy folder
          </button>
        </div>
      ) : (
        /* Folders Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {folders.map((folder) => {
            const folderWorkouts = workouts.filter((w) => w.folderId === folder.id);

            return (
              <div
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                className="group bg-[#0c0c10] border border-zinc-800 hover:border-lime-400/50 hover:bg-[#111116] rounded-3xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                {/* Folder Accent bar on top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
                  style={{ backgroundColor: folder.color || '#84cc16' }}
                />

                <div>
                  {/* Folder Top Row: Icon + Name + Quick Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3 pt-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${folder.color || '#84cc16'}20`,
                          color: folder.color || '#84cc16',
                        }}
                      >
                        <Folder className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-lime-400 transition-colors">
                          {folder.name}
                        </h3>
                        <span className="text-xs text-zinc-400 font-mono">
                          {folderWorkouts.length}{' '}
                          {folderWorkouts.length === 1
                            ? 'trening'
                            : folderWorkouts.length >= 2 && folderWorkouts.length <= 4
                            ? 'treningi'
                            : 'treningów'}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Rename & Delete */}
                    <div
                      className="flex items-center gap-1 opacity-90 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFolder(folder);
                          setEditName(folder.name);
                          setEditColor(folder.color || '#84cc16');
                        }}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Zmień nazwę folderu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestDeleteFolder(folder)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Usuń folder i jego zawartość"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Workouts Preview List */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5">
                    {folderWorkouts.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic py-2">
                        Folder jest pusty. Kliknij, aby dodać pierwszy trening.
                      </p>
                    ) : (
                      folderWorkouts.slice(0, 3).map((w) => (
                        <div
                          key={w.id}
                          className="text-xs text-zinc-300 flex items-center justify-between py-1 px-2.5 rounded-lg bg-black/60 border border-zinc-800/50"
                        >
                          <span className="truncate pr-2 font-medium">{w.name}</span>
                          <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                            {w.exercises.length} ćw.
                          </span>
                        </div>
                      ))
                    )}

                    {folderWorkouts.length > 3 && (
                      <div className="text-[11px] text-zinc-400 px-2 pt-0.5 font-mono">
                        + jeszcze {folderWorkouts.length - 3} więcej...
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 group-hover:text-lime-400 font-semibold">
                  <span>Otwórz folder</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}

          {/* Single Add Folder Placeholder Card */}
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="min-h-[190px] border-2 border-dashed border-zinc-800 hover:border-lime-400/60 hover:bg-lime-400/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-lime-300 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0e0e12] group-hover:bg-lime-400/10 border border-zinc-800 group-hover:border-lime-400/40 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-zinc-400 group-hover:text-lime-400" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-zinc-300 group-hover:text-lime-300 block">
                Dodaj Nowy Folder
              </span>
              <span className="text-xs text-zinc-400">
                Stwórz katalog na nowe plany treningowe
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
