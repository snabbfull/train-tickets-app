import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { trainSeatsRequested } from "../../../store/actions";
import {
  setSelectedSeats,
  setFpkOptions,
  setOrderTrainSummary,
  setLastRoutesSearch,
  setLastSelectedTrain,
} from "../../../store/order/orderSlice";
import {
  WAGON_TYPES,
  mapClassTypeToWagonId,
  getCoachId,
  FPK_LABELS,
  getFpkPrice,
} from "./seatsSectionUtils";
import RouteBlock from "./RouteBlock";
import WagonTypeBlock from "./WagonTypeBlock";
import WagonMainBlock from "./WagonMainBlock";
import "./SeatsSection.css";

const SeatsSection = ({ routeId, fetchedRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const trainFromState = location.state?.train;
  const searchParams = location.state?.searchParams;
  const arrivalRouteId = trainFromState?.arrival?._id ?? null;

  const dataByRoute = useSelector(
    (state) => state.trainSeats.dataByRoute ?? {},
  );
  const legacyData = useSelector((state) => state.trainSeats.data);
  const rawData = dataByRoute[routeId] ?? legacyData;
  const carriages = useMemo(
    () =>
      Array.isArray(rawData)
        ? rawData
        : (rawData?.coaches ?? rawData?.data ?? []),
    [rawData],
  );

  const rawDataArrival = arrivalRouteId
    ? (dataByRoute[arrivalRouteId] ?? null)
    : null;
  const carriagesArrival = useMemo(
    () =>
      !rawDataArrival
        ? []
        : Array.isArray(rawDataArrival)
          ? rawDataArrival
          : (rawDataArrival?.coaches ?? rawDataArrival?.data ?? []),
    [rawDataArrival],
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
  // Обратный маршрут: те же состояния
  const [wagonTypeFilterArrival, setWagonTypeFilterArrival] = useState(null);
  const [selectedSeatsByCoachArrival, setSelectedSeatsByCoachArrival] =
    useState({});
  const [userSelectedCoachIdsArrival, setUserSelectedCoachIdsArrival] =
    useState([]);
  const [fpkSelectedByCoachArrival, setFpkSelectedByCoachArrival] = useState(
    {},
  );

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
    [filteredCarriages],
  );

  const selectedCoachIds = useMemo(() => {
    const kept = userSelectedCoachIds.filter((id) =>
      availableCoachIds.includes(id),
    );
    if (kept.length > 0) return kept;
    return availableCoachIds.length ? [availableCoachIds[0]] : [];
  }, [userSelectedCoachIds, availableCoachIds]);

  const totalTicketsNeeded = adults + children;
  const MAX_PASSENGERS = 4;
  const MAX_CHILDREN_WITH_SEAT = 3;
  const totalPassengers = adults + children + childrenNoSeat;
  const remainingPassengers = Math.max(0, MAX_PASSENGERS - totalPassengers);
  const remainingChildrenSeats = Math.max(0, MAX_CHILDREN_WITH_SEAT - children);

  useEffect(() => {
    if (!routeId) return;
    if (fetchedRef.current.has(routeId)) return;
    fetchedRef.current.add(routeId);
    dispatch(trainSeatsRequested(routeId));
  }, [routeId, dispatch, fetchedRef]);

  useEffect(() => {
    if (!arrivalRouteId) return;
    if (fetchedRef.current.has(arrivalRouteId)) return;
    fetchedRef.current.add(arrivalRouteId);
    dispatch(trainSeatsRequested(arrivalRouteId));
  }, [arrivalRouteId, dispatch, fetchedRef]);

  const seatsByCoach = useMemo(
    () =>
      carriages.reduce((acc, carriage) => {
        const c = carriage?.coach ?? carriage;
        const coachId = c?._id || c?.coach_id || "";
        if (!coachId) return acc;

        const seatMap = Array.isArray(carriage?.seats)
          ? carriage.seats.reduce((obj, seat) => {
              obj[String(seat.index)] = {
                is_available: seat.available !== false,
              };
              return obj;
            }, {})
          : carriage?.seats || {};

        acc[coachId] = seatMap;
        return acc;
      }, {}),
    [carriages],
  );

  const globalSelectedCount = useMemo(
    () =>
      Object.values(selectedSeatsByCoach).reduce(
        (acc, set) => acc + (set?.size || 0),
        0,
      ),
    [selectedSeatsByCoach],
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
      const current =
        base.length > 0
          ? base
          : availableCoachIds.length
            ? [availableCoachIds[0]]
            : [];

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

  // Обратный маршрут: типы вагонов, фильтр, вагоны, места
  const availableWagonTypesArrival = useMemo(() => {
    const present = new Set();
    carriagesArrival.forEach((c) => {
      const classType = c.coach?.class_type || c.class_type;
      const id = mapClassTypeToWagonId(classType);
      if (id) present.add(id);
    });
    return WAGON_TYPES.filter((t) => present.has(t.id));
  }, [carriagesArrival]);

  const activeWagonTypeArrival =
    wagonTypeFilterArrival || availableWagonTypesArrival[0]?.id || null;

  const filteredCarriagesArrival = useMemo(() => {
    if (!activeWagonTypeArrival) return carriagesArrival;
    const filtered = carriagesArrival.filter((c) => {
      const classType = c.coach?.class_type || c.class_type;
      return mapClassTypeToWagonId(classType) === activeWagonTypeArrival;
    });
    return filtered.length ? filtered : carriagesArrival;
  }, [carriagesArrival, activeWagonTypeArrival]);

  const availableCoachIdsArrival = useMemo(
    () => filteredCarriagesArrival.map((c, idx) => getCoachId(c, idx)),
    [filteredCarriagesArrival],
  );

  const selectedCoachIdsArrival = useMemo(() => {
    const kept = userSelectedCoachIdsArrival.filter((id) =>
      availableCoachIdsArrival.includes(id),
    );
    if (kept.length > 0) return kept;
    return availableCoachIdsArrival.length ? [availableCoachIdsArrival[0]] : [];
  }, [userSelectedCoachIdsArrival, availableCoachIdsArrival]);

  const seatsByCoachArrival = useMemo(
    () =>
      carriagesArrival.reduce((acc, carriage) => {
        const c = carriage?.coach ?? carriage;
        const coachId = c?._id || c?.coach_id || "";
        if (!coachId) return acc;
        const seatMap = Array.isArray(carriage?.seats)
          ? carriage.seats.reduce((obj, seat) => {
              obj[String(seat.index)] = {
                is_available: seat.available !== false,
              };
              return obj;
            }, {})
          : carriage?.seats || {};
        acc[coachId] = seatMap;
        return acc;
      }, {}),
    [carriagesArrival],
  );

  const globalSelectedCountArrival = useMemo(
    () =>
      Object.values(selectedSeatsByCoachArrival).reduce(
        (acc, set) => acc + (set?.size || 0),
        0,
      ),
    [selectedSeatsByCoachArrival],
  );

  const handleSeatClickArrival = (seatNum, coachId) => {
    const seat = seatsByCoachArrival[coachId]?.[seatNum];
    if (!seat || seat.is_available === false) return;
    const prevSet = selectedSeatsByCoachArrival[coachId] || new Set();
    const nextSet = new Set(prevSet);
    if (nextSet.has(seatNum)) {
      nextSet.delete(seatNum);
    } else {
      if (globalSelectedCountArrival >= totalTicketsNeeded) return;
      nextSet.add(seatNum);
    }
    setSelectedSeatsByCoachArrival((prev) => ({
      ...prev,
      [coachId]: nextSet,
    }));
  };

  const toggleCoachSelectionArrival = (coachId) => {
    setUserSelectedCoachIdsArrival((prev) => {
      const base = prev.filter((id) => availableCoachIdsArrival.includes(id));
      const current =
        base.length > 0
          ? base
          : availableCoachIdsArrival.length
            ? [availableCoachIdsArrival[0]]
            : [];
      if (current.includes(coachId)) {
        if (current.length === 1) return current;
        return current.filter((id) => id !== coachId);
      }
      return [...current, coachId];
    });
  };

  const toggleFpkOptionArrival = (coachId, key) => {
    setFpkSelectedByCoachArrival((prev) => {
      const cur = prev[coachId] || {};
      return {
        ...prev,
        [coachId]: { ...cur, [key]: !cur[key] },
      };
    });
  };

  const getSeatPrice = (carriageList, coachId, seatNum) => {
    const idx = carriageList.findIndex((c, i) => getCoachId(c, i) === coachId);
    if (idx < 0) return 0;
    const coach = carriageList[idx]?.coach ?? carriageList[idx];
    const num = parseInt(seatNum, 10);
    const isTop = num % 2 === 0;
    const price = isTop ? coach?.top_price : coach?.bottom_price;
    return Number(price ?? coach?.price ?? 0) || 0;
  };

  const handleConfirmSeats = () => {
    const totalSelected = Object.values(selectedSeatsByCoach).reduce(
      (acc, set) => acc + set.size,
      0,
    );
    if (totalSelected === 0) return;

    const departureList = Object.entries(selectedSeatsByCoach).flatMap(
      ([coachId, set]) =>
        Array.from(set).map((seatNum) => ({
          coach_id: coachId,
          seat_number: parseInt(seatNum, 10),
          seat_price: getSeatPrice(carriages, coachId, seatNum),
        })),
    );
    const adultsCount = adults;
    const selectedSeats = departureList.map((seat, i) => ({
      ...seat,
      is_child: i >= adultsCount,
    }));

    const arrivalList =
      arrivalRouteId && carriagesArrival.length > 0
        ? Object.entries(selectedSeatsByCoachArrival).flatMap(
            ([coachId, set]) =>
              Array.from(set).map((seatNum) => ({
                coach_id: coachId,
                seat_number: parseInt(seatNum, 10),
                seat_price: getSeatPrice(carriagesArrival, coachId, seatNum),
              })),
          )
        : [];
    const arrivalSeats = arrivalList.map((seat, i) => ({
      ...seat,
      is_child: i >= adultsCount,
    }));

    const trainSummary = {
      departure: {
        fromCity: departure?.from?.city?.name || "—",
        fromStation: departure?.from?.railway_station_name || "",
        toCity: departure?.to?.city?.name || "—",
        toStation: departure?.to?.railway_station_name || "",
        fromDatetime: departure?.from?.datetime,
        toDatetime: departure?.to?.datetime,
        trainName: departure?.train?.name || "—",
        trainNumber: departure?.train?.name || "—",
        duration: departure?.duration,
      },
      ...(arrival &&
        arrivalList.length > 0 && {
          arrival: {
            fromCity: arrival?.from?.city?.name || "—",
            fromStation: arrival?.from?.railway_station_name || "",
            toCity: arrival?.to?.city?.name || "—",
            toStation: arrival?.to?.railway_station_name || "",
            fromDatetime: arrival?.from?.datetime,
            toDatetime: arrival?.to?.datetime,
            trainName: arrival?.train?.name || "—",
            trainNumber: arrival?.train?.name || "—",
            duration: arrival?.duration,
          },
        }),
    };
    dispatch(setOrderTrainSummary(trainSummary));
    if (searchParams) dispatch(setLastRoutesSearch(searchParams));
    if (trainFromState) dispatch(setLastSelectedTrain(trainFromState));

    dispatch(
      setSelectedSeats({
        selectedSeats,
        routeId,
        ...(arrivalRouteId &&
          arrivalSeats.length > 0 && { arrivalRouteId, arrivalSeats }),
      }),
    );

    const fpkOptionsList = [];
    const collectFpk = (fpkByCoach, carrList) => {
      Object.entries(fpkByCoach || {}).forEach(([coachId, selected]) => {
        if (!selected || typeof selected !== "object") return;
        const carriageIdx = carrList.findIndex(
          (c, i) => getCoachId(c, i) === coachId,
        );
        const carriage = carriageIdx >= 0 ? carrList[carriageIdx] : null;
        const coach = carriage?.coach ?? carriage;
        ["conder", "wifi", "underwear", "food"].forEach((key) => {
          if (selected[key]) {
            fpkOptionsList.push({
              coach_id: coachId,
              option_key: key,
              price: getFpkPrice(coach, key),
              label: FPK_LABELS[key],
            });
          }
        });
      });
    };
    collectFpk(fpkSelectedByCoach, carriages);
    collectFpk(fpkSelectedByCoachArrival, carriagesArrival);
    dispatch(setFpkOptions(fpkOptionsList));

    navigate("/passengers");
  };

  const departure = trainFromState?.departure;
  const arrival = trainFromState?.arrival;
  const trainNumber = departure?.train?.name || "—";
  const fromCity = departure?.from?.city?.name || "—";
  const toCity = departure?.to?.city?.name || "—";
  const fromStation = departure?.from?.railway_station_name || "";
  const toStation = departure?.to?.railway_station_name || "";
  const fromDatetime = departure?.from?.datetime;
  const toDatetime = departure?.to?.datetime;
  const duration = departure?.duration;

  const trainNumberArrival = arrival?.train?.name || "—";
  const fromCityArrival = arrival?.from?.city?.name || "—";
  const toCityArrival = arrival?.to?.city?.name || "—";
  const fromStationArrival = arrival?.from?.railway_station_name || "";
  const toStationArrival = arrival?.to?.railway_station_name || "";
  const fromDatetimeArrival = arrival?.from?.datetime;
  const toDatetimeArrival = arrival?.to?.datetime;
  const durationArrival = arrival?.duration;

  const normalizeCount = (value, max = 4) => {
    const cleaned = String(value ?? "")
      .replace(/\D/g, "")
      .replace(/^0+/, "");
    const n = parseInt(cleaned === "" ? "0" : cleaned, 10);
    if (Number.isNaN(n)) return 0;
    return Math.min(Math.max(n, 0), max);
  };

  const departureTotal = useMemo(() => {
    let seats = 0;
    Object.entries(selectedSeatsByCoach).forEach(([coachId, set]) => {
      Array.from(set || []).forEach((seatNum) => {
        seats += getSeatPrice(carriages, coachId, seatNum);
      });
    });
    let fpk = 0;
    Object.entries(fpkSelectedByCoach || {}).forEach(([coachId, selected]) => {
      if (!selected || typeof selected !== "object") return;
      const carriageIdx = carriages.findIndex(
        (c, i) => getCoachId(c, i) === coachId,
      );
      const coach = carriageIdx >= 0 ? (carriages[carriageIdx]?.coach ?? carriages[carriageIdx]) : null;
      ["conder", "wifi", "underwear", "food"].forEach((key) => {
        if (selected[key]) fpk += getFpkPrice(coach, key);
      });
    });
    return seats + fpk;
  }, [selectedSeatsByCoach, fpkSelectedByCoach, carriages]);

  const arrivalTotal = useMemo(() => {
    if (!arrival || carriagesArrival.length === 0) return 0;
    let seats = 0;
    Object.entries(selectedSeatsByCoachArrival).forEach(([coachId, set]) => {
      Array.from(set || []).forEach((seatNum) => {
        seats += getSeatPrice(carriagesArrival, coachId, seatNum);
      });
    });
    let fpk = 0;
    Object.entries(fpkSelectedByCoachArrival || {}).forEach(([coachId, selected]) => {
      if (!selected || typeof selected !== "object") return;
      const carriageIdx = carriagesArrival.findIndex(
        (c, i) => getCoachId(c, i) === coachId,
      );
      const coach = carriageIdx >= 0 ? (carriagesArrival[carriageIdx]?.coach ?? carriagesArrival[carriageIdx]) : null;
      ["conder", "wifi", "underwear", "food"].forEach((key) => {
        if (selected[key]) fpk += getFpkPrice(coach, key);
      });
    });
    return seats + fpk;
  }, [selectedSeatsByCoachArrival, fpkSelectedByCoachArrival, carriagesArrival, arrival]);

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

        <RouteBlock
          trainNumber={trainNumber}
          fromCity={fromCity}
          toCity={toCity}
          fromStation={fromStation}
          toStation={toStation}
          fromDatetime={fromDatetime}
          toDatetime={toDatetime}
          duration={duration}
        />

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

        <WagonTypeBlock
          types={availableWagonTypes}
          activeTypeId={activeWagonType}
          onSelect={setWagonTypeFilter}
        />

        <WagonMainBlock
          filteredCarriages={filteredCarriages}
          selectedCoachIds={selectedCoachIds}
          onCoachToggle={toggleCoachSelection}
          selectedSeatsByCoach={selectedSeatsByCoach}
          fpkSelectedByCoach={fpkSelectedByCoach}
          onSeatClick={handleSeatClick}
          onFpkToggle={toggleFpkOption}
        />
        {departureTotal > 0 && (
          <div className="seats-block-sum">
            <span className="seats-block-sum-amount">
              {departureTotal.toLocaleString("ru-RU")}
            </span>
            <span className="seats-block-sum-currency" aria-hidden>₽</span>
          </div>
        )}

        {arrival && carriagesArrival.length > 0 && (
          <div className="seats-arrival-section">
            <h3 className="seats-arrival-title">Обратный рейс</h3>
            <RouteBlock
              trainNumber={trainNumberArrival}
              fromCity={fromCityArrival}
              toCity={toCityArrival}
              fromStation={fromStationArrival}
              toStation={toStationArrival}
              fromDatetime={fromDatetimeArrival}
              toDatetime={toDatetimeArrival}
              duration={durationArrival}
              compact
            />
            <WagonTypeBlock
              types={availableWagonTypesArrival}
              activeTypeId={activeWagonTypeArrival}
              onSelect={setWagonTypeFilterArrival}
            />
            <WagonMainBlock
              filteredCarriages={filteredCarriagesArrival}
              selectedCoachIds={selectedCoachIdsArrival}
              onCoachToggle={toggleCoachSelectionArrival}
              selectedSeatsByCoach={selectedSeatsByCoachArrival}
              fpkSelectedByCoach={fpkSelectedByCoachArrival}
              onSeatClick={handleSeatClickArrival}
              onFpkToggle={toggleFpkOptionArrival}
            />
            {arrivalTotal > 0 && (
              <div className="seats-block-sum">
                <span className="seats-block-sum-amount">
                  {arrivalTotal.toLocaleString("ru-RU")}
                </span>
                <span className="seats-block-sum-currency" aria-hidden>₽</span>
              </div>
            )}
          </div>
        )}

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
