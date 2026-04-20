import { describe, it, expect } from "vitest";
import { getPlanForGoalAndLevel } from "../data";
import { adaptMealWeekByNutrition, getWeeklyMealExamples } from "../mealData";

describe("program design", () => {
  it("los planes de fuerza usan menos repeticiones y mas descanso en niveles altos", () => {
    const intermedio = getPlanForGoalAndLevel("fuerza", 1)!;
    const avanzado = getPlanForGoalAndLevel("fuerza", 2)!;

    expect(intermedio.workouts[0].exercises[0].reps).toBeLessThanOrEqual(6);
    expect(intermedio.workouts[0].exercises[0].rest).toBeGreaterThanOrEqual(90);
    expect(avanzado.workouts[0].exercises[0].reps).toBeLessThanOrEqual(5);
    expect(avanzado.workouts[0].exercises[0].rest).toBeGreaterThanOrEqual(120);
  });

  it("la dieta sube carbohidratos en dias de entreno y los baja en descanso", () => {
    const week = getWeeklyMealExamples("fuerza", "masculino")[0];
    const nutrition = {
      calories: 2600,
      protein: 180,
      carbs: 290,
      fats: 75,
      focus: "",
      hydration: 3000,
      trainingSummary: "",
      mealStrategy: "",
      preWorkout: "",
      postWorkout: "",
      carbBias: 1.05,
      proteinBias: 1.02,
      fatBias: 0.96,
    };

    const adapted = adaptMealWeekByNutrition(week, nutrition, {
      lun: "entreno",
      mar: "descanso",
      mie: "entreno",
      jue: "recuperacion",
      vie: "entreno",
      sab: "descanso",
      dom: "descanso",
    });

    const mondayCarbs = adapted.days[0].slots?.reduce((sum, slot) => sum + slot.items.reduce((acc, item) => acc + item.carbs, 0), 0) ?? 0;
    const tuesdayCarbs = adapted.days[1].slots?.reduce((sum, slot) => sum + slot.items.reduce((acc, item) => acc + item.carbs, 0), 0) ?? 0;

    expect(mondayCarbs).toBeGreaterThan(tuesdayCarbs);
    expect(adapted.days[0].strategyLabel).toContain("alto");
    expect(adapted.days[1].strategyLabel).toContain("bajo");
  });
});