/** Requests browser Notification permission. Returns `true` if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/** Schedules a daily workout notification at the given time. Auto-reschedules for the next day. */
export function scheduleWorkoutReminder(hour = 18, minute = 0): number | null {
  if (!("Notification" in window) || Notification.permission !== "granted") return null;

  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();
  const id = window.setTimeout(() => {
    new Notification("IronTrack 💪", {
      body: "¡Es hora de entrenar! Abre IronTrack y comienza tu rutina.",
      icon: "/icons/icon-192.svg",
      tag: "workout-reminder",
    });
    // Re-schedule for tomorrow
    scheduleWorkoutReminder(hour, minute);
  }, delay);

  return id;
}

/** Cancels a previously scheduled workout reminder by timeout ID. */
export function cancelReminder(id: number): void {
  window.clearTimeout(id);
}
