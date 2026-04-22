import React from "react";
import { useTranslation } from "react-i18next";
import { S } from "../theme/styles";
import { EXDB, getPlansForGoal, translateExerciseName, translateExerciseMuscle, translateWorkoutFocus, translatePlanName, translatePlanWeeks } from "../domain/data";
import { applyProfessionalProgression } from "../domain/workout";
import { ILLUS } from "./Illustrations";
import type { UserProfile, Workout, ThemeMode } from "../types";

interface PlansViewProps {
  onStartWorkout: (w: Workout, level: number) => void;
  user: UserProfile;
  themeMode: ThemeMode;
}

export function PlansView({ onStartWorkout, user, themeMode }: PlansViewProps) {
  const { t, i18n } = useTranslation();
  const planAccent = themeMode === "light" ? "#2b6500" : S.accent;
  const plans = getPlansForGoal(user.goal);
  return (
    <div style={{ ...S.container, paddingTop:32 }}>
      <h1 style={{ ...S.heading, fontSize:36, margin:"0 0 24px" }}>{t("plans.title")}</h1>
      {plans.map((plan, pi) => (
        <div key={pi} style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <div style={{ ...S.heading, fontSize:40, color:planAccent, lineHeight:1 }}>{pi+1}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:18 }}>{translatePlanName(plan.name, i18n.language)}</div>
              <span style={S.pill(planAccent)}>{translatePlanWeeks(plan.weeks, i18n.language)}</span>
            </div>
          </div>
          {plan.workouts.map((w, wi) => {
            const profW = applyProfessionalProgression(w, pi, user);
            return (
              <div key={wi} style={{ ...S.card, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div>
                    <div style={{ fontWeight:600 }}>{t("plans.day")} {w.day} - {translateWorkoutFocus(w.focus, i18n.language)}</div>
                    <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{w.exercises.length} {t("plans.exercises")}</div>
                  </div>
                  <button onClick={() => onStartWorkout(w, pi)} style={{ ...S.btn(S.accent), fontSize:13, padding:"9px 18px" }}>{t("plans.start")}</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {profW.exercises.map((ex, ei) => {
                    const info = EXDB[ex.id];
                    const Illus = ILLUS[ex.id];
                    return (
                      <div key={ei} style={{ display:"flex", alignItems:"center", gap:12, background:"var(--surface-inner)", borderRadius:10, padding:"10px 12px" }}>
                        <div style={{ width:56, height:40, flexShrink:0 }}>{Illus ? Illus(planAccent, user?.gender || "masculino") : null}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600 }}>{translateExerciseName(ex.id, i18n.language)}</div>
                          <div style={{ fontSize:11, color:S.muted }}>{translateExerciseMuscle(ex.id, i18n.language)}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:planAccent }}>{ex.sets}x{ex.reps}{ex.isTime ? "s" : ""}</div>
                          <div style={{ fontSize:11, color:S.muted }}>{t("plans.rest")} {ex.rest}s{ex.loadKg ? ` - ${ex.loadKg}kg` : ""}</div>
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
