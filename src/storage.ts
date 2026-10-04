import { PlanFolder, WorkoutPlan, WorkoutSession } from './types';
import { INITIAL_FOLDERS, INITIAL_WORKOUTS, INITIAL_HISTORY } from './mockData';

const FOLDERS_KEY = 'activebook_folders_v2';
const WORKOUTS_KEY = 'activebook_workouts_v2';
const HISTORY_KEY = 'activebook_history_v2';

// Purge any legacy keys from previous sessions to ensure clean state
try {
  localStorage.removeItem('all_plans_folders_v1');
  localStorage.removeItem('all_plans_workouts_v1');
  localStorage.removeItem('all_plans_history_v1');
} catch {
  // ignore
}

export function loadFolders(): PlanFolder[] {
  try {
    const data = localStorage.getItem(FOLDERS_KEY);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load folders from localStorage', e);
  }
  return INITIAL_FOLDERS;
}

export function saveFolders(folders: PlanFolder[]): void {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error('Failed to save folders to localStorage', e);
  }
}

export function loadWorkouts(): WorkoutPlan[] {
  try {
    const data = localStorage.getItem(WORKOUTS_KEY);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load workouts from localStorage', e);
  }
  return INITIAL_WORKOUTS;
}

export function saveWorkouts(workouts: WorkoutPlan[]): void {
  try {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (e) {
    console.error('Failed to save workouts to localStorage', e);
  }
}

export function loadHistory(): WorkoutSession[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
  }
  return INITIAL_HISTORY;
}

export function saveHistory(history: WorkoutSession[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
}

export function clearAllActiveBookData(): { folders: PlanFolder[]; workouts: WorkoutPlan[]; history: WorkoutSession[] } {
  try {
    localStorage.removeItem(FOLDERS_KEY);
    localStorage.removeItem(WORKOUTS_KEY);
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
  return {
    folders: [],
    workouts: [],
    history: [],
  };
}
