import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlanFolder, WorkoutPlan, WorkoutSession } from './types';
import {
  loadFolders,
  saveFolders,
  loadWorkouts,
  saveWorkouts,
  loadHistory,
  saveHistory,
} from './storage';
import {
  UserAccount,
  getCurrentUserAccount,
  logoutAccountSession,
} from './authSync';
import {
  syncUserData,
  subscribeToUserData,
  saveFolderToCloud,
  deleteFolderFromCloud,
  saveWorkoutToCloud,
  deleteWorkoutFromCloud,
  saveSessionToCloud,
  deleteSessionFromCloud,
  bulkUploadToCloud,
} from './firebaseSync';
import { Navbar } from './components/Navbar';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { FolderGrid } from './components/FolderGrid';
import { FolderDetail } from './components/FolderDetail';
import { WorkoutEditor } from './components/WorkoutEditor';
import { WorkoutSessionLogger } from './components/WorkoutSessionLogger';
import { WorkoutHistory } from './components/HistoryNotebook';
import { ProgressionTracker } from './components/ProgressionTracker';
import { ConfirmModal } from './components/ConfirmModal';
import { LoginModal } from './components/LoginModal';
import { DataBackupModal } from './components/DataBackupModal';

export default function App() {
  const [account, setAccount] = useState<UserAccount | null>(() => getCurrentUserAccount());
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  const [folders, setFolders] = useState<PlanFolder[]>(() => loadFolders());
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>(() => loadWorkouts());
  const [history, setHistory] = useState<WorkoutSession[]>(() => loadHistory());

  const [activeTab, setActiveTab] = useState<ActiveTab>('plans');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Reset keys to force returning to the root page of each tab
  const [historyResetKey, setHistoryResetKey] = useState<number>(0);
  const [progressResetKey, setProgressResetKey] = useState<number>(0);

  // Exercise selected to inspect in "Progres"
  const [selectedExerciseForProgress, setSelectedExerciseForProgress] = useState<string>('');

  // Handle bottom navigation click (always return to the first page of that tab)
  const handleBottomNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);

    if (tab === 'plans') {
      // Wróć do widoku wszystkich folderów
      setSelectedFolderId(null);
      setEditingWorkoutContext(null);
      setActiveLoggingContext(null);
      setIsCreatingFolder(false);
    } else if (tab === 'history') {
      // Wróć do pierwszej strony historii (wszystkie zwinięte, zresetowany filtr)
      setHistoryResetKey((k) => k + 1);
    } else if (tab === 'progress') {
      // Wróć do pierwszej strony progresu (lista wszystkich ćwiczeń)
      setSelectedExerciseForProgress('');
      setProgressResetKey((k) => k + 1);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Creating folder trigger
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);

  // Editor modal/view state
  const [editingWorkoutContext, setEditingWorkoutContext] = useState<{
    workout: WorkoutPlan | null;
    folderId: string;
  } | null>(null);

  // Active workout execution / history logging state
  const [activeLoggingContext, setActiveLoggingContext] = useState<{
    workout: WorkoutPlan;
    folder?: PlanFolder;
  } | null>(null);

  // Deletion modals state
  const [folderToDelete, setFolderToDelete] = useState<PlanFolder | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutPlan | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<WorkoutSession | null>(null);

  // Manual sync callback
  const handleManualSync = useCallback(async () => {
    if (!account) return;
    setIsSyncing(true);
    try {
      const synced = await syncUserData(account.userId, folders, workouts, history);
      setFolders(synced.folders);
      saveFolders(synced.folders);

      setWorkouts(synced.workouts);
      saveWorkouts(synced.workouts);

      setHistory(synced.history);
      saveHistory(synced.history);
    } catch (e) {
      console.error('Manual sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [account, folders, workouts, history]);

  // Initial and reactive cloud sync when user account changes
  useEffect(() => {
    if (!account) return;

    let isSubscribed = true;
    setIsSyncing(true);

    // Initial two-way sync (ensuring history and folders are fully synced)
    syncUserData(account.userId, folders, workouts, history)
      .then((synced) => {
        if (!isSubscribed) return;
        setFolders(synced.folders);
        saveFolders(synced.folders);

        setWorkouts(synced.workouts);
        saveWorkouts(synced.workouts);

        setHistory(synced.history);
        saveHistory(synced.history);
      })
      .finally(() => {
        if (isSubscribed) setIsSyncing(false);
      });

    // Real-time snapshot subscription across all user devices
    const unsubscribeCloud = subscribeToUserData(account.userId, {
      onFolders: (cloudFolders) => {
        if (!isSubscribed) return;
        setFolders(cloudFolders);
        saveFolders(cloudFolders);
      },
      onWorkouts: (cloudWorkouts) => {
        if (!isSubscribed) return;
        setWorkouts(cloudWorkouts);
        saveWorkouts(cloudWorkouts);
      },
      onHistory: (cloudHistory) => {
        if (!isSubscribed) return;
        setHistory(cloudHistory);
        saveHistory(cloudHistory);
      },
    });

    return () => {
      isSubscribed = false;
      unsubscribeCloud();
    };
  }, [account?.userId]);

  // Save to local cache
  useEffect(() => {
    saveFolders(folders);
  }, [folders]);

  useEffect(() => {
    saveWorkouts(workouts);
  }, [workouts]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Aggregate all known exercise names for autocomplete
  const existingExerciseNames = useMemo(() => {
    const namesSet = new Set<string>();
    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        if (e.name.trim()) namesSet.add(e.name.trim());
      });
    });
    history.forEach((s) => {
      s.exercises.forEach((e) => {
        if (e.name.trim()) namesSet.add(e.name.trim());
      });
    });
    return Array.from(namesSet).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [workouts, history]);

  // Auth actions
  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = async (newAccount: UserAccount) => {
    setAccount(newAccount);
    setIsSyncing(true);
    try {
      const synced = await syncUserData(newAccount.userId, folders, workouts, history);
      setFolders(synced.folders);
      saveFolders(synced.folders);

      setWorkouts(synced.workouts);
      saveWorkouts(synced.workouts);

      setHistory(synced.history);
      saveHistory(synced.history);
    } catch (e) {
      console.error('Initial sync error on login:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    logoutAccountSession();
    setAccount(null);
  };

  // Import Handler (Merge or Replace)
  const handleImportData = (
    importedFolders: PlanFolder[],
    importedWorkouts: WorkoutPlan[],
    importedHistory: WorkoutSession[],
    mode: 'merge' | 'replace'
  ) => {
    if (mode === 'replace') {
      setFolders(importedFolders);
      saveFolders(importedFolders);

      setWorkouts(importedWorkouts);
      saveWorkouts(importedWorkouts);

      setHistory(importedHistory);
      saveHistory(importedHistory);

      if (account) {
        bulkUploadToCloud(account.userId, importedFolders, importedWorkouts, importedHistory);
      }
    } else {
      // Merge mode
      const mergedFolders = [...folders];
      importedFolders.forEach((inf) => {
        const idx = mergedFolders.findIndex((f) => f.id === inf.id);
        if (idx >= 0) mergedFolders[idx] = inf;
        else mergedFolders.push(inf);
      });

      const mergedWorkouts = [...workouts];
      importedWorkouts.forEach((inw) => {
        const idx = mergedWorkouts.findIndex((w) => w.id === inw.id);
        if (idx >= 0) mergedWorkouts[idx] = inw;
        else mergedWorkouts.push(inw);
      });

      const mergedHistory = [...history];
      importedHistory.forEach((inh) => {
        const idx = mergedHistory.findIndex((h) => h.id === inh.id);
        if (idx >= 0) mergedHistory[idx] = inh;
        else mergedHistory.push(inh);
      });

      setFolders(mergedFolders);
      saveFolders(mergedFolders);

      setWorkouts(mergedWorkouts);
      saveWorkouts(mergedWorkouts);

      setHistory(mergedHistory);
      saveHistory(mergedHistory);

      if (account) {
        bulkUploadToCloud(account.userId, mergedFolders, mergedWorkouts, mergedHistory);
      }
    }
  };

  // Folder Operations
  const handleCreateFolder = (name: string, color: string) => {
    const newFolder: PlanFolder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, newFolder]);
    if (account) {
      saveFolderToCloud(account.userId, newFolder);
    }
  };

  const handleUpdateFolder = (id: string, newName: string, newColor: string) => {
    let updated: PlanFolder | undefined;
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          updated = { ...f, name: newName, color: newColor };
          return updated;
        }
        return f;
      })
    );
    if (account && updated) {
      saveFolderToCloud(account.userId, updated);
    }
  };

  const executeDeleteFolder = () => {
    if (!folderToDelete) return;
    const targetId = folderToDelete.id;

    setFolders((prev) => prev.filter((f) => f.id !== targetId));
    setWorkouts((prev) => prev.filter((w) => w.folderId !== targetId));
    if (selectedFolderId === targetId) {
      setSelectedFolderId(null);
    }

    if (account) {
      deleteFolderFromCloud(account.userId, targetId);
      workouts
        .filter((w) => w.folderId === targetId)
        .forEach((w) => deleteWorkoutFromCloud(account.userId, w.id));
    }

    setFolderToDelete(null);
  };

  // Workout Operations
  const handleSaveWorkout = (savedWorkout: WorkoutPlan) => {
    setWorkouts((prev) => {
      const exists = prev.some((w) => w.id === savedWorkout.id);
      if (exists) {
        return prev.map((w) => (w.id === savedWorkout.id ? savedWorkout : w));
      }
      return [...prev, savedWorkout];
    });

    if (account) {
      saveWorkoutToCloud(account.userId, savedWorkout);
    }

    setEditingWorkoutContext(null);
  };

  const executeDeleteWorkout = () => {
    if (!workoutToDelete) return;
    const targetId = workoutToDelete.id;

    setWorkouts((prev) => prev.filter((w) => w.id !== targetId));
    if (account) {
      deleteWorkoutFromCloud(account.userId, targetId);
    }
    setWorkoutToDelete(null);
  };

  // History Logging Operations
  const handleSaveSession = (newSession: WorkoutSession) => {
    setHistory((prev) => [newSession, ...prev]);
    if (account) {
      saveSessionToCloud(account.userId, newSession);
    }
    setActiveLoggingContext(null);
    setActiveTab('history');
  };

  const handleUpdateSession = (updatedSession: WorkoutSession) => {
    setHistory((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    if (account) {
      saveSessionToCloud(account.userId, updatedSession);
    }
  };

  const executeDeleteSession = () => {
    if (!sessionToDelete) return;
    const targetId = sessionToDelete.id;

    setHistory((prev) => prev.filter((s) => s.id !== targetId));
    if (account) {
      deleteSessionFromCloud(account.userId, targetId);
    }
    setSessionToDelete(null);
  };

  // Current folder selection
  const currentFolder = folders.find((f) => f.id === selectedFolderId);
  const currentFolderWorkouts = workouts.filter((w) => w.folderId === selectedFolderId);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-lime-400/30 selection:text-lime-300 pb-20">
      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={!!folderToDelete}
        title="Usunąć folder?"
        message={`Czy na pewno chcesz bezpowrotnie usunąć folder "${folderToDelete?.name}" wraz ze wszystkimi zaplanowanymi w nim treningami?`}
        confirmText="Usuń folder"
        onConfirm={executeDeleteFolder}
        onCancel={() => setFolderToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!workoutToDelete}
        title="Usunąć trening?"
        message={`Czy na pewno chcesz usunąć plan treningowy "${workoutToDelete?.name}"?`}
        confirmText="Usuń trening"
        onConfirm={executeDeleteWorkout}
        onCancel={() => setWorkoutToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!sessionToDelete}
        title="Usunąć z historii?"
        message="Czy na pewno chcesz usunąć ten zrealizowany trening z historii treningów?"
        confirmText="Usuń wpis"
        onConfirm={executeDeleteSession}
        onCancel={() => setSessionToDelete(null)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Data Backup / Export / Import Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        folders={folders}
        workouts={workouts}
        history={history}
        onImport={handleImportData}
      />

      {/* Top Brand Header with Login Status and Backup Button */}
      <Navbar
        account={account}
        isLoadingAuth={isLoadingAuth}
        isSyncing={isSyncing}
        onLogin={handleOpenLogin}
        onLogout={handleLogout}
        onManualSync={handleManualSync}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 md:py-7">
        {/* TAB 1: PLANS & FOLDERS */}
        {activeTab === 'plans' && (
          <div>
            {/* Case A: Save completed workout to history */}
            {activeLoggingContext ? (
              <WorkoutSessionLogger
                workout={activeLoggingContext.workout}
                folder={activeLoggingContext.folder}
                onSave={handleSaveSession}
                onCancel={() => setActiveLoggingContext(null)}
              />
            ) : editingWorkoutContext ? (
              /* Case B: Workout Editor */
              <WorkoutEditor
                workout={editingWorkoutContext.workout}
                folderId={editingWorkoutContext.folderId}
                folderName={
                  folders.find((f) => f.id === editingWorkoutContext.folderId)?.name || 'Folder'
                }
                existingExerciseNames={existingExerciseNames}
                onSave={handleSaveWorkout}
                onCancel={() => setEditingWorkoutContext(null)}
              />
            ) : selectedFolderId && currentFolder ? (
              /* Case C: Inside a specific folder */
              <FolderDetail
                folder={currentFolder}
                workouts={currentFolderWorkouts}
                onBack={() => setSelectedFolderId(null)}
                onEditWorkout={(workout) =>
                  setEditingWorkoutContext({ workout, folderId: currentFolder.id })
                }
                onLogCompletedWorkout={(workout) =>
                  setActiveLoggingContext({ workout, folder: currentFolder })
                }
                onRequestDeleteWorkout={(workout) => setWorkoutToDelete(workout)}
                onRequestDeleteFolder={(folder) => setFolderToDelete(folder)}
                onCreateWorkout={() =>
                  setEditingWorkoutContext({ workout: null, folderId: currentFolder.id })
                }
                onSaveWorkout={handleSaveWorkout}
              />
            ) : (
              /* Case D: Top-level Folder Grid */
              <FolderGrid
                folders={folders}
                workouts={workouts}
                isCreatingFolder={isCreatingFolder}
                setIsCreatingFolder={setIsCreatingFolder}
                onSelectFolder={(folderId) => setSelectedFolderId(folderId)}
                onCreateFolder={handleCreateFolder}
                onUpdateFolder={handleUpdateFolder}
                onRequestDeleteFolder={(folder) => setFolderToDelete(folder)}
              />
            )}
          </div>
        )}

        {/* TAB 2: HISTORIA TRENINGÓW */}
        {activeTab === 'history' && (
          <WorkoutHistory
            history={history}
            resetKey={historyResetKey}
            onOpenBackup={() => setIsBackupModalOpen(true)}
            onUpdateSession={handleUpdateSession}
            onRequestDeleteSession={(session) => setSessionToDelete(session)}
            onSelectExerciseForProgress={(exerciseName) => {
              setSelectedExerciseForProgress(exerciseName);
              setActiveTab('progress');
            }}
          />
        )}

        {/* TAB 3: PROGRES */}
        {activeTab === 'progress' && (
          <ProgressionTracker
            history={history}
            workouts={workouts}
            initialSelectedExercise={selectedExerciseForProgress}
            resetKey={progressResetKey}
            onClearInitialSelectedExercise={() => setSelectedExerciseForProgress('')}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleBottomNavClick}
      />
    </div>
  );
}
