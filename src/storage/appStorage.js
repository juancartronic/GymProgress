import { defaultWeeklyCalendar } from "../domain/data";

const readJson = (record, fallback) => {
  if (!record?.value) return fallback;
  try {
    return JSON.parse(record.value);
  } catch {
    return fallback;
  }
};

export const loadAppState = async () => {
  try {
    const [profilesRec, activeRec, historyRec, calendarRec, themeRec, customExercisesRec] = await Promise.all([
      window.storage.get("irontrack-profiles"),
      window.storage.get("irontrack-active-profile"),
      window.storage.get("irontrack-history-by-profile"),
      window.storage.get("irontrack-weekly-calendar-by-profile"),
      window.storage.get("irontrack-theme-mode"),
      window.storage.get("irontrack-custom-exercises-by-profile"),
    ]);

    if (profilesRec && activeRec) {
      return {
        profiles: readJson(profilesRec, []),
        activeProfileId: activeRec.value,
        historyByProfile: readJson(historyRec, {}),
        weeklyCalendarByProfile: readJson(calendarRec, {}),
        customExercisesByProfile: readJson(customExercisesRec, {}),
        themeMode: themeRec?.value || "dark",
      };
    }

    const [legacyUser, legacyHistory] = await Promise.all([
      window.storage.get("irontrack-user"),
      window.storage.get("irontrack-history"),
    ]);

    if (!legacyUser) {
      return null;
    }

    const parsedUser = readJson(legacyUser, null);
    if (!parsedUser) return null;

    const migratedId = `p-${Date.now()}`;
    return {
      profiles: [{ ...parsedUser, id: migratedId, height: parsedUser.height || "170" }],
      activeProfileId: migratedId,
      historyByProfile: { [migratedId]: readJson(legacyHistory, []) },
      weeklyCalendarByProfile: { [migratedId]: defaultWeeklyCalendar() },
      customExercisesByProfile: { [migratedId]: [] },
      themeMode: themeRec?.value || "dark",
    };
  } catch {
    return null;
  }
};

export const saveAppState = ({ profiles, activeProfileId, historyByProfile, weeklyCalendarByProfile, customExercisesByProfile, themeMode }) => {
  window.storage.set("irontrack-profiles", JSON.stringify(profiles));
  if (activeProfileId) window.storage.set("irontrack-active-profile", activeProfileId);
  window.storage.set("irontrack-history-by-profile", JSON.stringify(historyByProfile));
  window.storage.set("irontrack-weekly-calendar-by-profile", JSON.stringify(weeklyCalendarByProfile));
  window.storage.set("irontrack-custom-exercises-by-profile", JSON.stringify(customExercisesByProfile || {}));
  window.storage.set("irontrack-theme-mode", themeMode);
};
