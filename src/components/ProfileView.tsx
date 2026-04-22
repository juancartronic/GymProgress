import React, { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { S } from "../theme/styles";
import { exportAppData, importAppData } from "../storage/appStorage";
import { requestNotificationPermission, scheduleWorkoutReminder } from "../storage/notifications";
import i18n from "../i18n";
import type { UserProfile, ThemeMode, AppState, WeightEntry } from "../types";

interface ProfileViewProps {
  user: UserProfile;
  profiles: UserProfile[];
  activeProfileId: string | null;
  themeMode: ThemeMode;
  weightLog: WeightEntry[];
  onSwitchProfile: (id: string) => void;
  onAddProfile: () => void;
  onEditProfile: () => void;
  onDeleteProfile: () => void;
  onImportData?: (state: AppState) => void;
  onLogWeight: (weight: number) => void;
  onToggleTheme: () => void;
}

const GOAL_LABELS: Record<string, string> = {
  fuerza: "profile.goalStrength",
  cardio: "profile.goalCardio",
  perdida: "profile.goalLoss",
  tono: "profile.goalTone",
};

export function ProfileView({
  user, profiles, activeProfileId, themeMode, weightLog,
  onSwitchProfile, onAddProfile, onEditProfile, onDeleteProfile,
  onImportData, onLogWeight, onToggleTheme,
}: ProfileViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  // Mismo patrón que dashboardAccent en Dashboard
  const accent = themeMode === "light" ? "#2b6500" : S.accent;

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderHour, setReminderHour] = useState("18");
  const [reminderMin, setReminderMin] = useState("00");
  const [showWeightPrompt, setShowWeightPrompt] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [currentLang, setCurrentLang] = useState(i18n.language?.slice(0, 2) || "es");

  useEffect(() => {
    const lastEntry = weightLog.length > 0 ? weightLog[weightLog.length - 1] : null;
    if (!lastEntry) { setShowWeightPrompt(true); return; }
    const daysSince = Math.floor((Date.now() - new Date(lastEntry.date).getTime()) / 864e5);
    setShowWeightPrompt(daysSince >= 7);
  }, [weightLog, activeProfileId]);

  const handleWeightSubmit = () => {
    const w = parseFloat(weightInput.replace(",", "."));
    if (!w || w < 30 || w > 300) return;
    onLogWeight(w);
    setShowWeightPrompt(false);
    setWeightInput("");
  };

  const handleExport = async () => {
    const json = await exportAppData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `irontrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const state = await importAppData(reader.result as string);
        onImportData?.(state);
        toast.success(t("toast.importOk"));
      } catch (err) {
        toast.error(t("toast.importError") + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleActivateReminder = async () => {
    const h = Math.min(23, Math.max(0, parseInt(reminderHour) || 0));
    const m = Math.min(59, Math.max(0, parseInt(reminderMin) || 0));
    const ok = await requestNotificationPermission();
    if (ok) {
      scheduleWorkoutReminder(h, m);
      toast.success(t("toast.reminderSet", { time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` }));
      setShowReminderModal(false);
    } else {
      toast.error(t("toast.notificationDenied"));
    }
  };

  return (
    <div style={{ ...S.container, paddingTop: 32 }}>

      {/* ── Header ── mismo patrón que Dashboard */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: S.muted, margin: "0 0 4px", fontSize: 13 }}>{t("profile.myProfile")}</p>
        <h1 style={{ ...S.heading, fontSize: 38, margin: 0 }}>{user.name.toUpperCase()}</h1>
        <p style={{ fontSize: 13, color: S.muted, margin: "6px 0 0" }}>
          {user.gender === "masculino" ? "♂" : "♀"} · {user.age} {t("profile.years")} · {t(GOAL_LABELS[user.goal] ?? user.goal)}
        </p>
      </div>

      {/* ── Stats row ── mismo grid que Dashboard (Entrenos/Racha/Kcal) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[
          { label: t("profile.weight"), value: `${user.weight} kg` },
          { label: t("profile.height"), value: `${user.height} cm` },
          { label: t("profile.bodyFat"), value: user.bodyFat !== "" ? `${user.bodyFat}%` : "—" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, padding: "12px 6px", textAlign: "center" }}>
            <div style={{ ...S.heading, fontSize: 22, color: accent, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: S.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Perfil ── var(--card-plan-bg) igual que el card de plan en Dashboard */}
      <div style={{ ...S.card, marginBottom: 20, background: "var(--card-plan-bg)", border: `1px solid ${accent}30` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={S.pill(accent)}>{t("profile.sectionProfile")}</span>
          {profiles.length > 1 && (
            <select
              value={activeProfileId || ""}
              onChange={e => onSwitchProfile(e.target.value)}
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-main)",
                borderRadius: 10,
                padding: "6px 10px",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 12,
              }}
            >
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onAddProfile}
            style={{ ...S.btn("var(--surface-soft)", "var(--text-main)"), width: "100%", justifyContent: "flex-start", padding: "12px 14px", fontSize: 13, border: "1px solid var(--border-main)" }}>
            <span>👤</span> {t("profile.addProfile")}
          </button>
          <button onClick={onEditProfile}
            style={{ ...S.btn("var(--surface-soft)", "var(--text-main)"), width: "100%", justifyContent: "flex-start", padding: "12px 14px", fontSize: 13, border: "1px solid var(--border-main)" }}>
            <span>✏️</span> {t("profile.editProfile")}
          </button>
          <button onClick={onDeleteProfile}
            style={{ ...S.btn("var(--surface-soft)", "#d94a4a"), width: "100%", justifyContent: "flex-start", padding: "12px 14px", fontSize: 13, border: "1px solid var(--border-main)" }}>
            <span>🗑️</span> {t("profile.deleteProfile")}
          </button>
        </div>
      </div>

      {/* ── Control semanal de peso ── var(--card-cal-bg) */}
      <div style={{ ...S.card, marginBottom: 20, background: "var(--card-cal-bg)", border: "1px solid #5db0ff30" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={S.pill("#62adff")}>{t("profile.weeklyWeight")}</span>
          {!showWeightPrompt && (
            <button onClick={() => setShowWeightPrompt(true)}
              style={{ ...S.btn("var(--surface-soft)", "var(--text-main)"), padding: "6px 12px", fontSize: 12, border: "1px solid var(--border-main)", borderRadius: 8 }}>
              {t("profile.register")}
            </button>
          )}
        </div>

        {showWeightPrompt ? (
          <>
            <p style={{ fontSize: 12, color: S.muted, margin: "0 0 12px" }}>
              {weightLog.length === 0
                ? t("profile.weightFirstPrompt")
                : t("profile.weightWeeklyPrompt")}
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="number" step="0.1" min="30" max="300"
                placeholder={`${user.weight} kg`}
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleWeightSubmit()}
                style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-main)", borderRadius: 10, padding: "10px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 14, width: 110, textAlign: "center" }}
              />
              <button onClick={handleWeightSubmit}
                style={{ ...S.btn(S.accent, "#000"), padding: "10px 18px", fontWeight: 700, fontSize: 13, borderRadius: 10 }}>
                {t("profile.save")}
              </button>
              <button onClick={() => setShowWeightPrompt(false)}
                style={{ ...S.btn("var(--surface-soft)", "var(--text-main)"), padding: "10px 12px", fontSize: 12, border: "1px solid var(--border-main)", borderRadius: 10 }}>
                {t("profile.skip")}
              </button>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>
            {t("profile.lastRecord")}:{" "}
            <span style={{ color: "var(--text-main)", fontFamily: "'DM Mono',monospace" }}>
              {weightLog.length > 0
                ? `${weightLog[weightLog.length - 1].weight} kg · ${weightLog[weightLog.length - 1].date}`
                : "—"}
            </span>
          </p>
        )}

        {/* Mini gráfica — idéntica a la de Dashboard */}
        {weightLog.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 8 }}>📈 {t("profile.weightHistory")}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60 }}>
              {(() => {
                const entries = weightLog.slice(-12);
                const min = Math.min(...entries.map(e => e.weight));
                const max = Math.max(...entries.map(e => e.weight));
                const range = max - min || 1;
                return entries.map((e, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ fontSize: 8, color: S.muted }}>{e.weight}</div>
                    <div style={{
                      width: "100%", maxWidth: 28, borderRadius: 4,
                      background: i === entries.length - 1 ? S.accent : "var(--surface-soft)",
                      height: Math.max(6, ((e.weight - min) / range) * 48),
                    }} />
                    <div style={{ fontSize: 7, color: S.muted }}>{e.date.slice(5)}</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* ── Datos ── var(--card-obj-bg) igual que OBJETIVO en Dashboard */}
      <div style={{ ...S.card, marginBottom: 20, background: "var(--card-obj-bg)", border: "1px solid #5db0ff30" }}>
        <div style={{ marginBottom: 14 }}>
          <span style={S.pill("#62adff")}>{t("profile.sectionData")}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={handleExport}
            style={{ ...S.btn("var(--surface-soft)", "var(--text-main)"), width: "100%", justifyContent: "flex-start", padding: "12px 14px", fontSize: 13, border: "1px solid var(--border-main)" }}>
            <span>📤</span> {t("profile.exportData")}
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            style={{ ...S.btn("var(--surface-soft)", "var(--text-main)"), width: "100%", justifyContent: "flex-start", padding: "12px 14px", fontSize: 13, border: "1px solid var(--border-main)" }}>
            <span>📥</span> {t("profile.importData")}
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImportFile} />
        </div>
      </div>

      {/* ── Apariencia ── var(--card-diet-bg) con borde morado/neutro propio */}
      <div style={{ ...S.card, marginBottom: 16, background: "var(--card-diet-bg)", border: "1px solid #c8a0ff30" }}>
        <div style={{ marginBottom: 14 }}>
          <span style={S.pill("#c8a0ff")}>{t("profile.sectionAppearance")}</span>
        </div>
        {/* Fila: modo día/noche */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-inner)", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: "var(--text-main)" }}>
            {themeMode === "dark" ? t("theme.night") : t("theme.day")}
          </span>
          <button
            onClick={onToggleTheme}
            aria-label={themeMode === "dark" ? t("theme.switchDay") : t("theme.switchNight")}
            style={{
              width: 46,
              height: 26,
              borderRadius: 999,
              border: `1px solid ${"#c8a0ff"}50`,
              background: themeMode === "dark" ? "#1c1a2e" : "#e9e4f7",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: themeMode === "dark" ? "flex-end" : "flex-start",
              transition: "all .18s ease",
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#c8a0ff",
                color: "#080810",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                lineHeight: 1,
                transition: "all .18s ease",
              }}
            >
              {themeMode === "dark" ? "☀" : "☾"}
            </span>
          </button>
        </div>
        {/* Fila: idioma */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-inner)", borderRadius: 12, padding: "10px 14px" }}>
          <span style={{ fontSize: 14, color: "var(--text-main)" }}>🌐 {t("profile.language")}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {(["es", "en"] as const).map(lang => (
              <button
                key={lang}
                onClick={() => { i18n.changeLanguage(lang); setCurrentLang(lang); }}
                style={{
                  ...S.btn(
                    currentLang === lang ? "#c8a0ff" : "var(--surface-soft)",
                    currentLang === lang ? "#080810" : "var(--text-main)"
                  ),
                  padding: "6px 16px",
                  fontSize: 13,
                  fontWeight: currentLang === lang ? 700 : 400,
                  border: `1px solid ${currentLang === lang ? "#c8a0ff" : "var(--border-main)"}`,
                  borderRadius: 10,
                }}
              >
                {lang === "es" ? "🇪🇸 ES" : "🇬🇧 EN"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recordatorio ── var(--card-nut-bg) igual que NUTRICION en Dashboard */}
      <div style={{ ...S.card, marginBottom: 24, background: "var(--card-nut-bg)", border: "1px solid #ffb35a30" }}>
        <div style={{ marginBottom: 14 }}>
          <span style={S.pill("#ffb35a")}>{t("profile.sectionReminder")}</span>
        </div>
        <button onClick={() => setShowReminderModal(true)}
          style={{ ...S.btn("var(--surface-soft)", "var(--text-main)"), width: "100%", justifyContent: "flex-start", padding: "12px 14px", fontSize: 13, border: "1px solid var(--border-main)" }}>
          <span>🔔</span> {t("profile.activateReminder")}
        </button>
      </div>

      {/* ── Modal recordatorio ── igual que en Dashboard */}
      {showReminderModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setShowReminderModal(false); }}
        >
          <div style={{ ...S.card, maxWidth: 340, width: "90%", padding: 28, textAlign: "center", borderRadius: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>🔔 {t("profile.dailyReminder")}</div>
            <p style={{ fontSize: 13, color: S.muted, margin: "0 0 20px" }}>
              {t("profile.reminderDesc")}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
              <input type="number" min="0" max="23" value={reminderHour}
                onChange={e => setReminderHour(e.target.value.padStart(2, "0"))}
                style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-main)", borderRadius: 10, padding: "10px", fontFamily: "'DM Mono',monospace", fontSize: 20, width: 64, textAlign: "center" }} />
              <span style={{ fontSize: 20, color: S.muted, fontWeight: 700 }}>:</span>
              <input type="number" min="0" max="59" value={reminderMin}
                onChange={e => setReminderMin(e.target.value.padStart(2, "0"))}
                style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-main)", borderRadius: 10, padding: "10px", fontFamily: "'DM Mono',monospace", fontSize: 20, width: 64, textAlign: "center" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={handleActivateReminder}
                style={{ ...S.btn(S.accent, "#000"), padding: "10px 20px", fontWeight: 700, fontSize: 13, borderRadius: 10 }}>
                {t("profile.activate")}
              </button>
              <button onClick={() => setShowReminderModal(false)}
                style={{ ...S.btn("var(--surface-soft)", "var(--text-main)"), padding: "10px 14px", fontSize: 13, border: "1px solid var(--border-main)", borderRadius: 10 }}>
                {t("profile.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
