import { useState } from "react";
import { useSelector } from "react-redux";
import { selectFpkTotalPrice } from "../../../store/order/orderSlice";
import { formatTime, formatDate, formatDuration } from "../../../utils/dateUtils";
import fromToImg from "../../../assets/from-to.png";
import toFromImg from "../../../assets/to-from.png";
import passengerImg from "../../../assets/passenger.png";
import rightArrowImg from "../../../assets/right-arrow.png";
import "./OrderInformationSideBar.css";

const OrderInformationSideBar = () => {
  const [legDepOpen, setLegDepOpen] = useState(true);
  const [legArrOpen, setLegArrOpen] = useState(true);
  const [passengersOpen, setPassengersOpen] = useState(true);

  const order = useSelector((state) => state.order);
  const { data, trainSummary } = order;
  const fpkTotal = useSelector(selectFpkTotalPrice);

  const departure = data?.departure;
  const arrival = data?.arrival;
  const depSeats = departure?.seats || [];
  const arrSeats = arrival?.seats || [];

  const summaryDep = trainSummary?.departure;
  const summaryArr = trainSummary?.arrival;

  const adultsDep = depSeats.filter((s) => !s.is_child);
  const childrenDep = depSeats.filter((s) => s.is_child);
  const adultsArr = arrSeats.filter((s) => !s.is_child);
  const childrenArr = arrSeats.filter((s) => s.is_child);

  const adultsDepTotal = adultsDep.reduce(
    (sum, s) => sum + (Number(s.seat_price) || 0),
    0,
  );
  const childrenDepTotal = childrenDep.reduce(
    (sum, s) => sum + (Number(s.seat_price) || 0),
    0,
  );
  const adultsArrTotal = adultsArr.reduce(
    (sum, s) => sum + (Number(s.seat_price) || 0),
    0,
  );
  const childrenArrTotal = childrenArr.reduce(
    (sum, s) => sum + (Number(s.seat_price) || 0),
    0,
  );

  const adultsCount = adultsDep.length + adultsArr.length;
  const childrenCount = childrenDep.length + childrenArr.length;
  const adultsTotalPrice = adultsDepTotal + adultsArrTotal;
  const childrenTotalPrice = childrenDepTotal + childrenArrTotal;

  const seatsTotal = adultsTotalPrice + childrenTotalPrice;
  const total = seatsTotal + fpkTotal;

  const renderLeg = (leg, isArrival = false, isOpen, onToggle) => (
    <div className="order-info-section order-info-leg">
      <button
        type="button"
        className="order-info-leg-header-btn"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="order-info-leg-header-left">
          <span
            className={`order-info-arrow ${isArrival ? "order-info-arrow-back" : ""}`}
          >
            <img
              src={isArrival ? toFromImg : fromToImg}
              alt=""
              className="order-info-arrow-img"
            />
          </span>
          <span className="order-info-leg-title">
            {isArrival ? "Обратно" : "Туда"}
          </span>
          <span className="order-info-leg-date">{formatDate(leg.fromDatetime)}</span>
        </span>
        <span className="order-info-expand-icon" aria-hidden="true">
          <span className="order-info-expand-icon-char">{isOpen ? "−" : "+"}</span>
        </span>
      </button>
      {isOpen && (
        <div className="order-info-leg-body">
          <div className="order-info-leg-row order-info-leg-row-split">
            <span className="order-info-label">№ Поезда</span>
            <span className="order-info-value">{leg.trainNumber}</span>
          </div>
          <div className="order-info-leg-row order-info-leg-row-split order-info-leg-row-name">
            <span className="order-info-label">Название</span>
            <span className="order-info-value order-info-value-name">{leg.trainName}</span>
          </div>
          <div className="order-info-leg-time-block">
            <div className="order-info-leg-duration-row">
              <span className="order-info-duration">{formatDuration(leg.duration)}</span>
            </div>
            <div className="order-info-leg-time-row">
              <div className="order-info-leg-side">
                <span className="order-info-time">{formatTime(leg.fromDatetime)}</span>
                <span className="order-info-date">{formatDate(leg.fromDatetime)}</span>
              </div>
              <span className="order-info-duration-arrow" aria-hidden="true">
                <img src={rightArrowImg} alt="" className="order-info-duration-arrow-img" />
              </span>
              <div className="order-info-leg-side order-info-leg-side-right">
                <span className="order-info-time">{formatTime(leg.toDatetime)}</span>
                <span className="order-info-date">{formatDate(leg.toDatetime)}</span>
              </div>
            </div>
          </div>
          <div className="order-info-stations-row">
            <span className="order-info-station">
              {leg.fromCity} <span className="order-info-station-name">{leg.fromStation}</span>
            </span>
            <span className="order-info-station order-info-station-right">
              {leg.toCity} <span className="order-info-station-name">{leg.toStation}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <aside className="order-information-sidebar">
      <div className="order-title">
        <h2 className="order-info-main-title">Детали поездки</h2>
      </div>
      <div className="order-info-divider" />

      {summaryDep && renderLeg(summaryDep, false, legDepOpen, () => setLegDepOpen((p) => !p))}

      {summaryArr && arrSeats.length > 0 && (
        <>
          <div className="order-info-divider" />
          {renderLeg(summaryArr, true, legArrOpen, () => setLegArrOpen((p) => !p))}
        </>
      )}

      <div className="order-info-divider" />

      <div className="order-info-section order-info-passengers">
        <button
          type="button"
          className="order-info-passengers-header-btn"
          onClick={() => setPassengersOpen((p) => !p)}
          aria-expanded={passengersOpen}
        >
          <span className="order-info-passengers-header-left">
            <span className="order-info-passengers-icon">
              <img
                src={passengerImg}
                alt=""
                className="order-info-passengers-icon-img"
              />
            </span>
            <span className="order-info-passengers-title">Пассажиры</span>
          </span>
          <span className="order-info-expand-icon" aria-hidden="true">
            <span className="order-info-expand-icon-char">{passengersOpen ? "−" : "+"}</span>
          </span>
        </button>
        {passengersOpen && (
        <div className="order-info-passengers-list">
          {adultsCount > 0 && (
            <div className="order-info-passenger-row">
              <span className="order-info-passenger-label">
                {adultsCount} {adultsCount === 1 ? "Взрослый" : "Взрослых"}
              </span>
              <span className="order-info-passenger-price">
                {adultsTotalPrice.toLocaleString("ru-RU")}{" "}
                <span className="order-info-currency" aria-hidden="true">₽</span>
              </span>
            </div>
          )}
          {childrenCount > 0 && (
            <div className="order-info-passenger-row">
              <span className="order-info-passenger-label">
                {childrenCount} {childrenCount === 1 ? "Ребенок" : "Детей"}
              </span>
              <span className="order-info-passenger-price">
                {childrenTotalPrice.toLocaleString("ru-RU")}{" "}
                <span className="order-info-currency" aria-hidden="true">₽</span>
              </span>
            </div>
          )}
        </div>
        )}
      </div>

      <div className="order-info-divider" />

      <div className="order-info-section order-info-total">
        <span className="order-info-total-label">Итог</span>
        <span className="order-info-total-value">
          {total.toLocaleString("ru-RU")}{" "}
          <span className="order-info-currency" aria-hidden="true">₽</span>
        </span>
      </div>
    </aside>
  );
};

export default OrderInformationSideBar;
