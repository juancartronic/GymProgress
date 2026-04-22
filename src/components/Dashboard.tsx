import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { S } from "../theme/styles";
import { EXDB, WEEK_DAYS, DAY_STATE_ORDER, DAY_STATE_META, DAY_STATE_META_LIGHT, getPlanForGoalAndLevel, translateExerciseName, translateWorkoutFocus, translatePlanName, translatePlanDesc, translatePlanWeeks } from "../domain/data";
import { useIsMobile } from "../hooks/useIsMobile";
import { buildObjective, buildNutritionPlan } from "../domain/planning";
import { getWeeklyMealExamples, adaptMealWeekByNutrition, getDaySnackRecommendation, buildWeeklyShoppingList, translateFoodName, translateSlotLabel, translateCategory, translateWeekTitle } from "../domain/mealData";
import { ProgressBar } from "./ProgressBar";
import type { UserProfile, WorkoutResult, Workout, WeeklyCalendar, DayKey, ThemeMode, ExerciseId, AppState, WeightEntry } from "../types";

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
  weightLog: WeightEntry[];
  onLogWeight: (weight: number) => void;
}

export function Dashboard({
  user, history, activeProfileId,
  onStartWorkout, weeklyCalendar, onCycleDayState, themeMode,
  savedExtraIds = [], onRemoveSavedExtra, onClearSavedExtras,
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [mealWeekIdx, setMealWeekIdx] = useState(0);
  const [veganOnly, setVeganOnly] = useState(user?.dietPreference === "vegana");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showTodaySnack, setShowTodaySnack] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
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
  const weeklyTrainingDays = Object.values(weeklyCalendar || {}).filter((state) => state === "entreno").length || plan.workouts.length;
  const objective = buildObjective(user, currentLevel, i18n.language);
  const nutrition = buildNutritionPlan(user, currentLevel, weeklyTrainingDays, plan, i18n.language);
  const allMealWeeks = getWeeklyMealExamples(user?.goal, user?.gender);
  const filteredMealWeeks = veganOnly ? allMealWeeks.filter(w => w.type === "vegana") : allMealWeeks;
  const availableMealWeeks = filteredMealWeeks.length ? filteredMealWeeks : allMealWeeks;
  const selectedMealWeek = adaptMealWeekByNutrition(availableMealWeeks[mealWeekIdx % availableMealWeeks.length], nutrition, weeklyCalendar, i18n.language);
  const weeklyShoppingList = buildWeeklyShoppingList(selectedMealWeek);
  const totalShoppingGrams = weeklyShoppingList.reduce((sum, item) => sum + item.totalGrams, 0);
  const progressToNext = Math.min(12, totalWorkouts - currentLevel * 12);

  useEffect(() => {
    setMealWeekIdx(0);
    setVeganOnly(user?.dietPreference === "vegana");
  }, [user?.goal, activeProfileId, user?.dietPreference]);



  // Today's snack recommendation
  const todayJsDay = new Date().getDay(); // 0=dom,1=lun,...,6=sab
  const weekDayIndex = todayJsDay === 0 ? 6 : todayJsDay - 1; // convert to mon=0..sun=6
  const todayDayKey = WEEK_DAYS[weekDayIndex]?.key as import("../types").DayKey;
  const todayState = weeklyCalendar?.[todayDayKey] || "descanso";
  const todaySnack = getDaySnackRecommendation(todayState, nutrition.dominantStimulus, user.goal, i18n.language);
  const formatShoppingWeight = (grams: number) => (grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams} g`);

  return (
    <div style={{ ...S.container, paddingTop:32 }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ color:S.muted, margin:"0 0 4px", fontSize:13 }}>{t("dashboard.hello")}</p>
        <h1 style={{ ...S.heading, fontSize:38, margin:0 }}>{user.name.toUpperCase()}</h1>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: isMobile ? 6 : 10, marginBottom:24 }}>
        {[{ label:t("dashboard.workouts"), value:totalWorkouts }, { label:t("dashboard.streak"), value:`${streak}d` }, { label:t("dashboard.kcal"), value:totalCals > 999 ? `${(totalCals/1000).toFixed(1)}k` : totalCals }].map(s => (
          <div key={s.label} style={{ ...S.card, padding: isMobile ? "12px 6px" : "16px 12px", textAlign:"center" }}>
            <div style={{ ...S.heading, fontSize: isMobile ? 22 : 28, color:S.accent, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize: isMobile ? 10 : 11, color:S.muted, marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>







      <div style={{ ...S.card, marginBottom:20, background:"var(--card-plan-bg)", border:"1px solid #c8ff0030" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <span style={S.pill(dashboardAccent)}>{translatePlanWeeks(plan.weeks, i18n.language)}</span>
            <h2 style={{ ...S.heading, fontSize:28, margin:"8px 0 4px" }}>{translatePlanName(plan.name, i18n.language).toUpperCase()}</h2>
            <p style={{ fontSize:13, color:S.muted, margin:0 }}>{translatePlanDesc(plan.name, i18n.language)}</p>
          </div>
          <div style={{ ...S.heading, fontSize:52, color:dashboardAccent+"30", lineHeight:1 }}>{currentLevel+1}</div>
        </div>
        {currentLevel < 2 && <>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, color:themeMode === "light" ? "#111827" : S.muted }}>{t("dashboard.progressToNext")}</span>
            <span style={{ fontSize:12, color:themeMode === "light" ? "#111827" : dashboardAccent, fontFamily:"'DM Mono',monospace" }}>{progressToNext}/12</span>
          </div>
          <ProgressBar value={progressToNext} max={12} color={themeMode === "light" ? "#b6c3d9" : S.accent} trackColor={themeMode === "light" ? "#e8edf6" : "#1e1e2e"} />
        </>}
      </div>
      <div style={{ ...S.card, marginBottom:20, background:"var(--card-obj-bg)", border:"1px solid #5db0ff30" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={S.pill("#62adff")}>{t("dashboard.objective")}</span>
          <span style={{ fontSize:12, color:"var(--text-muted)" }}>{objective.horizonWeeks} {t("dashboard.weeks")}</span>
        </div>
        <h3 style={{ ...S.heading, fontSize:24, margin:"4px 0 8px" }}>{objective.phase.toUpperCase()}</h3>

        {/* Body composition summary */}
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 4 : 8, marginBottom:12 }}>
          {[
            { label:t("dashboard.bmi"), value: objective.bmi, unit:"", sub: objective.bmiCategory },
            { label:t("dashboard.waistHeight"), value: objective.waistToHeightRatio ?? "--", unit:"", sub: objective.metabolicRisk },
            { label:t("dashboard.fatEst"), value: objective.estimatedBF, unit:"%", sub: `${objective.leanMass} ${t("dashboard.lean")}` },
            { label:t("dashboard.targetWeight"), value: objective.targetWeight, unit:"kg", sub: `${objective.targetFat}% ${t("dashboard.fatKg")}` },
          ].map(m => (
            <div key={m.label} style={{ background:"var(--surface-soft)", borderRadius:10, padding: isMobile ? "8px 4px" : "10px 8px", textAlign:"center" }}>
              <div style={{ fontSize: isMobile ? 16 : 20, fontWeight:700, color:"#62adff" }}>{m.value}{m.unit}</div>
              <div style={{ fontSize:10, color:S.muted }}>{m.label}</div>
              <div style={{ fontSize:9, color:S.muted, marginTop:2 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize:11, color:S.muted, margin:"0 0 8px" }}>{objective.compositionMethod}</p>

        <p style={{ fontSize:12, color:"var(--text-main)", margin:"0 0 8px", lineHeight:1.5 }}>
          {objective.recommendation}
        </p>
        <p style={{ fontSize:12, color:S.muted, margin:0 }}>
          {t(objective.professional ? "dashboard.proUnlocked" : "dashboard.toIntermediate")}
        </p>
      </div>
      <div style={{ ...S.card, marginBottom:20, background:"var(--card-nut-bg)", border:"1px solid #ffb35a30" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={S.pill("#ffb35a")}>{t("dashboard.nutrition")}</span>
          <span style={{ fontSize:12, color:"var(--text-muted)" }}>{nutrition.calories} {t("dashboard.kcalDay")}</span>
        </div>
        <p style={{ fontSize:12, color:"var(--text-muted)", margin:"0 0 8px" }}>{nutrition.focus}</p>
        <p style={{ fontSize:11, color:S.muted, margin:"0 0 10px" }}>{nutrition.trainingSummary}</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: isMobile ? 4 : 8, marginBottom:8 }}>
          <div style={{ background:"var(--surface-inner)", border:"1px solid #3a3022", borderRadius:10, padding: isMobile ? "8px 4px" : "8px 6px", textAlign:"center" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize: isMobile ? 12 : 14, color:"var(--data-val)" }}>{nutrition.protein}g</div>
            <div style={{ fontSize: isMobile ? 9 : 10, color:S.muted }}>{t("dashboard.protein")}</div>
          </div>
          <div style={{ background:"var(--surface-inner)", border:"1px solid #3a3022", borderRadius:10, padding: isMobile ? "8px 4px" : "8px 6px", textAlign:"center" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize: isMobile ? 12 : 14, color:"var(--data-val)" }}>{nutrition.carbs}g</div>
            <div style={{ fontSize: isMobile ? 9 : 10, color:S.muted }}>{t("dashboard.carbs")}</div>
          </div>
          <div style={{ background:"var(--surface-inner)", border:"1px solid #3a3022", borderRadius:10, padding: isMobile ? "8px 4px" : "8px 6px", textAlign:"center" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, color:"var(--data-val)" }}>{nutrition.fats}g</div>
            <div style={{ fontSize:10, color:S.muted }}>{t("dashboard.fats")}</div>
          </div>
        </div>
        <p style={{ fontSize:11, color:S.muted, margin:0 }}>{t("dashboard.hydration", { val: nutrition.hydration })}</p>
        <p style={{ fontSize:11, color:S.muted, margin:"6px 0 0" }}>{nutrition.mealStrategy}</p>
        <p style={{ fontSize:11, color:S.muted, margin:"6px 0 0" }}>{nutrition.preWorkout}</p>
        <p style={{ fontSize:11, color:S.muted, margin:"6px 0 0" }}>{nutrition.postWorkout}</p>
        <button
          onClick={() => setShowTodaySnack(v => !v)}
          style={{ ...S.btn("var(--surface-inner)","var(--text-main)"), marginTop:12, width:"100%", padding:"9px 12px", fontSize:12, fontWeight:600, border:"1px solid #ffb35a50", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span>🍽️ {t("dashboard.todayNutrition")}</span>
          <span style={{ fontSize:10, color:S.muted }}>{showTodaySnack ? "▲" : "▼"}</span>
        </button>
        {showTodaySnack && (
          <div style={{ marginTop:10, borderTop:"1px solid #ffb35a30", paddingTop:10 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text-main)", marginBottom:4 }}>
              <span style={{ color:S.accent }}>{todaySnack.dayLabel}</span>
            </div>
            <p style={{ fontSize:12, color:S.muted, margin:"0 0 10px" }}>{todaySnack.tipText}</p>
            {todaySnack.preWorkout && (
              <div style={{ marginBottom:8, padding:"8px 12px", background:"var(--surface-inner)", borderRadius:10 }}>
                <div style={{ fontSize:11, fontWeight:700, color:S.accent, marginBottom:2 }}>{t("dashboard.preWorkout")} · {todaySnack.preWorkout.timing}</div>
                <div style={{ fontSize:13, color:"var(--text-main)", fontWeight:600 }}>{todaySnack.preWorkout.name}</div>
                <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{todaySnack.preWorkout.macroHint}</div>
              </div>
            )}
            {todaySnack.postWorkout && (
              <div style={{ padding:"8px 12px", background:"var(--surface-inner)", borderRadius:10 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#7ab8ff", marginBottom:2 }}>{t("dashboard.postWorkout")} · {todaySnack.postWorkout.timing}</div>
                <div style={{ fontSize:13, color:"var(--text-main)", fontWeight:600 }}>{todaySnack.postWorkout.name}</div>
                <div style={{ fontSize:11, color:S.muted, marginTop:2 }}>{todaySnack.postWorkout.macroHint}</div>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ ...S.card, marginBottom:20, padding: isMobile ? "14px 10px" : "20px", background:"var(--card-cal-bg)", border:"1px solid #50d0b030" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={S.pill("#50d0b0")}>{t("dashboard.weeklyCalendar")}</span>
          <span style={{ fontSize:11, color:S.muted }}>{t("dashboard.clickToChange")}</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(4,1fr)" : "repeat(7,1fr)", gap: isMobile ? 3 : 6 }}>
          {WEEK_DAYS.map((d, i) => {
            const state = weeklyCalendar?.[d.key] || "descanso";
            const meta = (themeMode === "light" ? DAY_STATE_META_LIGHT : DAY_STATE_META)[state];
            return (
              <button key={d.key} onClick={() => onCycleDayState(d.key)}
                style={{ border:`1px solid ${meta.border}`, background:meta.bg, color:meta.fg, borderRadius: isMobile ? 8 : 10, padding: isMobile ? "6px 2px" : "8px 4px", fontFamily:"'DM Sans',sans-serif", cursor:"pointer", minWidth:0, overflow:"hidden",
                  ...(isMobile && i === 4 ? { gridColumn: "1 / 2" } : {}) }}>
                <div style={{ fontSize: isMobile ? 10 : 11, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t(`dashboard.days.${d.key}`)}</div>
                <div style={{ fontSize: isMobile ? 7 : 9, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t(`dashboard.dayStates.${state}`)}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ ...S.card, marginBottom:20, background:"var(--surface-soft)", border:"1px solid var(--border-main)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, gap:8, flexWrap:"wrap" }}>
          <span style={S.pill("#7de8b8")}>{t("dashboard.myExtras")}</span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:11, color:S.muted }}>{t("dashboard.savedCount", { count: savedExtraIds.length })}</span>
            {savedExtraIds.length > 0 && (
              <button onClick={onClearSavedExtras} style={{ ...S.btn("var(--inactive-btn-bg)","#ff8080"), padding:"7px 10px", fontSize:11, border:"1px solid var(--border-main)" }}>
                {t("dashboard.clear")}
              </button>
            )}
          </div>
        </div>
        {savedExtraIds.length === 0 ? (
          <p style={{ margin:0, fontSize:12, color:S.muted }}>{t("dashboard.noExtras")}</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {savedExtraIds.map(id => (
              <div key={id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--surface-inner)", border:"1px solid var(--border-main)", borderRadius:10, padding:"8px 10px" }}>
                <span style={{ fontSize:12 }}>{translateExerciseName(id, i18n.language)}</span>
                <button onClick={() => onRemoveSavedExtra(id)} style={{ background:"none", border:"none", color:"#ff8080", cursor:"pointer", fontSize:12 }}>
                  {t("dashboard.remove")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ ...S.card, marginBottom:20, background:"var(--card-diet-bg)", border:"1px solid #ff857430" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={S.pill("#ff8574")}>{t("dashboard.weeklyDiet")}</span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, color:S.muted }}>{translateWeekTitle(selectedMealWeek.title, i18n.language)}</span>
            <button onClick={() => setMealWeekIdx(v => (v+1) % availableMealWeeks.length)} style={{ ...S.btn("var(--inactive-btn-bg)","var(--text-main)"), padding:"8px 10px", fontSize:12, border:"1px solid var(--border-main)" }}>
              {t("dashboard.changeWeek")}
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
          <button onClick={() => { setVeganOnly(false); setMealWeekIdx(0); }} style={{ ...S.btn(!veganOnly ? "#ff8574" : "var(--inactive-btn-bg)", !veganOnly ? "#080810" : "var(--text-muted)"), padding:"8px 10px", fontSize:12, border:"1px solid var(--border-main)" }}>
            {t("dashboard.all")}
          </button>
          <button onClick={() => { setVeganOnly(true); setMealWeekIdx(0); }} style={{ ...S.btn(veganOnly ? "#7de8b8" : "var(--inactive-btn-bg)", veganOnly ? "#08100d" : "var(--text-muted)"), padding:"8px 10px", fontSize:12, border:"1px solid var(--border-main)" }}>
            {t("dashboard.veganOnly")}
          </button>
        </div>
        <p style={{ fontSize:11, color:"var(--text-muted)", margin:"0 0 10px" }}>
          {t(selectedMealWeek.type === "vegana" ? "dashboard.veganAvailable" : "dashboard.omniRef")}
        </p>
        <p style={{ fontSize:11, color:S.muted, margin:"0 0 10px" }}>{selectedMealWeek.strategyLabel}</p>
        <p style={{ fontSize:11, color:S.muted, margin:"0 0 10px" }}>{selectedMealWeek.calorieLabel}</p>
        <button
          onClick={() => setShowShoppingList(v => !v)}
          style={{ ...S.btn("var(--surface-inner)","var(--text-main)"), width:"100%", marginBottom:10, padding:"9px 12px", fontSize:12, fontWeight:600, border:"1px solid #ff857450", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span>🛒 {t("dashboard.shoppingList")}</span>
          <span style={{ fontSize:10, color:S.muted }}>{showShoppingList ? "▲" : "▼"}</span>
        </button>
        {showShoppingList && (
          <div style={{ background:"var(--surface-inner)", border:"1px solid #342422", borderRadius:10, padding:"10px 12px", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text-main)" }}>
                {weeklyShoppingList.length} productos · {formatShoppingWeight(totalShoppingGrams)}
              </div>
              <button
                onClick={() => {
                  const catMap = new Map<string, typeof weeklyShoppingList>();
                  weeklyShoppingList.forEach(item => {
                    const arr = catMap.get(item.category) || [];
                    arr.push(item);
                    catMap.set(item.category, arr);
                  });
                  const lines: string[] = [`${t("dashboard.listTitle")} – ${translateWeekTitle(selectedMealWeek.title, i18n.language)}`, ""];
                  catMap.forEach((items, cat) => {
                    lines.push(`▸ ${translateCategory(cat, i18n.language)}`);
                    items.forEach(i => lines.push(`  • ${translateFoodName(i.name, i18n.language)}: ${formatShoppingWeight(i.totalGrams)}`));
                    lines.push("");
                  });
                  navigator.clipboard.writeText(lines.join("\n")).then(() => toast.success(t("dashboard.listCopied")));
                }}
                style={{ ...S.btn("var(--surface-soft)","var(--text-main)"), padding:"6px 10px", fontSize:11, border:"1px solid var(--border-main)", borderRadius:8 }}>
                📋 {t("dashboard.copyList")}
              </button>
            </div>
            {(() => {
              const catMap = new Map<string, typeof weeklyShoppingList>();
              weeklyShoppingList.forEach(item => {
                const arr = catMap.get(item.category) || [];
                arr.push(item);
                catMap.set(item.category, arr);
              });
              return Array.from(catMap.entries()).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#ffb35a", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{translateCategory(cat, i18n.language)}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {items.map(item => (
                      <div key={item.name} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:8, alignItems:"center", paddingBottom:4, borderBottom:"1px solid #342422" }}>
                        <div>
                          <div style={{ fontSize:12, color:"var(--text-main)", fontWeight:600 }}>{translateFoodName(item.name, i18n.language)}</div>
                          <div style={{ fontSize:10, color:S.muted }}>{item.appearances} {t("dashboard.times", { count: item.appearances })} · ~{item.totalKcal} kcal</div>
                        </div>
                        <div style={{ fontSize:11, color:"#ffb98c", fontFamily:"'DM Mono', monospace" }}>{formatShoppingWeight(item.totalGrams)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {selectedMealWeek.days.map(it => {
            const isOpen = expandedDay === it.day;
            const dayKcal = it.slots?.reduce((s, sl) => s + sl.items.reduce((a, b) => a + b.kcal, 0), 0) ?? 0;
            return (
              <div key={it.day} style={{ background:"var(--surface-inner)", border:"1px solid #342422", borderRadius:10, padding:"9px 10px", cursor:"pointer" }}
                onClick={() => setExpandedDay(isOpen ? null : it.day)}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--text-main)" }}>{t(`dashboard.fullDays.${it.day}`, it.day)}</div>
                  <div style={{ fontSize:10, color:S.muted }}>{dayKcal ? `${dayKcal} kcal` : ""} {isOpen ? "▲" : "▼"}</div>
                </div>
                {isOpen && it.slots && (
                  <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:8 }}>
                    {it.strategyLabel ? <div style={{ fontSize:10, color:S.muted, marginBottom:2 }}>{it.strategyLabel}</div> : null}
                    {it.slots.map(s => {
                      const slotKcal = s.items.reduce((a, b) => a + b.kcal, 0);
                      return (
                        <div key={s.label}>
                          <div style={{ fontSize:11, fontWeight:600, color:"#ff8574", marginBottom:3 }}>
                            {translateSlotLabel(s.label, i18n.language)} <span style={{ fontWeight:400, color:S.muted }}>({slotKcal} kcal)</span>
                          </div>
                          {s.items.map(item => (
                            <div key={item.name} style={{ fontSize:10, color:S.muted, paddingLeft:10, lineHeight:1.6 }}>
                              {translateFoodName(item.name, i18n.language)} ({item.grams}g) · {item.kcal} kcal · {item.protein}p / {item.carbs}c / {item.fat}g
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <h3 style={{ ...S.heading, fontSize:18, margin:"0 0 14px", color:S.muted }}>{t("dashboard.todayWorkouts")}</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {plan.workouts.map((w, i) => (
          <div key={i} style={{ ...S.card, display:"flex", alignItems:"center", gap:16, cursor:"pointer" }} onClick={() => onStartWorkout(w, currentLevel)}>
            <div style={{ width:48, height:48, borderRadius:12, background:S.accent+"15", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              {w.day}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:15 }}>{t("dashboard.day")} {w.day} - {translateWorkoutFocus(w.focus, i18n.language)}</div>
              <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{w.exercises.length} {t("dashboard.exercises")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
