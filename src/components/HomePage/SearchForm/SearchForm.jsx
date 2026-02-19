import React, { useState } from "react";
import "./SearchForm.css";
import reverse from "../../../assets/reverse.png";
import geolocation from "../../../assets/geolocation.png";
import calendar from "../../../assets/calendar.png";
import { useDispatch } from "react-redux";
import { fetchCitiesRequested, clearCities } from "../../../store/actions";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { ru } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

const SearchForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cities = useSelector((state) => state.cities.items);
  const [activeField, setActiveField] = useState(null);
  const parseIsoDate = (value) => {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const formatIsoDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDayClassName = (date) =>
    date.getDay() === 0 ? "search-form-day-sunday" : undefined;

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

  const clearDateField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: "",
    }));
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
            <DatePicker
              selected={parseIsoDate(formData.dateStart)}
              onChange={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  dateStart: formatIsoDate(date),
                }))
              }
              className="search-form__input search-form__input--date"
              placeholder="ДД/ММ/ГГ"
              placeholderText="ДД/ММ/ГГ"
              dateFormat="dd/MM/yy"
              locale={ru}
              dayClassName={getDayClassName}
              required
              showPopperArrow={false}
              popperClassName="search-form-datepicker-popper"
              calendarClassName="search-form-datepicker-calendar"
            />
            {formData.dateStart && (
              <button
                type="button"
                className="clear-input-btn clear-date-btn"
                onClick={() => clearDateField("dateStart")}
                aria-label="Очистить дату отправления"
                title="Очистить"
              >
                &times;
              </button>
            )}
            <span className="search-form__icon">
              <img src={calendar} alt="" />
            </span>
          </div>
          <div className="search-form__input-wrapper">
            <DatePicker
              selected={parseIsoDate(formData.dateEnd)}
              onChange={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  dateEnd: formatIsoDate(date),
                }))
              }
              className="search-form__input search-form__input--date"
              placeholder="ДД/ММ/ГГ"
              placeholderText="ДД/ММ/ГГ"
              dateFormat="dd/MM/yy"
              locale={ru}
              dayClassName={getDayClassName}
              showPopperArrow={false}
              popperClassName="search-form-datepicker-popper"
              calendarClassName="search-form-datepicker-calendar"
            />
            {formData.dateEnd && (
              <button
                type="button"
                className="clear-input-btn clear-date-btn"
                onClick={() => clearDateField("dateEnd")}
                aria-label="Очистить дату прибытия"
                title="Очистить"
              >
                &times;
              </button>
            )}
            <span className="search-form__icon">
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
