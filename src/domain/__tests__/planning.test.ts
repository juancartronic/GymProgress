import { describe, it, expect } from "vitest";
import { buildObjective } from "../planning";
import { buildNutritionPlan } from "../planning";

// ─── buildObjective ───────────────────────────────────────────────────────────
describe("buildObjective", () => {
  it("goal fuerza: incrementa peso objetivo", () => {
    const user = { weight: 80, bodyFat: 20, goal: "fuerza" as const };
    const result = buildObjective(user, 0);
    // targetWeight = 80 + Math.max(1, Math.round(80*0.025)) = 80 + 2 = 82
    expect(result.targetWeight).toBe(82);
    expect(result.targetFat).toBe(19); // clamp(20-1, 8,45)
    expect(result.horizonWeeks).toBe(8);
    expect(result.professional).toBe(false);
    expect(result.phase).toBe("Base tecnica");
  });

  it("goal perdida: reduce peso objetivo", () => {
    const user = { weight: 80, bodyFat: 25, goal: "perdida" as const };
    const result = buildObjective(user, 1);
    // targetWeight = Math.max(45, 80 - Math.max(2, Math.round(80*0.06))) = Math.max(45, 75) = 75
    expect(result.targetWeight).toBe(75);
    // targetFat = clamp(25-3.5, 8, 45) = 21.5
    expect(result.targetFat).toBe(21.5);
    expect(result.horizonWeeks).toBe(12);
    expect(result.professional).toBe(true);
  });

  it("goal tono: mantiene peso, solo reduce grasa", () => {
    const user = { weight: 70, bodyFat: 22, goal: "tono" as const };
    const result = buildObjective(user, 0);
    expect(result.targetWeight).toBe(70);
    // targetFat = clamp(22-2, 8, 45) = 20
    expect(result.targetFat).toBe(20);
  });

  it("planLevel 2 da horizonte de 16 semanas y profesional", () => {
    const result = buildObjective({ weight: 75, goal: "fuerza" as const }, 2);
    expect(result.horizonWeeks).toBe(16);
    expect(result.professional).toBe(true);
    expect(result.phase).toBe("Rendimiento avanzado");
  });

  it("sin bodyFat, targetFat es null", () => {
    const result = buildObjective({ weight: 70, goal: "fuerza" as const }, 0);
    expect(result.targetFat).toBeNull();
  });

  it("targetFat no baja del mínimo (8%)", () => {
    const user = { weight: 70, bodyFat: 9, goal: "fuerza" as const };
    const result = buildObjective(user, 0);
    expect(result.targetFat).toBeGreaterThanOrEqual(8);
  });
});

// ─── buildNutritionPlan ───────────────────────────────────────────────────────
describe("buildNutritionPlan", () => {
  const userM = { weight: 80, height: 180, age: 25, gender: "masculino" as const, goal: "fuerza" as const };
  const userF = { weight: 60, height: 165, age: 30, gender: "femenino" as const, goal: "perdida" as const };

  it("devuelve todas las propiedades esperadas", () => {
    const result = buildNutritionPlan(userM, 0, 3);
    expect(result).toHaveProperty("calories");
    expect(result).toHaveProperty("protein");
    expect(result).toHaveProperty("carbs");
    expect(result).toHaveProperty("fats");
    expect(result).toHaveProperty("focus");
    expect(result).toHaveProperty("hydration");
  });

  it("goal fuerza: calorías en superávit (planLevel 0)", () => {
    // bmr=1805, trainingFactor=1.5, maintenance=2707.5, calTarget=2927.5 → 2928
    const result = buildNutritionPlan(userM, 0, 3);
    expect(result.calories).toBe(2928);
    expect(result.protein).toBe(160);   // 80*2
    expect(result.carbs).toBe(336);     // 80*4.2
    expect(result.fats).toBe(80);       // 80*1
  });

  it("planLevel 1 incrementa proteína y carbohidratos", () => {
    const result = buildNutritionPlan(userM, 1, 3);
    // protein += 0.1*80=8 → 168; carbs += 0.3*80=24 → 360
    expect(result.protein).toBe(168);
    expect(result.carbs).toBe(360);
  });

  it("hidratación = 35 ml × peso", () => {
    const result = buildNutritionPlan(userM, 0, 3);
    expect(result.hydration).toBe(2800); // 80 * 35
  });

  it("más días de entrenamiento = más calorías (factor de actividad)", () => {
    const cal3 = buildNutritionPlan(userM, 0, 3).calories;
    const cal5 = buildNutritionPlan(userM, 0, 5).calories;
    expect(cal5).toBeGreaterThan(cal3);
  });

  it("goal perdida: calorías en déficit para perfil femenino", () => {
    // bmr(F)=10*60+6.25*165-5*30-161=600+1031.25-150-161=1320.25
    // maintenance=1320.25*1.5=1980.375, calTarget=1980.375-350=1630.375 → 1630
    const result = buildNutritionPlan(userF, 0, 3);
    expect(result.calories).toBe(1630);
  });

  it("los macros son números positivos", () => {
    const result = buildNutritionPlan(userM, 0, 3);
    expect(result.protein).toBeGreaterThan(0);
    expect(result.carbs).toBeGreaterThan(0);
    expect(result.fats).toBeGreaterThan(0);
  });
});
