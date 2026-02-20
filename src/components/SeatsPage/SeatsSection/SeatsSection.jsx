import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { trainSeatsRequested } from "../../../store/actions";
import seetIcon from "../../../assets/seet.png";
import plackartIcon from "../../../assets/plackart.png";
import coupeIcon from "../../../assets/coope.png";
import luxIcon from "../../../assets/lux.png";
import trainSeatsImg from "../../../assets/train-seats.png";
import conderWagonIcon from "../../../assets/conder-wagon.png";
import wifiWagonIcon from "../../../assets/wifi-wagon.png";
import underwearWagonIcon from "../../../assets/underwear-wagon.png";
import foodWagonIcon from "../../../assets/food-wagon.png";
import { setSelectedSeats, setFpkOptions } from "../../../store/order/orderSlice";
import "./SeatsSection.css";

// Соответствие типов вагонов из API (class_type) нашим табам
const WAGON_TYPES = [
  { id: "lux", class_type: "first", name: "Люкс", icon: luxIcon },
  { id: "coupe", class_type: "second", name: "Купе", icon: coupeIcon },
  { id: "platzkart", class_type: "third", name: "Плацкарт", icon: plackartIcon },
  { id: "sitting", class_type: "fourth", name: "Сидячий", icon: seetIcon },
];

