import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  X,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Dumbbell,
  History,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { PlanFolder, WorkoutPlan, WorkoutSession } from '../types';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: PlanFolder[];
  workouts: WorkoutPlan[];
  history: WorkoutSession[];
  onImport: (
    importedFolders: PlanFolder[],
    importedWorkouts: WorkoutPlan[],
    importedHistory: WorkoutSession[],
    mode: 'merge' | 'replace'
  ) => void;
}

interface ParsedBackupData {
  folders: PlanFolder[];
  workouts: WorkoutPlan[];
  history: WorkoutSession[];
  exportedAt?: string;
  version?: number;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  folders,
  workouts,
  history,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importedFile, setImportedFile] = useState<ParsedBackupData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle Export
  const handleExport = () => {
    try {
      const backupPayload = {
        appName: 'ActiveBook',
        version: 1,
        exportedAt: new Date().toISOString(),
        summary: {
          foldersCount: folders.length,
          workoutsCount: workouts.length,
          historyCount: history.length,
        },
        data: {
          folders,
          workouts,
          history,
        },
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const nowStr = new Date().toISOString().split('T')[0];

      const a = document.createElement('a');
      a.href = url;
      a.download = `ActiveBook_Kopia_${nowStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage('Pomyślnie wyeksportowano kopię zapasową!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage('Błąd podczas generowania pliku: ' + err.message);
    }
  };

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Validate structure (support both wrapped { data: { folders... } } or raw { folders... })
        const targetData = parsed.data || parsed;

        if (
          !targetData ||
          (!Array.isArray(targetData.folders) &&
            !Array.isArray(targetData.workouts) &&
            !Array.isArray(targetData.history))
        ) {
          throw new Error('Wybrany plik nie zawiera poprawnych danych ActiveBook.');
        }

        const validFolders: PlanFolder[] = Array.isArray(targetData.folders)
          ? targetData.folders
          : [];
        const validWorkouts: WorkoutPlan[] = Array.isArray(targetData.workouts)
          ? targetData.workouts
          : [];
        const validHistory: WorkoutSession[] = Array.isArray(targetData.history)
          ? targetData.history
          : [];

        setImportedFile({
          folders: validFolders,
          workouts: validWorkouts,
          history: validHistory,
          exportedAt: parsed.exportedAt,
          version: parsed.version,
        });
      } catch (err: any) {
        setErrorMessage('Niepoprawny format pliku JSON: ' + err.message);
        setImportedFile(null);
      }
    };

    reader.readAsText(file);
  };

  // Execute Import
  const handleExecuteImport = (mode: 'merge' | 'replace') => {
    if (!importedFile) return;

    onImport(
      importedFile.folders,
      importedFile.workouts,
      importedFile.history,
      mode
    );

    setSuccessMessage(
      mode === 'merge'
        ? 'Pomyślnie połączono i zaimportowano dane!'
        : 'Pomyślnie przywrócono kopię zapasową!'
    );

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0e0e12] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-13 h-13 mx-auto mb-3 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center">
            <FileJson className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Kopia Zapasowa & Eksport / Import</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Eksportuj swoje plany, historię treningów i progres do pliku JSON lub przywróć je na dowolnym urządzeniu.
          </p>
        </div>

        {/* Success or Error alert */}
        {successMessage && (
          <div className="mb-4 p-3 bg-lime-400/10 border border-lime-400/30 rounded-xl flex items-center gap-2 text-lime-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tabs: Export vs Import */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/15'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Eksport Danych</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/15'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Danych</span>
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-5">
            <div className="bg-[#121217] border border-zinc-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                Aktualny stan Twoich danych:
              </span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-black/60 border border-zinc-800/80 rounded-xl p-3">
                  <FolderOpen className="w-4 h-4 text-lime-400 mx-auto mb-1" />
                  <span className="text-lg font-black text-white font-mono block">{folders.length}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Foldery</span>
                </div>
                <div className="bg-black/60 border border-zinc-800/80 rounded-xl p-3">
                  <Dumbbell className="w-4 h-4 text-lime-400 mx-auto mb-1" />
                  <span className="text-lg font-black text-white font-mono block">{workouts.length}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Treningi</span>
                </div>
                <div className="bg-black/60 border border-zinc-800/80 rounded-xl p-3">
                  <History className="w-4 h-4 text-lime-400 mx-auto mb-1" />
                  <span className="text-lg font-black text-white font-mono block">{history.length}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Historia</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span>Eksport zawiera również wszystkie serie i ciężary potrzebne do wykresów progresu.</span>
              </p>
            </div>

            <button
              onClick={handleExport}
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Pobierz plik kopii zapasowej (.json)</span>
            </button>
          </div>
        )}

        {/* TAB 2: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-5">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {!importedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-lime-400/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-black/40 hover:bg-black/60 group"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-zinc-900 group-hover:bg-lime-400/10 text-zinc-400 group-hover:text-lime-400 flex items-center justify-center transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-zinc-200 block mb-1">
                  Wybierz lub przeciągnij plik kopii zapasowej (.json)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Obsługiwany format: ActiveBook Backup JSON
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#121217] border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-lime-400" />
                      <span className="text-xs font-bold text-white font-mono truncate max-w-[200px]">
                        {fileName}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setImportedFile(null);
                        setFileName('');
                      }}
                      className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      Zmień plik
                    </button>
                  </div>

                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Zawartość pliku do zaimportowania:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-black/60 border border-zinc-800 p-2 rounded-xl">
                      <strong className="text-lime-400 font-mono text-base block">
                        {importedFile.folders.length}
                      </strong>
                      <span className="text-[10px] text-zinc-500">Foldery</span>
                    </div>
                    <div className="bg-black/60 border border-zinc-800 p-2 rounded-xl">
                      <strong className="text-lime-400 font-mono text-base block">
                        {importedFile.workouts.length}
                      </strong>
                      <span className="text-[10px] text-zinc-500">Treningi</span>
                    </div>
                    <div className="bg-black/60 border border-zinc-800 p-2 rounded-xl">
                      <strong className="text-lime-400 font-mono text-base block">
                        {importedFile.history.length}
                      </strong>
                      <span className="text-[10px] text-zinc-500">Historia sesji</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handleExecuteImport('merge')}
                    className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-lime-400/20 flex items-center justify-center gap-2"
                  >
                    <span>Połącz z obecnymi danymi (Zalecane)</span>
                  </button>

                  <button
                    onClick={() => handleExecuteImport('replace')}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Zastąp wszystkie obecne dane</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
