import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { PlanFolder, WorkoutPlan, WorkoutSession } from './types';

// Recursively remove undefined values so Firestore never throws unsupported field value error
export function cleanForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) return data.map(cleanForFirestore);
  if (typeof data === 'object') {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        res[key] = cleanForFirestore(value);
      }
    }
    return res;
  }
  return data;
}

// Sync local and cloud data seamlessly (folders, workouts, history)
export async function syncUserData(
  userId: string,
  localFolders: PlanFolder[],
  localWorkouts: WorkoutPlan[],
  localHistory: WorkoutSession[]
): Promise<{ folders: PlanFolder[]; workouts: WorkoutPlan[]; history: WorkoutSession[] }> {
  const foldersPath = `users/${userId}/folders`;
  const workoutsPath = `users/${userId}/workouts`;
  const historyPath = `users/${userId}/history`;

  try {
    // 1. Fetch existing data from Firestore
    const [foldersSnap, workoutsSnap, historySnap] = await Promise.all([
      getDocs(collection(db, foldersPath)),
      getDocs(collection(db, workoutsPath)),
      getDocs(collection(db, historyPath)),
    ]);

    const cloudFolders: PlanFolder[] = [];
    foldersSnap.forEach((d) => cloudFolders.push(d.data() as PlanFolder));

    const cloudWorkouts: WorkoutPlan[] = [];
    workoutsSnap.forEach((d) => cloudWorkouts.push(d.data() as WorkoutPlan));

    const cloudHistory: WorkoutSession[] = [];
    historySnap.forEach((d) => cloudHistory.push(d.data() as WorkoutSession));

    console.log(`Cloud state for ${userId}:`, {
      folders: cloudFolders.length,
      workouts: cloudWorkouts.length,
      history: cloudHistory.length,
    });

    // If cloud already has data, it is the master source (e.g. user opening on 2nd device)
    if (cloudFolders.length > 0 || cloudWorkouts.length > 0 || cloudHistory.length > 0) {
      // Merge any local-only items if present and upload to cloud
      for (const lf of localFolders) {
        if (!cloudFolders.some((cf) => cf.id === lf.id)) {
          await saveFolderToCloud(userId, lf);
          cloudFolders.push(lf);
        }
      }
      for (const lw of localWorkouts) {
        if (!cloudWorkouts.some((cw) => cw.id === lw.id)) {
          await saveWorkoutToCloud(userId, lw);
          cloudWorkouts.push(lw);
        }
      }
      for (const lh of localHistory) {
        if (!cloudHistory.some((ch) => ch.id === lh.id)) {
          await saveSessionToCloud(userId, lh);
          cloudHistory.push(lh);
        }
      }

      return {
        folders: cloudFolders,
        workouts: cloudWorkouts,
        history: cloudHistory,
      };
    }

    // If cloud is empty, upload all local items from this device to cloud
    if (localFolders.length > 0 || localWorkouts.length > 0 || localHistory.length > 0) {
      console.log(`Uploading ${localFolders.length} folders, ${localWorkouts.length} workouts, ${localHistory.length} history to cloud...`);
      for (const f of localFolders) {
        await saveFolderToCloud(userId, f);
      }
      for (const w of localWorkouts) {
        await saveWorkoutToCloud(userId, w);
      }
      for (const h of localHistory) {
        await saveSessionToCloud(userId, h);
      }
    }

    return {
      folders: localFolders,
      workouts: localWorkouts,
      history: localHistory,
    };
  } catch (err) {
    console.error('Error during initial syncUserData:', err);
    return {
      folders: localFolders,
      workouts: localWorkouts,
      history: localHistory,
    };
  }
}

// Bulk upload all items (useful for import or full sync)
export async function bulkUploadToCloud(
  userId: string,
  folders: PlanFolder[],
  workouts: WorkoutPlan[],
  history: WorkoutSession[]
) {
  try {
    for (const f of folders) {
      await saveFolderToCloud(userId, f);
    }
    for (const w of workouts) {
      await saveWorkoutToCloud(userId, w);
    }
    for (const h of history) {
      await saveSessionToCloud(userId, h);
    }
  } catch (err) {
    console.error('Error in bulkUploadToCloud:', err);
  }
}

