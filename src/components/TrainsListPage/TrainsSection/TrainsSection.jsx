import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TrainCard from "../TrainCard/TrainCard";
import Pagination from "../Pagination/Pagination";
import { trainsListRequested } from "../../../store/actions";
import {
  changePage,
  changeSort,
  changeSortDirection,
  setLimit,
} from "../../../store/trainsList/trainsListSlice";
import "./TrainsSection.css";

const TrainsSection = ({ locationSearch, fetchedRef }) => {
  const dispatch = useDispatch();
  const { data, loading, currentPage, sortBy, sortDirection, limit } =
    useSelector((state) => state.trainsList);
  const filters = useSelector((state) => state.filters);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  const routes = useMemo(() => data?.items ?? [], [data?.items]);

  const dateToTimestamp = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day, 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
  };

  const timestampToHourValue = (ts) => {
    if (!ts) return 0;
    const d = new Date(ts * 1000);
    return d.getHours() + d.getMinutes() / 60;
  };

  const filteredRoutes = useMemo(
    () =>
      routes.filter((train) => {
        if (!train || !train.departure || !train.departure.from || !train.departure.to) {
          return false;
        }

        const departureFromTs = train.departure.from.datetime;
        const arrivalFromTs = train.arrival?.from?.datetime;

        if (filters.date_start && departureFromTs) {
          const startOfDay = dateToTimestamp(filters.date_start);
          if (departureFromTs < startOfDay) return false;
        }

        if (filters.date_start_arrival) {
          if (!train.arrival || arrivalFromTs == null) return false;
          const startOfDay = dateToTimestamp(filters.date_start_arrival);
          const endOfDay = startOfDay + 24 * 60 * 60;
          if (arrivalFromTs < startOfDay || arrivalFromTs >= endOfDay) return false;
        }

        if (filters.have_first_class && !train.departure?.have_first_class) return false;
        if (filters.have_second_class && !train.departure?.have_second_class) return false;
        if (filters.have_third_class && !train.departure?.have_third_class) return false;
        if (filters.have_fourth_class && !train.departure?.have_fourth_class) return false;

        if (filters.have_wifi && !train.departure?.have_wifi) return false;
        if (filters.have_express && !train.departure?.is_express) return false;

        if (filters.price_from && train.min_price < filters.price_from) return false;
        if (filters.price_to && train.min_price > filters.price_to) return false;

        const depDepartureHour = timestampToHourValue(train.departure?.from?.datetime);
        const depArrivalHour = timestampToHourValue(train.departure?.to?.datetime);
        if (
          depDepartureHour < filters.forward_departure_from ||
          depDepartureHour > filters.forward_departure_to
        ) {
          return false;
        }
        if (depArrivalHour < filters.forward_arrival_from || depArrivalHour > filters.forward_arrival_to) {
          return false;
        }

        if (train.arrival) {
          const backDepartureHour = timestampToHourValue(train.arrival?.from?.datetime);
          const backArrivalHour = timestampToHourValue(train.arrival?.to?.datetime);
          if (
            backDepartureHour < filters.back_departure_from ||
            backDepartureHour > filters.back_departure_to
          ) {
            return false;
          }
          if (backArrivalHour < filters.back_arrival_from || backArrivalHour > filters.back_arrival_to) {
            return false;
          }
        }

        return true;
      }),
    [routes, filters],
  );

  const totalCount = filteredRoutes.length;

  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const fetchedLocationsRef = fetchedRef;

  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(locationSearch));
    if (!params.from_city_id || !params.to_city_id) return;
    if (loading) return;
    if (fetchedLocationsRef.current.has(locationSearch)) return;

    fetchedLocationsRef.current.add(locationSearch);

    dispatch(
      trainsListRequested({
        ...params,
      }),
    );
  }, [dispatch, fetchedLocationsRef, locationSearch, loading]);

  useEffect(() => {
    if (currentPage !== 1) {
      dispatch(changePage(1));
    }
  }, [currentPage, dispatch, filters]);

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      const newDirection = sortDirection === "desc" ? "asc" : "desc";
      dispatch(changeSortDirection(newDirection));
    } else {
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
              <TrainCard
                key={train.departure?._id || train.arrival?._id || `${train.departure?.from?.datetime}-${index}`}
                train={train}
                searchParams={locationSearch}
              />
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
};

export default TrainsSection;
