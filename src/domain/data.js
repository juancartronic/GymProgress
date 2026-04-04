export const EXDB = {
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
};

export const PLANS = [
  {
    level: 0,
    name: "Principiante",
    weeks: "Sem. 1-4",
    desc: "Construye la base con movimientos fundamentales y bajo volumen.",
    workouts: [
      { day: "A", focus: "Tren Superior", exercises: [{ id: "pushup", sets: 3, reps: 8, rest: 60 }, { id: "curl", sets: 2, reps: 10, rest: 60 }, { id: "plank", sets: 3, reps: 20, rest: 45, isTime: true }] },
      { day: "B", focus: "Tren Inferior", exercises: [{ id: "squat", sets: 3, reps: 10, rest: 60 }, { id: "lunge", sets: 2, reps: 8, rest: 60 }, { id: "hipbridge", sets: 3, reps: 12, rest: 45 }] },
      { day: "C", focus: "Cuerpo Completo", exercises: [{ id: "jumpingjack", sets: 3, reps: 20, rest: 30 }, { id: "pushup", sets: 2, reps: 6, rest: 60 }, { id: "squat", sets: 2, reps: 10, rest: 60 }, { id: "mtnclimber", sets: 2, reps: 20, rest: 45 }] },
    ],
  },
  {
    level: 1,
    name: "Intermedio",
    weeks: "Sem. 5-8",
    desc: "Mayor volumen e intensidad. Introduce movimientos compuestos.",
    workouts: [
      { day: "A", focus: "Empuje + Core", exercises: [{ id: "pushup", sets: 4, reps: 12, rest: 60 }, { id: "press", sets: 3, reps: 10, rest: 60 }, { id: "plank", sets: 3, reps: 40, rest: 45, isTime: true }, { id: "mtnclimber", sets: 3, reps: 20, rest: 45 }] },
      { day: "B", focus: "Piernas + Gluteos", exercises: [{ id: "squat", sets: 4, reps: 15, rest: 60 }, { id: "lunge", sets: 3, reps: 12, rest: 60 }, { id: "hipbridge", sets: 4, reps: 15, rest: 45 }, { id: "jumpingjack", sets: 2, reps: 40, rest: 30 }] },
      { day: "C", focus: "Cardio + Fuerza", exercises: [{ id: "burpee", sets: 3, reps: 8, rest: 90 }, { id: "curl", sets: 3, reps: 12, rest: 60 }, { id: "squat", sets: 3, reps: 12, rest: 60 }, { id: "pushup", sets: 3, reps: 10, rest: 60 }] },
    ],
  },
  {
    level: 2,
    name: "Avanzado",
    weeks: "Sem. 9+",
    desc: "Maxima intensidad. Circuitos HIIT y alto volumen.",
    workouts: [
      { day: "A", focus: "Potencia Superior", exercises: [{ id: "pushup", sets: 5, reps: 15, rest: 45 }, { id: "press", sets: 4, reps: 12, rest: 45 }, { id: "curl", sets: 4, reps: 12, rest: 45 }, { id: "plank", sets: 4, reps: 60, rest: 30, isTime: true }] },
      { day: "B", focus: "Piernas Explosivas", exercises: [{ id: "squat", sets: 5, reps: 20, rest: 45 }, { id: "lunge", sets: 4, reps: 15, rest: 45 }, { id: "burpee", sets: 3, reps: 12, rest: 60 }, { id: "hipbridge", sets: 4, reps: 20, rest: 30 }] },
      { day: "C", focus: "Full Body HIIT", exercises: [{ id: "burpee", sets: 4, reps: 15, rest: 60 }, { id: "mtnclimber", sets: 4, reps: 30, rest: 45 }, { id: "jumpingjack", sets: 3, reps: 50, rest: 30 }, { id: "pushup", sets: 3, reps: 15, rest: 45 }, { id: "squat", sets: 3, reps: 20, rest: 45 }] },
    ],
  },
];

export const EX_TIPS = {
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
};

export const DIFFICULTY = {
  ligero: { label: "Ligero", sets: 0.85, reps: 0.85, rest: 1.2 },
  normal: { label: "Normal", sets: 1, reps: 1, rest: 1 },
  intenso: { label: "Intenso", sets: 1.2, reps: 1.2, rest: 0.8 },
};

export const WEEK_DAYS = [
  { key: "lun", label: "Lun" },
  { key: "mar", label: "Mar" },
  { key: "mie", label: "Mie" },
  { key: "jue", label: "Jue" },
  { key: "vie", label: "Vie" },
  { key: "sab", label: "Sab" },
  { key: "dom", label: "Dom" },
];

export const DAY_STATE_ORDER = ["entreno", "recuperacion", "descanso"];

export const DAY_STATE_META = {
  entreno: { label: "Entreno", bg: "#1b2b15", fg: "#b7ff8c", border: "#385c28" },
  recuperacion: { label: "Recuperacion", bg: "#1f1f2b", fg: "#b7c6ff", border: "#3a3a5c" },
  descanso: { label: "Descanso", bg: "#2a1f14", fg: "#ffd4a3", border: "#5b3f1f" },
};

export const DAY_STATE_META_LIGHT = {
  entreno: { label: "Entreno", bg: "#dff0d0", fg: "#2b6500", border: "#90c86a" },
  recuperacion: { label: "Recuperacion", bg: "#dde5f7", fg: "#1e3b8a", border: "#8aaad6" },
  descanso: { label: "Descanso", bg: "#f5e8d4", fg: "#7a3e08", border: "#d4a870" },
};

export const defaultWeeklyCalendar = () => ({
  lun: "entreno",
  mar: "recuperacion",
  mie: "entreno",
  jue: "descanso",
  vie: "entreno",
  sab: "recuperacion",
  dom: "descanso",
});

export const LOADABLE_EX = {
  squat: { intermedio: 6, avanzado: 12 },
  lunge: { intermedio: 4, avanzado: 8 },
  hipbridge: { intermedio: 6, avanzado: 12 },
  curl: { intermedio: 6, avanzado: 10 },
  press: { intermedio: 5, avanzado: 9 },
  burpee: { intermedio: 0, avanzado: 0 },
};
