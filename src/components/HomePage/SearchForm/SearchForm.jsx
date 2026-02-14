import React, { useState } from "react";
import "./SearchForm.css";
import reverse from '../../../assets/reverse.png'
import geolocation from "../../../assets/geolocation.png";
import calendar from "../../../assets/calendar.png";

const SearchForm = () => {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    dateFrom: "",
    dateTo: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateIconClick = (inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.showPicker?.() || input.click();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Поиск билетов:", formData);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
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
              onChange={handleChange}
              placeholder="Откуда"
              required
            />
            <span className="search-form__icon">
              <img src={geolocation} alt="" />
            </span>
          </div>
          <button
            type="button"
            className="search-form__swap"
            onClick={() => {
              const temp = formData.from;
              setFormData({ ...formData, from: formData.to, to: temp });
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
              onChange={handleChange}
              placeholder="Куда"
              required
            />
            <span className="search-form__icon">
              <img src={geolocation} alt="" />
            </span>
          </div>
        </div>
      </div>

      <div className="search-form__section">
        <label className="search-form__section-label">Дата</label>
        <div className="search-form__row search-form__row-date">
          <div className="search-form__input-wrapper">
            <input
              type="date"
              id="date-from"
              name="dateFrom"
              className="search-form__input search-form__input--date"
              placeholder="ДД/ММ/ГГ"
              value={formData.dateFrom}
              onChange={handleChange}
              required
            />
            <span
              className="search-form__icon"
              onClick={() => handleDateIconClick("date-from")}
            >
              <img src={calendar} alt="" />
            </span>
          </div>
          <div className="search-form__input-wrapper">
            <input
              type="date"
              id="date-to"
              name="dateTo"
              className="search-form__input search-form__input--date"
              placeholder="ДД/ММ/ГГ"
              value={formData.dateTo}
              onChange={handleChange}
            />
            <span
              className="search-form__icon"
              onClick={() => handleDateIconClick("date-to")}
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
