import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { resetOrder, selectFpkTotalPrice } from "../../../store/order/orderSlice";
import "./OrderSuccessInfo.css";
import emailTicketsIcon from "../../../assets/email-tickets.png";
import printTicketsIcon from "../../../assets/save-tickets.png";
import infoTicketsIcon from "../../../assets/show-tickets.png";
import starIcon from "../../../assets/star.png";

const RUS_LETTERS = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

const generateOrderNumber = () => {
  const digits = String(Math.floor(Math.random() * 900) + 100);
  const letters = Array.from({ length: 2 }, () =>
    RUS_LETTERS[Math.floor(Math.random() * RUS_LETTERS.length)]
  ).join("");
  return digits + letters;
};

const StarIcon = () => (
  <div className="order-success-stars">
    {" "}
    <img className="order-success-star-icon" src={starIcon} alt="star" />
    <img className="order-success-star-icon" src={starIcon} alt="star" />
    <img className="order-success-star-icon" src={starIcon} alt="star" />
    <img className="order-success-star-icon" src={starIcon} alt="star" />
    <img className="order-success-star-icon" src={starIcon} alt="star" />
  </div>
);

const OrderSuccessInfo = () => {
  const dispatch = useDispatch();
  const order = useSelector((state) => state.order);
  const { data } = order;
  const orderNumber = useMemo(generateOrderNumber, []);
  const fpkTotal = useSelector(selectFpkTotalPrice);
  const seatsDep = data?.departure?.seats || [];
  const seatsArr = data?.arrival?.seats || [];
  const seatsTotal = seatsDep
    .concat(seatsArr)
    .reduce((sum, s) => sum + (Number(s.seat_price) || 0), 0);
  const total = seatsTotal + fpkTotal;

  const userName = [data?.user?.last_name, data?.user?.first_name, data?.user?.patronymic]
    .filter(Boolean)
    .join(" ");

  const handleBackHomeClick = () => {
    setTimeout(() => dispatch(resetOrder()), 100);
  };

  return (
    <div className="order-success-info-container">
      <div className="order-success-info">
        <div className="order-success-card">
          <div className="order-success-header">
            <h2 className="order-success-order-num">№Заказа {orderNumber}</h2>
            <div className="order-success-sum">
              <span className="order-success-sum-label">сумма</span>
              <span className="order-success-sum-value">
                {total.toLocaleString("ru-RU")}
              </span>
              <span className="order-success-sum-currency">₽</span>
            </div>
          </div>

          <div className="order-success-divider" />

          <div className="order-success-steps">
            <div className="order-success-step-item">
              <div className="order-success-step-icon order-success-step-icon-train">
                <img
                  className="order-success-step-icon-img order-success-step-icon-img-email"
                  src={emailTicketsIcon}
                  alt="email tickets"
                />
              </div>
              <p>
                билеты будут отправлены на ваш{" "}
                <span className="order-success-step-icon-text">e-mail</span>
              </p>
            </div>
            <div className="order-success-step-item">
              <div className="order-success-step-icon order-success-step-icon-ticket">
                <img
                  className="order-success-step-icon-img order-success-step-icon-img-print"
                  src={printTicketsIcon}
                  alt="print tickets"
                />
              </div>
              <p>
                <span className="order-success-step-icon-text">
                  распечатайте
                </span>{" "}
                и сохраняйте билеты до даты поездки
              </p>
            </div>
            <div className="order-success-step-item">
              <div className="order-success-step-icon order-success-step-icon-info">
                <img
                  className="order-success-step-icon-img order-success-step-icon-img-info"
                  src={infoTicketsIcon}
                  alt="info tickets"
                />
              </div>
              <p>
                <span className="order-success-step-icon-text">предьявите</span>{" "}
                распечатанные билеты при посадке
              </p>
            </div>
          </div>

          <div className="order-success-message">
            <h3 className="order-success-greeting">
              {userName || "Пользователь"}!
            </h3>
            <p className="order-success-text">
              Ваш заказ успешно оформлен.{" "}
              <p className="order-success-text-highlight">
                В ближайшее время с вами свяжется наш оператор для
              </p>
              подтверждения.
            </p>
            <p className="order-success-thanks">
              Благодарим Вас за оказанное доверие и желаем приятного
              путешествия!
            </p>
          </div>
        </div>
        <div className="order-success-footer">
          <div className="order-success-rating">
            <span className="order-success-rating-label">
              Оцените наш сервис
            </span>
            <div className="order-success-stars">
              <StarIcon />
            </div>
          </div>
          <Link
            to="/"
            replace
            className="order-success-btn-home"
            onClick={handleBackHomeClick}
          >
            вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessInfo;
