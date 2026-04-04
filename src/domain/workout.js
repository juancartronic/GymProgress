import { DIFFICULTY, EXDB, LOADABLE_EX } from "./data";

export const applyProfessionalProgression = (workout, planLevel, user) => {
  const levelKey = planLevel === 1 ? "intermedio" : planLevel >= 2 ? "avanzado" : null;
  if (!levelKey) return workout;
  const sexAdj = user?.gender === "femenino" ? 0.85 : 1;

  return {
    ...workout,
    exercises: workout.exercises.map((ex) => {
      const base = LOADABLE_EX[ex.id]?.[levelKey];
      if (base === undefined) return ex;
      const loadKg = Math.max(0, Math.round(base * sexAdj));
      const professionalNote = loadKg > 0 ? `Mancuernas ${loadKg} kg total` : "Version tecnica profesional";
      return { ...ex, loadKg, professionalNote };
    }),
  };
};

export const scaleWorkout = (workout, difficulty) => {
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

export const calcCalories = (exercises, profile, totalMinutes) => {
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

export const exLoad = (ex) => (ex?.sets || 0) * (ex?.reps || 0);

export const weekStartIso = (iso) => {
  const d = new Date(iso);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

export const fmtDate = (iso) => new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

export const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
