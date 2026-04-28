import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { S } from "../theme/styles";
import { WEEK_DAYS, getPlanForGoalAndLevel } from "../domain/data";
import { buildNutritionPlan } from "../domain/planning";
import { adaptMealWeekByNutrition, buildWeeklyShoppingList, getDaySnackRecommendation, getWeeklyMealExamples, translateCategory, translateFoodName, translateSlotLabel, translateWeekTitle } from "../domain/mealData";
import { useIsMobile } from "../hooks/useIsMobile";
import type { UserProfile, WorkoutResult, WeeklyCalendar } from "../types";

interface DietViewProps {
  user: UserProfile;
  history: WorkoutResult[];
  weeklyCalendar: WeeklyCalendar;
}

export function DietView({ user, history, weeklyCalendar }: DietViewProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [mealWeekIdx, setMealWeekIdx] = useState(0);
  const [veganOnly, setVeganOnly] = useState(user?.dietPreference === "vegana");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showTodaySnack, setShowTodaySnack] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const totalWorkouts = history.length;
  const currentLevel = Math.min(2, Math.floor(totalWorkouts / 12));
  const plan = getPlanForGoalAndLevel(user.goal, currentLevel) ?? getPlanForGoalAndLevel("fuerza", 0)!;
  const weeklyTrainingDays = Object.values(weeklyCalendar || {}).filter((state) => state === "entreno").length || plan.workouts.length;
  const nutrition = buildNutritionPlan(user, currentLevel, weeklyTrainingDays, plan, i18n.language);
  const allMealWeeks = getWeeklyMealExamples(user?.goal, user?.gender);
  const filteredMealWeeks = veganOnly ? allMealWeeks.filter(w => w.type === "vegana") : allMealWeeks;
  const availableMealWeeks = filteredMealWeeks.length ? filteredMealWeeks : allMealWeeks;
  const selectedMealWeek = adaptMealWeekByNutrition(availableMealWeeks[mealWeekIdx % availableMealWeeks.length], nutrition, weeklyCalendar, i18n.language);
  const weeklyShoppingList = buildWeeklyShoppingList(selectedMealWeek);
  const totalShoppingGrams = weeklyShoppingList.reduce((sum, item) => sum + item.totalGrams, 0);

  useEffect(() => {
    setMealWeekIdx(0);
    setVeganOnly(user?.dietPreference === "vegana");
  }, [user?.goal, user?.dietPreference]);

  const todayJsDay = new Date().getDay();
  const weekDayIndex = todayJsDay === 0 ? 6 : todayJsDay - 1;
  const todayDayKey = WEEK_DAYS[weekDayIndex]?.key as import("../types").DayKey;
  const todayState = weeklyCalendar?.[todayDayKey] || "descanso";
  const todaySnack = getDaySnackRecommendation(todayState, nutrition.dominantStimulus, user.goal, i18n.language);
  const formatShoppingWeight = (grams: number) => (grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams} g`);

  return (
    <div style={{ ...S.container, paddingTop: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...S.heading, marginBottom: 8 }}>{t("dietView.title")}</div>
        <div style={{ color: S.muted, fontSize: 13 }}>{t("dietView.subtitle", { name: user.name })}</div>
      </div>

      <div style={{ ...S.card, marginBottom: 20, background: "var(--card-nut-bg)", border: "1px solid #ffb35a30" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={S.pill("#ffb35a")}>{t("dashboard.nutrition")}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{nutrition.calories} {t("dashboard.kcalDay")}</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>{nutrition.focus}</p>
        <p style={{ fontSize: 11, color: S.muted, margin: "0 0 10px" }}>{nutrition.trainingSummary}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: isMobile ? 4 : 8, marginBottom: 8 }}>
          <div style={{ background: "var(--surface-inner)", border: "1px solid #3a3022", borderRadius: 10, padding: isMobile ? "8px 4px" : "8px 6px", textAlign: "center" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 12 : 14, color: "var(--data-val)" }}>{nutrition.protein}g</div>
            <div style={{ fontSize: isMobile ? 9 : 10, color: S.muted }}>{t("dashboard.protein")}</div>
          </div>
          <div style={{ background: "var(--surface-inner)", border: "1px solid #3a3022", borderRadius: 10, padding: isMobile ? "8px 4px" : "8px 6px", textAlign: "center" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 12 : 14, color: "var(--data-val)" }}>{nutrition.carbs}g</div>
            <div style={{ fontSize: isMobile ? 9 : 10, color: S.muted }}>{t("dashboard.carbs")}</div>
          </div>
          <div style={{ background: "var(--surface-inner)", border: "1px solid #3a3022", borderRadius: 10, padding: isMobile ? "8px 4px" : "8px 6px", textAlign: "center" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: "var(--data-val)" }}>{nutrition.fats}g</div>
            <div style={{ fontSize: 10, color: S.muted }}>{t("dashboard.fats")}</div>
          </div>
        </div>
        <p style={{ fontSize: 11, color: S.muted, margin: 0 }}>{t("dashboard.hydration", { val: nutrition.hydration })}</p>
        <p style={{ fontSize: 11, color: S.muted, margin: "6px 0 0" }}>{nutrition.mealStrategy}</p>
        <p style={{ fontSize: 11, color: S.muted, margin: "6px 0 0" }}>{nutrition.preWorkout}</p>
        <p style={{ fontSize: 11, color: S.muted, margin: "6px 0 0" }}>{nutrition.postWorkout}</p>
        <button
          onClick={() => setShowTodaySnack(v => !v)}
          style={{ ...S.btn("var(--surface-inner)", "var(--text-main)"), marginTop: 12, width: "100%", padding: "9px 12px", fontSize: 12, fontWeight: 600, border: "1px solid #ffb35a50", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <span>🍽️ {t("dashboard.todayNutrition")}</span>
          <span style={{ fontSize: 10, color: S.muted }}>{showTodaySnack ? "▲" : "▼"}</span>
        </button>
        {showTodaySnack && (
          <div style={{ marginTop: 10, borderTop: "1px solid #ffb35a30", paddingTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
              <span style={{ color: S.accent }}>{todaySnack.dayLabel}</span>
            </div>
            <p style={{ fontSize: 12, color: S.muted, margin: "0 0 10px" }}>{todaySnack.tipText}</p>
            {todaySnack.preWorkout && (
              <div style={{ marginBottom: 8, padding: "8px 12px", background: "var(--surface-inner)", borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.accent, marginBottom: 2 }}>{t("dashboard.preWorkout")} · {todaySnack.preWorkout.timing}</div>
                <div style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 600 }}>{todaySnack.preWorkout.name}</div>
                <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{todaySnack.preWorkout.macroHint}</div>
              </div>
            )}
            {todaySnack.postWorkout && (
              <div style={{ padding: "8px 12px", background: "var(--surface-inner)", borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7ab8ff", marginBottom: 2 }}>{t("dashboard.postWorkout")} · {todaySnack.postWorkout.timing}</div>
                <div style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 600 }}>{todaySnack.postWorkout.name}</div>
                <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{todaySnack.postWorkout.macroHint}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ ...S.card, marginBottom: 84, background: "var(--card-diet-bg)", border: "1px solid #ff857430" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={S.pill("#ff8574")}>{t("dashboard.weeklyDiet")}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: S.muted }}>{translateWeekTitle(selectedMealWeek.title, i18n.language)}</span>
            <button onClick={() => setMealWeekIdx(v => (v + 1) % availableMealWeeks.length)} style={{ ...S.btn("var(--inactive-btn-bg)", "var(--text-main)"), padding: "8px 10px", fontSize: 12, border: "1px solid var(--border-main)" }}>
              {t("dashboard.changeWeek")}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <button onClick={() => { setVeganOnly(false); setMealWeekIdx(0); }} style={{ ...S.btn(!veganOnly ? "#ff8574" : "var(--inactive-btn-bg)", !veganOnly ? "#080810" : "var(--text-muted)"), padding: "8px 10px", fontSize: 12, border: "1px solid var(--border-main)" }}>
            {t("dashboard.all")}
          </button>
          <button onClick={() => { setVeganOnly(true); setMealWeekIdx(0); }} style={{ ...S.btn(veganOnly ? "#7de8b8" : "var(--inactive-btn-bg)", veganOnly ? "#08100d" : "var(--text-muted)"), padding: "8px 10px", fontSize: 12, border: "1px solid var(--border-main)" }}>
            {t("dashboard.veganOnly")}
          </button>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 10px" }}>
          {t(selectedMealWeek.type === "vegana" ? "dashboard.veganAvailable" : "dashboard.omniRef")}
        </p>
        <p style={{ fontSize: 11, color: S.muted, margin: "0 0 10px" }}>{selectedMealWeek.strategyLabel}</p>
        <p style={{ fontSize: 11, color: S.muted, margin: "0 0 10px" }}>{selectedMealWeek.calorieLabel}</p>
        <button
          onClick={() => setShowShoppingList(v => !v)}
          style={{ ...S.btn("var(--surface-inner)", "var(--text-main)"), width: "100%", marginBottom: 10, padding: "9px 12px", fontSize: 12, fontWeight: 600, border: "1px solid #ff857450", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <span>🛒 {t("dashboard.shoppingList")}</span>
          <span style={{ fontSize: 10, color: S.muted }}>{showShoppingList ? "▲" : "▼"}</span>
        </button>
        {showShoppingList && (
          <div style={{ background: "var(--surface-inner)", border: "1px solid #342422", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>
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
                  const lines: string[] = [`${t("dashboard.listTitle")} - ${translateWeekTitle(selectedMealWeek.title, i18n.language)}`, ""];
                  catMap.forEach((items, cat) => {
                    lines.push(`> ${translateCategory(cat, i18n.language)}`);
                    items.forEach(i => lines.push(`  - ${translateFoodName(i.name, i18n.language)}: ${formatShoppingWeight(i.totalGrams)}`));
                    lines.push("");
                  });
                  navigator.clipboard.writeText(lines.join("\n")).then(() => toast.success(t("dashboard.listCopied")));
                }}
                style={{ ...S.btn("var(--surface-soft)", "var(--text-main)"), padding: "6px 10px", fontSize: 11, border: "1px solid var(--border-main)", borderRadius: 8 }}
              >
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
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#ffb35a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{translateCategory(cat, i18n.language)}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {items.map(item => (
                      <div key={item.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center", paddingBottom: 4, borderBottom: "1px solid #342422" }}>
                        <div>
                          <div style={{ fontSize: 12, color: "var(--text-main)", fontWeight: 600 }}>{translateFoodName(item.name, i18n.language)}</div>
                          <div style={{ fontSize: 10, color: S.muted }}>{item.appearances} {t("dashboard.times", { count: item.appearances })} · ~{item.totalKcal} kcal</div>
                        </div>
                        <div style={{ fontSize: 11, color: "#ffb98c", fontFamily: "'DM Mono', monospace" }}>{formatShoppingWeight(item.totalGrams)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {selectedMealWeek.days.map(it => {
            const isOpen = expandedDay === it.day;
            const dayKcal = it.slots?.reduce((s, sl) => s + sl.items.reduce((a, b) => a + b.kcal, 0), 0) ?? 0;
            return (
              <div key={it.day} style={{ background: "var(--surface-inner)", border: "1px solid #342422", borderRadius: 10, padding: "9px 10px", cursor: "pointer" }} onClick={() => setExpandedDay(isOpen ? null : it.day)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>{t(`dashboard.fullDays.${it.day}`, it.day)}</div>
                  <div style={{ fontSize: 10, color: S.muted }}>{dayKcal ? `${dayKcal} kcal` : ""} {isOpen ? "▲" : "▼"}</div>
                </div>
                {isOpen && it.slots && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                    {it.strategyLabel ? <div style={{ fontSize: 10, color: S.muted, marginBottom: 2 }}>{it.strategyLabel}</div> : null}
                    {it.slots.map(s => {
                      const slotKcal = s.items.reduce((a, b) => a + b.kcal, 0);
                      return (
                        <div key={s.label}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#ff8574", marginBottom: 3 }}>
                            {translateSlotLabel(s.label, i18n.language)} <span style={{ fontWeight: 400, color: S.muted }}>({slotKcal} kcal)</span>
                          </div>
                          {s.items.map(item => (
                            <div key={item.name} style={{ fontSize: 10, color: S.muted, paddingLeft: 10, lineHeight: 1.6 }}>
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
    </div>
  );
}
