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
};

export const PLANS: Plan[] = [
  // ── FUERZA ──────────────────────────────────────────────────────────────────
  {
    level: 0, goal: "fuerza", name: "Fuerza - Principiante", weeks: "Sem. 1-4",
    desc: "Construye una base solida de fuerza con ejercicios fundamentales.",
    workouts: [
      { day: "A", focus: "Empuje", exercises: [{ id: "pushup", sets: 3, reps: 8, rest: 60 }, { id: "press", sets: 2, reps: 10, rest: 60 }, { id: "dip", sets: 2, reps: 8, rest: 60 }] },
      { day: "B", focus: "Tirón + Piernas", exercises: [{ id: "squat", sets: 3, reps: 10, rest: 60 }, { id: "row", sets: 2, reps: 10, rest: 60 }, { id: "curl", sets: 2, reps: 10, rest: 60 }] },
      { day: "C", focus: "Cuerpo Completo", exercises: [{ id: "lunge", sets: 3, reps: 8, rest: 60 }, { id: "pushup", sets: 2, reps: 8, rest: 60 }, { id: "hipbridge", sets: 3, reps: 12, rest: 45 }, { id: "plank", sets: 3, reps: 20, rest: 45, isTime: true }] },
    ],
  },
  {
    level: 1, goal: "fuerza", name: "Fuerza - Intermedio", weeks: "Sem. 5-8",
    desc: "Mayor volumen y ejercicios compuestos para ganar fuerza.",
    workouts: [
      { day: "A", focus: "Empuje Pesado", exercises: [{ id: "pushup", sets: 4, reps: 15, rest: 60 }, { id: "press", sets: 4, reps: 12, rest: 60 }, { id: "dip", sets: 3, reps: 12, rest: 60 }, { id: "lateralraise", sets: 3, reps: 12, rest: 45 }] },
      { day: "B", focus: "Tirón Pesado", exercises: [{ id: "pullup", sets: 3, reps: 8, rest: 90 }, { id: "row", sets: 4, reps: 12, rest: 60 }, { id: "curl", sets: 3, reps: 12, rest: 60 }, { id: "superman", sets: 3, reps: 12, rest: 45 }] },
      { day: "C", focus: "Piernas + Core", exercises: [{ id: "squat", sets: 4, reps: 15, rest: 60 }, { id: "lunge", sets: 3, reps: 12, rest: 60 }, { id: "hipbridge", sets: 4, reps: 15, rest: 45 }, { id: "calfraise", sets: 3, reps: 15, rest: 30 }] },
    ],
  },
  {
    level: 2, goal: "fuerza", name: "Fuerza - Avanzado", weeks: "Sem. 9+",
    desc: "Maxima intensidad y volumen para fuerza avanzada.",
    workouts: [
      { day: "A", focus: "Empuje Máximo", exercises: [{ id: "pushup", sets: 5, reps: 20, rest: 45 }, { id: "press", sets: 4, reps: 15, rest: 45 }, { id: "dip", sets: 4, reps: 15, rest: 45 }, { id: "tricepext", sets: 3, reps: 15, rest: 45 }, { id: "lateralraise", sets: 4, reps: 12, rest: 30 }] },
      { day: "B", focus: "Tirón Máximo", exercises: [{ id: "pullup", sets: 5, reps: 12, rest: 60 }, { id: "row", sets: 4, reps: 15, rest: 45 }, { id: "curl", sets: 4, reps: 12, rest: 45 }, { id: "superman", sets: 3, reps: 15, rest: 30 }] },
      { day: "C", focus: "Piernas Pesadas", exercises: [{ id: "squat", sets: 5, reps: 20, rest: 45 }, { id: "lunge", sets: 4, reps: 15, rest: 45 }, { id: "hipbridge", sets: 4, reps: 20, rest: 30 }, { id: "calfraise", sets: 4, reps: 20, rest: 30 }, { id: "plank", sets: 4, reps: 60, rest: 30, isTime: true }] },
    ],
  },

  // ── CARDIO ──────────────────────────────────────────────────────────────────
  {
    level: 0, goal: "cardio", name: "Cardio - Principiante", weeks: "Sem. 1-4",
    desc: "Mejora tu resistencia cardiovascular con ejercicios de bajo impacto.",
    workouts: [
      { day: "A", focus: "Cardio Suave", exercises: [{ id: "jumpingjack", sets: 3, reps: 20, rest: 30 }, { id: "highknees", sets: 3, reps: 15, rest: 30 }, { id: "mtnclimber", sets: 2, reps: 15, rest: 45 }] },
      { day: "B", focus: "Cardio + Core", exercises: [{ id: "skater", sets: 3, reps: 12, rest: 30 }, { id: "plank", sets: 3, reps: 20, rest: 45, isTime: true }, { id: "crunch", sets: 2, reps: 15, rest: 30 }] },
      { day: "C", focus: "Mixto", exercises: [{ id: "jumpingjack", sets: 2, reps: 25, rest: 30 }, { id: "squat", sets: 2, reps: 10, rest: 60 }, { id: "pushup", sets: 2, reps: 6, rest: 60 }, { id: "highknees", sets: 2, reps: 20, rest: 30 }] },
    ],
  },
  {
    level: 1, goal: "cardio", name: "Cardio - Intermedio", weeks: "Sem. 5-8",
    desc: "Aumenta la intensidad con circuitos y HIIT moderado.",
    workouts: [
      { day: "A", focus: "HIIT Moderado", exercises: [{ id: "burpee", sets: 3, reps: 8, rest: 60 }, { id: "highknees", sets: 3, reps: 25, rest: 30 }, { id: "mtnclimber", sets: 3, reps: 20, rest: 30 }, { id: "jumpingjack", sets: 3, reps: 30, rest: 30 }] },
      { day: "B", focus: "Piernas Dinamicas", exercises: [{ id: "jumpsquat", sets: 3, reps: 10, rest: 60 }, { id: "skater", sets: 3, reps: 15, rest: 30 }, { id: "lunge", sets: 3, reps: 12, rest: 45 }, { id: "calfraise", sets: 3, reps: 15, rest: 30 }] },
      { day: "C", focus: "Full Circuit", exercises: [{ id: "burpee", sets: 3, reps: 10, rest: 60 }, { id: "pushup", sets: 3, reps: 10, rest: 45 }, { id: "squat", sets: 3, reps: 12, rest: 45 }, { id: "russiantwist", sets: 3, reps: 15, rest: 30 }] },
    ],
  },
  {
    level: 2, goal: "cardio", name: "Cardio - Avanzado", weeks: "Sem. 9+",
    desc: "Circuitos HIIT de alta intensidad para maxima resistencia.",
    workouts: [
      { day: "A", focus: "HIIT Explosivo", exercises: [{ id: "burpee", sets: 4, reps: 15, rest: 45 }, { id: "jumpsquat", sets: 4, reps: 15, rest: 45 }, { id: "mtnclimber", sets: 4, reps: 30, rest: 30 }, { id: "highknees", sets: 3, reps: 40, rest: 30 }] },
      { day: "B", focus: "Circuito Total", exercises: [{ id: "skater", sets: 4, reps: 20, rest: 30 }, { id: "jumpingjack", sets: 3, reps: 50, rest: 30 }, { id: "burpee", sets: 3, reps: 12, rest: 45 }, { id: "pushup", sets: 3, reps: 15, rest: 45 }, { id: "squat", sets: 3, reps: 20, rest: 45 }] },
      { day: "C", focus: "Cardio Core", exercises: [{ id: "mtnclimber", sets: 4, reps: 30, rest: 30 }, { id: "russiantwist", sets: 4, reps: 20, rest: 30 }, { id: "crunch", sets: 4, reps: 20, rest: 30 }, { id: "plank", sets: 4, reps: 60, rest: 30, isTime: true }, { id: "highknees", sets: 3, reps: 40, rest: 30 }] },
    ],
  },

  // ── PÉRDIDA DE PESO ─────────────────────────────────────────────────────────
  {
    level: 0, goal: "perdida", name: "Pérdida - Principiante", weeks: "Sem. 1-4",
    desc: "Quema calorias de forma progresiva con circuitos accesibles.",
    workouts: [
      { day: "A", focus: "Quema Suave", exercises: [{ id: "jumpingjack", sets: 3, reps: 20, rest: 30 }, { id: "squat", sets: 3, reps: 10, rest: 60 }, { id: "pushup", sets: 2, reps: 8, rest: 60 }, { id: "plank", sets: 2, reps: 20, rest: 45, isTime: true }] },
      { day: "B", focus: "Circuito Bajo Impacto", exercises: [{ id: "lunge", sets: 2, reps: 8, rest: 60 }, { id: "hipbridge", sets: 3, reps: 12, rest: 45 }, { id: "crunch", sets: 2, reps: 12, rest: 30 }, { id: "highknees", sets: 2, reps: 15, rest: 30 }] },
      { day: "C", focus: "Cardio + Fuerza", exercises: [{ id: "jumpingjack", sets: 3, reps: 25, rest: 30 }, { id: "mtnclimber", sets: 2, reps: 15, rest: 45 }, { id: "squat", sets: 2, reps: 10, rest: 60 }, { id: "pushup", sets: 2, reps: 6, rest: 60 }] },
    ],
  },
  {
    level: 1, goal: "perdida", name: "Pérdida - Intermedio", weeks: "Sem. 5-8",
    desc: "HIIT y circuitos mas intensos para acelerar la quema de grasa.",
    workouts: [
      { day: "A", focus: "HIIT Quema Grasa", exercises: [{ id: "burpee", sets: 3, reps: 10, rest: 60 }, { id: "jumpsquat", sets: 3, reps: 10, rest: 60 }, { id: "mtnclimber", sets: 3, reps: 20, rest: 30 }, { id: "highknees", sets: 3, reps: 25, rest: 30 }] },
      { day: "B", focus: "Circuito Cuerpo Completo", exercises: [{ id: "pushup", sets: 3, reps: 12, rest: 45 }, { id: "squat", sets: 3, reps: 15, rest: 45 }, { id: "skater", sets: 3, reps: 15, rest: 30 }, { id: "russiantwist", sets: 3, reps: 15, rest: 30 }] },
      { day: "C", focus: "Piernas + Cardio", exercises: [{ id: "lunge", sets: 3, reps: 12, rest: 45 }, { id: "jumpingjack", sets: 3, reps: 40, rest: 30 }, { id: "hipbridge", sets: 3, reps: 15, rest: 45 }, { id: "crunch", sets: 3, reps: 15, rest: 30 }] },
    ],
  },
  {
    level: 2, goal: "perdida", name: "Pérdida - Avanzado", weeks: "Sem. 9+",
    desc: "Maxima quema calorica con circuitos HIIT de alta intensidad.",
    workouts: [
      { day: "A", focus: "HIIT Extremo", exercises: [{ id: "burpee", sets: 4, reps: 15, rest: 45 }, { id: "jumpsquat", sets: 4, reps: 15, rest: 45 }, { id: "mtnclimber", sets: 4, reps: 30, rest: 30 }, { id: "skater", sets: 3, reps: 20, rest: 30 }] },
      { day: "B", focus: "Full Body Intenso", exercises: [{ id: "pushup", sets: 4, reps: 15, rest: 45 }, { id: "squat", sets: 4, reps: 20, rest: 45 }, { id: "row", sets: 3, reps: 12, rest: 45 }, { id: "highknees", sets: 3, reps: 40, rest: 30 }, { id: "crunch", sets: 4, reps: 20, rest: 30 }] },
      { day: "C", focus: "Circuito Final", exercises: [{ id: "burpee", sets: 4, reps: 12, rest: 45 }, { id: "jumpingjack", sets: 3, reps: 50, rest: 30 }, { id: "lunge", sets: 4, reps: 15, rest: 45 }, { id: "russiantwist", sets: 4, reps: 20, rest: 30 }, { id: "plank", sets: 3, reps: 45, rest: 30, isTime: true }] },
    ],
  },

  // ── TONIFICACIÓN ────────────────────────────────────────────────────────────
  {
    level: 0, goal: "tono", name: "Tonificación - Principiante", weeks: "Sem. 1-4",
    desc: "Tonifica todo el cuerpo con ejercicios equilibrados.",
    workouts: [
      { day: "A", focus: "Tren Superior", exercises: [{ id: "pushup", sets: 3, reps: 8, rest: 60 }, { id: "curl", sets: 2, reps: 10, rest: 60 }, { id: "lateralraise", sets: 2, reps: 10, rest: 45 }, { id: "plank", sets: 3, reps: 20, rest: 45, isTime: true }] },
      { day: "B", focus: "Tren Inferior", exercises: [{ id: "squat", sets: 3, reps: 10, rest: 60 }, { id: "lunge", sets: 2, reps: 8, rest: 60 }, { id: "hipbridge", sets: 3, reps: 12, rest: 45 }, { id: "calfraise", sets: 2, reps: 12, rest: 30 }] },
      { day: "C", focus: "Core + Cardio", exercises: [{ id: "crunch", sets: 3, reps: 12, rest: 30 }, { id: "russiantwist", sets: 2, reps: 10, rest: 30 }, { id: "jumpingjack", sets: 3, reps: 20, rest: 30 }, { id: "superman", sets: 2, reps: 10, rest: 45 }] },
    ],
  },
  {
    level: 1, goal: "tono", name: "Tonificación - Intermedio", weeks: "Sem. 5-8",
    desc: "Mayor definicion con volumen moderado y variedad muscular.",
    workouts: [
      { day: "A", focus: "Empuje + Hombros", exercises: [{ id: "pushup", sets: 4, reps: 12, rest: 45 }, { id: "press", sets: 3, reps: 10, rest: 60 }, { id: "dip", sets: 3, reps: 10, rest: 60 }, { id: "lateralraise", sets: 3, reps: 12, rest: 45 }] },
      { day: "B", focus: "Tirón + Piernas", exercises: [{ id: "squat", sets: 4, reps: 15, rest: 45 }, { id: "row", sets: 3, reps: 12, rest: 60 }, { id: "lunge", sets: 3, reps: 12, rest: 45 }, { id: "curl", sets: 3, reps: 12, rest: 45 }] },
      { day: "C", focus: "Core Definido", exercises: [{ id: "crunch", sets: 4, reps: 15, rest: 30 }, { id: "russiantwist", sets: 3, reps: 15, rest: 30 }, { id: "plank", sets: 3, reps: 40, rest: 30, isTime: true }, { id: "hipbridge", sets: 3, reps: 15, rest: 45 }, { id: "highknees", sets: 3, reps: 20, rest: 30 }] },
    ],
  },
  {
    level: 2, goal: "tono", name: "Tonificación - Avanzado", weeks: "Sem. 9+",
    desc: "Esculpe y define con circuitos de alto volumen y reps controladas.",
    workouts: [
      { day: "A", focus: "Upper Sculpt", exercises: [{ id: "pushup", sets: 5, reps: 15, rest: 45 }, { id: "press", sets: 4, reps: 12, rest: 45 }, { id: "pullup", sets: 4, reps: 10, rest: 60 }, { id: "dip", sets: 4, reps: 12, rest: 45 }, { id: "tricepext", sets: 3, reps: 12, rest: 30 }] },
      { day: "B", focus: "Lower Sculpt", exercises: [{ id: "squat", sets: 5, reps: 20, rest: 45 }, { id: "lunge", sets: 4, reps: 15, rest: 45 }, { id: "hipbridge", sets: 4, reps: 20, rest: 30 }, { id: "calfraise", sets: 4, reps: 20, rest: 30 }, { id: "jumpsquat", sets: 3, reps: 10, rest: 60 }] },
      { day: "C", focus: "Core + Full Body", exercises: [{ id: "crunch", sets: 4, reps: 20, rest: 30 }, { id: "russiantwist", sets: 4, reps: 20, rest: 30 }, { id: "superman", sets: 3, reps: 15, rest: 30 }, { id: "plank", sets: 4, reps: 60, rest: 30, isTime: true }, { id: "skater", sets: 3, reps: 15, rest: 30 }] },
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
  squat: { intermedio: 6, avanzado: 12 },
  lunge: { intermedio: 4, avanzado: 8 },
  hipbridge: { intermedio: 6, avanzado: 12 },
  curl: { intermedio: 6, avanzado: 10 },
  press: { intermedio: 5, avanzado: 9 },
  burpee: { intermedio: 0, avanzado: 0 },
  row: { intermedio: 8, avanzado: 14 },
  tricepext: { intermedio: 5, avanzado: 9 },
  calfraise: { intermedio: 6, avanzado: 12 },
  lateralraise: { intermedio: 4, avanzado: 8 },
  jumpsquat: { intermedio: 0, avanzado: 4 },
};
