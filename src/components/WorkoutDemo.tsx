import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { S } from "../theme/styles";
import { EXDB } from "../domain/data";
import { applyProfessionalProgression } from "../domain/workout";
import { ILLUS } from "./Illustrations";
import type { Workout, WorkoutExercise, ExerciseId, UserProfile } from "../types";

interface WorkoutDemoProps {
  workout: Workout;
  planLevel: number;
  onStartNow: (customWorkout?: Workout) => void;
  onBack: () => void;
  user: UserProfile;
  savedExtraIds?: ExerciseId[];
  onSaveExtraIds?: (ids: ExerciseId[]) => void;
}

export function WorkoutDemo({ workout, planLevel, onStartNow, onBack, user, savedExtraIds = [], onSaveExtraIds }: WorkoutDemoProps) {
  const [left, setLeft] = useState(30);
  const [idx, setIdx] = useState(0);
  const [selectedExtraId, setSelectedExtraId] = useState<ExerciseId>("squat");
  const [extraExercises, setExtraExercises] = useState<WorkoutExercise[]>([]);
  const startedRef = useRef(false);

  const buildExtraExercise = useCallback((id: ExerciseId): WorkoutExercise => {
    const byExercise: Partial<Record<ExerciseId, Omit<WorkoutExercise, "id">>> = {
      plank: { sets:3, reps:30, rest:45, isTime:true },
      burpee: { sets:3, reps:10, rest:60 },
      jumpingjack: { sets:3, reps:30, rest:30 },
      mtnclimber: { sets:3, reps:24, rest:45 },
    };
    const defaults = byExercise[id] || { sets:3, reps:12, rest:45 };
    return { id, ...defaults, custom:true } as WorkoutExercise;
  }, []);

  useEffect(() => {
    const normalized = (savedExtraIds || []).filter(id => EXDB[id as keyof typeof EXDB]);
    setExtraExercises(normalized.map(id => buildExtraExercise(id as ExerciseId)));
  }, [savedExtraIds, buildExtraExercise]);

  const workoutWithExtras = useMemo(
    () => ({ ...workout, exercises: [...workout.exercises, ...extraExercises] }),
    [workout, extraExercises]
  );

  const demoWorkout = useMemo(() => applyProfessionalProgression(workoutWithExtras, planLevel, user), [workoutWithExtras, planLevel, user]);

  useEffect(() => {
    const t = setInterval(() => setLeft(v => Math.max(0, v-1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx(v => (v+1) % demoWorkout.exercises.length), 2500);
    return () => clearInterval(t);
  }, [demoWorkout.exercises.length]);

  useEffect(() => {
    if (left === 0 && !startedRef.current) {
      startedRef.current = true;
      onStartNow(workoutWithExtras);
    }
  }, [left, onStartNow, workoutWithExtras]);

  const ex = demoWorkout.exercises[idx];
  const info = EXDB[ex.id];
  const Illus = ILLUS[ex.id];

  return (
    <div style={{ ...S.container, paddingTop:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:S.muted, cursor:"pointer", fontSize:14, fontFamily:"'DM Sans',sans-serif" }}>← Volver</button>
        <div style={{ fontFamily:"'DM Mono',monospace", color:S.accent, fontSize:16 }}>Demo {left}s</div>
      </div>
      <div style={{ ...S.card, marginBottom:16, background:"var(--card-demo-bg)", border:"1px solid #c8ff002f" }}>
        <h2 style={{ ...S.heading, fontSize:28, margin:"0 0 4px" }}>VISTA PREVIA DEL ENTRENO</h2>
        <p style={{ fontSize:13, color:S.muted, margin:0 }}>{workout.focus} - Revision rapida de tecnica y ritmo.</p>
      </div>
      <div style={{ background:"var(--surface-soft)", borderRadius:20, padding:20, marginBottom:16, display:"flex", justifyContent:"center", height:220, alignItems:"center", overflow:"hidden" }}>
        {Illus ? Illus(S.accent, user?.gender || "masculino") : null}
      </div>
      <div style={{ ...S.card, marginBottom:16, padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{info.name}</div>
            <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{ex.sets}x{ex.reps}{ex.isTime ? "s" : ""} - desc {ex.rest}s{ex.loadKg ? ` - ${ex.loadKg}kg` : ""}</div>
          </div>
          <span style={S.pill(S.accent)}>{idx+1}/{demoWorkout.exercises.length}</span>
        </div>
      </div>
      <div style={{ ...S.card, marginBottom:16, padding:"14px 16px", background:"var(--surface-soft)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:10, flexWrap:"wrap" }}>
          <span style={S.pill("#7de8b8")}>EXTRAS OPCIONALES</span>
          <span style={{ fontSize:11, color:S.muted }}>Anade ejercicios antes de iniciar</span>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <select
            value={selectedExtraId}
            onChange={e => setSelectedExtraId(e.target.value as ExerciseId)}
            style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text-main)", borderRadius:10, padding:"9px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:12, minWidth:180 }}
          >
            {(Object.entries(EXDB) as [ExerciseId, { name: string }][]).map(([id, info]) => (
              <option key={id} value={id}>{info.name}</option>
            ))}
          </select>
          <button
            onClick={() => setExtraExercises(prev => {
              if (prev.some(ex => ex.id === selectedExtraId)) return prev;
              return [...prev, buildExtraExercise(selectedExtraId)];
            })}
            style={{ ...S.btn("var(--inactive-btn-bg)","var(--text-main)"), padding:"8px 12px", fontSize:12, border:"1px solid var(--border-main)" }}
          >
            + Anadir ejercicio
          </button>
          <button
            onClick={() => onSaveExtraIds && onSaveExtraIds(extraExercises.map(ex => ex.id))}
            style={{ ...S.btn("var(--surface-inner)","var(--text-main)"), padding:"8px 12px", fontSize:12, border:"1px solid var(--border-main)" }}
          >
            Guardar extras del perfil
          </button>
        </div>
        {extraExercises.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:10 }}>
            {extraExercises.map((extra, extraIdx) => (
              <div key={`${extra.id}-${extraIdx}`} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--surface-inner)", border:"1px solid var(--border-main)", borderRadius:10, padding:"8px 10px" }}>
                <div style={{ fontSize:12 }}>{EXDB[extra.id]?.name} · {extra.sets}x{extra.reps}{extra.isTime ? "s" : ""}</div>
                <button
                  onClick={() => setExtraExercises(prev => prev.filter((_, i) => i !== extraIdx))}
                  style={{ background:"none", border:"none", color:"#ff7f7f", cursor:"pointer", fontSize:12 }}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
        {demoWorkout.exercises.map((item, i) => {
          const active = i === idx;
          return (
            <div key={i} style={{ ...S.card, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", border:active ? `1px solid ${S.accent}` : "1px solid var(--border-main)", background:active ? "var(--surface-soft)" : "var(--surface-inner)" }}>
              <div style={{ fontSize:13 }}>{EXDB[item.id].name}{item.custom ? " · extra" : ""}</div>
              <div style={{ fontSize:11, color:S.muted }}>{item.sets}x{item.reps}{item.isTime ? "s" : ""}{item.loadKg ? ` - ${item.loadKg}kg` : ""}</div>
            </div>
          );
        })}
      </div>
      <button onClick={() => onStartNow(workoutWithExtras)} style={{ ...S.btn(S.accent), width:"100%", justifyContent:"center", fontSize:16, padding:16 }}>
        Empezar ahora
      </button>
    </div>
  );
}
