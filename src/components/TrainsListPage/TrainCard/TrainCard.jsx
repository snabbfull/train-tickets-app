import "./TrainCard.css";
import wifi from "../../../assets/wifi.png";
import express from "../../../assets/express.png";
import eat from "../../../assets/eat.png";
import trainIcon from "../../../assets/train-icon.png";


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

// Компонент для отображения места (класс вагона)
const SeatClass = ({ name, seats, price }) => {
  if (!seats || seats <= 0) return null;

  return (
    <div className="seat-class">
      <div className="seat-name">{name}</div>
      <div className="seat-info">
        <span className="seat-seats">{seats} мест</span>
        <span className="seat-price">от {price} ₽</span>
      </div>
    </div>
  );
};

// Компонент для иконок опций
const AmenitiesIcons = ({ train }) => {
  const amenities = [];

  if (train.departure.have_wifi) {
    amenities.push(
      <img key="wifi" src={wifi} className="amenity-icon wifi" alt="Wi-Fi"/>
    );
  }

  if (train.departure.is_express) {
    amenities.push(
      <img key="express" src={express} className="amenity-icon express" alt="Express"/>
    );
  }

  // Если есть информация о питании (добавьте поле в API при необходимости)
    amenities.push(
      <img
        key="eat"
        src={eat}
        className="amenity-icon eat"
        alt="Food"
      />
    );


  if (amenities.length === 0) return null;

  return <div className="amenities">{amenities}</div>;
};

const TrainCard = ({ train }) => {
  const departure = train.departure;

  // Данные о местах из available_seats_info
  const seatsInfo = departure.available_seats_info || {};

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
          <div className="route-point">
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
          <div className="route-arrow-block">
            <div className="route-duration">
              {formatDuration(departure.duration)}
            </div>
            <div className="route-arrow">━━━━━━━━━━►</div>
          </div>

          {/* Прибытие */}
          <div className="route-point">
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
          <button className="train-button">Выбрать места</button>
        </div>
      </div>
      {/* Кнопка */}
    </div>
  );
};

export default TrainCard;
