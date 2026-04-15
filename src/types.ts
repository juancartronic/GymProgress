// ─── User & Profiles ─────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  weight: number;
  height: number;
  bodyFat: number | "";
  age: number;
  gender: "masculino" | "femenino";
  goal: Goal;
  dietPreference: "general" | "vegana";
}

export type Goal = "fuerza" | "cardio" | "perdida" | "tono";
export type Gender = "masculino" | "femenino";
export type DietPreference = "general" | "vegana";

// ─── Exercises ───────────────────────────────────────────────────────────────
export type ExerciseId =
  | "pushup"
  | "squat"
  | "lunge"
  | "plank"
  | "burpee"
  | "curl"
  | "press"
  | "mtnclimber"
  | "jumpingjack"
  | "hipbridge"
  | "row"
  | "pullup"
  | "superman"
  | "dip"
  | "tricepext"
  | "crunch"
  | "russiantwist"
  | "highknees"
  | "skater"
  | "calfraise"
  | "lateralraise"
  | "jumpsquat";

export interface ExerciseInfo {
  name: string;
  met: number;
  muscle: string;
  tag: string;
}

export interface WorkoutExercise {
  id: ExerciseId;
  sets: number;
  reps: number;
  rest: number;
  isTime?: boolean;
  custom?: boolean;
  loadKg?: number;
  professionalNote?: string;
}

export interface Workout {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
}

export interface Plan {
  level: number;
  name: string;
  weeks: string;
  desc: string;
  goal: Goal;
  workouts: Workout[];
}

// ─── Difficulty ──────────────────────────────────────────────────────────────
export type DifficultyKey = "ligero" | "normal" | "intenso";

export interface DifficultyConfig {
  label: string;
  sets: number;
  reps: number;
  rest: number;
}

// ─── Week Calendar ───────────────────────────────────────────────────────────
export type DayKey = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";
export type DayState = "entreno" | "recuperacion" | "descanso";
export type WeeklyCalendar = Record<DayKey, DayState>;

export interface DayStateMeta {
  label: string;
  bg: string;
  fg: string;
  border: string;
}

export interface WeekDay {
  key: DayKey;
  label: string;
}

// ─── Workout Result / History ────────────────────────────────────────────────
export interface WorkoutResult {
  workout: Workout;
  baseWorkout?: Workout;
  planLevel: number;
  difficulty: DifficultyKey;
  duration: number;
  calories: number;
  date: string;
}

// ─── App State ───────────────────────────────────────────────────────────────
export type ThemeMode = "dark" | "light";

export interface AppState {
  profiles: UserProfile[];
  activeProfileId: string | null;
  historyByProfile: Record<string, WorkoutResult[]>;
  weeklyCalendarByProfile: Record<string, WeeklyCalendar>;
  customExercisesByProfile: Record<string, ExerciseId[]>;
  themeMode: ThemeMode;
}

export type Screen =
  | "onboarding"
  | "dashboard"
  | "plans"
  | "history"
  | "demo"
  | "active"
  | "summary"
  | "profile-form";

// ─── Theme ───────────────────────────────────────────────────────────────────
export interface ThemeTokens {
  bgMain: string;
  textMain: string;
  textMuted: string;
  cardBg: string;
  border: string;
  inputBg: string;
  inputBorder: string;
  navBg: string;
  surfaceSoft: string;
  surfaceInner: string;
  scrollTrack: string;
  scrollThumb: string;
  cardPlanBg: string;
  cardObjBg: string;
  cardNutBg: string;
  cardCalBg: string;
  cardDietBg: string;
  cardDemoBg: string;
  inactiveBtnBg: string;
  tipCardBg: string;
  tipCardBorder: string;
  soundOnBg: string;
  vibrateOnBg: string;
}

// ─── Nutrition ───────────────────────────────────────────────────────────────
export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  focus: string;
  hydration: number;
}

export interface Objective {
  phase: string;
  horizonWeeks: number;
  targetWeight: number;
  targetFat: number | null;
  professional: boolean;
}

// ─── Meal Data ───────────────────────────────────────────────────────────────
export interface MealItem {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealSlot {
  label: string;
  items: MealItem[];
}

export interface MealDay {
  day: string;
  meals: string;
  slots?: MealSlot[];
}

export interface MealWeek {
  title: string;
  type: "omni" | "vegana";
  days: MealDay[];
  calorieLabel?: string;
  baseCal?: number;
}

// ─── Tips ────────────────────────────────────────────────────────────────────
export interface ExTip {
  cue: string;
  mistake: string;
}

// ─── Loadable exercises ──────────────────────────────────────────────────────
export interface LoadableConfig {
  intermedio: number;
  avanzado: number;
}

// ─── Active Workout State ────────────────────────────────────────────────────
export interface ActiveWorkoutState {
  workout: Workout;
  planLevel: number;
  origin: string;
  difficulty: DifficultyKey;
}
