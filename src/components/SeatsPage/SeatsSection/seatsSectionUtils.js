import seetIcon from "../../../assets/seet.png";
import plackartIcon from "../../../assets/plackart.png";
import coupeIcon from "../../../assets/coope.png";
import luxIcon from "../../../assets/lux.png";

export const WAGON_TYPES = [
  { id: "lux", class_type: "first", name: "Люкс", icon: luxIcon },
  { id: "coupe", class_type: "second", name: "Купе", icon: coupeIcon },
  { id: "platzkart", class_type: "third", name: "Плацкарт", icon: plackartIcon },
  { id: "sitting", class_type: "fourth", name: "Сидячий", icon: seetIcon },
];

export const FPK_LABELS = {
  conder: "Кондиционер",
  wifi: "Wi-Fi",
  underwear: "Бельё",
  food: "Питание",
};

export const formatTime = (ts) => {
  if (ts == null) return "--:--";
  const date = new Date(typeof ts === "number" ? ts * 1000 : ts);
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

export const formatDuration = (seconds) => {
  if (seconds == null) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h} ч ${m} мин`;
};

export const mapClassTypeToWagonId = (classType) => {
  const ct = (classType || "").toLowerCase();
  if (ct === "first") return "lux";
  if (ct === "second") return "coupe";
  if (ct === "third") return "platzkart";
  if (ct === "fourth") return "sitting";
  return null;
};

export const getWagonDisplayNumber = (carriage, idx) => {
  const coach = carriage?.coach ?? carriage;
  const rawName = String(coach?.name || "").trim();
  const digits = rawName.match(/\d+/g);
  if (digits && digits.length > 0) return digits[digits.length - 1];
  return String(idx + 1).padStart(2, "0");
};

export const getCoachId = (carriage, idx) => {
  const coach = carriage?.coach ?? carriage;
  return coach?._id || coach?.coach_id || `carriage-${idx}`;
};

export const getFpkPrice = (coach, optionKey) => {
  if (!coach) return 0;
  if (optionKey === "underwear") {
    if (coach.is_linens_included) return 0;
    return Number(coach.linens_price) || 0;
  }
  if (optionKey === "conder") return Number(coach.air_conditioning_price) || 0;
  if (optionKey === "wifi") return Number(coach.wifi_price) || 0;
  if (optionKey === "food") return Number(coach.food_price ?? coach.express_price) || 0;
  return 0;
};
