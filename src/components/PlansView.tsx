import React from "react";
import { S } from "../theme/styles";
import { EXDB, getPlansForGoal } from "../domain/data";
import { applyProfessionalProgression } from "../domain/workout";
import { ILLUS } from "./Illustrations";
import type { UserProfile, Workout, ThemeMode } from "../types";

interface PlansViewProps {
  onStartWorkout: (w: Workout, level: number) => void;
  user: UserProfile;
  themeMode: ThemeMode;
}

export function PlansView({ onStartWorkout, user, themeMode }: PlansViewProps) {
  const planAccent = themeMode === "light" ? "#2b6500" : S.accent;
  const plans = getPlansForGoal(user.goal);
  return (
    <div style={{ ...S.container, paddingTop:32 }}>
      <h1 style={{ ...S.heading, fontSize:36, margin:"0 0 24px" }}>PLANES DE<br/>ENTRENAMIENTO</h1>
      {plans.map((plan, pi) => (
        <div key={pi} style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <div style={{ ...S.heading, fontSize:40, color:planAccent, lineHeight:1 }}>{pi+1}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:18 }}>{plan.name}</div>
              <span style={S.pill(planAccent)}>{plan.weeks}</span>
            </div>
          </div>
          {plan.workouts.map((w, wi) => {
            const profW = applyProfessionalProgression(w, pi, user);
            return (
              <div key={wi} style={{ ...S.card, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div>
                    <div style={{ fontWeight:600 }}>Dia {w.day} - {w.focus}</div>
                    <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{w.exercises.length} ejercicios</div>
                  </div>
                  <button onClick={() => onStartWorkout(w, pi)} style={{ ...S.btn(S.accent), fontSize:13, padding:"9px 18px" }}>Iniciar</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {profW.exercises.map((ex, ei) => {
                    const info = EXDB[ex.id];
                    const Illus = ILLUS[ex.id];
                    return (
                      <div key={ei} style={{ display:"flex", alignItems:"center", gap:12, background:"var(--surface-inner)", borderRadius:10, padding:"10px 12px" }}>
                        <div style={{ width:56, height:40, flexShrink:0 }}>{Illus ? Illus(planAccent, user?.gender || "masculino") : null}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600 }}>{info.name}</div>
                          <div style={{ fontSize:11, color:S.muted }}>{info.muscle}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:planAccent }}>{ex.sets}x{ex.reps}{ex.isTime ? "s" : ""}</div>
                          <div style={{ fontSize:11, color:S.muted }}>desc {ex.rest}s{ex.loadKg ? ` - ${ex.loadKg}kg` : ""}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
