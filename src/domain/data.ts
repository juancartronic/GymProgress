import type {
  ExerciseId, ExerciseInfo, Plan, ExTip, DifficultyKey, DifficultyConfig,
  DayKey, DayState, DayStateMeta, WeekDay, WeeklyCalendar, LoadableConfig, Goal,
} from "../types";

export const EXDB: Record<ExerciseId, ExerciseInfo> = {
  pushup: { name: "Flexiones", met: 3.8, muscle: "Pecho - Triceps", tag: "Fuerza" },
  squat: { name: "Sentadillas", met: 5.0, muscle: "Cuadriceps - Gluteos", tag: "Fuerza" },
  lunge: { name: "Zancadas", met: 4.0, muscle: "Piernas - Gluteos", tag: "Fuerza" },
  plank: { name: "Plancha", met: 3.0, muscle: "Core - Abdomen", tag: "Core" },
  burpee: { name: "Burpees", met: 8.0, muscle: "Cuerpo Completo", tag: "HIIT" },
  curl: { name: "Curl de Biceps", met: 3.5, muscle: "Biceps - Antebrazos", tag: "Fuerza" },
  press: { name: "Press Hombros", met: 4.0, muscle: "Hombros - Triceps", tag: "Fuerza" },
  mtnclimber: { name: "Mountain Climbers", met: 7.0, muscle: "Core - Cardio", tag: "HIIT" },
  jumpingjack: { name: "Jumping Jacks", met: 7.0, muscle: "Cardio - Cuerpo", tag: "Cardio" },
  hipbridge: { name: "Puente de Cadera", met: 3.5, muscle: "Gluteos - Isquios", tag: "Core" },
  row: { name: "Remo con Mancuerna", met: 4.5, muscle: "Espalda - Biceps", tag: "Fuerza" },
  pullup: { name: "Dominadas", met: 5.5, muscle: "Espalda - Biceps", tag: "Fuerza" },
  superman: { name: "Superman", met: 3.0, muscle: "Espalda Baja - Gluteos", tag: "Core" },
  dip: { name: "Fondos en Banco", met: 4.0, muscle: "Triceps - Pecho", tag: "Fuerza" },
  tricepext: { name: "Extension de Triceps", met: 3.5, muscle: "Triceps", tag: "Fuerza" },
  crunch: { name: "Crunch Abdominal", met: 3.0, muscle: "Abdominales", tag: "Core" },
  russiantwist: { name: "Giro Ruso", met: 3.5, muscle: "Oblicuos - Core", tag: "Core" },
  highknees: { name: "Rodillas Altas", met: 7.5, muscle: "Cardio - Cuadriceps", tag: "Cardio" },
  skater: { name: "Skaters", met: 7.0, muscle: "Piernas - Cardio", tag: "Cardio" },
  calfraise: { name: "Elevacion de Pantorrillas", met: 3.0, muscle: "Pantorrillas", tag: "Fuerza" },
  lateralraise: { name: "Elevacion Lateral", met: 3.5, muscle: "Hombros - Deltoides", tag: "Fuerza" },
  jumpsquat: { name: "Sentadilla con Salto", met: 8.0, muscle: "Piernas - Cardio", tag: "HIIT" },
  dbchestpress: { name: "Press Pecho Mancuernas", met: 4.0, muscle: "Pecho - Triceps", tag: "Fuerza" },
  dbfly: { name: "Apertura Pecho", met: 3.5, muscle: "Pecho", tag: "Fuerza" },
  rdl: { name: "Peso Muerto Rumano", met: 5.0, muscle: "Isquiotibiales - Gluteos", tag: "Fuerza" },
  gobletsquat: { name: "Sentadilla Goblet", met: 5.0, muscle: "Cuadriceps - Gluteos", tag: "Fuerza" },
  bandpullapart: { name: "Pull Apart con Banda", met: 3.0, muscle: "Espalda Alta - Deltoides Post.", tag: "Fuerza" },
  bandrow: { name: "Remo con Banda", met: 4.0, muscle: "Espalda - Biceps", tag: "Fuerza" },
  bandfacepull: { name: "Face Pull con Banda", met: 3.5, muscle: "Deltoides Post. - Trapecios", tag: "Fuerza" },
  bandpallof: { name: "Pallof Press con Banda", met: 3.0, muscle: "Core - Oblicuos", tag: "Core" },
  bandbicepcurl: { name: "Curl con Banda", met: 3.5, muscle: "Biceps", tag: "Fuerza" },
  bandlateralwalk: { name: "Caminata Lateral Banda", met: 4.0, muscle: "Gluteo Medio - Abductores", tag: "Fuerza" },
  floorwiper: { name: "Floor Wiper", met: 3.5, muscle: "Core - Oblicuos", tag: "Core" },
  reverselunge: { name: "Zancada Inversa", met: 4.0, muscle: "Piernas - Gluteos", tag: "Fuerza" },
};

