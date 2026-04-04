const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export const buildObjective = (user, planLevel) => {
  const weight = Number(user?.weight) || 70;
  const bodyFat = user?.bodyFat ? Number(user.bodyFat) : null;
  const goal = user?.goal || "fuerza";
  const horizonWeeks = planLevel === 0 ? 8 : planLevel === 1 ? 12 : 16;
  let targetWeight = weight;
  let targetFat = bodyFat;

  if (goal === "perdida") {
    targetWeight = Math.max(45, weight - Math.max(2, Math.round(weight * 0.06)));
    if (bodyFat) targetFat = clamp(bodyFat - 3.5, 8, 45);
  } else if (goal === "fuerza") {
    targetWeight = weight + Math.max(1, Math.round(weight * 0.025));
    if (bodyFat) targetFat = clamp(bodyFat - 1, 8, 45);
  } else if (goal === "tono") {
    targetWeight = weight;
    if (bodyFat) targetFat = clamp(bodyFat - 2, 8, 45);
  } else {
    targetWeight = Math.max(45, weight - Math.max(1, Math.round(weight * 0.03)));
    if (bodyFat) targetFat = clamp(bodyFat - 1.5, 8, 45);
  }

  const phase = planLevel === 0 ? "Base tecnica" : planLevel === 1 ? "Sobrecarga progresiva" : "Rendimiento avanzado";

  return {
    phase,
    horizonWeeks,
    targetWeight: Number(targetWeight.toFixed(1)),
    targetFat: targetFat ? Number(targetFat.toFixed(1)) : null,
    professional: planLevel > 0,
  };
};

export const buildNutritionPlan = (user, planLevel, weeklyWorkouts) => {
  const goal = user?.goal || "fuerza";
  const weight = Number(user?.weight) || 70;
  const heightCm = Number(user?.height) || 170;
  const age = Number(user?.age) || 30;
  const gender = user?.gender || "masculino";

  const bmr =
    gender === "femenino"
      ? 10 * weight + 6.25 * heightCm - 5 * age - 161
      : 10 * weight + 6.25 * heightCm - 5 * age + 5;

  const trainingFactor = weeklyWorkouts >= 5 ? 1.65 : weeklyWorkouts >= 3 ? 1.5 : 1.4;
  const maintenance = bmr * trainingFactor;

  let calTarget = maintenance;
  let protein = weight * 1.8;
  let carb = weight * 3.5;
  let fat = weight * 0.9;
  let focus = "Composicion corporal sostenible";

  if (goal === "perdida") {
    calTarget = maintenance - 350;
    protein = weight * 2;
    carb = weight * 2.4;
    fat = weight * 0.8;
    focus = "Deficit moderado, conservar masa muscular";
  } else if (goal === "fuerza") {
    calTarget = maintenance + 220;
    protein = weight * 2;
    carb = weight * 4.2;
    fat = weight * 1;
    focus = "Superavit ligero y rendimiento en cargas";
  } else if (goal === "cardio") {
    calTarget = maintenance - 120;
    protein = weight * 1.7;
    carb = weight * 4;
    fat = weight * 0.8;
    focus = "Energia para sesiones largas y recuperacion";
  } else if (goal === "tono") {
    calTarget = maintenance - 80;
    protein = weight * 1.9;
    carb = weight * 3.1;
    fat = weight * 0.85;
    focus = "Recomposicion: perder grasa y mantener musculo";
  }

  if (planLevel >= 1) {
    protein += 0.1 * weight;
    carb += 0.3 * weight;
  }

  return {
    calories: Math.round(calTarget),
    protein: Math.round(protein),
    carbs: Math.round(carb),
    fats: Math.round(fat),
    focus,
    hydration: Math.round(weight * 35),
  };
};
