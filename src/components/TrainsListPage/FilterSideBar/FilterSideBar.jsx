import { useDispatch, useSelector } from "react-redux";
import {
  setDateFilter,
  toggleFilter,
  setPriceFilter,
  resetFilters,
} from "../../../store/filters/filtersSlice";
import "./FilterSideBar.css";

const FilterSideBar = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);

  const priceFrom = filters.price_from || "";
  const priceTo = filters.price_to || "";

  // const dateStart = filters.date_start || "";
  // const dateEnd = filters.date_end || "";

  const handleToggle = (filterName) => {
    dispatch(toggleFilter({ filterName }));
  };

  // const handleDateChange = (e, type) => {
  //   const dateValue = e.target.value ? e.target.value : null;
  //   const newFilters = {
  //     date_start: type === "start" ? dateValue : dateStart,
  //     date_end: type === "end" ? dateValue : dateEnd,
  //   };
  //   dispatch(setDateFilter(newFilters));
  // }

  const handlePriceChange = (e, type) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    const newFilters = {
      price_from: type === "from" ? value : priceFrom,
      price_to: type === "to" ? value : priceTo,
    };
    dispatch(setPriceFilter(newFilters));
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  return (
    <aside className="filters-sidebar">
      {/* ДАТЫ
      <div className="filter-block">
        <h3>Дата поездки</h3>

        <input
          type="date"
          placeholder="с"
          value={dateStart}
          onChange={(e) => handleDateChange(e, "start")}
        />

        <input
          type="date"
          placeholder="по"
          value={dateEnd}
          onChange={(e) => handleDateChange(e, "end")}
        />
      </div> */}

      {/* ТИПЫ ВАГОНОВ */}
      <div className="filter-block">
        <h3>Тип вагона</h3>

        <div className="toggle-item">
          <span>Люкс</span>
          <div
            className={`toggle ${filters.have_first_class ? "active" : ""}`}
            onClick={() => handleToggle("have_first_class")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>

        <div className="toggle-item">
          <span>Купе</span>
          <div
            className={`toggle ${filters.have_second_class ? "active" : ""}`}
            onClick={() => handleToggle("have_second_class")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>

        <div className="toggle-item">
          <span>Плацкарт</span>
          <div
            className={`toggle ${filters.have_third_class ? "active" : ""}`}
            onClick={() => handleToggle("have_third_class")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>

        <div className="toggle-item">
          <span>Сидячий</span>
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
          <span>Wi-Fi</span>
          <div
            className={`toggle ${filters.have_wifi ? "active" : ""}`}
            onClick={() => handleToggle("have_wifi")}
          >
            <div className="toggle-button"></div>
          </div>
        </div>

        <div className="toggle-item">
          <span>Экспресс</span>
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

        <input
          type="number"
          placeholder="от"
          value={priceFrom}
          onChange={(e) => handlePriceChange(e, "from")}
        />

        <input
          type="number"
          placeholder="до"
          value={priceTo}
          onChange={(e) => handlePriceChange(e, "to")}
        />
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
