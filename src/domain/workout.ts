import { DIFFICULTY, EXDB, LOADABLE_EX } from "./data";
import type { Workout, WorkoutExercise, DifficultyKey, UserProfile } from "../types";

/** Adjusts exercise loads and adds professional notes for intermediate/advanced plan levels.
 *  Also applies weekly progressive overload: each week adds ~2.5% more load/reps.
 */
export const applyProfessionalProgression = (workout: Workout, planLevel: number, user?: Partial<UserProfile> | null, weekInBlock = 1): Workout => {
  const levelKey = planLevel === 1 ? "intermedio" : planLevel >= 2 ? "avanzado" : null;
  if (!levelKey) return workout;
  const sexAdj = user?.gender === "femenino" ? 0.85 : 1;
  // Progressive overload: +2.5% per week, cap at +15% (week 7 onward)
  const weekFactor = 1 + Math.min((weekInBlock - 1) * 0.025, 0.15);

  return {
    ...workout,
    exercises: workout.exercises.map((ex) => {
      const base = LOADABLE_EX[ex.id]?.[levelKey];
      if (base === undefined) return ex;
      const loadKg = Math.max(0, Math.round(base * sexAdj * weekFactor));
      const progressNote = weekInBlock > 1 ? ` (sem. ${weekInBlock})` : "";
      const professionalNote = loadKg > 0 ? `Mancuernas ${loadKg} kg total${progressNote}` : "Version tecnica profesional";
      return { ...ex, loadKg, professionalNote };
    }),
  };
};

/** Scales workout sets, reps, and rest times by difficulty multipliers. */
export const scaleWorkout = (workout: Workout, difficulty: DifficultyKey): Workout => {
  const d = DIFFICULTY[difficulty] || DIFFICULTY.normal;
  return {
    ...workout,
    exercises: workout.exercises.map((ex) => ({
      ...ex,
      sets: Math.max(1, Math.round(ex.sets * d.sets)),
      reps: Math.max(ex.isTime ? 10 : 3, Math.round(ex.reps * d.reps)),
      rest: Math.max(15, Math.round(ex.rest * d.rest)),
    })),
  };
};

/** Estimates calories burned using average MET, BMR, and workout duration. */
export const calcCalories = (exercises: WorkoutExercise[], profile: Partial<UserProfile> | null | undefined, totalMinutes: number): number => {
  const weightKg = Number(profile?.weight) || 70;
  const heightCm = Number(profile?.height) || 170;
  const age = Number(profile?.age) || 30;
  const gender = profile?.gender || "masculino";
  const avgMet = exercises.reduce((s, e) => s + (EXDB[e.id]?.met || 4), 0) / exercises.length;
  const bmr =
    gender === "femenino"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const basePerMin = bmr / 1440;
  return Math.round(avgMet * basePerMin * totalMinutes);
};

/** Calculates total exercise load (sets × reps). */
export const exLoad = (ex: Pick<WorkoutExercise, 'sets' | 'reps'> | null | undefined): number => (ex?.sets || 0) * (ex?.reps || 0);

/** Returns the ISO date string (YYYY-MM-DD) for the Monday of the given date's week. */
export const weekStartIso = (iso: string): string => {
  const d = new Date(iso);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

/** Formats an ISO date string as a localized Spanish date (e.g. "15 abr 2026"). */
export const fmtDate = (iso: string): string => new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

/** Formats seconds as MM:SS. */
export const fmtTime = (s: number): string => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
