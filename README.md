# IronTrack — Gym Progress App

Aplicación web PWA de entrenamiento personal construida con React 18 + TypeScript + Vite. Diseñada como mobile-first, instalable en dispositivos, con soporte offline.

## Características principales

- **Multiusuario** — perfiles independientes con historial, calendario y configuración propios.
- **Planes de entrenamiento** — 4 objetivos (fuerza, cardio, pérdida, tono) × 3 niveles (principiante, intermedio, avanzado), con progresión semanal automática de carga y repeticiones.
- **Rutina activa** — temporizadores de sets y descansos, dificultad configurable, vibración y sonido opcionales.
- **Demo visual** — animaciones SVG de cada ejercicio antes de entrenar.
- **Nutrición personalizada** — cálculo de TDEE, macros (proteína, carbos, grasas), hidratación diaria y menú semanal según objetivo y dieta (general / vegana).
- **Snack del día** — recomendación de snack pre/post entrenamiento según tipo de estímulo dominante del plan.
- **Lista de compra semanal** — agrega ingredientes por categoría con cantidades totales en gramos/kg, copiable al portapapeles.
- **Historial y peso** — gráfica de evolución de peso y registro de sesiones anteriores.
- **Calendario semanal** — marca días de entrenamiento, recuperación y descanso.
- **Recordatorio diario** — notificación push a la hora elegida (requiere permiso de notificaciones).
- **Tema día/noche** — persiste entre sesiones.
- **Exportar / Importar** — backup cifrado del estado completo (AES-256-GCM).
- **i18n** — soporte español/inglés, idioma por defecto: español.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| UI | React 18, TypeScript |
| Build | Vite 5 |
| PWA | vite-plugin-pwa (Workbox) |
| Estado | React Context + useReducer |
| Formularios | react-hook-form + Zod |
| Animaciones | Framer Motion |
| Gráficas | Recharts |
| Notificaciones | react-hot-toast |
| i18n | i18next + react-i18next |
| Tests | Vitest + Testing Library |
| Linting | ESLint + Prettier |

---

## Estructura de directorios

```
src/
├── main.tsx                 # Bootstrap, AppProvider, error boundary
├── types.ts                 # Todos los tipos e interfaces TypeScript
├── components/
│   ├── Dashboard.tsx        # Pantalla principal (objetivo, nutrición, dieta, peso)
│   ├── ActiveWorkout.tsx    # Sesión activa con sets/reps y temporizadores
│   ├── PlansView.tsx        # Selección de plan y días de entrenamiento
│   ├── WorkoutDemo.tsx      # Preview SVG animado de ejercicios
│   ├── Summary.tsx          # Resumen al finalizar sesión
│   ├── History.tsx          # Historial + gráfica de peso
│   ├── Onboarding.tsx       # Creación / edición de perfil
│   ├── NavBar.tsx           # Barra de navegación inferior
│   ├── Illustrations.tsx    # Ilustraciones SVG por objetivo
│   ├── PageTransition.tsx   # Animaciones de transición entre pantallas
│   ├── ProgressBar.tsx      # Barra de progreso reutilizable
│   └── Skeleton.tsx         # Placeholder de carga
├── domain/
│   ├── data.ts              # Ejercicios, planes y calendario por defecto
│   ├── workout.ts           # Lógica de sesión activa y progresión de carga
│   ├── planning.ts          # Cálculo de TDEE, macros e hidratación
│   ├── mealData.ts          # Menús semanales, snacks y lista de compra
│   └── __tests__/           # Tests unitarios de dominio
├── state/
│   ├── AppContext.tsx        # Context + hooks useAppState / useAppDispatch
│   └── appReducer.ts        # Reducer centralizado con todas las acciones
├── storage/
│   ├── appStorage.ts        # Lectura/escritura en window.storage con migración legacy
│   ├── crypto.ts            # Cifrado AES-256-GCM para exportar/importar datos
│   └── notifications.ts     # Gestión de permisos y recordatorio diario
├── hooks/
│   └── useIsMobile.ts       # Detecta viewport mobile
├── i18n/
│   ├── es.json              # Traducciones español
│   ├── en.json              # Traducciones inglés
│   └── index.ts             # Configuración i18next
└── theme/
    ├── tokens.ts            # Variables de color por tema (dark/light)
    ├── styles.ts            # Helpers de estilos inline reutilizables
    └── fonts.ts             # Tipografías
```

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo (localhost:5173)
npm run build        # Build de producción en /dist
npm run preview      # Preview local del build
npm run test         # Ejecuta todos los tests (Vitest)
npm run test:watch   # Tests en modo watch
npm run lint         # ESLint (0 warnings tolerados)
npm run format       # Prettier sobre src/**/*.{ts,tsx}
```

---

## Flujo de pantallas

```
Onboarding ──────────────────────────┐
                                      ↓
                                  Dashboard ←──────────────────┐
                                      │                         │
                              ┌───────┴───────┐                 │
                              ↓               ↓                 │
                           Plans           History              │
                              │                                  │
                              ↓                                  │
                            Demo                                 │
                              │                                  │
                              ↓                                  │
                           Active                                │
                              │                                  │
                              ↓                                  │
                           Summary ──────────────────────────────┘
