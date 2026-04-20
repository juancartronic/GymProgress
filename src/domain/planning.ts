import type { UserProfile, Objective, NutritionPlan, Plan, WorkoutExercise } from "../types";
import { EXDB } from "./data";

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

interface PlanDemand {
  sessions: number;
  weeklyMinutes: number;
  calorieMinutes: number;
  avgMet: number;
  density: number;
  strengthRatio: number;
  cardioRatio: number;
  hiitRatio: number;
  coreRatio: number;
  dominantStimulus: "fuerza" | "cardio" | "mixto";
}

const EMPTY_PLAN_DEMAND = (sessions: number): PlanDemand => ({
  sessions,
  weeklyMinutes: sessions * 22,
  calorieMinutes: sessions * 17,
  avgMet: 4.2,
  density: 0.7,
  strengthRatio: 0.45,
  cardioRatio: 0.35,
  hiitRatio: 0.1,
  coreRatio: 0.1,
  dominantStimulus: "mixto",
});

const estimateActiveMinutes = (ex: WorkoutExercise): number => {
  if (ex.isTime) return (ex.sets * ex.reps) / 60;
  const tag = EXDB[ex.id]?.tag;
  const secPerRep = tag === "HIIT" ? 2.2 : tag === "Cardio" ? 2.4 : 3.5;
  return (ex.sets * ex.reps * secPerRep) / 60;
};

const estimateTotalMinutes = (ex: WorkoutExercise): number => {
  const activeMinutes = estimateActiveMinutes(ex);
  const restMinutes = Math.max(0, ex.sets - 1) * ex.rest / 60;
  return activeMinutes + restMinutes + 0.35;
};

const estimateCalorieMinutes = (ex: WorkoutExercise): number => {
  const activeMinutes = estimateActiveMinutes(ex);
  const restMinutes = Math.max(0, ex.sets - 1) * ex.rest / 60;
  return activeMinutes + restMinutes * 0.35 + 0.15;
};

const analyzePlanDemand = (plan: Partial<Plan> | null | undefined, fallbackSessions: number): PlanDemand => {
  const workouts = plan?.workouts ?? [];
  const sessions = Math.max(1, workouts.length || fallbackSessions || 3);
  if (!workouts.length) return EMPTY_PLAN_DEMAND(sessions);

  let activeMinutesTotal = 0;
  let weeklyMinutes = 0;
  let calorieMinutes = 0;
  let metWeighted = 0;
  let strengthTagMinutes = 0;
  let cardioTagMinutes = 0;
  let hiitTagMinutes = 0;
  let coreTagMinutes = 0;

  for (const workout of workouts) {
    for (const ex of workout.exercises) {
      const info = EXDB[ex.id];
      const activeMinutes = estimateActiveMinutes(ex);
      const totalMinutes = estimateTotalMinutes(ex);
      const caloriesMinutes = estimateCalorieMinutes(ex);

      activeMinutesTotal += activeMinutes;
      weeklyMinutes += totalMinutes;
      calorieMinutes += caloriesMinutes;
      metWeighted += (info?.met || 4) * activeMinutes;

      if (info?.tag === "Fuerza") strengthTagMinutes += activeMinutes;
      else if (info?.tag === "Cardio") cardioTagMinutes += activeMinutes;
      else if (info?.tag === "HIIT") hiitTagMinutes += activeMinutes;
      else coreTagMinutes += activeMinutes;
    }
  }

  const activeBase = Math.max(activeMinutesTotal, 1);
  const strengthDemand = strengthTagMinutes + hiitTagMinutes * 0.15 + coreTagMinutes * 0.3;
  const cardioDemand = cardioTagMinutes + hiitTagMinutes * 0.85;
  const dominantStimulus = Math.abs(strengthDemand - cardioDemand) <= activeBase * 0.1
    ? "mixto"
    : strengthDemand > cardioDemand
      ? "fuerza"
      : "cardio";

  return {
    sessions,
    weeklyMinutes: Number(weeklyMinutes.toFixed(1)),
    calorieMinutes: Number(calorieMinutes.toFixed(1)),
    avgMet: Number((metWeighted / activeBase).toFixed(2)),
    density: Number((activeBase / Math.max(weeklyMinutes, 1)).toFixed(2)),
    strengthRatio: Number((strengthDemand / activeBase).toFixed(2)),
    cardioRatio: Number((cardioDemand / activeBase).toFixed(2)),
    hiitRatio: Number((hiitTagMinutes / activeBase).toFixed(2)),
    coreRatio: Number((coreTagMinutes / activeBase).toFixed(2)),
    dominantStimulus,
  };
};

const dominantStimulusLabel = (value: PlanDemand["dominantStimulus"]): string =>
  value === "fuerza" ? "predominio de fuerza" : value === "cardio" ? "predominio de cardio/HIIT" : "estimulo mixto";

