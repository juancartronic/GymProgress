import { defaultWeeklyCalendar } from "../domain/data";
import { encrypt, decrypt } from "./crypto";
import type { AppState, ThemeMode, UserProfile } from "../types";

const readJson = <T>(record: { value: string } | null, fallback: T): T => {
  if (!record?.value) return fallback;
  try {
    return JSON.parse(record.value);
  } catch {
    return fallback;
  }
};

/** Loads persisted app state from browser storage. Handles migration from legacy single-profile format. */
export const loadAppState = async (): Promise<AppState | null> => {
  try {
    const [profilesRec, activeRec, historyRec, calendarRec, themeRec, customExercisesRec, weightLogRec] = await Promise.all([
      window.storage.get("irontrack-profiles"),
      window.storage.get("irontrack-active-profile"),
      window.storage.get("irontrack-history-by-profile"),
      window.storage.get("irontrack-weekly-calendar-by-profile"),
      window.storage.get("irontrack-theme-mode"),
      window.storage.get("irontrack-custom-exercises-by-profile"),
      window.storage.get("irontrack-weight-log-by-profile"),
    ]);

    if (profilesRec && activeRec) {
      return {
        profiles: readJson(profilesRec, []),
        activeProfileId: activeRec.value,
        historyByProfile: readJson(historyRec, {}),
        weeklyCalendarByProfile: readJson(calendarRec, {}),
        customExercisesByProfile: readJson(customExercisesRec, {}),
        weightLogByProfile: readJson(weightLogRec, {}),
        themeMode: (themeRec?.value || "dark") as ThemeMode,
      };
    }

    const [legacyUser, legacyHistory] = await Promise.all([
      window.storage.get("irontrack-user"),
      window.storage.get("irontrack-history"),
    ]);

    if (!legacyUser) {
      return null;
    }

    const parsedUser = readJson<Partial<UserProfile> | null>(legacyUser, null);
    if (!parsedUser) return null;

    const migratedId = `p-${Date.now()}`;
    return {
      profiles: [{ ...parsedUser, id: migratedId, height: parsedUser.height || 170, waistCm: parsedUser.waistCm || "" } as UserProfile],
      activeProfileId: migratedId,
      historyByProfile: { [migratedId]: readJson(legacyHistory, []) },
      weeklyCalendarByProfile: { [migratedId]: defaultWeeklyCalendar() },
      customExercisesByProfile: { [migratedId]: [] },
      weightLogByProfile: { [migratedId]: [] },
      themeMode: (themeRec?.value || "dark") as ThemeMode,
    };
  } catch {
    return null;
  }
};

/** Persists app state to browser storage. Returns `{ ok, error }` — handles QuotaExceeded gracefully. */
export const saveAppState = ({ profiles, activeProfileId, historyByProfile, weeklyCalendarByProfile, customExercisesByProfile, weightLogByProfile, themeMode }: AppState): { ok: boolean; error?: string } => {
  try {
    window.storage.set("irontrack-profiles", JSON.stringify(profiles));
    if (activeProfileId) window.storage.set("irontrack-active-profile", activeProfileId);
    window.storage.set("irontrack-history-by-profile", JSON.stringify(historyByProfile));
    window.storage.set("irontrack-weekly-calendar-by-profile", JSON.stringify(weeklyCalendarByProfile));
    window.storage.set("irontrack-custom-exercises-by-profile", JSON.stringify(customExercisesByProfile || {}));
    window.storage.set("irontrack-weight-log-by-profile", JSON.stringify(weightLogByProfile || {}));
    window.storage.set("irontrack-theme-mode", themeMode);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof DOMException && e.name === "QuotaExceededError"
      ? "Almacenamiento lleno. Libera espacio eliminando datos antiguos."
      : "Error al guardar los datos. Intenta de nuevo.";
    console.error("[appStorage] saveAppState error:", e);
    return { ok: false, error: msg };
  }
};

/** Exports full app state as JSON string. If `passphrase` is provided, encrypts with AES-GCM. */
export const exportAppData = async (passphrase?: string): Promise<string> => {
  const state = await loadAppState();
  const json = JSON.stringify(state, null, 2);
  if (passphrase) return encrypt(json, passphrase);
  return json;
};

/** Imports app state from JSON string. Optionally decrypts with `passphrase`. Validates structure before saving. */
export const importAppData = async (input: string, passphrase?: string): Promise<AppState> => {
  let jsonStr = input;
  if (passphrase) {
    try {
      jsonStr = await decrypt(input, passphrase);
    } catch {
      throw new Error("No se pudo descifrar. Contraseña incorrecta o archivo dañado.");
    }
  }
  let data: unknown;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    throw new Error("El archivo no contiene JSON válido.");
  }
  if (!data || typeof data !== "object" || !Array.isArray((data as Record<string, unknown>).profiles) || typeof (data as Record<string, unknown>).activeProfileId !== "string") {
    throw new Error("Formato de datos inválido. Asegúrate de importar un archivo exportado desde IronTrack.");
  }
  const d = data as Record<string, unknown>;
  const state: AppState = {
    profiles: d.profiles as UserProfile[],
    activeProfileId: d.activeProfileId as string,
    historyByProfile: (d.historyByProfile || {}) as AppState["historyByProfile"],
    weeklyCalendarByProfile: (d.weeklyCalendarByProfile || {}) as AppState["weeklyCalendarByProfile"],
    customExercisesByProfile: (d.customExercisesByProfile || {}) as AppState["customExercisesByProfile"],
    weightLogByProfile: (d.weightLogByProfile || {}) as AppState["weightLogByProfile"],
    themeMode: (d.themeMode as ThemeMode) || "dark",
  };
  const result = saveAppState(state);
  if (!result.ok) throw new Error(result.error);
  return state;
};
