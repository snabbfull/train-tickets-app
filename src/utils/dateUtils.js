/**
 * Общие утилиты форматирования даты и времени
 */

export const formatTime = (ts) => {
  if (ts == null) return "--:--";
  const date = new Date(typeof ts === "number" ? ts * 1000 : ts);
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (ts) => {
  if (ts == null) return "--";
  const date = new Date(typeof ts === "number" ? ts * 1000 : ts);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDuration = (seconds) => {
  if (seconds == null) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h} ч ${m} мин`;
};
