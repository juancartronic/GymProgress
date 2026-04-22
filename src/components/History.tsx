import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { S } from "../theme/styles";
import { EXDB, DIFFICULTY, getLevelName, translateExerciseName, translateWorkoutFocus, getLevelNameI18n, translateDifficultyLabel } from "../domain/data";
import { weekStartIso, fmtDate, exLoad } from "../domain/workout";
import { ProgressBar } from "./ProgressBar";
import type { WorkoutResult, UserProfile } from "../types";

interface HistoryProps {
  history: WorkoutResult[];
  user: UserProfile;
}

export function History({ history, user }: HistoryProps) {
  const { t, i18n } = useTranslation();
  const totalCals = history.reduce((s, e) => s + e.calories, 0);
  const totalMins = history.reduce((s, e) => s + e.duration, 0);
  const weekly: Record<string, { minutes: number; calories: number; volume: number; sessions: number }> = {};
  const records: Record<string, number> = {};
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
      <h1 style={{ ...S.heading, fontSize:36, margin:"0 0 6px" }}>{t("history.title")}</h1>
      <p style={{ color:S.muted, margin:"0 0 24px", fontSize:13 }}>{t("history.recorded", { count: history.length })}</p>
      {history.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
          {[
            { label: t("history.totalKcal"), value: totalCals > 9999 ? `${(totalCals/1000).toFixed(1)}k` : totalCals },
            { label: t("history.minutes"), value: totalMins },
            { label: t("history.workoutsLabel"), value: history.length },
          ].map(s => (
            <div key={s.label} style={{ ...S.card, textAlign:"center", padding:"14px 6px", minWidth:0, overflow:"hidden" }}>
              <div style={{ ...S.heading, fontSize:"clamp(18px, 6vw, 26px)", color:S.accent, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:10, color:S.muted, marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {history.length === 0 ? (
        <div style={{ textAlign:"center", paddingTop:60 }}>
          <p style={{ color:S.muted }}>{t("history.empty")}</p>
        </div>
      ) : (
        <>
          <div style={{ ...S.card, marginBottom:12, padding:"14px 14px" }}>
            <h3 style={{ ...S.heading, fontSize:16, margin:"0 0 8px", color:S.muted }}>{t("history.weeklyVolume")}</h3>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={weeklyRows.map(([k, v]) => ({ week: fmtDate(k).split(" ")[0], volume: v.volume, calories: v.calories }))}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#888" }} />
                <Bar dataKey="volume" fill="#c8ff00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize:11, color:S.muted, margin:"8px 0 0" }}>{t("history.volumeNote")}</p>
          </div>
          <div style={{ ...S.card, marginBottom:12, padding:"14px 14px" }}>
            <h3 style={{ ...S.heading, fontSize:16, margin:"0 0 10px", color:S.muted }}>{t("history.records")}</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {recordRows.map(([id, load]) => (
                <div key={id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--surface-inner)", borderRadius:10, padding:"9px 10px" }}>
                  <span style={{ fontSize:13 }}>{translateExerciseName(id, i18n.language)}</span>
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
                  <div style={{ fontWeight:600, fontSize:14 }}>{translateWorkoutFocus(h.workout.focus, i18n.language)}</div>
                  <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{fmtDate(h.date)} - {getLevelNameI18n(h.planLevel, i18n.language)} - {translateDifficultyLabel(h.difficulty || "normal", i18n.language)}</div>
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
