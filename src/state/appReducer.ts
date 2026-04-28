import type {
  UserProfile,
  ThemeMode,
  WeeklyCalendar,
  WorkoutResult,
  ExerciseId,
  ActiveWorkoutState,
  AppState,
  WeightEntry,
} from "../types";
import { defaultWeeklyCalendar } from "../domain/data";

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

const estimateBodyFat = (profile: UserProfile): number | "" => {
  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const age = Number(profile.age);
  if (!weight || !height || !age || height <= 0) return profile.bodyFat;

  const isMale = profile.gender === "masculino";
  const bmi = weight / ((height / 100) ** 2);
  const waist = typeof profile.waistCm === "number" ? profile.waistCm : null;

  const bf = waist && waist > 0
    ? (isMale ? 64 : 76) - 20 * (height / waist)
    : 1.39 * bmi + 0.16 * age - 10.34 * (isMale ? 1 : 0) - 9;

  return Number(clamp(bf, 4, 60).toFixed(1));
};

const withAutoBodyFat = (profile: UserProfile): UserProfile => ({
  ...profile,
  bodyFat: estimateBodyFat(profile),
});

// ─── State ───────────────────────────────────────────────────────────────────
/** Full app state managed by the reducer, including profiles, workout state, and UI flags. */
export interface AppReducerState {
  profiles: UserProfile[];
  activeProfileId: string | null;
  historyByProfile: Record<string, WorkoutResult[]>;
  weeklyCalendarByProfile: Record<string, WeeklyCalendar>;
  customExercisesByProfile: Record<string, ExerciseId[]>;
  weightLogByProfile: Record<string, WeightEntry[]>;
  activeWorkout: ActiveWorkoutState | null;
  workoutResult: WorkoutResult | null;
  loaded: boolean;
  editingProfileId: string | null;
  themeMode: ThemeMode;
}

export const initialState: AppReducerState = {
  profiles: [],
  activeProfileId: null,
  historyByProfile: {},
  weeklyCalendarByProfile: {},
  customExercisesByProfile: {},
  weightLogByProfile: {},
  activeWorkout: null,
  workoutResult: null,
  loaded: false,
  editingProfileId: null,
  themeMode: "dark",
};

// ─── Actions ─────────────────────────────────────────────────────────────────
export type AppAction =
  | { type: "LOAD_STATE"; payload: AppState }
  | { type: "IMPORT_STATE"; payload: AppState }
  | { type: "SET_LOADED" }
  | { type: "ADD_PROFILE"; payload: UserProfile }
  | { type: "UPDATE_PROFILE"; payload: { id: string; data: Omit<UserProfile, "id"> } }
  | { type: "DELETE_PROFILE"; payload: string }
  | { type: "SWITCH_PROFILE"; payload: string }
  | { type: "SET_EDITING_PROFILE"; payload: string | null }
  | { type: "CYCLE_DAY_STATE"; payload: { userId: string; dayKey: string; nextState: string } }
  | { type: "PREP_WORKOUT"; payload: ActiveWorkoutState }
  | { type: "UPDATE_ACTIVE_WORKOUT_EXERCISES"; payload: ActiveWorkoutState }
  | { type: "FINISH_WORKOUT"; payload: { userId: string; result: WorkoutResult } }
  | { type: "SET_WORKOUT_RESULT"; payload: WorkoutResult | null }
  | { type: "SAVE_EXTRA_IDS"; payload: { userId: string; ids: ExerciseId[] } }
  | { type: "REMOVE_SAVED_EXTRA"; payload: { userId: string; id: ExerciseId } }
  | { type: "CLEAR_SAVED_EXTRAS"; payload: string }
  | { type: "LOG_WEIGHT"; payload: { userId: string; entry: WeightEntry } }
  | { type: "TOGGLE_THEME" };

