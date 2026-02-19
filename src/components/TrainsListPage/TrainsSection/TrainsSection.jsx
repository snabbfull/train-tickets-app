import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TrainCard from "../TrainCard/TrainCard";
import Pagination from "../Pagination/Pagination";
import { trainsListRequested } from "../../../store/actions";
import {
  changePage,
  changeSort,
  changeSortDirection,
  setLimit
} from "../../../store/trainsList/trainsListSlice";
import "./TrainsSection.css"

const TrainsSection = ({ locationSearch, fetchedRef }) => {
  const dispatch = useDispatch();
  const { data, loading, currentPage, sortBy, sortDirection, limit } = useSelector(
    (state) => state.trainsList,
  );
  const filters = useSelector((state) => state.filters);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  const routes = data?.items || [];

  const dateToTimestamp = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    // Создаём дату в UTC (месяцы в JS с 0!)
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return Math.floor(date.getTime() / 1000); // в секундах
  };

  const timestampToHourValue = (ts) => {
    if (!ts) return 0;
    const d = new Date(ts * 1000);
    return d.getHours() + d.getMinutes() / 60;
  };

  // Apply filters to routes
const filteredRoutes = routes.filter((train) => {
  // 🔒 Защита: пропускаем поезда без обязательных данных
  if (
    !train ||
    !train.departure ||
    !train.departure.from ||
    !train.departure.to
  ) {
    return false;
  }

  const departureFromTs = train.departure.from.datetime;

  // Для arrival проверка опциональна (если есть обратный рейс)
  const arrivalToTs = train.arrival?.to?.datetime;

  // 📅 Фильтр по дате отправления (date_start)
  if (filters.date_start && departureFromTs) {
    const startOfDay = dateToTimestamp(filters.date_start);
    if (departureFromTs < startOfDay) return false;
  }

  // 📅 Фильтр по дате возврата (date_start_arrival) — только если есть arrival
  if (filters.date_start_arrival && arrivalToTs) {
    const endOfDay = dateToTimestamp(filters.date_start_arrival) + 24 * 60 * 60;
    if (arrivalToTs >= endOfDay) return false;
  }

  // 🚃 Filter by train class (с защитой)
  if (filters.have_first_class && !train.departure?.have_first_class)
    return false;
  if (filters.have_second_class && !train.departure?.have_second_class)
    return false;
  if (filters.have_third_class && !train.departure?.have_third_class)
    return false;
  if (filters.have_fourth_class && !train.departure?.have_fourth_class)
    return false;

  // 📡 Filter by additional options
  if (filters.have_wifi && !train.departure?.have_wifi) return false;
  if (filters.have_express && !train.departure?.is_express) return false;

  // 💰 Filter by price
  if (filters.price_from && train.min_price < filters.price_from) return false;
  if (filters.price_to && train.min_price > filters.price_to) return false;

  // 🕒 Время "Туда"
  const depDepartureHour = timestampToHourValue(train.departure?.from?.datetime);
  const depArrivalHour = timestampToHourValue(train.departure?.to?.datetime);
  if (
    depDepartureHour < filters.forward_departure_from ||
    depDepartureHour > filters.forward_departure_to
  ) {
    return false;
  }
  if (
    depArrivalHour < filters.forward_arrival_from ||
    depArrivalHour > filters.forward_arrival_to
  ) {
    return false;
  }

  // 🕒 Время "Обратно" (применяем, только если есть обратный сегмент)
  if (train.arrival) {
    const backDepartureHour = timestampToHourValue(train.arrival?.from?.datetime);
    const backArrivalHour = timestampToHourValue(train.arrival?.to?.datetime);
    if (
      backDepartureHour < filters.back_departure_from ||
      backDepartureHour > filters.back_departure_to
    ) {
      return false;
    }
    if (
      backArrivalHour < filters.back_arrival_from ||
      backArrivalHour > filters.back_arrival_to
    ) {
      return false;
    }
  }

  return true;
});

  const totalCount = filteredRoutes.length;

  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const fetchedLocationsRef = fetchedRef;

  // fetch только при изменении location.search
  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(locationSearch));
    if (!params.from_city_id || !params.to_city_id) return;
    if (loading) return; // не диспатчить если уже loading
    if (fetchedLocationsRef.current.has(locationSearch)) return;

    fetchedLocationsRef.current.add(locationSearch);

    dispatch(
      trainsListRequested({
        ...params,
      }),
    );
  }, [locationSearch, loading]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      dispatch(changePage(1));
    }
  }, [filters]);

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle direction
      const newDirection = sortDirection === "desc" ? "asc" : "desc";
      dispatch(changeSortDirection(newDirection));
    } else {
      // Change sortBy, reset to desc
      dispatch(changeSort(newSortBy));
    }
    setIsSortDropdownOpen(false);
  };

  const handlePageChange = (page) => {
    dispatch(changePage(page));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortLabelMap = {
    date: "Времени",
    price: "Стоимости",
    duration: "Длительности",
  };

  return (
    <div className="trains-section">
      <div className="trains-header">
        <div className="trains-count">Найдено поездов: {totalCount}</div>
        <div className="trains-header-options">
          <div className="trains-sort">
            <label>Сортировать по:</label>
            <div className="trains-sort-select" ref={sortDropdownRef}>
              <button
                type="button"
                className="trains-sort-select-btn"
                onClick={() => setIsSortDropdownOpen((prev) => !prev)}
              >
                {sortLabelMap[sortBy] || "Времени"}
              </button>
              {isSortDropdownOpen && (
                <div className="trains-sort-dropdown">
                  <button
                    type="button"
                    className={`trains-sort-dropdown-item ${
                      sortBy === "date" ? "active" : ""
                    }`}
                    onClick={() => handleSortChange("date")}
                  >
                    Времени
                  </button>
                  <button
                    type="button"
                    className={`trains-sort-dropdown-item ${
                      sortBy === "price" ? "active" : ""
                    }`}
                    onClick={() => handleSortChange("price")}
                  >
                    Стоимости
                  </button>
                  <button
                    type="button"
                    className={`trains-sort-dropdown-item ${
                      sortBy === "duration" ? "active" : ""
                    }`}
                    onClick={() => handleSortChange("duration")}
                  >
                    Длительности
                  </button>
                </div>
              )}
            </div>
            <div
              className="trains-sort-btn"
              onClick={() =>
                dispatch(
                  changeSortDirection(
                    sortDirection === "desc" ? "asc" : "desc",
                  ),
                )
              }
            >
              {sortDirection === "desc" ? "↓" : "↑"}
            </div>
          </div>
          <div className="trains-list-limit">
            показывать по:
            <div>
              <p
                className="trains-list-limit-count"
                onClick={() => dispatch(setLimit(5))}
              >
                5
              </p>
              <p
                className="trains-list-limit-count"
                onClick={() => dispatch(setLimit(10))}
              >
                10
              </p>
              <p
                className="trains-list-limit-count"
                onClick={() => dispatch(setLimit(20))}
              >
                20
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="trains-list">
        {paginatedRoutes.length > 0
          ? paginatedRoutes.map((train, index) => (
              <TrainCard key={index} train={train} />
            ))
          : !loading && <div>Поездов не найдено</div>}
      </div>

      <Pagination
        totalCount={filteredRoutes.length}
        limit={limit}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};;

export default TrainsSection;