// ─── Body composition helpers ───────────────────────────────────────────────

/** BMI = weight(kg) / height(m)² */
const calcBMI = (weight: number, heightCm: number): number => weight / ((heightCm / 100) ** 2);

/** Waist-to-height ratio is a simple proxy for abdominal fat risk. */
const calcWaistToHeightRatio = (waistCm: number, heightCm: number): number => waistCm / heightCm;

/** Deurenberg improved formula: BF% from BMI, age, sex (1=male, 0=female) */
const estimateBFPercent = (bmi: number, age: number, isMale: boolean): number =>
  clamp(1.39 * bmi + 0.16 * age - 10.34 * (isMale ? 1 : 0) - 9, 4, 60);

/** Relative Fat Mass using height and waist; more useful than BMI when waist is available. */
const estimateRFMPercent = (heightCm: number, waistCm: number, isMale: boolean): number =>
  clamp((isMale ? 64 : 76) - 20 * (heightCm / waistCm), 4, 60);

const bmiCategory = (bmi: number): string =>
  bmi < 18.5 ? "Bajo peso" : bmi < 25 ? "Peso normal" : bmi < 30 ? "Sobrepeso" : "Obesidad";

const metabolicRiskLabel = (waistToHeightRatio: number | null, bmi: number): string => {
  if (waistToHeightRatio !== null) {
    if (waistToHeightRatio < 0.5) return "Riesgo abdominal bajo";
    if (waistToHeightRatio < 0.6) return "Riesgo abdominal moderado";
    return "Riesgo abdominal alto";
  }
  return bmi < 25 ? "Riesgo metabolico bajo" : bmi < 30 ? "Riesgo metabolico moderado" : "Riesgo metabolico alto";
};

/** Ideal body fat target % by goal and gender */
const idealBF = (goal: string, isMale: boolean): number => {
  if (goal === "fuerza")  return isMale ? 15 : 22;
  if (goal === "tono")    return isMale ? 13 : 20;
  if (goal === "perdida") return isMale ? 16 : 24;
  /* cardio */            return isMale ? 15 : 23;
};

/** Lean‑mass growth factor depending on goal (how much muscle can be built during the plan horizon) */
const leanGainFactor = (goal: string): number => {
  if (goal === "fuerza") return 1.03;   // +3% lean mass target
  if (goal === "tono")   return 1.015;  // slight recomp
  return 1.0;                           // perdida/cardio: preserve lean
};

/** Computes fitness objective (phase, target weight/fat, timeline) based on user profile and plan level.
 *  Uses BMI → estimated BF% → lean mass to set intelligent, personalized goals. */
export const buildObjective = (user: Partial<UserProfile> | null | undefined, planLevel: number): Objective => {
  const weight   = Number(user?.weight)  || 70;
  const heightCm = Number(user?.height)  || 170;
  const age      = Number(user?.age)     || 30;
  const goal     = user?.goal            || "fuerza";
  const gender   = user?.gender          || "masculino";
  const isMale   = gender === "masculino";
  const waistCm  = user?.waistCm ? Number(user.waistCm) : null;
  const userBF   = user?.bodyFat ? Number(user.bodyFat) : null;

  const horizonWeeks = planLevel === 0 ? 8 : planLevel === 1 ? 12 : 16;
  const phase = planLevel === 0 ? "Base tecnica" : planLevel === 1 ? "Sobrecarga progresiva" : "Rendimiento avanzado";

  // 1. BMI & estimated body fat
  const bmi = calcBMI(weight, heightCm);
  const waistToHeightRatio = waistCm ? calcWaistToHeightRatio(waistCm, heightCm) : null;
  const estimatedBF = userBF ?? (waistCm ? estimateRFMPercent(heightCm, waistCm, isMale) : estimateBFPercent(bmi, age, isMale));
  const compositionMethod = userBF ? "Grasa corporal indicada" : waistCm ? "Estimacion RFM con cintura" : "Estimacion BMI/edad (Deurenberg)";
  const metabolicRisk = metabolicRiskLabel(waistToHeightRatio, bmi);
  const leanMass = weight * (1 - estimatedBF / 100);

  // 2. Target body fat % — approach ideal gradually (max ~40% improvement per plan cycle)
  const ideal = idealBF(goal, isMale);
  const minBF = isMale ? 8 : 14;
  const targetBFRaw = estimatedBF > ideal
    ? estimatedBF - (estimatedBF - ideal) * 0.4
    : Math.max(estimatedBF - 1, minBF);
  const targetBF = clamp(Number(targetBFRaw.toFixed(1)), minBF, 50);

  // 3. Target lean mass (allow muscle growth for strength/tono goals, but only if not significantly overweight)
  const centralFatRisk = waistToHeightRatio !== null && waistToHeightRatio >= 0.54;
  const canGainMuscle = bmi < 30 && !centralFatRisk;
  const targetLean = canGainMuscle ? leanMass * leanGainFactor(goal) : leanMass;

  // 4. Target weight = targetLean / (1 - targetBF/100)
  const targetWeight = clamp(Number((targetLean / (1 - targetBF / 100)).toFixed(1)), 40, 200);

  // 5. Build human‑readable recommendation
  let recommendation: string;
  const diff = weight - targetWeight;
  if (diff > 3) {
    recommendation = `Reducir ${diff.toFixed(1)} kg de grasa manteniendo ${targetLean.toFixed(1)} kg de masa magra.`;
  } else if (diff < -1) {
    recommendation = `Ganar ${Math.abs(diff).toFixed(1)} kg de masa muscular con bajo aumento de grasa.`;
  } else {
    recommendation = `Recomposicion corporal: reducir grasa y mantener/ganar musculo en el mismo peso.`;
  }

  if (bmi >= 30 && goal === "fuerza") {
    recommendation = `Priorizar perdida de grasa corporal antes de buscar fuerza maxima. ` + recommendation;
  }
  if (waistToHeightRatio !== null && waistToHeightRatio >= 0.6) {
    recommendation = `La grasa abdominal es prioritaria por salud y rendimiento. ` + recommendation;
  }

  return {
    phase,
    horizonWeeks,
    targetWeight,
    targetFat: Number(targetBF.toFixed(1)),
    professional: planLevel > 0,
    estimatedBF: Number(estimatedBF.toFixed(1)),
    leanMass: Number(leanMass.toFixed(1)),
    bmi: Number(bmi.toFixed(1)),
    bmiCategory: bmiCategory(bmi),
    waistToHeightRatio: waistToHeightRatio !== null ? Number(waistToHeightRatio.toFixed(2)) : null,
    compositionMethod,
    metabolicRisk,
    recommendation,
  };
};

