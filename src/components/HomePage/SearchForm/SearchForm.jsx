import React, { useState } from "react";
import "./SearchForm.css";
import reverse from "../../../assets/reverse.png";
import geolocation from "../../../assets/geolocation.png";
import calendar from "../../../assets/calendar.png";
import { useDispatch } from "react-redux";
import { fetchCitiesRequested, clearCities } from "../../../store/actions";
import { useSelector } from "react-redux";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cities = useSelector((state) => state.cities.items);
  const [activeField, setActiveField] = useState(null);
  const dateFromRef = useRef(null);
  const dateToRef = useRef(null);

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "from" || name === "to") {
      handleCitiesFetch(value);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFromInput = () => {
    setFormData((prev) => ({
      ...prev,
      from: "",
      fromId: null,
    }));
    dispatch(clearCities());
  };

  const clearToInput = () => {
    setFormData((prev) => ({
      ...prev,
      to: "",
      toId: null,
    }));
    dispatch(clearCities());
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

  const [formData, setFormData] = useState({
    from: "",
    fromId: null,
    to: "",
    toId: null,
    dateStart: "",
    dateEnd: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fromId || !formData.toId) {
      alert("⚠️ Выберите города из списка подсказок");
      // Опционально: подсветить поля
      return;
    }

    navigate(
      `/routes?from_city_id=${formData.fromId}&to_city_id=${formData.toId}&date_start=${formData.dateStart}&date_start_arrival=${formData.dateEnd}`,
    );
  };

  return (
    <form className="search-form" onSubmit={(e) => handleSubmit(e)}>
      <div className="search-form__section">
        <label className="search-form__section-label">Направление</label>
        <div className="search-form__row">
          <div className="search-form__input-wrapper">
            <input
              type="text"
              id="from"
              name="from"
              className="search-form__input"
              value={formData.from}
              onChange={handleInputChange}
              onFocus={() => setActiveField("from")}
              placeholder="Откуда"
              required
            />
            {formData.from && (
              <div
                className="clear-input-btn"
                onClick={clearFromInput}
                title="Очистить"
              >
                ✕
              </div>
            )}
            <span className="search-form__icon">
              <img src={geolocation} alt="" />
            </span>
            {activeField === "from" && cities.length >= 1 && (
              <ul className="search-form__suggestions">
                {cities.map((city) => (
                  <li
                    key={city._id}
                    className="search-form__suggestion"
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
            className="search-form__swap"
            onClick={() => {
              const temp = formData.from;
              const tempId = formData.fromId;
              setFormData({
                ...formData,
                from: formData.to,
                fromId: formData.toId,
                to: temp,
                toId: tempId,
              });
            }}
          >
            <img src={reverse} alt="Поменять местами" />
          </button>
          <div className="search-form__input-wrapper">
            <input
              type="text"
              id="to"
              name="to"
              className="search-form__input"
              value={formData.to}
              onChange={handleInputChange}
              onFocus={() => setActiveField("to")}
              placeholder="Куда"
              required
            />
            {formData.to && (
              <div
                className="clear-input-btn"
                onClick={clearToInput}
                title="Очистить"
              >
                ✕
              </div>
            )}
            <span className="search-form__icon">
              <img src={geolocation} alt="" />
            </span>
            {activeField === "to" && cities.length >= 1 && (
              <ul className="search-form__suggestions">
                {cities.map((city) => (
                  <li
                    key={city._id}
                    className="search-form__suggestion"
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

      <div className="search-form__section">
        <label className="search-form__section-label">Дата</label>
        <div className="search-form__row search-form__row-date">
          <div className="search-form__input-wrapper">
            <input
              ref={dateFromRef}
              type="date"
              id="date-from"
              name="dateStart"
              className="search-form__input search-form__input--date"
              placeholder="ДД/ММ/ГГ"
              value={formData.dateStart}
              onChange={handleDateChange}
              required
            />
            <span
              className="search-form__icon"
              onClick={() => handleDateIconClick(dateFromRef)}
            >
              <img src={calendar} alt="" />
            </span>
          </div>
          <div className="search-form__input-wrapper">
            <input
              ref={dateToRef}
              type="date"
              id="date-to"
              name="dateEnd"
              className="search-form__input search-form__input--date"
              placeholder="ДД/ММ/ГГ"
              value={formData.dateEnd}
              onChange={handleDateChange}
            />
            <span
              className="search-form__icon"
              onClick={() => handleDateIconClick(dateToRef)}
            >
              <img src={calendar} alt="" />
            </span>
          </div>
        </div>
      </div>
      <div className="search-form__actions">
        <button type="submit" className="search-form__button">
          НАЙТИ БИЛЕТЫ
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