export const PLANS: Plan[] = [
  // ── FUERZA ──────────────────────────────────────────────────────────────────
  {
    level: 0, goal: "fuerza", name: "Fuerza - Principiante", weeks: "Sem. 1-4",
    desc: "Construye una base de fuerza con menos repeticiones, tecnica limpia y descansos algo mas largos.",
    workouts: [
      { day: "1", focus: "Empuje", exercises: [{ id: "pushup", sets: 4, reps: 6, rest: 75 }, { id: "press", sets: 3, reps: 8, rest: 75 }, { id: "dip", sets: 3, reps: 6, rest: 75 }, { id: "bandpullapart", sets: 2, reps: 12, rest: 45 }] },
      { day: "2", focus: "Tirón + Piernas", exercises: [{ id: "squat", sets: 4, reps: 6, rest: 90 }, { id: "bandrow", sets: 3, reps: 8, rest: 75 }, { id: "curl", sets: 2, reps: 8, rest: 60 }, { id: "rdl", sets: 3, reps: 8, rest: 90 }] },
      { day: "3", focus: "Cuerpo Completo", exercises: [{ id: "lunge", sets: 3, reps: 6, rest: 75 }, { id: "pushup", sets: 3, reps: 6, rest: 75 }, { id: "hipbridge", sets: 3, reps: 10, rest: 60 }, { id: "plank", sets: 3, reps: 25, rest: 45, isTime: true }] },
    ],
  },
  {
    level: 1, goal: "fuerza", name: "Fuerza - Intermedio", weeks: "Sem. 5-8",
    desc: "Menos repeticiones, mas descanso y sobrecarga progresiva en patrones compuestos.",
    workouts: [
      { day: "1", focus: "Empuje Pesado", exercises: [{ id: "dbchestpress", sets: 5, reps: 6, rest: 90 }, { id: "press", sets: 4, reps: 6, rest: 90 }, { id: "dip", sets: 4, reps: 8, rest: 75 }, { id: "lateralraise", sets: 3, reps: 10, rest: 60 }] },
      { day: "2", focus: "Tirón Pesado", exercises: [{ id: "row", sets: 5, reps: 6, rest: 90 }, { id: "bandfacepull", sets: 3, reps: 12, rest: 60 }, { id: "curl", sets: 3, reps: 8, rest: 75 }, { id: "superman", sets: 3, reps: 12, rest: 45 }] },
      { day: "3", focus: "Piernas + Core", exercises: [{ id: "gobletsquat", sets: 5, reps: 6, rest: 105 }, { id: "rdl", sets: 4, reps: 6, rest: 105 }, { id: "reverselunge", sets: 3, reps: 8, rest: 75 }, { id: "bandlateralwalk", sets: 3, reps: 12, rest: 45 }] },
    ],
  },
  {
    level: 2, goal: "fuerza", name: "Fuerza - Avanzado", weeks: "Sem. 9+",
    desc: "Bloque de fuerza real: series cortas, descansos largos y maxima calidad en cada repeticion.",
    workouts: [
      { day: "1", focus: "Empuje Máximo", exercises: [{ id: "dbchestpress", sets: 5, reps: 5, rest: 120 }, { id: "press", sets: 5, reps: 5, rest: 120 }, { id: "dbfly", sets: 3, reps: 8, rest: 75 }, { id: "dip", sets: 4, reps: 6, rest: 90 }, { id: "tricepext", sets: 3, reps: 10, rest: 60 }] },
      { day: "2", focus: "Tirón Máximo", exercises: [{ id: "row", sets: 5, reps: 5, rest: 120 }, { id: "bandfacepull", sets: 4, reps: 10, rest: 60 }, { id: "curl", sets: 4, reps: 6, rest: 75 }, { id: "bandpullapart", sets: 3, reps: 12, rest: 45 }] },
      { day: "3", focus: "Piernas Pesadas", exercises: [{ id: "gobletsquat", sets: 5, reps: 5, rest: 120 }, { id: "rdl", sets: 5, reps: 5, rest: 120 }, { id: "reverselunge", sets: 4, reps: 6, rest: 90 }, { id: "hipbridge", sets: 4, reps: 8, rest: 60 }, { id: "calfraise", sets: 4, reps: 12, rest: 45 }] },
    ],
  },

  // ── CARDIO ──────────────────────────────────────────────────────────────────
  {
    level: 0, goal: "cardio", name: "Cardio - Principiante", weeks: "Sem. 1-4",
    desc: "Mejora tu resistencia cardiovascular con ejercicios de bajo impacto.",
    workouts: [
      { day: "1", focus: "Cardio Suave", exercises: [{ id: "jumpingjack", sets: 3, reps: 20, rest: 30 }, { id: "highknees", sets: 3, reps: 15, rest: 30 }, { id: "mtnclimber", sets: 2, reps: 15, rest: 45 }] },
      { day: "2", focus: "Cardio + Core", exercises: [{ id: "skater", sets: 3, reps: 12, rest: 30 }, { id: "plank", sets: 3, reps: 20, rest: 45, isTime: true }, { id: "crunch", sets: 2, reps: 15, rest: 30 }, { id: "bandpallof", sets: 2, reps: 10, rest: 30 }] },
      { day: "3", focus: "Mixto", exercises: [{ id: "jumpingjack", sets: 2, reps: 25, rest: 30 }, { id: "squat", sets: 2, reps: 10, rest: 60 }, { id: "pushup", sets: 2, reps: 6, rest: 60 }, { id: "highknees", sets: 2, reps: 20, rest: 30 }] },
    ],
  },
  {
    level: 1, goal: "cardio", name: "Cardio - Intermedio", weeks: "Sem. 5-8",
    desc: "Aumenta la intensidad con circuitos y HIIT moderado.",
    workouts: [
      { day: "1", focus: "HIIT Moderado", exercises: [{ id: "burpee", sets: 3, reps: 8, rest: 60 }, { id: "highknees", sets: 3, reps: 25, rest: 30 }, { id: "mtnclimber", sets: 3, reps: 20, rest: 30 }, { id: "jumpingjack", sets: 3, reps: 30, rest: 30 }] },
      { day: "2", focus: "Piernas Dinamicas", exercises: [{ id: "jumpsquat", sets: 3, reps: 10, rest: 60 }, { id: "skater", sets: 3, reps: 15, rest: 30 }, { id: "reverselunge", sets: 3, reps: 12, rest: 45 }, { id: "bandlateralwalk", sets: 3, reps: 15, rest: 30 }] },
      { day: "3", focus: "Full Circuit", exercises: [{ id: "burpee", sets: 3, reps: 10, rest: 60 }, { id: "pushup", sets: 3, reps: 10, rest: 45 }, { id: "squat", sets: 3, reps: 12, rest: 45 }, { id: "russiantwist", sets: 3, reps: 15, rest: 30 }] },
    ],
  },
  {
    level: 2, goal: "cardio", name: "Cardio - Avanzado", weeks: "Sem. 9+",
    desc: "Circuitos HIIT de alta intensidad para maxima resistencia.",
    workouts: [
      { day: "1", focus: "HIIT Explosivo", exercises: [{ id: "burpee", sets: 4, reps: 15, rest: 45 }, { id: "jumpsquat", sets: 4, reps: 15, rest: 45 }, { id: "mtnclimber", sets: 4, reps: 30, rest: 30 }, { id: "highknees", sets: 3, reps: 40, rest: 30 }] },
      { day: "2", focus: "Circuito Total", exercises: [{ id: "skater", sets: 4, reps: 20, rest: 30 }, { id: "jumpingjack", sets: 3, reps: 50, rest: 30 }, { id: "burpee", sets: 3, reps: 12, rest: 45 }, { id: "reverselunge", sets: 3, reps: 15, rest: 45 }, { id: "bandlateralwalk", sets: 3, reps: 20, rest: 30 }] },
      { day: "3", focus: "Cardio Core", exercises: [{ id: "mtnclimber", sets: 4, reps: 30, rest: 30 }, { id: "floorwiper", sets: 4, reps: 15, rest: 30 }, { id: "bandpallof", sets: 3, reps: 12, rest: 30 }, { id: "plank", sets: 4, reps: 60, rest: 30, isTime: true }, { id: "highknees", sets: 3, reps: 40, rest: 30 }] },
    ],
  },

  // ── PÉRDIDA DE PESO ─────────────────────────────────────────────────────────
  {
    level: 0, goal: "perdida", name: "Pérdida - Principiante", weeks: "Sem. 1-4",
    desc: "Quema calorias de forma progresiva con circuitos accesibles.",
    workouts: [
      { day: "1", focus: "Quema Suave", exercises: [{ id: "jumpingjack", sets: 3, reps: 20, rest: 30 }, { id: "squat", sets: 3, reps: 10, rest: 60 }, { id: "pushup", sets: 2, reps: 8, rest: 60 }, { id: "plank", sets: 2, reps: 20, rest: 45, isTime: true }] },
      { day: "2", focus: "Circuito Bajo Impacto", exercises: [{ id: "reverselunge", sets: 2, reps: 8, rest: 60 }, { id: "hipbridge", sets: 3, reps: 12, rest: 45 }, { id: "crunch", sets: 2, reps: 12, rest: 30 }, { id: "highknees", sets: 2, reps: 15, rest: 30 }] },
      { day: "3", focus: "Cardio + Fuerza", exercises: [{ id: "jumpingjack", sets: 3, reps: 25, rest: 30 }, { id: "mtnclimber", sets: 2, reps: 15, rest: 45 }, { id: "squat", sets: 2, reps: 10, rest: 60 }, { id: "bandrow", sets: 2, reps: 10, rest: 60 }] },
    ],
  },
  {
    level: 1, goal: "perdida", name: "Pérdida - Intermedio", weeks: "Sem. 5-8",
    desc: "HIIT y circuitos mas intensos para acelerar la quema de grasa.",
    workouts: [
      { day: "1", focus: "HIIT Quema Grasa", exercises: [{ id: "burpee", sets: 3, reps: 10, rest: 60 }, { id: "jumpsquat", sets: 3, reps: 10, rest: 60 }, { id: "mtnclimber", sets: 3, reps: 20, rest: 30 }, { id: "highknees", sets: 3, reps: 25, rest: 30 }] },
      { day: "2", focus: "Circuito Cuerpo Completo", exercises: [{ id: "pushup", sets: 3, reps: 12, rest: 45 }, { id: "gobletsquat", sets: 3, reps: 12, rest: 45 }, { id: "skater", sets: 3, reps: 15, rest: 30 }, { id: "rdl", sets: 3, reps: 10, rest: 45 }] },
      { day: "3", focus: "Piernas + Cardio", exercises: [{ id: "reverselunge", sets: 3, reps: 12, rest: 45 }, { id: "jumpingjack", sets: 3, reps: 40, rest: 30 }, { id: "hipbridge", sets: 3, reps: 15, rest: 45 }, { id: "bandlateralwalk", sets: 3, reps: 15, rest: 30 }] },
    ],
  },
  {
    level: 2, goal: "perdida", name: "Pérdida - Avanzado", weeks: "Sem. 9+",
    desc: "Maxima quema calorica con circuitos HIIT de alta intensidad.",
    workouts: [
      { day: "1", focus: "HIIT Extremo", exercises: [{ id: "burpee", sets: 4, reps: 15, rest: 45 }, { id: "jumpsquat", sets: 4, reps: 15, rest: 45 }, { id: "mtnclimber", sets: 4, reps: 30, rest: 30 }, { id: "skater", sets: 3, reps: 20, rest: 30 }] },
      { day: "2", focus: "Full Body Intenso", exercises: [{ id: "dbchestpress", sets: 3, reps: 12, rest: 45 }, { id: "gobletsquat", sets: 4, reps: 12, rest: 45 }, { id: "rdl", sets: 3, reps: 10, rest: 45 }, { id: "highknees", sets: 3, reps: 40, rest: 30 }, { id: "floorwiper", sets: 3, reps: 15, rest: 30 }] },
      { day: "3", focus: "Circuito Final", exercises: [{ id: "burpee", sets: 4, reps: 12, rest: 45 }, { id: "jumpingjack", sets: 3, reps: 50, rest: 30 }, { id: "reverselunge", sets: 4, reps: 12, rest: 45 }, { id: "russiantwist", sets: 4, reps: 20, rest: 30 }, { id: "plank", sets: 3, reps: 45, rest: 30, isTime: true }] },
    ],
  },

  // ── TONIFICACIÓN ────────────────────────────────────────────────────────────
  {
    level: 0, goal: "tono", name: "Tonificación - Principiante", weeks: "Sem. 1-4",
    desc: "Tonifica todo el cuerpo con ejercicios equilibrados.",
    workouts: [
      { day: "1", focus: "Tren Superior", exercises: [{ id: "pushup", sets: 3, reps: 8, rest: 60 }, { id: "bandbicepcurl", sets: 2, reps: 10, rest: 60 }, { id: "lateralraise", sets: 2, reps: 10, rest: 45 }, { id: "bandpullapart", sets: 2, reps: 12, rest: 45 }] },
      { day: "2", focus: "Tren Inferior", exercises: [{ id: "squat", sets: 3, reps: 10, rest: 60 }, { id: "reverselunge", sets: 2, reps: 8, rest: 60 }, { id: "hipbridge", sets: 3, reps: 12, rest: 45 }, { id: "calfraise", sets: 2, reps: 12, rest: 30 }] },
      { day: "3", focus: "Core + Cardio", exercises: [{ id: "crunch", sets: 3, reps: 12, rest: 30 }, { id: "russiantwist", sets: 2, reps: 10, rest: 30 }, { id: "jumpingjack", sets: 3, reps: 20, rest: 30 }, { id: "superman", sets: 2, reps: 10, rest: 45 }] },
    ],
  },
  {
    level: 1, goal: "tono", name: "Tonificación - Intermedio", weeks: "Sem. 5-8",
    desc: "Mayor definicion con volumen moderado y variedad muscular.",
    workouts: [
      { day: "1", focus: "Empuje + Hombros", exercises: [{ id: "dbchestpress", sets: 3, reps: 10, rest: 60 }, { id: "press", sets: 3, reps: 10, rest: 60 }, { id: "dip", sets: 3, reps: 10, rest: 60 }, { id: "lateralraise", sets: 3, reps: 12, rest: 45 }] },
      { day: "2", focus: "Tirón + Piernas", exercises: [{ id: "gobletsquat", sets: 4, reps: 12, rest: 45 }, { id: "row", sets: 3, reps: 12, rest: 60 }, { id: "rdl", sets: 3, reps: 10, rest: 60 }, { id: "bandfacepull", sets: 3, reps: 15, rest: 45 }] },
      { day: "3", focus: "Core Definido", exercises: [{ id: "crunch", sets: 4, reps: 15, rest: 30 }, { id: "floorwiper", sets: 3, reps: 12, rest: 30 }, { id: "bandpallof", sets: 3, reps: 12, rest: 30 }, { id: "plank", sets: 3, reps: 40, rest: 30, isTime: true }, { id: "hipbridge", sets: 3, reps: 15, rest: 45 }] },
    ],
  },
  {
    level: 2, goal: "tono", name: "Tonificación - Avanzado", weeks: "Sem. 9+",
    desc: "Esculpe y define con circuitos de alto volumen y reps controladas.",
    workouts: [
      { day: "1", focus: "Upper Sculpt", exercises: [{ id: "dbchestpress", sets: 4, reps: 10, rest: 45 }, { id: "dbfly", sets: 3, reps: 12, rest: 45 }, { id: "press", sets: 4, reps: 10, rest: 45 }, { id: "dip", sets: 4, reps: 12, rest: 45 }, { id: "tricepext", sets: 3, reps: 12, rest: 30 }] },
      { day: "2", focus: "Lower Sculpt", exercises: [{ id: "gobletsquat", sets: 4, reps: 10, rest: 60 }, { id: "rdl", sets: 4, reps: 10, rest: 60 }, { id: "reverselunge", sets: 4, reps: 10, rest: 45 }, { id: "bandlateralwalk", sets: 3, reps: 20, rest: 30 }, { id: "calfraise", sets: 4, reps: 15, rest: 30 }] },
      { day: "3", focus: "Core + Full Body", exercises: [{ id: "floorwiper", sets: 4, reps: 15, rest: 30 }, { id: "bandpallof", sets: 3, reps: 12, rest: 30 }, { id: "superman", sets: 3, reps: 15, rest: 30 }, { id: "plank", sets: 4, reps: 60, rest: 30, isTime: true }, { id: "skater", sets: 3, reps: 15, rest: 30 }] },
    ],
  },
];

