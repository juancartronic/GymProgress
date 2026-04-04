import React from "react";
import { S } from "../theme/styles.js";
import { EXDB, PLANS, DIFFICULTY } from "../domain/data.js";
import { weekStartIso, fmtDate, exLoad } from "../domain/workout.js";
import { ProgressBar } from "./ProgressBar.jsx";

export function History({ history, user }) {
  const totalCals = history.reduce((s, e) => s + e.calories, 0);
  const totalMins = history.reduce((s, e) => s + e.duration, 0);
  const weekly = {};
  const records = {};
  history.forEach(h => {
    const key = weekStartIso(h.date);
    if (!weekly[key]) weekly[key] = { minutes:0, calories:0, volume:0, sessions:0 };
    weekly[key].minutes += h.duration;
    weekly[key].calories += h.calories;
    weekly[key].sessions += 1;
    (h.workout?.exercises || []).forEach(ex => {
      const load = exLoad(ex);
      weekly[key].volume += load;
      records[ex.id] = Math.max(records[ex.id] || 0, load);
    });
  });
  const weeklyRows = Object.entries(weekly).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  const maxWeeklyVol = Math.max(...weeklyRows.map(([, v]) => v.volume), 1);
  const recordRows = Object.entries(records).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div style={{ ...S.container, paddingTop:32 }}>
      <h1 style={{ ...S.heading, fontSize:36, margin:"0 0 6px" }}>HISTORIAL</h1>
      <p style={{ color:S.muted, margin:"0 0 24px", fontSize:13 }}>{history.length} entreno{history.length !== 1 ? "s" : ""} registrado{history.length !== 1 ? "s" : ""}</p>
      {history.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
          {[
            { label:"Total kcal", value: totalCals > 9999 ? `${(totalCals/1000).toFixed(1)}k` : totalCals },
            { label:"Minutos", value: totalMins },
            { label:"Entrenos", value: history.length },
          ].map(s => (
            <div key={s.label} style={{ ...S.card, textAlign:"center", padding:"14px 8px" }}>
              <div style={{ ...S.heading, fontSize:26, color:S.accent, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:10, color:S.muted, marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {history.length === 0 ? (
        <div style={{ textAlign:"center", paddingTop:60 }}>
          <p style={{ color:S.muted }}>Aun no tienes entrenamientos registrados.</p>
        </div>
      ) : (
        <>
          <div style={{ ...S.card, marginBottom:12, padding:"14px 14px" }}>
            <h3 style={{ ...S.heading, fontSize:16, margin:"0 0 8px", color:S.muted }}>VOLUMEN SEMANAL</h3>
            <div style={{ display:"flex", alignItems:"end", gap:8, height:110 }}>
              {weeklyRows.map(([k, v]) => {
                const h = Math.max(8, Math.round((v.volume / maxWeeklyVol) * 92));
                return (
                  <div key={k} style={{ flex:1, textAlign:"center" }}>
                    <div style={{ height:h, background:"linear-gradient(180deg,#c8ff00,#84ad00)", borderRadius:"8px 8px 4px 4px" }} />
                    <div style={{ fontSize:9, color:S.muted, marginTop:6 }}>{fmtDate(k).split(" ")[0]}</div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize:11, color:S.muted, margin:"8px 0 0" }}>Carga = sets x reps/segundos por semana.</p>
          </div>
          <div style={{ ...S.card, marginBottom:12, padding:"14px 14px" }}>
            <h3 style={{ ...S.heading, fontSize:16, margin:"0 0 10px", color:S.muted }}>RECORDS PERSONALES</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {recordRows.map(([id, load]) => (
                <div key={id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--surface-inner)", borderRadius:10, padding:"9px 10px" }}>
                  <span style={{ fontSize:13 }}>{EXDB[id]?.name || id}</span>
                  <span style={{ fontSize:12, color:S.accent, fontFamily:"'DM Mono',monospace" }}>{load} pts</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[...history].reverse().map((h, i) => (
              <div key={i} style={{ ...S.card, display:"flex", gap:14, alignItems:"center" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:S.accent+"15", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>✓</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{h.workout.focus}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{fmtDate(h.date)} - {PLANS[h.planLevel]?.name} - {DIFFICULTY[h.difficulty || "normal"]?.label || "Normal"}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, color:S.accent }}>{h.calories} kcal</div>
                  <div style={{ fontSize:11, color:S.muted }}>{h.duration} min</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
