import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { S } from "../theme/styles";
import { EXDB, WEEK_DAYS, DAY_STATE_ORDER, DAY_STATE_META, DAY_STATE_META_LIGHT, getPlanForGoalAndLevel } from "../domain/data";
import { useIsMobile } from "../hooks/useIsMobile";
import { buildObjective, buildNutritionPlan } from "../domain/planning";
import { getWeeklyMealExamples, adaptMealWeekByCalories } from "../domain/mealData";
import { ProgressBar } from "./ProgressBar";
import { exportAppData, importAppData } from "../storage/appStorage";
import { requestNotificationPermission, scheduleWorkoutReminder } from "../storage/notifications";
import type { UserProfile, WorkoutResult, Workout, WeeklyCalendar, DayKey, ThemeMode, ExerciseId, AppState } from "../types";

interface DashboardProps {
  user: UserProfile;
  history: WorkoutResult[];
  profiles: UserProfile[];
  activeProfileId: string | null;
  onSwitchProfile: (id: string) => void;
  onAddProfile: () => void;
  onEditProfile: () => void;
  onDeleteProfile: () => void;
  onStartWorkout: (w: Workout, level: number) => void;
  weeklyCalendar: WeeklyCalendar;
  onCycleDayState: (dayKey: DayKey) => void;
  themeMode: ThemeMode;
  savedExtraIds?: ExerciseId[];
  onRemoveSavedExtra: (id: ExerciseId) => void;
  onClearSavedExtras: () => void;
  onImportData?: (state: AppState) => void;
}

