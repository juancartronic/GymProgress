import React from "react";
import { useTranslation } from "react-i18next";
import { S } from "../theme/styles";
import { EXDB, DIFFICULTY, getLevelName, translateExerciseName, translateWorkoutFocus, getLevelNameI18n, translateDifficultyLabel } from "../domain/data";
import { ILLUS } from "./Illustrations";
import type { WorkoutResult, UserProfile } from "../types";

interface SummaryProps {
  result: WorkoutResult;
  user: UserProfile;
  onContinue: () => void;
}

export function Summary({ result, user, onContinue }: SummaryProps) {
  const { t, i18n } = useTranslation();
  const { workout, planLevel, duration, calories, difficulty = "normal" } = result;
  return (
    <div style={{ ...S.container, paddingTop:40 }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <h1 style={{ ...S.heading, fontSize:44, margin:"0 0 8px", color:S.accent }}>{t("summary.completed")}</h1>
        <p style={{ color:S.muted, margin:0 }}>{translateWorkoutFocus(workout.focus, i18n.language)} - {getLevelNameI18n(planLevel, i18n.language)} - {translateDifficultyLabel(difficulty, i18n.language)}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        <div style={{ ...S.card, textAlign:"center", padding:"28px 12px", background:"var(--card-plan-bg)", overflow:"hidden" }}>
          <div style={{ ...S.heading, fontSize:"clamp(32px, 10vw, 56px)", color:S.accent, lineHeight:1 }}>{calories}</div>
          <div style={{ fontSize:13, color:S.muted, marginTop:4 }}>{t("summary.calories")}</div>
        </div>
        <div style={{ ...S.card, textAlign:"center", padding:"28px 12px", overflow:"hidden" }}>
          <div style={{ ...S.heading, fontSize:"clamp(32px, 10vw, 56px)", lineHeight:1 }}>{duration}</div>
          <div style={{ fontSize:13, color:S.muted, marginTop:4 }}>{t("summary.minutes")}</div>
        </div>
      </div>
      <div style={{ ...S.card, marginBottom:24 }}>
        <h3 style={{ ...S.heading, fontSize:16, margin:"0 0 14px", color:S.muted }}>{t("summary.exercisesCompleted")}</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {workout.exercises.map((ex, i) => {
            const info = EXDB[ex.id];
            const Illus = ILLUS[ex.id];
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:56, height:40, flexShrink:0, opacity:0.7 }}>{Illus ? Illus(S.accent, user?.gender || "masculino") : null}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{translateExerciseName(ex.id, i18n.language)}</div>
                  <div style={{ fontSize:11, color:S.muted }}>{ex.sets}x{ex.reps}{ex.isTime ? "s" : ` ${t("summary.reps")}`}</div>
                  <div style={{ fontSize:11, color:S.muted }}>{ex.sets}x{ex.reps}{ex.isTime ? "s" : ` ${t("summary.reps")}`}{ex.loadKg ? ` - ${ex.loadKg}kg` : ""}</div>
                </div>
                <div style={{ color:S.muted, fontSize:11 }}>{ex.sets}x{ex.reps}{ex.isTime ? "s" : ` ${t("summary.reps")}`}{ex.loadKg ? ` - ${ex.loadKg}kg` : ""}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...S.card, marginBottom:24, background:"var(--surface-soft)", borderColor:"#c8ff0020" }}>
        <p style={{ margin:0, fontSize:13, color:S.muted, lineHeight:1.6 }}>
          {t("summary.estimation", { weight: user.weight, height: user.height, duration })}
        </p>
      </div>
      <button onClick={onContinue} style={{ ...S.btn(S.accent), width:"100%", justifyContent:"center", fontSize:17, padding:18 }}>
        {t("summary.back")}
      </button>
    </div>
  );
}