/** Calculates daily macros using body metrics plus the real exercise demand of the current plan. */
export const buildNutritionPlan = (
  user: Partial<UserProfile> | null | undefined,
  planLevel: number,
  weeklyWorkouts: number,
  plan?: Partial<Plan> | null,
): NutritionPlan => {
  const goal = user?.goal || "fuerza";
  const weight = Number(user?.weight) || 70;
  const heightCm = Number(user?.height) || 170;
  const age = Number(user?.age) || 30;
  const gender = user?.gender || "masculino";
  const bmi = calcBMI(weight, heightCm);
  const planDemand = analyzePlanDemand(plan, weeklyWorkouts);

  const bmr =
    gender === "femenino"
      ? 10 * weight + 6.25 * heightCm - 5 * age - 161
      : 10 * weight + 6.25 * heightCm - 5 * age + 5;

  const baselineActivity =
    planDemand.sessions >= 5 ? 1.46 :
    planDemand.sessions >= 4 ? 1.41 :
    planDemand.sessions >= 3 ? 1.36 : 1.3;
  const basePerMin = bmr / 1440;
  const weeklyExerciseCalories = planDemand.avgMet * basePerMin * planDemand.calorieMinutes;
  const maintenance = bmr * baselineActivity + weeklyExerciseCalories / 7;

  const strengthCut = goal === "fuerza" && bmi >= 30;
  let calorieOffset = 0;
  if (goal === "perdida") calorieOffset = bmi >= 30 ? -425 : -325;
  else if (goal === "fuerza") calorieOffset = strengthCut ? -220 : bmi >= 25 ? -80 : 140 + planDemand.strengthRatio * 90;
  else if (goal === "cardio") calorieOffset = (bmi >= 25 ? -140 : -40) + planDemand.cardioRatio * 40;
  else calorieOffset = bmi >= 25 ? -180 : -70;

  if (planLevel >= 1 && !strengthCut && (goal === "fuerza" || goal === "tono")) calorieOffset += 35;

  const calTarget = Math.round(maintenance + calorieOffset);

  const proteinPerKg = clamp(
    1.65 + (goal === "perdida" || goal === "tono" ? 0.2 : 0.05) + planDemand.strengthRatio * 0.25 + (bmi >= 30 ? 0.1 : 0),
    1.6,
    2.25,
  );
  const preferredCarbPerKg = clamp(
    2.0 + planDemand.cardioRatio * 1.35 + planDemand.hiitRatio * 0.45 + (goal === "fuerza" && !strengthCut ? 0.45 : 0) + (goal === "cardio" ? 0.35 : 0) - (goal === "perdida" ? 0.25 : 0),
    1.8,
    4.8,
  );

  let protein = Math.round(weight * proteinPerKg);
  let carbs = Math.round(weight * preferredCarbPerKg);
  const minCarbs = Math.round(weight * (planDemand.dominantStimulus === "cardio" ? 2.6 : goal === "fuerza" && !strengthCut ? 2.4 : 1.9));
  const minFats = Math.round(weight * (goal === "perdida" || strengthCut ? 0.65 : 0.7));
  let fats = Math.round(weight * (goal === "fuerza" && !strengthCut ? 0.85 : 0.75));

  let macroCalories = protein * 4 + carbs * 4 + fats * 9;
  if (macroCalories > calTarget) {
    const excess = macroCalories - calTarget;
    carbs = Math.max(minCarbs, carbs - Math.round(excess / 4));
    macroCalories = protein * 4 + carbs * 4 + fats * 9;
  }
  if (macroCalories > calTarget) {
    const excess = macroCalories - calTarget;
    fats = Math.max(minFats, fats - Math.round(excess / 9));
    macroCalories = protein * 4 + carbs * 4 + fats * 9;
  }
  if (macroCalories < calTarget) {
    const remaining = calTarget - macroCalories;
    if (planDemand.dominantStimulus === "cardio") carbs += Math.round(remaining / 4);
    else if (planDemand.dominantStimulus === "fuerza") {
      carbs += Math.round(remaining * 0.65 / 4);
      fats += Math.round(remaining * 0.35 / 9);
    } else {
      carbs += Math.round(remaining * 0.7 / 4);
      fats += Math.round(remaining * 0.3 / 9);
    }
  }

  const focus =
    goal === "perdida"
      ? `Deficit moderado con proteina alta y ${dominantStimulusLabel(planDemand.dominantStimulus)} para proteger masa magra.`
      : goal === "fuerza"
        ? strengthCut
          ? "Fuerza con control de grasa: calorias mas contenidas hasta mejorar la composicion corporal."
          : `Combustible para sobrecarga progresiva con ${dominantStimulusLabel(planDemand.dominantStimulus)}.`
        : goal === "cardio"
          ? `Energia para repetir esfuerzos y recuperar glucogeno con ${dominantStimulusLabel(planDemand.dominantStimulus)}.`
          : `Recomposicion corporal con volumen util, proteina alta y ${dominantStimulusLabel(planDemand.dominantStimulus)}.`;

  const mealStrategy =
    planDemand.dominantStimulus === "cardio"
      ? "Concentra mas carbohidrato antes y despues del entreno; en dias suaves baja ligeramente las raciones de almidon."
      : planDemand.dominantStimulus === "fuerza"
        ? "Reparte la proteina en 4-5 tomas y reserva carbohidrato util en desayuno, pre y post entreno."
        : "Mantiene una base de proteina en todas las comidas y ajusta la carga de carbohidrato segun el dia de entreno.";

  const preWorkout =
    planDemand.dominantStimulus === "cardio"
      ? "Pre: fruta + avena, pan o arroz 60-90 min antes."
      : planDemand.dominantStimulus === "fuerza"
        ? "Pre: 25-30 g de proteina + carbohidrato facil 60-120 min antes."
        : "Pre: comida ligera con proteina y carbohidrato facil de digerir.";

  const postWorkout =
    planDemand.dominantStimulus === "cardio"
      ? "Post: liquidos + carbohidrato dominante + 20-30 g de proteina."
      : planDemand.dominantStimulus === "fuerza"
        ? "Post: proteina completa + carbohidrato medio para recuperar y rendir en la siguiente sesion."
        : "Post: proteina completa, verdura y una porcion de carbohidrato segun el desgaste del dia.";

  return {
    calories: calTarget,
    protein,
    carbs,
    fats,
    focus,
    hydration: Math.round(weight * 35 + (planDemand.weeklyMinutes / 7) * 12 + planDemand.hiitRatio * 350),
    trainingSummary: `${planDemand.sessions} sesiones/sem · ${Math.round(planDemand.weeklyMinutes)} min · MET ${planDemand.avgMet.toFixed(1)} · ${dominantStimulusLabel(planDemand.dominantStimulus)}`,
    mealStrategy,
    preWorkout,
    postWorkout,
    carbBias: clamp((planDemand.dominantStimulus === "cardio" ? 1.08 : 1) * (calTarget < maintenance ? 0.95 : 1.03), 0.86, 1.15),
    proteinBias: clamp((goal === "fuerza" || goal === "tono" || goal === "perdida" ? 1.05 : 1) + (planLevel >= 1 ? 0.02 : 0), 0.96, 1.12),
    fatBias: clamp(goal === "perdida" || strengthCut ? 0.92 : goal === "cardio" ? 0.96 : 1, 0.88, 1.05),
    dominantStimulus: planDemand.dominantStimulus,
  };
};
