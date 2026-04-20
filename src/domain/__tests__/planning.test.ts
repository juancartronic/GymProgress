import { describe, it, expect } from "vitest";
import { buildObjective } from "../planning";
import { buildNutritionPlan } from "../planning";

// ─── buildObjective ───────────────────────────────────────────────────────────
describe("buildObjective", () => {
  it("persona obesa + fuerza: recomienda bajar peso, no subir", () => {
    // Tu ejemplo: 100 kg, 160 cm, masculino, fuerza → debe bajar, NO subir a 101
    const user = { weight: 100, height: 160, age: 30, gender: "masculino" as const, goal: "fuerza" as const };
    const result = buildObjective(user, 0);
    expect(result.targetWeight).toBeLessThan(100);
    expect(result.bmi).toBeGreaterThan(30);
    expect(result.bmiCategory).toBe("Obesidad");
    expect(result.recommendation).toContain("grasa");
  });

  it("persona normopeso + fuerza: puede ganar masa muscular", () => {
    const user = { weight: 70, height: 175, age: 25, gender: "masculino" as const, goal: "fuerza" as const };
    const result = buildObjective(user, 0);
    // Should gain a bit of weight (muscle)
    expect(result.targetWeight).toBeGreaterThanOrEqual(70);
    expect(result.bmiCategory).toBe("Peso normal");
    expect(result.leanMass).toBeGreaterThan(0);
  });

  it("goal perdida: siempre reduce peso objetivo", () => {
    const user = { weight: 80, height: 170, age: 30, gender: "masculino" as const, goal: "perdida" as const };
    const result = buildObjective(user, 1);
    expect(result.targetWeight).toBeLessThan(80);
    expect(result.horizonWeeks).toBe(12);
    expect(result.professional).toBe(true);
  });

  it("goal perdida femenino: grasa objetivo nunca baja del mínimo", () => {
    const user = { weight: 60, height: 165, age: 25, gender: "femenino" as const, goal: "perdida" as const };
    const result = buildObjective(user, 0);
    expect(result.targetFat).toBeGreaterThanOrEqual(14);
  });

  it("goal tono: apunta a recomposición corporal", () => {
    const user = { weight: 70, height: 175, age: 28, gender: "masculino" as const, goal: "tono" as const };
    const result = buildObjective(user, 0);
    expect(result.targetFat).toBeLessThan(result.estimatedBF);
    expect(result.recommendation.toLowerCase()).toContain("musculo");
  });

  it("planLevel 2 da horizonte de 16 semanas y profesional", () => {
    const result = buildObjective({ weight: 75, height: 175, age: 30, goal: "fuerza" as const }, 2);
    expect(result.horizonWeeks).toBe(16);
    expect(result.professional).toBe(true);
    expect(result.phase).toBe("Rendimiento avanzado");
  });

  it("sin bodyFat usa estimación Deurenberg y nunca es null", () => {
    const result = buildObjective({ weight: 70, height: 175, age: 30, goal: "fuerza" as const }, 0);
    expect(result.estimatedBF).toBeGreaterThan(0);
    expect(result.targetFat).not.toBeNull();
  });

  it("targetFat no baja del mínimo (8% hombres, 14% mujeres)", () => {
    const userM = { weight: 65, height: 180, bodyFat: 9, age: 22, gender: "masculino" as const, goal: "fuerza" as const };
    const resultM = buildObjective(userM, 0);
    expect(resultM.targetFat).toBeGreaterThanOrEqual(8);

    const userF = { weight: 55, height: 165, bodyFat: 16, age: 22, gender: "femenino" as const, goal: "tono" as const };
    const resultF = buildObjective(userF, 0);
    expect(resultF.targetFat).toBeGreaterThanOrEqual(14);
  });

  it("devuelve BMI, estimatedBF, leanMass, bmiCategory y recommendation", () => {
    const result = buildObjective({ weight: 80, height: 180, age: 30, goal: "fuerza" as const }, 0);
    expect(result.bmi).toBeCloseTo(24.7, 0);
    expect(result.estimatedBF).toBeGreaterThan(0);
    expect(result.leanMass).toBeGreaterThan(0);
    expect(result.bmiCategory).toBeDefined();
    expect(result.recommendation.length).toBeGreaterThan(10);
  });

  it("si hay cintura usa el metodo RFM y calcula el ratio cintura/altura", () => {
    const result = buildObjective({ weight: 92, height: 178, waistCm: 104, age: 34, gender: "masculino" as const, goal: "fuerza" as const }, 0);
    expect(result.compositionMethod).toContain("RFM");
    expect(result.waistToHeightRatio).toBeCloseTo(0.58, 2);
    expect(result.metabolicRisk.toLowerCase()).toContain("abdominal");
  });
});

