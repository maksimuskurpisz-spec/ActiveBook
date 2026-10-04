export type ExerciseMode = 'reps' | 'time';

export interface ExerciseSlot {
  id: string;
  name: string;          // Nazwa ćwiczenia
  sets: number;          // Ilość serii
  mode: ExerciseMode;    // 'reps' (powtórzenia) lub 'time' (czas)
  reps?: string;         // Ilość powtórzeń (np. "10" lub "8-10")
  timeDisplay?: string;  // Czas (np. "45s", "60s", "01:30")
  weight: string;        // Ciężar (np. "80", "12.5", "0")
  notes?: string;        // Uwagi do ćwiczenia (np. technika, kąt ławki)
}

export interface WorkoutPlan {
  id: string;
  folderId: string;
  name: string;          // Nazwa treningu, np. "Push A", "Nogi & Brzuch"
  notes?: string;        // Krótka notatka o treningu
  exercises: ExerciseSlot[];
  updatedAt: string;
}

export interface PlanFolder {
  id: string;
  name: string;          // Nazwa folderu
  color: string;         // Kolor akcentu
  createdAt: string;
}

export interface LoggedSet {
  setNumber: number;
  reps?: number;
  timeDisplay?: string;
  weight: number;
  completed: boolean;
}

export interface LoggedExercise {
  name: string;
  mode: ExerciseMode;
  sets: LoggedSet[];
}

export interface WorkoutSession {
  id: string;
  workoutPlanId?: string;
  workoutName: string;
  folderName: string;
  date: string;          // ISO date string
  durationMinutes?: number;
  exercises: LoggedExercise[];
  notes?: string;
}
