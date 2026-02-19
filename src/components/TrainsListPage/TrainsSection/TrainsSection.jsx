import { useEffect } from "react";
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

  const routes = data?.items || [];

  const dateToTimestamp = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    // Создаём дату в UTC (месяцы в JS с 0!)
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return Math.floor(date.getTime() / 1000); // в секундах
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

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    if (newSortBy === sortBy) {
      // Toggle direction
      const newDirection = sortDirection === "desc" ? "asc" : "desc";
      dispatch(changeSortDirection(newDirection));
    } else {
      // Change sortBy, reset to desc
      dispatch(changeSort(newSortBy));
    }
  };

  const handlePageChange = (page) => {
    dispatch(changePage(page));
  };

  return (
    <div className="trains-section">
      <div className="trains-header">
        <div className="trains-count">Найдено поездов: {totalCount}</div>
        <div className="trains-header-options">
          <div className="trains-sort">
            <label>Сортировать по:</label>
            <select value={sortBy} onChange={handleSortChange}>
              <option value="date">Времени</option>
              <option value="price">Стоимости</option>
              <option value="duration">Длительности</option>
            </select>
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