export function Dashboard({
  user, history, profiles, activeProfileId,
  onSwitchProfile, onAddProfile, onEditProfile, onDeleteProfile,
  onStartWorkout, weeklyCalendar, onCycleDayState, themeMode,
  savedExtraIds = [], onRemoveSavedExtra, onClearSavedExtras, onImportData,
}: DashboardProps) {
  const isMobile = useIsMobile();
  const [mealWeekIdx, setMealWeekIdx] = useState(0);
  const [veganOnly, setVeganOnly] = useState(user?.dietPreference === "vegana");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboardAccent = themeMode === "light" ? "#2b6500" : S.accent;
  const totalWorkouts = history.length;
  const totalCals = history.reduce((s, e) => s + e.calories, 0);
  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const ds = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      if (history.some(h => h.date.slice(0, 10) === ds)) s++;
      else break;
    }
    return s;
  })();
  const currentLevel = Math.min(2, Math.floor(totalWorkouts / 12));
  const plan = getPlanForGoalAndLevel(user.goal, currentLevel) ?? getPlanForGoalAndLevel("fuerza", 0)!;
  const objective = buildObjective(user, currentLevel);
  const nutrition = buildNutritionPlan(user, currentLevel, totalWorkouts);
  const allMealWeeks = getWeeklyMealExamples(user?.goal);
  const filteredMealWeeks = veganOnly ? allMealWeeks.filter(w => w.type === "vegana") : allMealWeeks;
  const availableMealWeeks = filteredMealWeeks.length ? filteredMealWeeks : allMealWeeks;
  const selectedMealWeek = adaptMealWeekByCalories(availableMealWeeks[mealWeekIdx % availableMealWeeks.length], nutrition.calories);
  const progressToNext = Math.min(12, totalWorkouts - currentLevel * 12);

  useEffect(() => {
    setMealWeekIdx(0);
    setVeganOnly(user?.dietPreference === "vegana");
  }, [user?.goal, activeProfileId, user?.dietPreference]);

  return (
    <div style={{ ...S.container, paddingTop:32 }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ color:S.muted, margin:"0 0 4px", fontSize:13 }}>Hola,</p>
        <h1 style={{ ...S.heading, fontSize:38, margin:0 }}>{user.name.toUpperCase()}</h1>
        <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
          <select value={activeProfileId || ""} onChange={e => onSwitchProfile(e.target.value)}
            style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text-main)", borderRadius:10, padding:"10px 12px", fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name} - {p.gender}</option>)}
          </select>
          <button onClick={onAddProfile} style={{ ...S.btn("var(--surface-soft)","var(--text-main)"), padding:"10px 12px", fontSize:13, border:"1px solid var(--border-main)" }}>+ Perfil</button>
          <button onClick={onEditProfile} style={{ ...S.btn("var(--surface-soft)","var(--text-main)"), padding:"10px 12px", fontSize:13, border:"1px solid var(--border-main)" }}>Editar</button>
          <button onClick={onDeleteProfile} style={{ ...S.btn("var(--surface-soft)","#d94a4a"), padding:"10px 12px", fontSize:13, border:"1px solid var(--border-main)" }}>Eliminar</button>
          <button onClick={async()=>{
            const json=await exportAppData();
            const blob=new Blob([json],{type:"application/json"});
            const url=URL.createObjectURL(blob);
            const a=document.createElement("a");
            a.href=url;a.download=`irontrack-backup-${new Date().toISOString().slice(0,10)}.json`;
            a.click();URL.revokeObjectURL(url);
          }} style={{ ...S.btn("var(--surface-soft)","var(--text-main)"), padding:"10px 12px", fontSize:13, border:"1px solid var(--border-main)" }}>Exportar</button>
          <button onClick={()=>fileInputRef.current?.click()} style={{ ...S.btn("var(--surface-soft)","var(--text-main)"), padding:"10px 12px", fontSize:13, border:"1px solid var(--border-main)" }}>Importar</button>
          <button onClick={async()=>{
            const ok=await requestNotificationPermission();
            if(ok){ scheduleWorkoutReminder(18,0); toast.success("Recordatorio de entrenamiento activado (18:00)"); }
            else toast.error("Permisos de notificación denegados");
          }} style={{ ...S.btn("var(--surface-soft)","var(--text-main)"), padding:"10px 12px", fontSize:13, border:"1px solid var(--border-main)" }}>🔔 Recordatorio</button>
          <input ref={fileInputRef} type="file" accept=".json" style={{display:"none"}} onChange={e=>{
            const file=e.target.files?.[0];
            if(!file)return;
            const reader=new FileReader();
            reader.onload=async()=>{
              try{
                const state=await importAppData(reader.result as string);
                onImportData?.(state);
                toast.success("Datos importados correctamente");
              }catch(err){
                toast.error("Error al importar: "+(err instanceof Error?err.message:String(err)));
              }
            };
            reader.readAsText(file);
            e.target.value="";
          }}/>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: isMobile ? 6 : 10, marginBottom:24 }}>
        {[{ label:"Entrenos", value:totalWorkouts }, { label:"Racha", value:`${streak}d` }, { label:"Kcal", value:totalCals > 999 ? `${(totalCals/1000).toFixed(1)}k` : totalCals }].map(s => (
          <div key={s.label} style={{ ...S.card, padding: isMobile ? "12px 6px" : "16px 12px", textAlign:"center" }}>
            <div style={{ ...S.heading, fontSize: isMobile ? 22 : 28, color:S.accent, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize: isMobile ? 10 : 11, color:S.muted, marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.card, marginBottom:20, background:"var(--card-plan-bg)", border:"1px solid #c8ff0030" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <span style={S.pill(dashboardAccent)}>{plan.weeks}</span>
            <h2 style={{ ...S.heading, fontSize:28, margin:"8px 0 4px" }}>{plan.name.toUpperCase()}</h2>
            <p style={{ fontSize:13, color:S.muted, margin:0 }}>{plan.desc}</p>
          </div>
          <div style={{ ...S.heading, fontSize:52, color:dashboardAccent+"30", lineHeight:1 }}>{currentLevel+1}</div>
        </div>
        {currentLevel < 2 && <>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, color:themeMode === "light" ? "#111827" : S.muted }}>Progreso al siguiente nivel</span>
            <span style={{ fontSize:12, color:themeMode === "light" ? "#111827" : dashboardAccent, fontFamily:"'DM Mono',monospace" }}>{progressToNext}/12</span>
          </div>
          <ProgressBar value={progressToNext} max={12} color={themeMode === "light" ? "#b6c3d9" : S.accent} trackColor={themeMode === "light" ? "#e8edf6" : "#1e1e2e"} />
        </>}
      </div>
      <div style={{ ...S.card, marginBottom:20, background:"var(--card-obj-bg)", border:"1px solid #5db0ff30" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={S.pill("#62adff")}>OBJETIVO</span>
          <span style={{ fontSize:12, color:"var(--text-muted)" }}>{objective.horizonWeeks} semanas</span>
        </div>
        <h3 style={{ ...S.heading, fontSize:24, margin:"4px 0 8px" }}>{objective.phase.toUpperCase()}</h3>
        <p style={{ fontSize:13, color:S.muted, margin:"0 0 8px" }}>
          Peso objetivo: <strong style={{ color:"var(--text-main)" }}>{objective.targetWeight} kg</strong>
          {objective.targetFat !== null ? <> - Grasa objetivo: <strong style={{ color:"var(--text-main)" }}>{objective.targetFat}%</strong></> : null}
        </p>
        <p style={{ fontSize:12, color:S.muted, margin:0 }}>
          {objective.professional
            ? "Nivel superior desbloqueado: se anaden cargas con mancuernas y variantes profesionales."
            : "Al pasar a intermedio, se activara progresion de carga con mancuernas."}
        </p>
      </div>
      <div style={{ ...S.card, marginBottom:20, background:"var(--card-nut-bg)", border:"1px solid #ffb35a30" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={S.pill("#ffb35a")}>NUTRICION</span>
          <span style={{ fontSize:12, color:"var(--text-muted)" }}>{nutrition.calories} kcal/dia</span>
        </div>
        <p style={{ fontSize:12, color:"var(--text-muted)", margin:"0 0 8px" }}>{nutrition.focus}</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: isMobile ? 4 : 8, marginBottom:8 }}>
          <div style={{ background:"var(--surface-inner)", border:"1px solid #3a3022", borderRadius:10, padding: isMobile ? "8px 4px" : "8px 6px", textAlign:"center" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize: isMobile ? 12 : 14, color:"var(--data-val)" }}>{nutrition.protein}g</div>
            <div style={{ fontSize: isMobile ? 9 : 10, color:S.muted }}>Proteina</div>
          </div>
          <div style={{ background:"var(--surface-inner)", border:"1px solid #3a3022", borderRadius:10, padding: isMobile ? "8px 4px" : "8px 6px", textAlign:"center" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize: isMobile ? 12 : 14, color:"var(--data-val)" }}>{nutrition.carbs}g</div>
            <div style={{ fontSize: isMobile ? 9 : 10, color:S.muted }}>Carbohidratos</div>
          </div>
          <div style={{ background:"var(--surface-inner)", border:"1px solid #3a3022", borderRadius:10, padding: isMobile ? "8px 4px" : "8px 6px", textAlign:"center" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, color:"var(--data-val)" }}>{nutrition.fats}g</div>
            <div style={{ fontSize:10, color:S.muted }}>Grasas</div>
          </div>
        </div>
        <p style={{ fontSize:11, color:S.muted, margin:0 }}>Hidratacion objetivo: {nutrition.hydration} ml/dia (aprox.).</p>
      </div>
      <div style={{ ...S.card, marginBottom:20, padding: isMobile ? "14px 10px" : "20px", background:"var(--card-cal-bg)", border:"1px solid #50d0b030" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={S.pill("#50d0b0")}>CALENDARIO SEMANAL</span>
          <span style={{ fontSize:11, color:S.muted }}>Click para cambiar estado</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap: isMobile ? 3 : 6 }}>
          {WEEK_DAYS.map(d => {
            const state = weeklyCalendar?.[d.key] || "descanso";
            const meta = (themeMode === "light" ? DAY_STATE_META_LIGHT : DAY_STATE_META)[state];
            return (
              <button key={d.key} onClick={() => onCycleDayState(d.key)}
                style={{ border:`1px solid ${meta.border}`, background:meta.bg, color:meta.fg, borderRadius: isMobile ? 8 : 10, padding: isMobile ? "6px 2px" : "8px 4px", fontFamily:"'DM Sans',sans-serif", cursor:"pointer", minWidth:0, overflow:"hidden" }}>
                <div style={{ fontSize: isMobile ? 10 : 11, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.label}</div>
                <div style={{ fontSize: isMobile ? 7 : 9, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{meta.label}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ ...S.card, marginBottom:20, background:"var(--surface-soft)", border:"1px solid var(--border-main)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, gap:8, flexWrap:"wrap" }}>
          <span style={S.pill("#7de8b8")}>MIS EXTRAS</span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:11, color:S.muted }}>{savedExtraIds.length} guardado{savedExtraIds.length !== 1 ? "s" : ""}</span>
            {savedExtraIds.length > 0 && (
              <button onClick={onClearSavedExtras} style={{ ...S.btn("var(--inactive-btn-bg)","#ff8080"), padding:"7px 10px", fontSize:11, border:"1px solid var(--border-main)" }}>
                Limpiar
              </button>
            )}
          </div>
        </div>
        {savedExtraIds.length === 0 ? (
          <p style={{ margin:0, fontSize:12, color:S.muted }}>No hay extras guardados. Anadelos en la pantalla de demo antes de empezar el entreno.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {savedExtraIds.map(id => (
              <div key={id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--surface-inner)", border:"1px solid var(--border-main)", borderRadius:10, padding:"8px 10px" }}>
                <span style={{ fontSize:12 }}>{EXDB[id]?.name || id}</span>
                <button onClick={() => onRemoveSavedExtra(id)} style={{ background:"none", border:"none", color:"#ff8080", cursor:"pointer", fontSize:12 }}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ ...S.card, marginBottom:20, background:"var(--card-diet-bg)", border:"1px solid #ff857430" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={S.pill("#ff8574")}>DIETA SEMANAL EJEMPLO</span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, color:S.muted }}>{selectedMealWeek.title}</span>
            <button onClick={() => setMealWeekIdx(v => (v+1) % availableMealWeeks.length)} style={{ ...S.btn("var(--inactive-btn-bg)","var(--text-main)"), padding:"8px 10px", fontSize:12, border:"1px solid var(--border-main)" }}>
              Cambiar semana
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
          <button onClick={() => { setVeganOnly(false); setMealWeekIdx(0); }} style={{ ...S.btn(!veganOnly ? "#ff8574" : "var(--inactive-btn-bg)", !veganOnly ? "#080810" : "var(--text-muted)"), padding:"8px 10px", fontSize:12, border:"1px solid var(--border-main)" }}>
            Todas
          </button>
          <button onClick={() => { setVeganOnly(true); setMealWeekIdx(0); }} style={{ ...S.btn(veganOnly ? "#7de8b8" : "var(--inactive-btn-bg)", veganOnly ? "#08100d" : "var(--text-muted)"), padding:"8px 10px", fontSize:12, border:"1px solid var(--border-main)" }}>
            Solo vegana
          </button>
        </div>
        <p style={{ fontSize:11, color:"var(--text-muted)", margin:"0 0 10px" }}>
          {selectedMealWeek.type === "vegana" ? "Version vegana disponible en rotacion." : "Version omnivora de referencia."}
        </p>
        <p style={{ fontSize:11, color:S.muted, margin:"0 0 10px" }}>{selectedMealWeek.calorieLabel}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {selectedMealWeek.days.map(it => (
            <div key={it.day} style={{ background:"var(--surface-inner)", border:"1px solid #342422", borderRadius:10, padding:"9px 10px" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text-main)", marginBottom:3 }}>{it.day}</div>
              <div style={{ fontSize:11, color:S.muted, lineHeight:1.4 }}>{it.meals}</div>
            </div>
          ))}
        </div>
      </div>
      <h3 style={{ ...S.heading, fontSize:18, margin:"0 0 14px", color:S.muted }}>ENTRENAMIENTOS DE HOY</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {plan.workouts.map((w, i) => (
          <div key={i} style={{ ...S.card, display:"flex", alignItems:"center", gap:16, cursor:"pointer" }} onClick={() => onStartWorkout(w, currentLevel)}>
            <div style={{ width:48, height:48, borderRadius:12, background:S.accent+"15", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              {w.day}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:15 }}>Dia {w.day} - {w.focus}</div>
              <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{w.exercises.length} ejercicios</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
