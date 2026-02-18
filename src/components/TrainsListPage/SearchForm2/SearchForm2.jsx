import React, { useState, useRef } from "react";
import "./SearchForm2.css";
import reverse from "../../../assets/reverse.png";
import geolocation from "../../../assets/geolocation.png";
import calendar from "../../../assets/calendar.png";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCitiesRequested, clearCities } from "../../../store/actions";

const SearchForm2 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cities = useSelector((state) => state.cities.items);
  const [activeField, setActiveField] = useState(null);
  const dateFromRef = useRef(null);
  const dateToRef = useRef(null);

  const [formData, setFormData] = useState({
    from: "",
    fromId: null,
    to: "",
    toId: null,
    dateStart: "",
    dateEnd: "",
  });

  const handleDateIconClick = (ref) => {
    if (ref.current?.showPicker) {
      ref.current.showPicker();
    } else {
      ref.current?.focus();
    }
  };

  const handleCitiesFetch = (query) => {
    if (!query || query.length < 2) {
      dispatch(clearCities());
      return;
    }
    dispatch(fetchCitiesRequested(query));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "from" || name === "to") {
      handleCitiesFetch(value);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCitySelect = (field, city) => {
    setFormData((prev) => ({
      ...prev,
      [field]: city.name,
      [`${field}Id`]: city._id,
    }));
    setActiveField(null);
    dispatch(clearCities());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fromId || !formData.toId) {
      alert("⚠️ Выберите города из списка подсказок");
      return;
    }
    navigate(
      `/routes?from_city_id=${formData.fromId}&to_city_id=${formData.toId}&date_start=${formData.dateStart}&date_end=${formData.dateEnd}`,
    );
  };

    const clearFromInput = () => {
      setFormData((prev) => ({
        ...prev,
        from: "",
        fromId: null,
      }));
      dispatch(clearCities());
    }

    const clearToInput = () => {
      setFormData((prev) => ({
        ...prev,
        to: "",
        toId: null,
      }));
      dispatch(clearCities());
    }
  

  return (
    <form className="search-form-2" onSubmit={handleSubmit}>
      {/* Общий контейнер для двух колонок: Направление и Дата */}
      <div className="search-form__main-row">
        {/* Секция 1: Направление */}
        <div className="search-form__section-2">
          <label className="search-form__section-label-2">Направление</label>
          <div className="search-form__inputs-row">
            <div className="search-form__input-wrapper-2">
              <input
                type="text"
                name="from"
                className="search-form__input-2"
                value={formData.from}
                onChange={handleInputChange}
                onFocus={() => setActiveField("from")}
                placeholder="Откуда"
                required
              />
              {formData.from && (
                <div className="clear-input-btn" onClick={clearFromInput}>
                  &times;
                </div>
              )}
              <span className="search-form__icon-2">
                <img src={geolocation} alt="" />
              </span>
              {activeField === "from" && cities.length >= 1 && (
                <ul className="search-form__suggestions-2">
                  {cities.map((city) => (
                    <li
                      key={city._id}
                      className="search-form__suggestion-2"
                      onClick={() => handleCitySelect("from", city)}
                    >
                      {city.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              className="search-form__swap-2"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  from: prev.to,
                  fromId: prev.toId,
                  to: prev.from,
                  toId: prev.fromId,
                }));
              }}
            >
              <img src={reverse} alt="Поменять местами" />
            </button>

            <div className="search-form__input-wrapper-2">
              <input
                type="text"
                name="to"
                className="search-form__input-2"
                value={formData.to}
                onChange={handleInputChange}
                onFocus={() => setActiveField("to")}
                placeholder="Куда"
                required
              />
              {formData.to && (
                <div className="clear-input-btn" onClick={clearToInput}>
                  &times;
                </div>
              )}
              <span className="search-form__icon-2">
                <img src={geolocation} alt="" />
              </span>
              {activeField === "to" && cities.length >= 1 && (
                <ul className="search-form__suggestions-2">
                  {cities.map((city) => (
                    <li
                      key={city._id}
                      className="search-form__suggestion-2"
                      onClick={() => handleCitySelect("to", city)}
                    >
                      {city.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Секция 2: Дата */}
        <div className="search-form__section-2">
          <label className="search-form__section-label-2">Дата</label>
          <div className="search-form__inputs-row">
            <div className="search-form__input-wrapper-2">
              <input
                ref={dateFromRef}
                type="date"
                name="dateStart"
                className="search-form__input-2 search-form__input--date-2"
                value={formData.dateStart}
                onChange={handleDateChange}
                required
              />
              <span
                className="search-form__icon-2"
                onClick={() => handleDateIconClick(dateFromRef)}
              >
                <img src={calendar} alt="" />
              </span>
            </div>

            <div className="search-form__input-wrapper-2">
              <input
                ref={dateToRef}
                type="date"
                name="dateEnd"
                className="search-form__input-2 search-form__input--date-2"
                value={formData.dateEnd}
                onChange={handleDateChange}
              />
              <span
                className="search-form__icon-2"
                onClick={() => handleDateIconClick(dateToRef)}
              >
                <img src={calendar} alt="" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка поиска */}
      <div className="search-form__actions-2">
        <button type="submit" className="search-form__button-2">
          НАЙТИ БИЛЕТЫ
        </button>
      </div>
    </form>
  );
};

export default SearchForm2;
