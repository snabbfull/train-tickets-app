import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLastRoutesRequested } from "../../../store/actions";
import wifi from "../../../assets/wifi.png";
import express from "../../../assets/express.png";
import eat from "../../../assets/eat.png";
import "./LastTickets.css";

// Компонент для иконок опций
const AmenitiesIcons = ({ train }) => {
  const amenities = [];

  if (train.departure.have_wifi) {
    amenities.push(
      <img key="wifi" src={wifi} className="amenity-icon wifi" alt="Wi-Fi" />,
    );
  }

  if (train.departure.is_express) {
    amenities.push(
      <img
        key="express"
        src={express}
        className="amenity-icon express"
        alt="Express"
      />,
    );
  }

  // Показываем иконку питания всегда (или добавьте проверку have_food при необходимости)
  amenities.push(
    <img key="eat" src={eat} className="amenity-icon amenity-icon-food" alt="Food" />,
  );

  if (amenities.length === 0) return null;

  return <div className="amenities">{amenities}</div>;
};

const LastTickets = () => {
  const dispatch = useDispatch();
  const { lastRoutes } = useSelector((state) => state.lastRoutes);

  useEffect(() => {
    if (!lastRoutes.length) {
      dispatch(fetchLastRoutesRequested());
    }
  }, [dispatch, lastRoutes.length]);

  if (!lastRoutes.length) return null;

  return (
    <div className="last-tickets">
      <h3>ПОСЛЕДНИЕ БИЛЕТЫ</h3>

      {lastRoutes.map((route, index) => (
        <div key={index} className="last-ticket-card">
          {/* Верхняя часть: города и вокзалы */}
          <div className="ticket-route-info">
            <div className="ticket-departure">
              <div className="ticket-city">
                {route.departure.from.city.name}
              </div>
              <div className="ticket-station">
                {route.departure.from.railway_station_name}
              </div>
            </div>

            <div className="ticket-arrival">
              <div className="ticket-city">{route.departure.to.city.name}</div>
              <div className="ticket-station">
                {route.departure.to.railway_station_name}
              </div>
            </div>
          </div>

          {/* Нижняя часть: иконки и цена */}
          <div className="ticket-footer">
            <div className="ticket-footer-wrapper">
              <AmenitiesIcons train={route} />
              <div className="ticket-price-block">
                <span className="ticket-price-from">от</span>
                <span className="ticket-price-value">
                  {Math.round(route.min_price).toLocaleString("ru-RU")}
                </span>
                <span className="ticket-price-currency">₽</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LastTickets;
