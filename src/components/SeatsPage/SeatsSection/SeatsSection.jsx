import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { trainSeatsRequested } from "../../../store/actions";
import seetIcon from "../../../assets/seet.png";
import plackartIcon from "../../../assets/plackart.png";
import coupeIcon from "../../../assets/coope.png";
import luxIcon from "../../../assets/lux.png";
import { setSelectedSeats } from "../../../store/order/orderSlice";
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

const SeatsSection = ({ routeId, fetchedRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const trainFromState = location.state?.train;

  const rawData = useSelector((state) => state.trainSeats.data);
  const carriages = Array.isArray(rawData)
    ? rawData
    : rawData?.coaches ?? rawData?.data ?? [];

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenNoSeat, setChildrenNoSeat] = useState(0);
  const [wagonTypeFilter, setWagonTypeFilter] = useState(null);
  const [selectedCarriageIndex, setSelectedCarriageIndex] = useState(0);
  const [selectedSeatsLocal, setSelectedSeatsLocal] = useState(new Set());

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

  // Фильтрация вагонов по выбранному типу
  const filteredCarriages = useMemo(() => {
    if (!wagonTypeFilter) return carriages;
    const filtered = carriages.filter((c) => {
      const classType = c.coach?.class_type || c.class_type;
      return mapClassTypeToWagonId(classType) === wagonTypeFilter;
    });
    return filtered.length ? filtered : carriages;
  }, [carriages, wagonTypeFilter]);

  // Если тип не выбран, устанавливаем первый доступный из ответа
  useEffect(() => {
    if (!wagonTypeFilter && availableWagonTypes.length) {
      setWagonTypeFilter(availableWagonTypes[0].id);
    }
  }, [wagonTypeFilter, availableWagonTypes]);

  useEffect(() => {
    setSelectedCarriageIndex((prev) =>
      Math.min(prev, Math.max(0, filteredCarriages.length - 1))
    );
  }, [filteredCarriages.length]);

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

  const safeCarriageIndex = Math.min(
    selectedCarriageIndex,
    Math.max(0, filteredCarriages.length - 1)
  );
  const currentCarriage = filteredCarriages[safeCarriageIndex];
  const coach = currentCarriage?.coach ?? currentCarriage;
  const carriageTypeName = coach?.name || "Сидячий";

  // Опции обслуживания ФПК для текущего вагона
  const hasAirConditioning = !!coach?.have_air_conditioning;
  const hasWifi = !!coach?.have_wifi;
  const hasLinens =
    coach?.is_linens_included || (coach?.linens_price ?? 0) > 0;
  // В API нет явного поля про еду, используем have_express как признак доп. сервиса
  const hasFood = !!coach?.have_express;

  const seats = Array.isArray(currentCarriage?.seats)
    ? currentCarriage.seats.reduce((acc, seat) => {
        const key = String(seat.index);
        acc[key] = { is_available: seat.available !== false };
        return acc;
      }, {})
    : currentCarriage?.seats || {};

  const seatNumbers = Object.keys(seats).sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10)
  );

  const seatPairs = useMemo(() => {
    const sorted = [...seatNumbers].map(Number).sort((a, b) => a - b);
    const pairs = [];
    for (let i = 0; i < sorted.length; i += 2) {
      const lower = sorted[i];
      const upper = sorted[i + 1] ?? null;
      pairs.push({ lower: String(lower), upper: upper !== null ? String(upper) : null });
    }
    return pairs;
  }, [seatNumbers]);

  const half = Math.ceil(seatPairs.length / 2);
  const topRowPairs = seatPairs.slice(0, half);
  const bottomRowPairs = seatPairs.slice(half);

  const selectedCount = selectedSeatsLocal.size;
  const upperSeats = seatNumbers.filter((n) => parseInt(n, 10) % 2 === 0);
  const lowerSeats = seatNumbers.filter((n) => parseInt(n, 10) % 2 === 1);

  const pricePerSeat = coach?.price ?? 0;
  const topPrice = coach?.top_price ?? coach?.price ?? 0;
  const bottomPrice = coach?.bottom_price ?? coach?.price ?? 0;

  const handleSeatClick = (seatNum) => {
    const seat = seats[seatNum];
    if (!seat || seat.is_available === false) return;

    const next = new Set(selectedSeatsLocal);
    if (next.has(seatNum)) next.delete(seatNum);
    else next.add(seatNum);

    if (next.size > totalTicketsNeeded) return;
    setSelectedSeatsLocal(next);
  };

  const handleConfirmSeats = () => {
    if (selectedSeatsLocal.size === 0 || !currentCarriage) return;
    dispatch(
      setSelectedSeats({
        seatNumbers: Array.from(selectedSeatsLocal),
        routeId,
        coach_id: coach?._id || coach?.coach_id || "",
      })
    );
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
    <div className="seats-page-content">
      <div className="seats-page-header">
        <h1 className="seats-page-title">ВЫБОР МЕСТ</h1>
        <button
          type="button"
          className="seats-page-back"
          onClick={() => navigate("/routes" + (location.search || ""))}
        >
          <span className="seats-back-arrow">←</span>
          <span className="seats-back-label">Выбрать другой поезд</span>
        </button>
      </div>

      <div className="seats-route-block">
        <div className="seats-route-col seats-route-col-train">
          <div className="seats-route-train-number">{trainNumber}</div>
          <div className="seats-route-cities-main">
            <span className="seats-route-city">{fromCity}</span>
            <span className="seats-route-city-arrow">→</span>
            <span className="seats-route-city seats-route-city-to">{toCity}</span>
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
              <span className="seats-ticket-placeholder">
                Взрослых
              </span>
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
              <span className="seats-ticket-placeholder">
                Детских
              </span>
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
                Можно добавить еще 3 детей до 10 лет. Свое место в вагоне, как у
                взрослых, но дешевле в среднем на 50-65%
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
            const isActive = wagonTypeFilter === type.id;
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
            {filteredCarriages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`seats-wagon-num ${
                  safeCarriageIndex === idx ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedCarriageIndex(idx);
                  setSelectedSeatsLocal(new Set());
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        <div className="seats-wagon-detail-row">
          <div className="seats-wagon-badge-large">
            {String(safeCarriageIndex + 1).padStart(2, "0")} вагон
          </div>
          <div className="seats-layout-left">
            {/* Блок Места / Стоимость / Обслуживание ФПК над схемой вагона */}
            <div className="seats-summary-card">
              <div className="seats-summary-main">
                {/* Колонка Места */}
                <div className="seats-summary-column">
                  <span className="seats-summary-title">Места</span>
                  <span className="seats-total-value">{seatNumbers.length}</span>
                  <span className="seats-places-line">
                    Верхние <span className="seats-count">{upperSeats.length}</span>
                  </span>
                  <span className="seats-places-line">
                    Нижние <span className="seats-count">{lowerSeats.length}</span>
                  </span>
                </div>

                {/* Колонка Стоимость (пустая строка под общее кол-во мест, далее цены) */}
                <div className="seats-summary-column seats-summary-column-cost">
                  <span className="seats-summary-title">Стоимость</span>
                  {/* Пустая строка, чтобы выровнять цены с \"Верхние\" / \"Нижние\" */}
                  <span className="seats-cost-placeholder" />
                  <span className="seats-cost-value">
                    {upperSeats.length
                      ? `${Math.round(topPrice).toLocaleString("ru-RU")} ₽`
                      : "—"}
                  </span>
                  <span className="seats-cost-value">
                    {lowerSeats.length
                      ? `${Math.round(bottomPrice).toLocaleString("ru-RU")} ₽`
                      : "—"}
                  </span>
                </div>

                {/* Колонка Обслуживание ФПК (иконки зависят от данных по вагону) */}
                <div className="seats-summary-column seats-summary-right">
                  <span className="seats-services-label">Обслуживание ФПК</span>
                  <div className="seats-services-icons">
                    {hasAirConditioning && <span title="кондиционер">❄️</span>}
                    {hasWifi && <span title="Wi-Fi">📶</span>}
                    {hasLinens && <span title="бельё">🛏️</span>}
                    {hasFood && <span title="питание">🍽️</span>}
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
                  {String(safeCarriageIndex + 1).padStart(2, "0")}
                </div>
                <div className="carriage-end-icons carriage-end-left">
                  <span className="carriage-icon" title="Туалет">
                    🚻
                  </span>
                  <span className="carriage-icon" title="Проводник">
                    👤
                  </span>
                  <span className="carriage-icon" title="Багаж">
                    🛄
                  </span>
                </div>
                <div className="carriage-aisle-header" />
                <div className="carriage-end-icons carriage-end-right">
                  <span className="carriage-icon" title="Туалет">
                    🚻
                  </span>
                  <span className="carriage-icon" title="Не курить">
                    🚭
                  </span>
                  <span className="carriage-icon" title="Урна">
                    🗑️
                  </span>
                </div>
              </div>

              <div className="carriage-rows">
                <div className="carriage-row carriage-row-top">
                  {topRowPairs.map((pair, idx) => (
                    <div key={idx} className="seat-block">
                      <button
                        type="button"
                        className={`seat-btn-inline ${
                          seats[pair.upper]?.is_available === false ? "occupied" : ""
                        } ${
                          selectedSeatsLocal.has(pair.upper) ? "selected" : ""
                        }`}
                        disabled={seats[pair.upper]?.is_available === false}
                        onClick={() => handleSeatClick(pair.upper)}
                        title={`Место ${pair.upper}`}
                      >
                        {pair.upper}
                      </button>
                      <button
                        type="button"
                        className={`seat-btn-inline ${
                          seats[pair.lower]?.is_available === false ? "occupied" : ""
                        } ${
                          selectedSeatsLocal.has(pair.lower) ? "selected" : ""
                        }`}
                        disabled={seats[pair.lower]?.is_available === false}
                        onClick={() => handleSeatClick(pair.lower)}
                        title={`Место ${pair.lower}`}
                      >
                        {pair.lower}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="carriage-aisle-visual" />
                <div className="carriage-row carriage-row-bottom">
                  {bottomRowPairs.map((pair, idx) => (
                    <div key={idx} className="seat-block">
                      <button
                        type="button"
                        className={`seat-btn-inline ${
                          seats[pair.upper]?.is_available === false ? "occupied" : ""
                        } ${
                          selectedSeatsLocal.has(pair.upper) ? "selected" : ""
                        }`}
                        disabled={pair.upper && seats[pair.upper]?.is_available === false}
                        onClick={() => pair.upper && handleSeatClick(pair.upper)}
                        title={pair.upper ? `Место ${pair.upper}` : ""}
                      >
                        {pair.upper ?? "—"}
                      </button>
                      <button
                        type="button"
                        className={`seat-btn-inline ${
                          seats[pair.lower]?.is_available === false ? "occupied" : ""
                        } ${
                          selectedSeatsLocal.has(pair.lower) ? "selected" : ""
                        }`}
                        disabled={seats[pair.lower]?.is_available === false}
                        onClick={() => handleSeatClick(pair.lower)}
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
      </div>

      <div className="seats-page-actions">
        <button
          type="button"
          className="seats-btn-next"
          disabled={selectedCount === 0 || selectedCount !== totalTicketsNeeded}
          onClick={handleConfirmSeats}
        >
          ДАЛЕЕ
        </button>
      </div>
    </div>
  );
};

export default SeatsSection;

