import React from "react";
import { S } from "../theme/styles.js";
import { EXDB, PLANS, DIFFICULTY } from "../domain/data.js";
import { ILLUS } from "./Illustrations.jsx";

export function Summary({ result, user, onContinue }) {
  const { workout, planLevel, duration, calories, difficulty = "normal" } = result;
  return (
    <div style={{ ...S.container, paddingTop:40 }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <h1 style={{ ...S.heading, fontSize:44, margin:"0 0 8px", color:S.accent }}>¡COMPLETADO!</h1>
        <p style={{ color:S.muted, margin:0 }}>{workout.focus} - {PLANS[planLevel].name} - {DIFFICULTY[difficulty]?.label || "Normal"}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        <div style={{ ...S.card, textAlign:"center", padding:"28px 12px", background:"var(--card-plan-bg)" }}>
          <div style={{ ...S.heading, fontSize:56, color:S.accent, lineHeight:1 }}>{calories}</div>
          <div style={{ fontSize:13, color:S.muted, marginTop:4 }}>kcal estimadas</div>
        </div>
        <div style={{ ...S.card, textAlign:"center", padding:"28px 12px" }}>
          <div style={{ ...S.heading, fontSize:56, lineHeight:1 }}>{duration}</div>
          <div style={{ fontSize:13, color:S.muted, marginTop:4 }}>minutos</div>
        </div>
      </div>
      <div style={{ ...S.card, marginBottom:24 }}>
        <h3 style={{ ...S.heading, fontSize:16, margin:"0 0 14px", color:S.muted }}>EJERCICIOS COMPLETADOS</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {workout.exercises.map((ex, i) => {
            const info = EXDB[ex.id];
            const Illus = ILLUS[ex.id];
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:56, height:40, flexShrink:0, opacity:0.7 }}>{Illus ? Illus(S.accent, user?.gender || "masculino") : null}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{info.name}</div>
                  <div style={{ fontSize:11, color:S.muted }}>{ex.sets}x{ex.reps}{ex.isTime ? "s" : " reps"}</div>
                  <div style={{ fontSize:11, color:S.muted }}>{ex.sets}x{ex.reps}{ex.isTime ? "s" : " reps"}{ex.loadKg ? ` - ${ex.loadKg}kg` : ""}</div>
                </div>
                <div style={{ color:S.muted, fontSize:11 }}>{ex.sets}x{ex.reps}{ex.isTime ? "s" : " reps"}{ex.loadKg ? ` - ${ex.loadKg}kg` : ""}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...S.card, marginBottom:24, background:"var(--surface-soft)", borderColor:"#c8ff0020" }}>
        <p style={{ margin:0, fontSize:13, color:S.muted, lineHeight:1.6 }}>
          Estimacion basada en MET - peso <strong style={{ color:"var(--text-main)" }}>{user.weight} kg</strong>
          {user.height ? <> - altura <strong style={{ color:"var(--text-main)" }}>{user.height} cm</strong></> : null}
          {" "}- duracion <strong style={{ color:"var(--text-main)" }}>{duration} min</strong>.
        </p>
      </div>
      <button onClick={onContinue} style={{ ...S.btn(S.accent), width:"100%", justifyContent:"center", fontSize:17, padding:18 }}>
        Volver al inicio
      </button>
    </div>
  );
}