/** Filtra planes por objetivo del usuario */
export function getPlansForGoal(goal: Goal): Plan[] {
  return PLANS.filter(p => p.goal === goal);
}

/** Obtiene un plan por objetivo y nivel */
export function getPlanForGoalAndLevel(goal: Goal, level: number): Plan | undefined {
  return PLANS.find(p => p.goal === goal && p.level === level);
}

const LEVEL_NAMES = ["Principiante", "Intermedio", "Avanzado"];

/** Nombre del nivel por índice (para historial) */
export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] ?? "Desconocido";
}

export const EX_TIPS: Record<ExerciseId, ExTip> = {
  pushup: { cue: "Manten el cuerpo en bloque y baja controlado.", mistake: "Evita hundir la cadera o abrir codos en exceso." },
  squat: { cue: "Empuja la cadera atras y rodillas alineadas.", mistake: "No levantes talones ni redondees la espalda." },
  lunge: { cue: "Paso largo y tronco estable durante todo el descenso.", mistake: "No dejes que la rodilla delantera colapse hacia dentro." },
  plank: { cue: "Aprieta abdomen y gluteos, cuello neutro.", mistake: "No dejes caer la zona lumbar." },
  burpee: { cue: "Fluye por fases: baja, plancha, salto.", mistake: "No sacrifiques tecnica por velocidad." },
  curl: { cue: "Codos pegados al torso, sube con control.", mistake: "No balancees el cuerpo para ayudar el peso." },
  press: { cue: "Empuja vertical y bloquea arriba sin arquear.", mistake: "No hiperextiendas la espalda baja." },
  mtnclimber: { cue: "Ritmo rapido con core firme.", mistake: "Evita rebotar cadera arriba y abajo." },
  jumpingjack: { cue: "Aterriza suave y coordinado.", mistake: "No golpees talones ni cierres hombros." },
  hipbridge: { cue: "Eleva cadera apretando gluteos arriba.", mistake: "No empujes desde la zona lumbar." },
  row: { cue: "Tira del codo hacia atras, omoplato retraido.", mistake: "No gires el torso ni subas el hombro." },
  pullup: { cue: "Inicia desde brazos extendidos, barbilla sobre barra.", mistake: "No uses impulso con piernas ni encorves hombros." },
  superman: { cue: "Levanta brazos y piernas simultaneamente.", mistake: "No hiperextiendas el cuello ni lances el movimiento." },
  dip: { cue: "Baja controlado hasta 90° en codos.", mistake: "No bajes demasiado ni abras los codos." },
  tricepext: { cue: "Extiende desde el codo, manten el brazo fijo.", mistake: "No muevas el hombro ni balancees." },
  crunch: { cue: "Eleva omoplatos del suelo apretando abdomen.", mistake: "No tires del cuello con las manos." },
  russiantwist: { cue: "Gira desde el torso con pies elevados.", mistake: "No dejes caer la espalda ni muevas solo los brazos." },
  highknees: { cue: "Rodillas a la altura de la cadera, ritmo rapido.", mistake: "No aterrices con el pie plano ni inclines el torso." },
  skater: { cue: "Salta lateral con control, toca el suelo.", mistake: "No pierdas el equilibrio ni aterrices rigido." },
  calfraise: { cue: "Sube hasta puntillas y baja lento.", mistake: "No hagas rebotes ni flexiones de rodilla." },
  lateralraise: { cue: "Levanta a la altura del hombro con control.", mistake: "No subas por encima del hombro ni uses impulso." },
  jumpsquat: { cue: "Sentadilla profunda y explota hacia arriba.", mistake: "No aterrices con rodillas bloqueadas." },
  dbchestpress: { cue: "Baja las mancuernas a los lados del pecho y empuja vertical.", mistake: "No rebotes las mancuernas ni arquees excesivamente la espalda." },
  dbfly: { cue: "Abre los brazos en arco controlado, codos ligeramente flexionados.", mistake: "No bajes demasiado ni extiendas los codos por completo." },
  rdl: { cue: "Bisagra de cadera, espalda neutra, mancuernas pegadas a las piernas.", mistake: "No redondees la espalda ni dobles las rodillas en exceso." },
  gobletsquat: { cue: "Sujeta la mancuerna al pecho y baja profundo con el torso erguido.", mistake: "No dejes que los codos se separen ni inclines el tronco." },
  bandpullapart: { cue: "Tira de la banda separando las manos a la altura del pecho.", mistake: "No encorves los hombros ni uses impulso." },
  bandrow: { cue: "Pisa la banda, tira de los codos hacia atras apretando omoplatos.", mistake: "No gires el torso ni levantes los hombros." },
  bandfacepull: { cue: "Tira hacia la cara con los codos altos y rotacion externa.", mistake: "No dejes que los codos caigan ni tires solo con las manos." },
  bandpallof: { cue: "Extiende los brazos al frente resistiendo la rotacion del core.", mistake: "No gires el torso ni inclines la cadera." },
  bandbicepcurl: { cue: "Pisa la banda y curl controlado, codos fijos al torso.", mistake: "No balancees el cuerpo ni muevas los hombros." },
  bandlateralwalk: { cue: "Banda en tobillos, pasos laterales manteniendo tension.", mistake: "No arrastres los pies ni dejes que las rodillas colapsen." },
  floorwiper: { cue: "Tumbado, gira las piernas de lado a lado con control.", mistake: "No despegues los hombros del suelo ni hagas impulso." },
  reverselunge: { cue: "Da un paso atras largo y baja controlado.", mistake: "No dejes que la rodilla toque el suelo con fuerza." },
};

