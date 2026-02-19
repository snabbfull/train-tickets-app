import React, { useState } from "react";
import "./SearchForm2.css";
import reverse from "../../../assets/reverse.png";
import geolocation from "../../../assets/geolocation.png";
import calendar from "../../../assets/calendar.png";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCitiesRequested,
  clearCities,
  trainsListRequested,
} from "../../../store/actions";
import DatePicker from "react-datepicker";
import { ru } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

const SearchForm2 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cities = useSelector((state) => state.cities.items);
  const [activeField, setActiveField] = useState(null);

  const [formData, setFormData] = useState({
    from: "",
    fromId: null,
    to: "",
    toId: null,
    dateStart: "",
    dateEnd: "",
  });

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
      ...(name === "from" ? { fromId: null } : {}),
      ...(name === "to" ? { toId: null } : {}),
    }));
    if (name === "from" || name === "to") {
      handleCitiesFetch(value);
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fromId || !formData.toId) {
      alert("⚠️ Выберите города из списка подсказок");
      return;
    }
    const params = {
      from_city_id: formData.fromId,
      to_city_id: formData.toId,
      date_start: formData.dateStart,
      date_start_arrival: formData.dateEnd,
    };

    // Гарантируем запрос даже если URL не изменился (повторный поиск).
    dispatch(trainsListRequested(params));

    navigate(
      `/routes?from_city_id=${formData.fromId}&to_city_id=${formData.toId}&date_start=${formData.dateStart}&date_start_arrival=${formData.dateEnd}`,
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
              <DatePicker
                selected={parseIsoDate(formData.dateStart)}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateStart: formatIsoDate(date),
                  }))
                }
                className="search-form__input-2 search-form__input--date-2"
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
              <span className="search-form__icon-2">
                <img src={calendar} alt="" />
              </span>
            </div>

            <div className="search-form__input-wrapper-2">
              <DatePicker
                selected={parseIsoDate(formData.dateEnd)}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateEnd: formatIsoDate(date),
                  }))
                }
                className="search-form__input-2 search-form__input--date-2"
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
              <span className="search-form__icon-2">
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