// ─── buildNutritionPlan ───────────────────────────────────────────────────────
describe("buildNutritionPlan", () => {
  const userM = { weight: 80, height: 180, age: 25, gender: "masculino" as const, goal: "fuerza" as const };
  const userF = { weight: 60, height: 165, age: 30, gender: "femenino" as const, goal: "perdida" as const };
  const strengthPlan = {
    workouts: [
      { day: "1", focus: "Empuje", exercises: [{ id: "dbchestpress" as const, sets: 4, reps: 8, rest: 75 }, { id: "press" as const, sets: 4, reps: 8, rest: 75 }] },
      { day: "2", focus: "Piernas", exercises: [{ id: "gobletsquat" as const, sets: 4, reps: 8, rest: 90 }, { id: "rdl" as const, sets: 4, reps: 8, rest: 90 }] },
      { day: "3", focus: "Tiron", exercises: [{ id: "row" as const, sets: 4, reps: 8, rest: 75 }, { id: "curl" as const, sets: 3, reps: 10, rest: 60 }] },
    ],
  };
  const cardioPlan = {
    workouts: [
      { day: "1", focus: "HIIT", exercises: [{ id: "burpee" as const, sets: 4, reps: 15, rest: 30 }, { id: "highknees" as const, sets: 4, reps: 35, rest: 20 }] },
      { day: "2", focus: "Intervals", exercises: [{ id: "mtnclimber" as const, sets: 4, reps: 30, rest: 20 }, { id: "jumpingjack" as const, sets: 4, reps: 40, rest: 20 }] },
      { day: "3", focus: "Circuit", exercises: [{ id: "skater" as const, sets: 4, reps: 20, rest: 20 }, { id: "burpee" as const, sets: 3, reps: 12, rest: 30 }] },
    ],
  };

  it("devuelve todas las propiedades esperadas", () => {
    const result = buildNutritionPlan(userM, 0, 3, strengthPlan);
    expect(result).toHaveProperty("calories");
    expect(result).toHaveProperty("protein");
    expect(result).toHaveProperty("carbs");
    expect(result).toHaveProperty("fats");
    expect(result).toHaveProperty("focus");
    expect(result).toHaveProperty("hydration");
    expect(result).toHaveProperty("trainingSummary");
    expect(result).toHaveProperty("mealStrategy");
    expect(result).toHaveProperty("preWorkout");
    expect(result).toHaveProperty("postWorkout");
  });

  it("plan cardio exige mas carbohidratos que un plan de fuerza comparable", () => {
    const strengthResult = buildNutritionPlan(userM, 0, 3, strengthPlan);
    const cardioResult = buildNutritionPlan({ ...userM, goal: "cardio" as const }, 0, 3, cardioPlan);
    expect(cardioResult.carbs).toBeGreaterThan(strengthResult.carbs);
  });

  it("plan de fuerza prioriza proteina alta y guia de comida alrededor del entreno", () => {
    const result = buildNutritionPlan(userM, 1, 3, strengthPlan);
    expect(result.protein).toBeGreaterThanOrEqual(150);
    expect(result.mealStrategy.toLowerCase()).toContain("proteina");
    expect(result.preWorkout.toLowerCase()).toContain("proteina");
  });

  it("plan cardio/HIIT sube la hidratacion respecto a uno de fuerza", () => {
    const strengthResult = buildNutritionPlan(userM, 0, 3, strengthPlan);
    const cardioResult = buildNutritionPlan({ ...userM, goal: "cardio" as const }, 0, 3, cardioPlan);
    expect(cardioResult.hydration).toBeGreaterThan(strengthResult.hydration);
  });

  it("mas sesiones por semana elevan las calorias objetivo", () => {
    const plan3 = buildNutritionPlan(userM, 0, 3);
    const plan5 = buildNutritionPlan(userM, 0, 5);
    expect(plan5.calories).toBeGreaterThan(plan3.calories);
  });

  it("goal perdida: calorias en deficit para perfil femenino", () => {
    const result = buildNutritionPlan(userF, 0, 3, cardioPlan);
    const bmr = 10 * 60 + 6.25 * 165 - 5 * 30 - 161;
    expect(result.calories).toBeLessThan(Math.round(bmr * 1.45));
  });

  it("persona obesa con objetivo fuerza no recibe un superavit agresivo", () => {
    const result = buildNutritionPlan({ weight: 100, height: 160, age: 30, gender: "masculino" as const, goal: "fuerza" as const }, 0, 3, strengthPlan);
    expect(result.focus.toLowerCase()).toContain("control de grasa");
    expect(result.calories).toBeLessThan(2600);
  });

  it("los macros son numeros positivos", () => {
    const result = buildNutritionPlan(userM, 0, 3, strengthPlan);
    expect(result.protein).toBeGreaterThan(0);
    expect(result.carbs).toBeGreaterThan(0);
    expect(result.fats).toBeGreaterThan(0);
  });
});