export const DIFFICULTY: Record<DifficultyKey, DifficultyConfig> = {
  ligero: { label: "Ligero", sets: 0.85, reps: 0.85, rest: 1.2 },
  normal: { label: "Normal", sets: 1, reps: 1, rest: 1 },
  intenso: { label: "Intenso", sets: 1.2, reps: 1.2, rest: 0.8 },
};

export const WEEK_DAYS: WeekDay[] = [
  { key: "lun", label: "Lun" },
  { key: "mar", label: "Mar" },
  { key: "mie", label: "Mie" },
  { key: "jue", label: "Jue" },
  { key: "vie", label: "Vie" },
  { key: "sab", label: "Sab" },
  { key: "dom", label: "Dom" },
];

export const DAY_STATE_ORDER: DayState[] = ["entreno", "recuperacion", "descanso"];

export const DAY_STATE_META: Record<DayState, DayStateMeta> = {
  entreno: { label: "Entreno", bg: "#1b2b15", fg: "#b7ff8c", border: "#385c28" },
  recuperacion: { label: "Recuperacion", bg: "#1f1f2b", fg: "#b7c6ff", border: "#3a3a5c" },
  descanso: { label: "Descanso", bg: "#2a1f14", fg: "#ffd4a3", border: "#5b3f1f" },
};