// ─── Reducer ─────────────────────────────────────────────────────────────────
/** Main reducer handling all app state transitions (profiles, workouts, calendar, theme). */
export function appReducer(state: AppReducerState, action: AppAction): AppReducerState {
  switch (action.type) {
    case "LOAD_STATE":
    case "IMPORT_STATE":
      return {
        ...state,
        profiles: action.payload.profiles,
        activeProfileId: action.payload.activeProfileId,
        historyByProfile: action.payload.historyByProfile,
        weeklyCalendarByProfile: action.payload.weeklyCalendarByProfile,
        customExercisesByProfile: action.payload.customExercisesByProfile || {},
        weightLogByProfile: action.payload.weightLogByProfile || {},
        themeMode: action.payload.themeMode,
        loaded: true,
      };

    case "SET_LOADED":
      return { ...state, loaded: true };

    case "ADD_PROFILE": {
      const p = withAutoBodyFat(action.payload);
      return {
        ...state,
        profiles: [...state.profiles, p],
        activeProfileId: p.id,
        historyByProfile: { ...state.historyByProfile, [p.id]: [] },
        weeklyCalendarByProfile: { ...state.weeklyCalendarByProfile, [p.id]: defaultWeeklyCalendar() },
        customExercisesByProfile: { ...state.customExercisesByProfile, [p.id]: [] },
        weightLogByProfile: { ...state.weightLogByProfile, [p.id]: [] },
      };
    }

    case "UPDATE_PROFILE": {
      const { id, data } = action.payload;
      return {
        ...state,
        profiles: state.profiles.map((p) =>
          p.id === id ? withAutoBodyFat({ ...p, ...data, id: p.id }) : p,
        ),
        editingProfileId: null,
      };
    }

    case "DELETE_PROFILE": {
      const id = action.payload;
      const remaining = state.profiles.filter((p) => p.id !== id);
      const { [id]: _h, ...histRest } = state.historyByProfile;
      const { [id]: _w, ...calRest } = state.weeklyCalendarByProfile;
      const { [id]: _c, ...exRest } = state.customExercisesByProfile;
      const { [id]: _wl, ...wlRest } = state.weightLogByProfile;
      return {
        ...state,
        profiles: remaining,
        activeProfileId: remaining.length > 0 ? remaining[0].id : null,
        historyByProfile: histRest,
        weeklyCalendarByProfile: calRest,
        customExercisesByProfile: exRest,
        weightLogByProfile: wlRest,
      };
    }

    case "SWITCH_PROFILE":
      return { ...state, activeProfileId: action.payload };

    case "SET_EDITING_PROFILE":
      return { ...state, editingProfileId: action.payload };

    case "CYCLE_DAY_STATE": {
      const { userId, dayKey, nextState } = action.payload;
      const curr = state.weeklyCalendarByProfile[userId] || defaultWeeklyCalendar();
      return {
        ...state,
        weeklyCalendarByProfile: {
          ...state.weeklyCalendarByProfile,
          [userId]: { ...curr, [dayKey]: nextState },
        },
      };
    }

    case "PREP_WORKOUT":
      return { ...state, activeWorkout: action.payload };

    case "UPDATE_ACTIVE_WORKOUT_EXERCISES":
      return { ...state, activeWorkout: action.payload };

    case "FINISH_WORKOUT": {
      const { userId, result } = action.payload;
      return {
        ...state,
        workoutResult: result,
        historyByProfile: {
          ...state.historyByProfile,
          [userId]: [...(state.historyByProfile[userId] || []), result],
        },
      };
    }

    case "SET_WORKOUT_RESULT":
      return { ...state, workoutResult: action.payload };

    case "SAVE_EXTRA_IDS": {
      const { userId, ids } = action.payload;
      return {
        ...state,
        customExercisesByProfile: { ...state.customExercisesByProfile, [userId]: ids },
      };
    }

    case "REMOVE_SAVED_EXTRA": {
      const { userId, id } = action.payload;
      return {
        ...state,
        customExercisesByProfile: {
          ...state.customExercisesByProfile,
          [userId]: (state.customExercisesByProfile[userId] || []).filter((x) => x !== id),
        },
      };
    }

    case "CLEAR_SAVED_EXTRAS":
      return {
        ...state,
        customExercisesByProfile: { ...state.customExercisesByProfile, [action.payload]: [] },
      };

    case "LOG_WEIGHT": {
      const { userId, entry } = action.payload;
      const log = [...(state.weightLogByProfile[userId] || []), entry];
      const updated = state.profiles.map(p =>
        p.id === userId ? withAutoBodyFat({ ...p, weight: entry.weight }) : p
      );
      return {
        ...state,
        profiles: updated,
        weightLogByProfile: { ...state.weightLogByProfile, [userId]: log },
      };
    }

    case "TOGGLE_THEME":
      return { ...state, themeMode: state.themeMode === "dark" ? "light" : "dark" };

    default:
      return state;
  }
}