```

| Pantalla | `Screen` key | Descripción |
|---|---|---|
| Onboarding | `onboarding` | Crear o editar perfil de usuario |
| Dashboard | `dashboard` | Resumen, nutrición, dieta y peso |
| Planes | `plans` | Selección de plan y días |
| Demo | `demo` | Preview animado del entrenamiento |
| Activo | `active` | Sesión con cronómetro y sets |
| Resumen | `summary` | Resultado al finalizar |
| Historial | `history` | Sesiones pasadas y gráfica de peso |

---

## Modelo de datos principal

### `UserProfile`
```typescript
{
  id: string;
  name: string;
  weight: number;           // kg
  height: number;           // cm
  waistCm?: number | "";
  bodyFat: number | "";     // %
  age: number;
  gender: "masculino" | "femenino";
  goal: "fuerza" | "cardio" | "perdida" | "tono";
  dietPreference: "general" | "vegana";
}
```

### `WorkoutResult` (sesión guardada)
```typescript
{
  workout: Workout;
  planLevel: number;
  difficulty: "ligero" | "normal" | "intenso";
  duration: number;         // segundos
  calories: number;
  date: string;             // ISO
}
```

### `NutritionPlan` (calculado en planning.ts)
```typescript
{
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  hydration: number;        // ml/día
  dominantStimulus: "fuerza" | "cardio" | "mixto";
  focus: string;
}
```

### `WeeklyShoppingItem` (lista de compra)
```typescript
{
  name: string;
  totalGrams: number;
  totalKcal: number;
  appearances: number;
  category: ShoppingCategory; // "Proteínas animales" | "Lácteos y huevos" | ...
}
```

---

## Estado global (`AppReducerState`)

```typescript
{
  profiles: UserProfile[];
  activeProfileId: string | null;
  historyByProfile:        Record<string, WorkoutResult[]>;
  weeklyCalendarByProfile: Record<string, WeeklyCalendar>;
  customExercisesByProfile: Record<string, ExerciseId[]>;
  weightLogByProfile:      Record<string, WeightEntry[]>;
  activeWorkout: ActiveWorkoutState | null;
  workoutResult: WorkoutResult | null;
  themeMode: "dark" | "light";
}
```

---

## Persistencia y seguridad

- Los datos se guardan en `window.storage` con las claves `irontrack-*`.
- La migración desde el formato legacy (perfil único) se realiza automáticamente en `appStorage.ts`.
- La exportación de datos usa **AES-256-GCM** con clave derivada por **PBKDF2** (100 000 iteraciones, SHA-256) — ver `src/storage/crypto.ts`.

---

## Nutrición y dieta

La función `buildNutritionPlan` en `planning.ts` calcula:

1. **TDEE** (Harris-Benedict + factor actividad según objetivo y nivel del plan)
2. **Macros** según `dominantStimulus` (fuerza → +proteína; cardio → +carbos; mixto → equilibrado)
3. **Hidratación** = `peso × 35 ml + (minutos semanales / 7) × 12 ml + ratio HIIT × 350 ml`

El menú semanal (`mealData.ts`) genera 7 días con slots (desayuno, almuerzo, merienda, cena) adaptados al objetivo y preferencia dietética.

---

## Tests

```bash
npm run test
```

Cobertura en:
- `src/domain/__tests__/planning.test.ts` — cálculos de TDEE y macros
- `src/domain/__tests__/workout.test.ts` — progresión de carga
- `src/components/__tests__/` — componentes NavBar, Onboarding, ProgressBar

---

## Despliegue

La app está configurada para **Vercel** (`vercel.json`) con rewrite de rutas al `index.html`. El build genera un Service Worker (Workbox) para funcionamiento offline e instalación como PWA.

```bash
npm run build   # → dist/
```
Si no existe (entorno browser normal), se crea un wrapper sobre `localStorage` en `src/main.jsx`.

## Claves actuales
- `irontrack-profiles`
- `irontrack-active-profile`
- `irontrack-history-by-profile`
- `irontrack-weekly-calendar-by-profile`
- `irontrack-theme-mode`

## Migracion legacy
Si no existe multiperfil, se intenta migrar desde:
- `irontrack-user`
- `irontrack-history`

## 5. Logica de entrenamiento

## Planes
`PLANS` define 3 niveles:
- Nivel 0: Principiante
- Nivel 1: Intermedio
- Nivel 2: Avanzado

Cada nivel tiene 3 dias (`A`, `B`, `C`) y cada dia define ejercicios con:
- `id`
- `sets`
- `reps` (o segundos si `isTime`)
- `rest`

## Dificultad
`DIFFICULTY` escala sets/reps/rest:
- ligero
- normal
- intenso

La funcion `scaleWorkout()` aplica este escalado antes de ejecutar la rutina.

## Progresion profesional
`applyProfessionalProgression()` agrega cargas para ejercicios compatibles en intermedio/avanzado.
Ajusta segun sexo biologico para estimar `loadKg`.

## Calorias
`calcCalories()` usa MET + perfil + duracion para estimar gasto calorico.

## 6. Objetivo, nutricion y dieta

## Objetivo
`buildObjective(user, planLevel)` calcula:
- fase de trabajo
- horizonte en semanas
- peso objetivo
- grasa objetivo (si existe dato)
- bandera de modo profesional

## Nutricion
`buildNutritionPlan(user, planLevel, weeklyWorkouts)` calcula:
- calorias objetivo
- proteina
- carbohidratos
- grasas
- foco nutricional
- hidratacion recomendada

Base: BMR (Mifflin-St Jeor) + factor de actividad + ajuste por objetivo.

## Dieta semanal ejemplo
`MEAL_WEEKLY_TEMPLATES` contiene semanas por objetivo:
- fuerza
- cardio
- perdida
- tono

Cada objetivo incluye semanas omni y vegana.
`adaptMealWeekByCalories()` ajusta texto de porciones segun tier calorico:
- low
- mid
- high

## 7. Tema dia/noche

## Sistema de tema
- `THEMES.dark` y `THEMES.light`
- Inyeccion de tokens via CSS variables en el contenedor raiz
- Persistencia en `irontrack-theme-mode`

## Ajustes recientes de UI
- Switch pequeno para cambiar tema (menos invasivo)
- En modo dia se oscurecieron verdes en zonas especificas para legibilidad
- En dashboard, el bloque "Progreso al siguiente nivel" tiene texto negro y barra gris en modo dia

## 8. Componentes principales

- `NavBar`: navegacion inferior
- `Onboarding`: alta/edicion de perfil
- `Dashboard`: resumen principal + objetivo + nutricion + dieta + calendario
- `PlansView`: planes y detalle de ejercicios
- `WorkoutDemo`: previsualizacion antes de iniciar
- `ActiveWorkout`: ejecucion guiada del entrenamiento
- `Summary`: cierre de sesion
- `History`: historico y records

## 9. Figuras y animaciones de ejercicios

- `CharacterFigure` dibuja cuerpo articulado (coordenadas de joints)
- `humanExercise()` define poses y transiciones por ejercicio
- `ILLUS` mapea `exerciseId -> render de figura`

Objetivo: visuales coherentes por biomecanica (sin segmentos extra innecesarios).

## 10. Convenciones para seguir desarrollando

## Recomendaciones de cambios
- Mantener cambios visuales por tema usando `themeMode` y CSS vars
- Evitar hardcodes de color cuando exista token de tema
- Para textos en espanol, evitar mojibake (guardar UTF-8)
- Ejecutar `npm run build` despues de cada bloque de cambios

## Si agregas un nuevo ejercicio
1. Agregarlo en `EXDB`
2. Agregar poses en `humanExercise()`
3. Referenciarlo en algun plan (`PLANS`)
4. Si aplica, incluirlo en `LOADABLE_EX`
5. Revisar calculo de calorias y visualizacion de reps/sets

## Si agregas un nuevo estado del calendario
1. Extender `DAY_STATE_ORDER`
2. Extender `DAY_STATE_META` y `DAY_STATE_META_LIGHT`
3. Validar transicion en `onCycleDayState`

## 11. Troubleshooting rapido

## La app no carga
- Revisar consola de navegador
- `src/main.jsx` incluye ErrorBoundary y fallback fatal
- Validar que exista `#root` en `index.html`

## No persiste informacion
- Verificar permisos de localStorage
- Revisar formato JSON guardado en claves `irontrack-*`

## Colores raros o texto ilegible
- Revisar tokens de `THEMES`
- Revisar ramas condicionales por `themeMode`
- Evitar reemplazos globales de `S.accent` sin filtro por contexto

## 12. Backups

Existe una copia de seguridad creada en:
- `backup-20260402-074927/`

Contenido actual del backup:
- `GymProgressApp.jsx`
- `main.jsx`
- `package.json`

## 13. Mejoras futuras sugeridas

- Extraer `GymProgressApp.jsx` en modulos (`components/`, `domain/`, `theme/`, `storage/`)
- Migrar estilos inline a un sistema de estilos mas mantenible
- Agregar tests unitarios a calculos (`buildObjective`, `buildNutritionPlan`, `calcCalories`)
- Agregar validaciones de formulario mas estrictas
- Internacionalizacion (es/en) y control centralizado de textos
