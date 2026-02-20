import "./TrainCard.css";
import amenitiesSprite from "../../../assets/wifi-express-food.png";
import eatIcon from "../../../assets/eat.png";
import trainIcon from "../../../assets/train-icon.png";
import { useNavigate } from "react-router-dom";


const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} ч ${minutes} мин`;
};

const formatPriceValue = (price) =>
  Math.round(Number(price) || 0).toLocaleString("ru-RU");

// Компонент для отображения места (класс вагона)
const SeatClass = ({ name, seats, price }) => {
  if (!seats || seats <= 0) return null;

  return (
    <div className="seat-class">
      <span className="seat-name">{name}</span>
      <span className="seat-seats">{seats}</span>
      <span className="seat-from">от</span>
      <span className="seat-price">{formatPriceValue(price)}</span>
      <span className="seat-currency" aria-hidden="true">₽</span>
    </div>
  );
};

// Компонент для иконок опций
const AmenitiesIcons = ({ train }) => {
  const amenities = [];

  if (train.departure.have_wifi) {
    amenities.push(
      <span
        key="wifi"
        className="amenity-icon amenity-icon-sprite amenity-icon-sprite-wifi"
        style={{ backgroundImage: `url(${amenitiesSprite})` }}
        aria-hidden="true"
        title="Wi-Fi"
      />
    );
  }

  if (train.departure.is_express) {
    amenities.push(
      <span
        key="express"
        className="amenity-icon amenity-icon-sprite amenity-icon-sprite-express"
        style={{ backgroundImage: `url(${amenitiesSprite})` }}
        aria-hidden="true"
        title="Express"
      />
    );
  }

  amenities.push(
    <img
      key="eat"
      src={eatIcon}
      className="amenity-icon-train amenity-icon-food"
      alt=""
      aria-hidden="true"
      title="Food"
    />
  );


  if (amenities.length === 0) return null;

  return <div className="amenities-train-card">{amenities}</div>;
};


const TrainCard = ({ train }) => {
  const departure = train.departure;
  const arrival = train.arrival;

  const navigate = useNavigate();

  const handleSeatsChoice = (e, trainId) => {
    e.preventDefault();
    navigate(`/routes/${trainId}/seats`, { state: { train } });
  };

  // Данные о местах из available_seats_info
  const seatsInfo = departure.available_seats_info || {};
  const totalAvailableSeats = Object.values(seatsInfo).reduce(
    (sum, count) => sum + (Number(count) || 0),
    0
  );
  const hasAvailableSeats = totalAvailableSeats > 0;

  return (
    <div className="train-card">
      {/* 🟦 ЛЕВЫЙ БЛОК: Инфо о поезде */}
      <div className="train-left-block">
        <div className="train-image">
          <img src={trainIcon} />
        </div>
        <div className="train-name">{departure.train.name}</div>
        <div className="train-cities">
          <div className="city-departure">{departure.from.city.name}</div>
          <div className="city-arrow">→</div>
          <div className="city-arrival">{departure.to.city.name}</div>
        </div>
      </div>

      {/* 🟨 ЦЕНТРАЛЬНЫЙ БЛОК: Время и маршрут */}
      <div className="train-center-block">
        <div className="route-row">
          {/* Отправление */}
          <div className="route-point route-point-depart">
            <div className="route-time">
              {formatTime(departure.from.datetime)}
            </div>
            <div className="route-date">
              {formatDate(departure.from.datetime)}
            </div>
            <div className="route-city">{departure.from.city.name}</div>
            <div className="route-station">
              {departure.from.railway_station_name}
            </div>
          </div>

          {/* Стрелка и длительность */}
          <div className="route-middle">
            <div className="route-arrow-block">
              <div className="route-duration">
                {formatDuration(departure.duration)}
              </div>
              <div className="route-arrow" aria-hidden="true" />
            </div>
          </div>

          {/* Прибытие */}
          <div className="route-point route-point-arrive">
            <div className="route-time">
              {formatTime(departure.to.datetime)}
            </div>
            <div className="route-date">
              {formatDate(departure.to.datetime)}
            </div>
            <div className="route-city">{departure.to.city.name}</div>
            <div className="route-station">
              {departure.to.railway_station_name}
            </div>
          </div>
        </div>

        {arrival && (
          <div className="return-route">
            <div className="return-label">Обратный рейс</div>
            <div className="route-row return-row">
              <div className="route-point route-point-depart">
                <div className="route-time">{formatTime(arrival.from.datetime)}</div>
                <div className="route-date">{formatDate(arrival.from.datetime)}</div>
                <div className="route-city">{arrival.from.city.name}</div>
                <div className="route-station">{arrival.from.railway_station_name}</div>
              </div>

              <div className="route-middle">
                <div className="route-arrow-block">
                  <div className="route-duration">{formatDuration(arrival.duration)}</div>
                  <div className="route-arrow" aria-hidden="true" />
                </div>
              </div>

              <div className="route-point route-point-arrive">
                <div className="route-time">{formatTime(arrival.to.datetime)}</div>
                <div className="route-date">{formatDate(arrival.to.datetime)}</div>
                <div className="route-city">{arrival.to.city.name}</div>
                <div className="route-station">{arrival.to.railway_station_name}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🟩 ПРАВЫЙ БЛОК: Места и кнопка */}
      <div className="train-right-block">
        <div className="seats-container">
          {/* Люкс */}
          {departure.have_first_class && (
            <SeatClass
              name="Люкс"
              seats={seatsInfo.first || 0}
              price={
                departure.price_info?.first?.bottom_price || train.min_price
              }
            />
          )}

          {/* Купе */}
          {departure.have_second_class && (
            <SeatClass
              name="Купе"
              seats={seatsInfo.second || 0}
              price={
                departure.price_info?.second?.bottom_price || train.min_price
              }
            />
          )}

          {/* Плацкарт */}
          {departure.have_third_class && (
            <SeatClass
              name="Плацкарт"
              seats={seatsInfo.third || 0}
              price={
                departure.price_info?.third?.bottom_price || train.min_price
              }
            />
          )}

          {/* Сидячий */}
          {departure.have_fourth_class && (
            <SeatClass
              name="Сидячий"
              seats={seatsInfo.fourth || 0}
              price={train.min_price}
            />
          )}
        </div>

        <div className="trains-right-block-container">
          {/* Иконки опций */}
          <AmenitiesIcons train={train} />
          {/* Кнопка */}
          <button
            className="train-button"
            type="button"
            disabled={!hasAvailableSeats}
            onClick={(e) => handleSeatsChoice(e, departure._id)}
          >
            Выбрать места
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainCard;