export const DAY_STATE_META_LIGHT: Record<DayState, DayStateMeta> = {
  entreno: { label: "Entreno", bg: "#dff0d0", fg: "#2b6500", border: "#90c86a" },
  recuperacion: { label: "Recuperacion", bg: "#dde5f7", fg: "#1e3b8a", border: "#8aaad6" },
  descanso: { label: "Descanso", bg: "#f5e8d4", fg: "#7a3e08", border: "#d4a870" },
};

export const defaultWeeklyCalendar = (): WeeklyCalendar => ({
  lun: "entreno",
  mar: "recuperacion",
  mie: "entreno",
  jue: "descanso",
  vie: "entreno",
  sab: "recuperacion",
  dom: "descanso",
});

export const LOADABLE_EX: Partial<Record<ExerciseId, LoadableConfig>> = {
  squat: { intermedio: 8, avanzado: 20 },
  lunge: { intermedio: 6, avanzado: 14 },
  hipbridge: { intermedio: 8, avanzado: 16 },
  curl: { intermedio: 6, avanzado: 12 },
  press: { intermedio: 6, avanzado: 12 },
  burpee: { intermedio: 0, avanzado: 0 },
  row: { intermedio: 10, avanzado: 18 },
  tricepext: { intermedio: 5, avanzado: 10 },
  calfraise: { intermedio: 8, avanzado: 16 },
  lateralraise: { intermedio: 4, avanzado: 8 },
  jumpsquat: { intermedio: 0, avanzado: 6 },
  dbchestpress: { intermedio: 8, avanzado: 16 },
  dbfly: { intermedio: 5, avanzado: 10 },
  rdl: { intermedio: 10, avanzado: 22 },
  gobletsquat: { intermedio: 10, avanzado: 20 },
  reverselunge: { intermedio: 6, avanzado: 14 },
};