// Subscribe to real-time updates for a logged-in user
export function subscribeToUserData(
  userId: string,
  callbacks: {
    onFolders: (folders: PlanFolder[]) => void;
    onWorkouts: (workouts: WorkoutPlan[]) => void;
    onHistory: (history: WorkoutSession[]) => void;
  }
): () => void {
  const foldersPath = `users/${userId}/folders`;
  const workoutsPath = `users/${userId}/workouts`;
  const historyPath = `users/${userId}/history`;

  const unsubs: Unsubscribe[] = [];

  // Listen to Folders
  try {
    const unsubFolders = onSnapshot(
      collection(db, foldersPath),
      (snapshot) => {
        const foldersList: PlanFolder[] = [];
        snapshot.forEach((d) => {
          foldersList.push(d.data() as PlanFolder);
        });
        callbacks.onFolders(foldersList);
      },
      (error) => {
        console.error('Error in onSnapshot folders:', error);
      }
    );
    unsubs.push(unsubFolders);
  } catch (error) {
    console.error('Failed to subscribe to folders:', error);
  }

  // Listen to Workouts
  try {
    const unsubWorkouts = onSnapshot(
      collection(db, workoutsPath),
      (snapshot) => {
        const workoutsList: WorkoutPlan[] = [];
        snapshot.forEach((d) => {
          workoutsList.push(d.data() as WorkoutPlan);
        });
        callbacks.onWorkouts(workoutsList);
      },
      (error) => {
        console.error('Error in onSnapshot workouts:', error);
      }
    );
    unsubs.push(unsubWorkouts);
  } catch (error) {
    console.error('Failed to subscribe to workouts:', error);
  }

  // Listen to History
  try {
    const unsubHistory = onSnapshot(
      collection(db, historyPath),
      (snapshot) => {
        const historyList: WorkoutSession[] = [];
        snapshot.forEach((d) => {
          historyList.push(d.data() as WorkoutSession);
        });
        // Sort history by date descending
        historyList.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        callbacks.onHistory(historyList);
      },
      (error) => {
        console.error('Error in onSnapshot history:', error);
      }
    );
    unsubs.push(unsubHistory);
  } catch (error) {
    console.error('Failed to subscribe to history:', error);
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

// Folder cloud operations
export async function saveFolderToCloud(userId: string, folder: PlanFolder) {
  try {
    const cleaned = cleanForFirestore(folder);
    await setDoc(doc(db, 'users', userId, 'folders', folder.id), cleaned);
  } catch (error) {
    console.error(`Error saving folder ${folder.id} to cloud:`, error);
  }
}

export async function deleteFolderFromCloud(userId: string, folderId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId, 'folders', folderId));
  } catch (error) {
    console.error(`Error deleting folder ${folderId} from cloud:`, error);
  }
}

// Workout cloud operations
export async function saveWorkoutToCloud(userId: string, workout: WorkoutPlan) {
  try {
    const cleaned = cleanForFirestore(workout);
    await setDoc(doc(db, 'users', userId, 'workouts', workout.id), cleaned);
  } catch (error) {
    console.error(`Error saving workout ${workout.id} to cloud:`, error);
  }
}

export async function deleteWorkoutFromCloud(userId: string, workoutId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId, 'workouts', workoutId));
  } catch (error) {
    console.error(`Error deleting workout ${workoutId} from cloud:`, error);
  }
}

// History session cloud operations
export async function saveSessionToCloud(userId: string, session: WorkoutSession) {
  try {
    const cleaned = cleanForFirestore(session);
    await setDoc(doc(db, 'users', userId, 'history', session.id), cleaned);
  } catch (error) {
    console.error(`Error saving session ${session.id} to cloud:`, error);
  }
}

export async function deleteSessionFromCloud(userId: string, sessionId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId, 'history', sessionId));
  } catch (error) {
    console.error(`Error deleting session ${sessionId} from cloud:`, error);
  }
}
