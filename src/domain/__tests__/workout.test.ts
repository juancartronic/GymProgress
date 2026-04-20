import { describe, it, expect } from "vitest";
import {
  calcCalories,
  scaleWorkout,
  exLoad,
  fmtTime,
  weekStartIso,
  applyProfessionalProgression,
} from "../workout";

// ─── exLoad ──────────────────────────────────────────────────────────────────
describe("exLoad", () => {
  it("devuelve sets × reps", () => {
    expect(exLoad({ sets: 3, reps: 10 })).toBe(30);
  });
  it("devuelve 0 si sets es 0", () => {
    expect(exLoad({ sets: 0, reps: 10 })).toBe(0);
  });
  it("maneja null con optional chaining", () => {
    expect(exLoad(null)).toBe(0);
  });
});

// ─── fmtTime ─────────────────────────────────────────────────────────────────
describe("fmtTime", () => {
  it("formatea 0 segundos como 00:00", () => {
    expect(fmtTime(0)).toBe("00:00");
  });
  it("formatea 65 segundos como 01:05", () => {
    expect(fmtTime(65)).toBe("01:05");
  });
  it("formatea 3600 segundos como 60:00", () => {
    expect(fmtTime(3600)).toBe("60:00");
  });
});

// ─── weekStartIso ─────────────────────────────────────────────────────────────
describe("weekStartIso", () => {
  it("un lunes devuelve el mismo día", () => {
    // 2026-03-30 es lunes (UTC)
    const result = weekStartIso("2026-03-30T12:00:00Z");
    expect(result).toBe("2026-03-30");
  });
  it("un domingo vuelve al lunes anterior", () => {
    // 2026-04-05 es domingo → lunes es 2026-03-30
    const result = weekStartIso("2026-04-05T12:00:00Z");
    expect(result).toBe("2026-03-30");
  });
});

// ─── scaleWorkout ─────────────────────────────────────────────────────────────
const baseWorkout = {
  day: "1",
  focus: "Test",
  exercises: [{ id: "pushup" as const, sets: 3, reps: 10, rest: 60 }],
};

describe("scaleWorkout", () => {
  it("dificultad normal no cambia los valores", () => {
    const result = scaleWorkout(baseWorkout, "normal");
    const ex = result.exercises[0];
    expect(ex.sets).toBe(3);
    expect(ex.reps).toBe(10);
    expect(ex.rest).toBe(60);
  });

  it("dificultad intenso aumenta sets/reps y reduce descanso", () => {
    const result = scaleWorkout(baseWorkout, "intenso");
    const ex = result.exercises[0];
    // sets: Math.round(3 * 1.2) = 4, reps: Math.round(10 * 1.2) = 12, rest: Math.round(60 * 0.8) = 48
    expect(ex.sets).toBe(4);
    expect(ex.reps).toBe(12);
    expect(ex.rest).toBe(48);
  });

  it("dificultad ligero reduce sets/reps y aumenta descanso", () => {
    const result = scaleWorkout(baseWorkout, "ligero");
    const ex = result.exercises[0];
    // reps: Math.round(10 * 0.85) = 9, rest: Math.round(60 * 1.2) = 72
    expect(ex.reps).toBe(9);
    expect(ex.rest).toBe(72);
  });

  it("el descanso nunca baja de 15 segundos", () => {
    const shortRest = {
      day: "1", focus: "Test",
      exercises: [{ id: "pushup" as const, sets: 3, reps: 10, rest: 18 }],
    };
    const result = scaleWorkout(shortRest, "intenso");
    expect(result.exercises[0].rest).toBeGreaterThanOrEqual(15);
  });
});

// ─── calcCalories ─────────────────────────────────────────────────────────────
const profileM = { weight: 80, height: 180, age: 25, gender: "masculino" as const };
const profileF = { weight: 60, height: 165, age: 30, gender: "femenino" as const };
const exercises = [
  { id: "pushup" as const, sets: 3, reps: 10, rest: 60 },
  { id: "squat" as const, sets: 3, reps: 10, rest: 60 },
];

describe("calcCalories", () => {
  it("calcula correctamente para perfil masculino (30 min)", () => {
    // avgMet=(3.8+5)/2=4.4, bmr=1805, basePerMin=1805/1440
    // Math.round(4.4 × (1805/1440) × 30) = 165
    expect(calcCalories(exercises, profileM, 30)).toBe(165);
  });

  it("calcula correctamente para perfil femenino (30 min)", () => {
    // bmr = 10*60+6.25*165-5*30-161 = 600+1031.25-150-161 = 1320.25, basePerMin=1320.25/1440
    // Math.round(4.4 × (1320.25/1440) × 30) = 121
    expect(calcCalories(exercises, profileF, 30)).toBe(121);
  });

  it("a mayor duración, más calorías", () => {
    const cal30 = calcCalories(exercises, profileM, 30);
    const cal60 = calcCalories(exercises, profileM, 60);
    expect(cal60).toBeGreaterThan(cal30);
  });

  it("usa 70 kg como peso por defecto si el perfil no tiene datos", () => {
    const cal = calcCalories(exercises, {}, 30);
    expect(cal).toBeGreaterThan(0);
  });
});

// ─── applyProfessionalProgression ─────────────────────────────────────────────
const workoutWithLoadable = {
  day: "2",
  focus: "Piernas",
  exercises: [
    { id: "squat" as const, sets: 3, reps: 10, rest: 60 },
    { id: "pushup" as const, sets: 3, reps: 8, rest: 60 },
  ],
};

describe("applyProfessionalProgression", () => {
  it("planLevel 0 no añade cargas", () => {
    const result = applyProfessionalProgression(workoutWithLoadable, 0, profileM);
    expect(result.exercises[0].loadKg).toBeUndefined();
  });

  it("planLevel 1 asigna loadKg a squat (masculino)", () => {
    // LOADABLE_EX.squat.intermedio=8, sexAdj=1 → loadKg=8
    const result = applyProfessionalProgression(workoutWithLoadable, 1, profileM);
    expect(result.exercises[0].loadKg).toBe(8);
  });

  it("planLevel 2 con sexAdj femenino reduce la carga", () => {
    // LOADABLE_EX.squat.avanzado=20, sexAdj=0.85 → Math.round(20*0.85)=17
    const result = applyProfessionalProgression(workoutWithLoadable, 2, profileF);
    expect(result.exercises[0].loadKg).toBe(17);
  });

  it("ejercicios sin carga (pushup) no se modifican", () => {
    const result = applyProfessionalProgression(workoutWithLoadable, 2, profileM);
    const pushup = result.exercises.find((e) => e.id === "pushup");
    expect(pushup?.loadKg).toBeUndefined();
  });
});
