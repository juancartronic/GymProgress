# Gym Progress App

Aplicacion web de entrenamiento personal hecha con React + Vite.

Incluye:
- Onboarding y edicion de perfil
- Multiperfil con historial independiente
- Planes por nivel (principiante/intermedio/avanzado)
- Demo visual de ejercicios y rutina activa con temporizadores
- Resumen de sesion y historial
- Objetivo fisico, nutricion y dieta semanal ejemplo
- Calendario semanal de estados
- Tema dia/noche con persistencia

## 1. Stack y estructura

## Stack
- React 18
- Vite 5
- JavaScript (un solo archivo de dominio principal)

## Archivos principales
- `GymProgressApp.jsx`: logica completa de negocio y UI
- `src/main.jsx`: bootstrap, error boundary y carga dinamica de la app
- `package.json`: scripts y dependencias

## Scripts
- `npm run dev`: entorno local
- `npm run build`: build de produccion
- `npm run preview`: preview del build

## 2. Flujo de pantallas

La app usa una maquina de estados simple con `screen`:
- `onboarding`: creacion inicial de perfil
- `profile-form`: editar/crear perfil desde dashboard
- `dashboard`: pantalla principal con progreso, objetivo, nutricion y dieta
- `plans`: lista de planes y dias de entrenamiento
- `demo`: previsualizacion corta del entrenamiento
- `active`: sesion activa por sets/reps y descansos
- `summary`: resultado al finalizar
- `history`: historial de entrenamientos

Transiciones relevantes:
- Onboarding valido -> Dashboard
- Dashboard/Plans -> Demo -> Active -> Summary -> Dashboard
- Dashboard -> Profile Form -> Dashboard

## 3. Modelo de datos

## Perfil
Cada perfil contiene:
- `id`
- `name`
- `weight`
- `height`
- `bodyFat`
- `age`
- `gender`
- `goal`
- `dietPreference`

## Historial por perfil
`historyByProfile[profileId]` guarda un array de sesiones con:
- fecha
- duracion
- calorias
- dificultad
- workout (estructura del entrenamiento)
- progreso de sets completados

## Calendario por perfil
`weeklyCalendarByProfile[profileId]` guarda el estado por dia:
- `entreno`
- `recuperacion`
- `descanso`

## 4. Persistencia

La app persiste en `window.storage`.
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