const formatTime = (ts) => {
  if (ts == null) return "--:--";
  const date = new Date(typeof ts === "number" ? ts * 1000 : ts);
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

const formatDuration = (seconds) => {
  if (seconds == null) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h} ч ${m} мин`;
};

const mapClassTypeToWagonId = (classType) => {
  const ct = (classType || "").toLowerCase();
  if (ct === "first") return "lux";
  if (ct === "second") return "coupe";
  if (ct === "third") return "platzkart";
  if (ct === "fourth") return "sitting";
  return null;
};

const getWagonDisplayNumber = (carriage, idx) => {
  const coach = carriage?.coach ?? carriage;
  const rawName = String(coach?.name || "").trim();
  const digits = rawName.match(/\d+/g);
  if (digits && digits.length > 0) {
    return digits[digits.length - 1];
  }
  return String(idx + 1).padStart(2, "0");
};

const getCoachId = (carriage, idx) => {
  const coach = carriage?.coach ?? carriage;
  return coach?._id || coach?.coach_id || `carriage-${idx}`;
};

const FPK_LABELS = { conder: "Кондиционер", wifi: "Wi-Fi", underwear: "Бельё", food: "Питание" };

const getFpkPrice = (coach, optionKey) => {
  if (!coach) return 0;
  if (optionKey === "underwear") return Number(coach.linens_price) || 0;
  if (optionKey === "conder") return Number(coach.air_conditioning_price) || 0;
  if (optionKey === "wifi") return Number(coach.wifi_price) || 0;
  if (optionKey === "food") return Number(coach.food_price ?? coach.express_price) || 0;
  return 0;
};

const SeatsSection = ({ routeId, fetchedRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const trainFromState = location.state?.train;

  const rawData = useSelector((state) => state.trainSeats.data);
  const carriages = useMemo(
    () =>
      Array.isArray(rawData)
        ? rawData
        : rawData?.coaches ?? rawData?.data ?? [],
    [rawData]
  );

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenNoSeat, setChildrenNoSeat] = useState(0);
  const [wagonTypeFilter, setWagonTypeFilter] = useState(null);
  // выбор мест по нескольким вагонам: { [coach_id]: Set(seat_number) }
  const [selectedSeatsByCoach, setSelectedSeatsByCoach] = useState({});
  // выбранные пользователем вагоны в блоке "Вагоны"
  const [userSelectedCoachIds, setUserSelectedCoachIds] = useState([]);
  // выбранные опции ФПК по вагону: { [coach_id]: { conder, wifi, underwear, food } }
  const [fpkSelectedByCoach, setFpkSelectedByCoach] = useState({});

  // Какие типы вагонов реально есть в ответе сервера
  const availableWagonTypes = useMemo(() => {
    const present = new Set();
    carriages.forEach((c) => {
      const classType = c.coach?.class_type || c.class_type;
      const id = mapClassTypeToWagonId(classType);
      if (id) present.add(id);
    });
    return WAGON_TYPES.filter((t) => present.has(t.id));
  }, [carriages]);

  const activeWagonType = wagonTypeFilter || availableWagonTypes[0]?.id || null;

  // Фильтрация вагонов по выбранному типу
  const filteredCarriages = useMemo(() => {
    if (!activeWagonType) return carriages;
    const filtered = carriages.filter((c) => {
      const classType = c.coach?.class_type || c.class_type;
      return mapClassTypeToWagonId(classType) === activeWagonType;
    });
    return filtered.length ? filtered : carriages;
  }, [carriages, activeWagonType]);

  const availableCoachIds = useMemo(
    () => filteredCarriages.map((c, idx) => getCoachId(c, idx)),
    [filteredCarriages]
  );

  const selectedCoachIds = useMemo(() => {
    const kept = userSelectedCoachIds.filter((id) => availableCoachIds.includes(id));
    if (kept.length > 0) return kept;
    return availableCoachIds.length ? [availableCoachIds[0]] : [];
  }, [userSelectedCoachIds, availableCoachIds]);

  const totalTicketsNeeded = adults + children;
  const MAX_PASSENGERS = 4;
  const MAX_CHILDREN_WITH_SEAT = 3;
  const totalPassengers = adults + children + childrenNoSeat;
  const remainingPassengers = Math.max(0, MAX_PASSENGERS - totalPassengers);
  const remainingChildrenSeats = Math.max(
    0,
    MAX_CHILDREN_WITH_SEAT - children
  );

  useEffect(() => {
    if (!routeId) return;
    if (fetchedRef.current.has(routeId)) return;
    fetchedRef.current.add(routeId);
    dispatch(trainSeatsRequested(routeId));
  }, [routeId, dispatch, fetchedRef]);

  const seatsByCoach = useMemo(
    () =>
      carriages.reduce((acc, carriage) => {
        const c = carriage?.coach ?? carriage;
        const coachId = c?._id || c?.coach_id || "";
        if (!coachId) return acc;

        const seatMap = Array.isArray(carriage?.seats)
          ? carriage.seats.reduce((obj, seat) => {
              obj[String(seat.index)] = { is_available: seat.available !== false };
              return obj;
            }, {})
          : carriage?.seats || {};

        acc[coachId] = seatMap;
        return acc;
      }, {}),
    [carriages]
  );

  const globalSelectedCount = useMemo(
    () =>
      Object.values(selectedSeatsByCoach).reduce(
        (acc, set) => acc + (set?.size || 0),
        0
      ),
    [selectedSeatsByCoach]
  );

  const handleSeatClick = (seatNum, coachId) => {
    const seat = seatsByCoach[coachId]?.[seatNum];
    if (!seat || seat.is_available === false) return;

    const id = coachId;
    const prevSet = selectedSeatsByCoach[id] || new Set();
    const nextSet = new Set(prevSet);

    if (nextSet.has(seatNum)) {
      nextSet.delete(seatNum);
    } else {
      // глобальное ограничение по количеству билетов
      if (globalSelectedCount >= totalTicketsNeeded) return;
      nextSet.add(seatNum);
    }

    setSelectedSeatsByCoach((prev) => ({
      ...prev,
      [id]: nextSet,
    }));
  };

  const toggleCoachSelection = (coachId) => {
    setUserSelectedCoachIds((prev) => {
      const base = prev.filter((id) => availableCoachIds.includes(id));
      const current = base.length > 0 ? base : availableCoachIds.length ? [availableCoachIds[0]] : [];

      if (current.includes(coachId)) {
        // оставляем хотя бы один выбранный вагон
        if (current.length === 1) return current;
        return current.filter((id) => id !== coachId);
      }
      return [...current, coachId];
    });
  };

  const toggleFpkOption = (coachId, key) => {
    setFpkSelectedByCoach((prev) => {
      const cur = prev[coachId] || {};
      return {
        ...prev,
        [coachId]: { ...cur, [key]: !cur[key] },
      };
    });
  };

  const handleConfirmSeats = () => {
    // Если нет выбранных мест вообще — не переходим
    const totalSelected = Object.values(selectedSeatsByCoach).reduce(
      (acc, set) => acc + set.size,
      0
    );
    if (totalSelected === 0) return;

    const selectedSeats = Object.entries(selectedSeatsByCoach).flatMap(
      ([coachId, set]) =>
        Array.from(set).map((seatNum) => ({
          coach_id: coachId,
          seat_number: parseInt(seatNum, 10),
        }))
    );

    dispatch(
      setSelectedSeats({
        selectedSeats,
        routeId,
      })
    );

    // Собрать выбранные доп. опции ФПК с ценами и сохранить в order
    const fpkOptionsList = [];
    Object.entries(fpkSelectedByCoach || {}).forEach(([coachId, selected]) => {
      if (!selected || typeof selected !== "object") return;
      const carriageIdx = carriages.findIndex((c, i) => getCoachId(c, i) === coachId);
      const carriage = carriageIdx >= 0 ? carriages[carriageIdx] : null;
      const coach = carriage?.coach ?? carriage;
      ["conder", "wifi", "underwear", "food"].forEach((key) => {
        if (selected[key]) {
          const price = getFpkPrice(coach, key);
          fpkOptionsList.push({
            coach_id: coachId,
            option_key: key,
            price,
            label: FPK_LABELS[key],
          });
        }
      });
    });
    dispatch(setFpkOptions(fpkOptionsList));

    navigate("/passengers");
  };

  const departure = trainFromState?.departure;
  const trainNumber = departure?.train?.name || "—";
  const fromCity = departure?.from?.city?.name || "—";
  const toCity = departure?.to?.city?.name || "—";
  const fromStation = departure?.from?.railway_station_name || "";
  const toStation = departure?.to?.railway_station_name || "";
  const fromDatetime = departure?.from?.datetime;
  const toDatetime = departure?.to?.datetime;
  const duration = departure?.duration;

  const normalizeCount = (value, max = 4) => {
    const cleaned = String(value ?? "").replace(/\D/g, "").replace(/^0+/, "");
    const n = parseInt(cleaned === "" ? "0" : cleaned, 10);
    if (Number.isNaN(n)) return 0;
    return Math.min(Math.max(n, 0), max);
  };

  return (
    <>
      <h1 className="seats-page-title">ВЫБОР МЕСТ</h1>
      <div className="seats-page-content">
        <div className="seats-page-header">
          <button
            type="button"
            className="seats-page-back"
            onClick={() => navigate(-1)}
          >
            <span className="seats-back-arrow">→</span>
            <span className="seats-back-label">Выбрать другой поезд</span>
          </button>
        </div>

        <div className="seats-route-block">
          <div className="seats-route-col seats-route-col-train">
            <div className="seats-route-train-icon-wrap">
              <img
                src={trainSeatsImg}
                alt=""
                className="seats-route-train-img"
              />
            </div>
            <div className="seats-route-train-info">
              <div className="seats-route-train-info-wrapper">
                <div className="seats-route-train-number">{trainNumber}</div>
                <div className="seats-route-cities-main">
                  <span className="seats-route-city">
                    {fromCity} <span className="seats-route-city-arrow">→</span>
                  </span>
                  <span className="seats-route-city seats-route-city-to">
                    {toCity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="seats-route-col seats-route-col-depart">
            <div className="seats-route-time-main">
              {formatTime(fromDatetime)}
            </div>
            <div className="seats-route-station">
              {fromCity}, {fromStation}
            </div>
          </div>

          {/* Стрелка направления между отправлением и прибытием */}
          <div className="seats-route-col seats-route-col-arrow">
            <div className="seats-route-arrow-line">━━━━━━━━━━►</div>
          </div>

          <div className="seats-route-col seats-route-col-arrive">
            <div className="seats-route-time-main">
              {formatTime(toDatetime)}
            </div>
            <div className="seats-route-station">
              {toCity}, {toStation}
            </div>
          </div>

          <div className="seats-route-col seats-route-col-duration">
            <div className="seats-route-duration-icon">⏱</div>
            <div className="seats-route-duration-text">
              {formatDuration(duration)}
            </div>
          </div>
        </div>

        <div className="seats-tickets-count-block">
          <h3 className="seats-block-title">Количество билетов</h3>
          <div className="seats-tickets-row">
            <div className="seats-ticket-field">
              <div className="seats-ticket-control">
                <span className="seats-ticket-placeholder">Взрослых</span>
                <input
                  className="seats-ticket-input"
                  type="number"
                  min={0}
                  max={4}
                  value={adults}
                  onChange={(e) => setAdults(normalizeCount(e.target.value, 4))}
                />
              </div>
              {totalPassengers > 0 && remainingPassengers > 0 && (
                <p className="seats-field-hint">
                  Можно добавить еще {remainingPassengers} пассажира
                </p>
              )}
            </div>
            <div className="seats-ticket-field">
              <div className="seats-ticket-control">
                <span className="seats-ticket-placeholder">Детских</span>
                <input
                  className="seats-ticket-input"
                  type="number"
                  min={0}
                  max={4}
                  value={children}
                  onChange={(e) =>
                    setChildren(normalizeCount(e.target.value, 4))
                  }
                />
              </div>
              {children > 0 && remainingChildrenSeats > 0 && (
                <p className="seats-field-hint">
                  Можно добавить еще 3 детей до 10 лет. Свое место в вагоне, как
                  у взрослых, но дешевле в среднем на 50-65%
                </p>
              )}
            </div>
            <div className="seats-ticket-field">
              <div className="seats-ticket-control">
                <span className="seats-ticket-placeholder">
                  Детских «без места»
                </span>
                <input
                  className="seats-ticket-input"
                  type="number"
                  min={0}
                  max={4}
                  value={childrenNoSeat}
                  onChange={(e) =>
                    setChildrenNoSeat(normalizeCount(e.target.value, 4))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="seats-wagon-type-block">
          <h3 className="seats-block-title">Тип вагона</h3>
          <div className="seats-wagon-type-icons">
            {availableWagonTypes.map((type) => {
              const isActive = activeWagonType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`seats-wagon-type-btn ${isActive ? "active" : ""}`}
                  onClick={() => setWagonTypeFilter(type.id)}
                >
                  <span className="seats-wagon-type-icon">
                    <img src={type.icon} alt={type.name} />
                  </span>
                  <span className="seats-wagon-type-name">{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="seats-wagon-main">
          <div className="seats-wagon-bar">
            Нумерация вагонов начинается с головы поезда
          </div>
          <div className="seats-wagon-selector-row">
            <span className="seats-wagon-label">Вагоны</span>
            <div className="seats-wagon-numbers">
              {filteredCarriages.map((carriage, idx) => {
                const wagonLabel = getWagonDisplayNumber(carriage, idx);
                const coachId = getCoachId(carriage, idx);
                const isActive = selectedCoachIds.includes(coachId);
                return (
                  <button
                    key={coachId}
                    type="button"
                    className={`seats-wagon-num ${isActive ? "active" : ""}`}
                    onClick={() => toggleCoachSelection(coachId)}
                  >
                    {wagonLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredCarriages
            .filter((carriage, carriageIdx) =>
              selectedCoachIds.includes(getCoachId(carriage, carriageIdx)),
            )
            .map((carriage, carriageIdx) => {
              const carriageCoach = carriage?.coach ?? carriage;
              const carriageCoachId = getCoachId(carriage, carriageIdx);
              const carriageSeats = Array.isArray(carriage?.seats)
                ? carriage.seats.reduce((acc, seat) => {
                    acc[String(seat.index)] = {
                      is_available: seat.available !== false,
                    };
                    return acc;
                  }, {})
                : carriage?.seats || {};
              const carriageSeatNumbers = Object.keys(carriageSeats).sort(
                (a, b) => parseInt(a, 10) - parseInt(b, 10),
              );
              const carriageUpperSeats = carriageSeatNumbers.filter(
                (n) => parseInt(n, 10) % 2 === 0,
              );
              const carriageLowerSeats = carriageSeatNumbers.filter(
                (n) => parseInt(n, 10) % 2 === 1,
              );
              const carriageTopPrice =
                carriageCoach?.top_price ?? carriageCoach?.price ?? 0;
              const carriageBottomPrice =
                carriageCoach?.bottom_price ?? carriageCoach?.price ?? 0;
              const carriageHasAirConditioning =
                !!carriageCoach?.have_air_conditioning;
              const carriageHasWifi = !!carriageCoach?.have_wifi;
              const carriageHasLinens =
                carriageCoach?.is_linens_included ||
                (carriageCoach?.linens_price ?? 0) > 0;
              const carriageHasFood = !!carriageCoach?.have_express;
              const carriageSelectedSet =
                selectedSeatsByCoach[carriageCoachId] || new Set();
              const carriageSeatPairs = (() => {
                const sorted = [...carriageSeatNumbers]
                  .map(Number)
                  .sort((a, b) => a - b);
                const pairs = [];
                for (let i = 0; i < sorted.length; i += 2) {
                  const lower = sorted[i];
                  const upper = sorted[i + 1] ?? null;
                  pairs.push({
                    lower: String(lower),
                    upper: upper !== null ? String(upper) : null,
                  });
                }
                return pairs;
              })();
              const carriageHalf = Math.ceil(carriageSeatPairs.length / 2);
              const carriageTopRowPairs = carriageSeatPairs.slice(
                0,
                carriageHalf,
              );
              const carriageBottomRowPairs =
                carriageSeatPairs.slice(carriageHalf);
              const wagonLabel = getWagonDisplayNumber(carriage, carriageIdx);

              return (
                <div
                  key={carriageCoachId || carriageIdx}
                  className="seats-wagon-detail-row"
                >
                  <div className="seats-wagon-badge-large">
                    <span className="seats-wagon-badge-num">{wagonLabel}</span>
                    <span className="seats-wagon-badge-label">вагон</span>
                  </div>
                  <div className="seats-layout-left">
                    <div className="seats-summary-card">
                      <div className="seats-summary-main">
                        <div className="seats-summary-column">
                          <div className="seats-summary-title-row">
                            <span className="seats-summary-title">Места</span>
                            <span className="seats-total-value">
                              {carriageSeatNumbers.length}
                            </span>
                          </div>
                          <span className="seats-places-line">
                            Верхние{" "}
                            <span className="seats-count">
                              {carriageUpperSeats.length}
                            </span>
                          </span>
                          <span className="seats-places-line">
                            Нижние{" "}
                            <span className="seats-count">
                              {carriageLowerSeats.length}
                            </span>
                          </span>
                        </div>

                        <div className="seats-summary-column seats-summary-column-cost">
                          <span className="seats-summary-title">Стоимость</span>
                          <div className="seats-cost-value-wrapper">
                            <span className="seats-cost-value">
                              {carriageUpperSeats.length ? (
                                <>
                                  {Math.round(carriageTopPrice).toLocaleString(
                                    "ru-RU",
                                  )}{" "}
                                  <span
                                    className="seats-cost-currency"
                                    aria-hidden="true"
                                  >
                                    ₽
                                  </span>
                                </>
                              ) : (
                                "—"
                              )}
                            </span>
                            <span className="seats-cost-value">
                              {carriageLowerSeats.length ? (
                                <>
                                  {Math.round(
                                    carriageBottomPrice,
                                  ).toLocaleString("ru-RU")}{" "}
                                  <span
                                    className="seats-cost-currency"
                                    aria-hidden="true"
                                  >
                                    ₽
                                  </span>
                                </>
                              ) : (
                                "—"
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="seats-summary-column seats-summary-right">
                          <span className="seats-services-label">
                            Обслуживание <span>ФПК</span>
                          </span>
                          <div className="seats-services-icons">
                            {[
                              {
                                key: "conder",
                                included: carriageHasAirConditioning,
                                title: "Кондиционер",
                                src: conderWagonIcon,
                              },
                              {
                                key: "wifi",
                                included: carriageHasWifi,
                                title: "Wi-Fi",
                                src: wifiWagonIcon,
                              },
                              {
                                key: "underwear",
                                included: carriageHasLinens,
                                title: "Бельё",
                                src: underwearWagonIcon,
                              },
                              {
                                key: "food",
                                included: carriageHasFood,
                                title: "Питание",
                                src: foodWagonIcon,
                              },
                            ].map(({ key, included, title, src }) => {
                              const selected = !!(fpkSelectedByCoach[
                                carriageCoachId
                              ] || {})[key];
                              const stateClass = included
                                ? "seats-service-btn--included"
                                : selected
                                  ? "seats-service-btn--selected"
                                  : "seats-service-btn--inactive";
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  className={`seats-service-btn seats-service-btn--${key} ${stateClass}`}
                                  onClick={() =>
                                    !included &&
                                    toggleFpkOption(carriageCoachId, key)
                                  }
                                  title={title}
                                  aria-pressed={included ? undefined : selected}
                                >
                                  <span className="seats-service-icon-inner">
                                    <img
                                      src={src}
                                      alt=""
                                      className="seats-service-icon-img"
                                      aria-hidden
                                    />
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="seats-legend">
                      <div className="seats-legend-item">
                        <div className="seats-legend-box available" />
                        <span>Свободное</span>
                      </div>
                      <div className="seats-legend-item">
                        <div className="seats-legend-box occupied" />
                        <span>Занято</span>
                      </div>
                      <div className="seats-legend-item">
                        <div className="seats-legend-box selected" />
                        <span>Выбрано</span>
                      </div>
                    </div>

                    <div className="carriage-scheme">
                      <div className="carriage-scheme-header">
                        <div className="carriage-number-badge">
                          {wagonLabel}
                        </div>
                        <div className="carriage-end-icons carriage-end-left" />
                        <div className="carriage-aisle-header" />
                        <div className="carriage-end-icons carriage-end-right" />
                      </div>

                      <div className="carriage-rows">
                        <div className="carriage-row carriage-row-top">
                          {carriageTopRowPairs.map((pair, idx) => (
                            <div key={idx} className="seat-block">
                              <button
                                type="button"
                                className={`seat-btn-inline ${
                                  carriageSeats[pair.upper]?.is_available ===
                                  false
                                    ? "occupied"
                                    : ""
                                } ${
                                  carriageSelectedSet.has(pair.upper)
                                    ? "selected"
                                    : ""
                                }`}
                                disabled={
                                  carriageSeats[pair.upper]?.is_available ===
                                  false
                                }
                                onClick={() =>
                                  handleSeatClick(pair.upper, carriageCoachId)
                                }
                                title={`Место ${pair.upper}`}
                              >
                                {pair.upper}
                              </button>
                              <button
                                type="button"
                                className={`seat-btn-inline ${
                                  carriageSeats[pair.lower]?.is_available ===
                                  false
                                    ? "occupied"
                                    : ""
                                } ${
                                  carriageSelectedSet.has(pair.lower)
                                    ? "selected"
                                    : ""
                                }`}
                                disabled={
                                  carriageSeats[pair.lower]?.is_available ===
                                  false
                                }
                                onClick={() =>
                                  handleSeatClick(pair.lower, carriageCoachId)
                                }
                                title={`Место ${pair.lower}`}
                              >
                                {pair.lower}
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="carriage-aisle-visual" />
                        <div className="carriage-row carriage-row-bottom">
                          {carriageBottomRowPairs.map((pair, idx) => (
                            <div key={idx} className="seat-block">
                              <button
                                type="button"
                                className={`seat-btn-inline ${
                                  carriageSeats[pair.upper]?.is_available ===
                                  false
                                    ? "occupied"
                                    : ""
                                } ${
                                  carriageSelectedSet.has(pair.upper)
                                    ? "selected"
                                    : ""
                                }`}
                                disabled={
                                  pair.upper &&
                                  carriageSeats[pair.upper]?.is_available ===
                                    false
                                }
                                onClick={() =>
                                  pair.upper &&
                                  handleSeatClick(pair.upper, carriageCoachId)
                                }
                                title={pair.upper ? `Место ${pair.upper}` : ""}
                              >
                                {pair.upper ?? "—"}
                              </button>
                              <button
                                type="button"
                                className={`seat-btn-inline ${
                                  carriageSeats[pair.lower]?.is_available ===
                                  false
                                    ? "occupied"
                                    : ""
                                } ${
                                  carriageSelectedSet.has(pair.lower)
                                    ? "selected"
                                    : ""
                                }`}
                                disabled={
                                  carriageSeats[pair.lower]?.is_available ===
                                  false
                                }
                                onClick={() =>
                                  handleSeatClick(pair.lower, carriageCoachId)
                                }
                                title={`Место ${pair.lower}`}
                              >
                                {pair.lower}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="seats-page-actions">
          <button
            type="button"
            className="seats-btn-next"
            disabled={
              globalSelectedCount === 0 ||
              globalSelectedCount !== totalTicketsNeeded
            }
            onClick={handleConfirmSeats}
          >
            ДАЛЕЕ
          </button>
        </div>
      </div>
    </>
  );
};

export default SeatsSection;

