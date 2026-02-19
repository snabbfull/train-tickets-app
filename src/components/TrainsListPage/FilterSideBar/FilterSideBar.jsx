import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import { ru } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import calendarIcon from "../../../assets/calendar.png";
import luxIcon from "../../../assets/lux.png";
import coupeIcon from "../../../assets/coope.png";
import plackartIcon from "../../../assets/plackart.png";
import sittingIcon from "../../../assets/seet.png";
import wifiIcon from "../../../assets/wifi.png";
import expressIcon from "../../../assets/express.png";
import {
  setDateFilter,
  toggleFilter,
  setPriceFilter,
  setTimeFilter,
  resetFilters,
} from "../../../store/filters/filtersSlice";
import "./FilterSideBar.css";

const formatHourLabel = (hour) =>
  `${String(hour).padStart(2, "0")}:00`;

const getRangeTrackStyle = (min, max, fromValue, toValue) => {
  const span = Math.max(1, max - min);
  const fromPercent = ((fromValue - min) / span) * 100;
  const toPercent = ((toValue - min) / span) * 100;
  return {
    background: `linear-gradient(to right,
      #5a5a5a 0%,
      #5a5a5a ${fromPercent}%,
      #ffa800 ${fromPercent}%,
      #ffa800 ${toPercent}%,
      #5a5a5a ${toPercent}%,
      #5a5a5a 100%)`,
  };
};

const parseIsoDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatIsoDate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const FilterSideBar = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const routes = useSelector((state) => state.trainsList.data?.items || []);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [isBackOpen, setIsBackOpen] = useState(false);

  const { minPrice, maxPrice } = useMemo(() => {
    const prices = routes
      .map((r) => Number(r?.min_price))
      .filter((p) => Number.isFinite(p) && p > 0);
    if (!prices.length) return { minPrice: 0, maxPrice: 0 };
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [routes]);

  useEffect(() => {
    if (!maxPrice) return;
    if (filters.price_from == null || filters.price_to == null) {
      dispatch(setPriceFilter({ price_from: minPrice, price_to: maxPrice }));
    }
  }, [minPrice, maxPrice, filters.price_from, filters.price_to, dispatch]);

  const priceFrom =
    filters.price_from == null ? minPrice : Number(filters.price_from);
  const priceTo =
    filters.price_to == null ? maxPrice : Number(filters.price_to);

  const handleToggle = (filterName) => {
    dispatch(toggleFilter({ filterName }));
  };

  const handleDateChange = (field, date) => {
    dispatch(
      setDateFilter({
        date_start:
          field === "date_start" ? formatIsoDate(date) : filters.date_start,
        date_start_arrival:
          field === "date_start_arrival"
            ? formatIsoDate(date)
            : filters.date_start_arrival,
      })
    );
  };

  const clearDateField = (field) => {
    dispatch(
      setDateFilter({
        date_start: field === "date_start" ? null : filters.date_start,
        date_start_arrival:
          field === "date_start_arrival" ? null : filters.date_start_arrival,
      })
    );
  };

  const handlePriceChange = (type, value) => {
    const next = Number(value);
    if (type === "from") {
      dispatch(
        setPriceFilter({
          price_from: Math.min(next, priceTo),
          price_to: priceTo,
        })
      );
      return;
    }
    dispatch(
      setPriceFilter({
        price_from: priceFrom,
        price_to: Math.max(next, priceFrom),
      })
    );
  };

  const handleTimeRangeChange = (fromKey, toKey, type, value) => {
    const next = Number(value);
    const fromValue = Number(filters[fromKey]);
    const toValue = Number(filters[toKey]);

    if (type === "from") {
      dispatch(setTimeFilter({ [fromKey]: Math.min(next, toValue) }));
      return;
    }
    dispatch(setTimeFilter({ [toKey]: Math.max(next, fromValue) }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  return (
    <aside className="filters-sidebar">
      <div className="filter-block">
        <h3>Дата поездки</h3>
        <div className="filter-date-wrap">
          <DatePicker
            selected={parseIsoDate(filters.date_start)}
            onChange={(date) => handleDateChange("date_start", date)}
            className="filter-date-input"
            placeholderText="ДД/ММ/ГГ"
            dateFormat="dd/MM/yy"
            locale={ru}
            showPopperArrow={false}
            popperClassName="filter-datepicker-popper"
            calendarClassName="filter-datepicker-calendar"
          />
          {filters.date_start && (
            <button
              type="button"
              className="filter-date-clear"
              onClick={() => clearDateField("date_start")}
              aria-label="Очистить дату поездки"
              title="Очистить"
            >
              &times;
            </button>
          )}
          <span className="filter-date-icon" aria-hidden="true">
            <img src={calendarIcon} alt="" />
          </span>
        </div>
      </div>

      <div className="filter-block">
        <h3>Дата возвращения</h3>
        <div className="filter-date-wrap">
          <DatePicker
            selected={parseIsoDate(filters.date_start_arrival)}
            onChange={(date) => handleDateChange("date_start_arrival", date)}
            className="filter-date-input"
            placeholderText="ДД/ММ/ГГ"
            dateFormat="dd/MM/yy"
            locale={ru}
            showPopperArrow={false}
            popperClassName="filter-datepicker-popper"
            calendarClassName="filter-datepicker-calendar"
          />
          {filters.date_start_arrival && (
            <button
              type="button"
              className="filter-date-clear"
              onClick={() => clearDateField("date_start_arrival")}
              aria-label="Очистить дату возвращения"
              title="Очистить"
            >
              &times;
            </button>
          )}
          <span className="filter-date-icon" aria-hidden="true">
            <img src={calendarIcon} alt="" />
          </span>
        </div>
      </div>

      {/* ТИПЫ ВАГОНОВ */}
      <div className="filter-block">
        <h3>Тип вагона</h3>

        <div className="toggle-item">
          <span className="filter-item-label">
            <img src={luxIcon} alt="" className="filter-item-icon" />
            <span>Люкс</span>
          </span>
          <div
            className={`toggle ${filters.have_first_class ? "active" : ""}`}
            onClick={() => handleToggle("have_first_class")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>

        <div className="toggle-item">
          <span className="filter-item-label">
            <img src={coupeIcon} alt="" className="filter-item-icon" />
            <span>Купе</span>
          </span>
          <div
            className={`toggle ${filters.have_second_class ? "active" : ""}`}
            onClick={() => handleToggle("have_second_class")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>

        <div className="toggle-item">
          <span className="filter-item-label">
            <img src={plackartIcon} alt="" className="filter-item-icon" />
            <span>Плацкарт</span>
          </span>
          <div
            className={`toggle ${filters.have_third_class ? "active" : ""}`}
            onClick={() => handleToggle("have_third_class")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>

        <div className="toggle-item">
          <span className="filter-item-label">
            <img src={sittingIcon} alt="" className="filter-item-icon" />
            <span>Сидячий</span>
          </span>
          <div
            className={`toggle ${filters.have_fourth_class ? "active" : ""}`}
            onClick={() => handleToggle("have_fourth_class")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>
      </div>

      {/* ДОП. ОПЦИИ */}
      <div className="filter-block">
        <h3>Дополнительно</h3>

        <div className="toggle-item">
          <span className="filter-item-label">
            <img
              src={wifiIcon}
              alt=""
              className="filter-item-icon filter-item-icon-service"
            />
            <span>Wi-Fi</span>
          </span>
          <div
            className={`toggle ${filters.have_wifi ? "active" : ""}`}
            onClick={() => handleToggle("have_wifi")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>

        <div className="toggle-item">
          <span className="filter-item-label">
            <img
              src={expressIcon}
              alt=""
              className="filter-item-icon filter-item-icon-service"
            />
            <span>Экспресс</span>
          </span>
          <div
            className={`toggle ${filters.have_express ? "active" : ""}`}
            onClick={() => handleToggle("have_express")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>
      </div>

      {/* ЦЕНА */}
      <div className="filter-block">
        <h3>Стоимость</h3>
        <div className="range-block">
          <div className="range-caption">
            <span>от</span>
            <span>до</span>
          </div>
          <div className="dual-range">
            <div
              className="dual-range-track"
              style={getRangeTrackStyle(minPrice, maxPrice, priceFrom, priceTo)}
            />
            <input
              className="range-input range-input-from"
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceFrom}
              onChange={(e) => handlePriceChange("from", e.target.value)}
              disabled={!maxPrice}
            />
            <input
              className="range-input range-input-to"
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceTo}
              onChange={(e) => handlePriceChange("to", e.target.value)}
              disabled={!maxPrice}
            />
          </div>
          <div className="range-values">
            <span>от {priceFrom}</span>
            <span>до {priceTo}</span>
          </div>
        </div>
      </div>

      <div className="filter-block">
        <button
          type="button"
          className="filter-expand-btn"
          onClick={() => setIsForwardOpen((prev) => !prev)}
        >
          <span className="filter-expand-title-wrap">
            <span className="filter-direction-badge" aria-hidden="true">
              <span className="filter-direction-arrow">→</span>
            </span>
            <span className="filter-expand-title">Туда</span>
          </span>
          <span className="filter-expand-icon">{isForwardOpen ? "−" : "+"}</span>
        </button>
        {isForwardOpen && (
          <div className="time-filters-group">
            <div className="time-filter-item">
              <label>Время отбытия</label>
              <div className="dual-range">
                <div
                  className="dual-range-track"
                  style={getRangeTrackStyle(
                    0,
                    24,
                    filters.forward_departure_from,
                    filters.forward_departure_to
                  )}
                />
                <input
                  className="range-input range-input-from"
                  type="range"
                  min={0}
                  max={24}
                  value={filters.forward_departure_from}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      "forward_departure_from",
                      "forward_departure_to",
                      "from",
                      e.target.value
                    )
                  }
                />
                <input
                  className="range-input range-input-to"
                  type="range"
                  min={0}
                  max={24}
                  value={filters.forward_departure_to}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      "forward_departure_from",
                      "forward_departure_to",
                      "to",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="range-values">
                <span>{formatHourLabel(filters.forward_departure_from)}</span>
                <span>{formatHourLabel(filters.forward_departure_to)}</span>
              </div>
            </div>

            <div className="time-filter-item time-filter-item-arrive">
              <label>Время прибытия</label>
              <div className="dual-range">
                <div
                  className="dual-range-track"
                  style={getRangeTrackStyle(
                    0,
                    24,
                    filters.forward_arrival_from,
                    filters.forward_arrival_to
                  )}
                />
                <input
                  className="range-input range-input-from"
                  type="range"
                  min={0}
                  max={24}
                  value={filters.forward_arrival_from}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      "forward_arrival_from",
                      "forward_arrival_to",
                      "from",
                      e.target.value
                    )
                  }
                />
                <input
                  className="range-input range-input-to"
                  type="range"
                  min={0}
                  max={24}
                  value={filters.forward_arrival_to}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      "forward_arrival_from",
                      "forward_arrival_to",
                      "to",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="range-values">
                <span>{formatHourLabel(filters.forward_arrival_from)}</span>
                <span>{formatHourLabel(filters.forward_arrival_to)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="filter-block">
        <button
          type="button"
          className="filter-expand-btn"
          onClick={() => setIsBackOpen((prev) => !prev)}
        >
          <span className="filter-expand-title-wrap">
            <span className="filter-direction-badge" aria-hidden="true">
              <span className="filter-direction-arrow">←</span>
            </span>
            <span className="filter-expand-title">Обратно</span>
          </span>
          <span className="filter-expand-icon">{isBackOpen ? "−" : "+"}</span>
        </button>
        {isBackOpen && (
          <div className="time-filters-group">
            <div className="time-filter-item">
              <label>Время отбытия</label>
              <div className="dual-range">
                <div
                  className="dual-range-track"
                  style={getRangeTrackStyle(
                    0,
                    24,
                    filters.back_departure_from,
                    filters.back_departure_to
                  )}
                />
                <input
                  className="range-input range-input-from"
                  type="range"
                  min={0}
                  max={24}
                  value={filters.back_departure_from}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      "back_departure_from",
                      "back_departure_to",
                      "from",
                      e.target.value
                    )
                  }
                />
                <input
                  className="range-input range-input-to"
                  type="range"
                  min={0}
                  max={24}
                  value={filters.back_departure_to}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      "back_departure_from",
                      "back_departure_to",
                      "to",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="range-values">
                <span>{formatHourLabel(filters.back_departure_from)}</span>
                <span>{formatHourLabel(filters.back_departure_to)}</span>
              </div>
            </div>

            <div className="time-filter-item time-filter-item-arrive">
              <label>Время прибытия</label>
              <div className="dual-range">
                <div
                  className="dual-range-track"
                  style={getRangeTrackStyle(
                    0,
                    24,
                    filters.back_arrival_from,
                    filters.back_arrival_to
                  )}
                />
                <input
                  className="range-input range-input-from"
                  type="range"
                  min={0}
                  max={24}
                  value={filters.back_arrival_from}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      "back_arrival_from",
                      "back_arrival_to",
                      "from",
                      e.target.value
                    )
                  }
                />
                <input
                  className="range-input range-input-to"
                  type="range"
                  min={0}
                  max={24}
                  value={filters.back_arrival_to}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      "back_arrival_from",
                      "back_arrival_to",
                      "to",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="range-values">
                <span>{formatHourLabel(filters.back_arrival_from)}</span>
                <span>{formatHourLabel(filters.back_arrival_to)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* КНОПКА СБРОСА */}
      <div className="filter-block">
        <button className="reset-button" onClick={handleReset}>
          Сбросить фильтры
        </button>
      </div>
    </aside>
  );
};

export default FilterSideBar;
