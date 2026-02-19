import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HeroSection2 from "../components/TrainsListPage/HeroSection2/HeroSection2";
import Stepper from "../components/Stepper/Stepper";
import Loader from "../components/Loader/Loader";
import LoadingError from "../components/LoadingError/LoadingError";
import "./OrderPage.css";
import { sendOrderRequested } from "../store/actions";
import { resetOrder } from "../store/order/orderSlice";

const OrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const { data, loading, error, success, orderNumber } = order;

  // Redirect if no seats selected
  useEffect(() => {
    if (!data.departure.seats || data.departure.seats.length === 0) {
      navigate("/routes");
    }
  }, [data.departure.seats, navigate]);

  const handleConfirmOrder = () => {
    // Prepare order data for API
    const orderData = {
      user: data.user,
      departure: data.departure,
    };

    // Dispatch order sending
    dispatch(sendOrderRequested(orderData));
  };

  const handleBackHome = () => {
    dispatch(resetOrder());
    navigate("/");
  };

  // Show success screen
  if (success && orderNumber) {
    return (
      <>
        <HeroSection2 />
        <Stepper />
        <div className="order-success-page">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h1>Заказ успешно оформлен!</h1>
            <p className="order-number">
              Номер заказа: <strong>#{orderNumber}</strong>
            </p>
            <p className="success-message">
              На вашу почту <strong>{data.user.email}</strong> отправлены билеты
            </p>
            <button className="btn-home" onClick={handleBackHome}>
              На главную
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroSection2 />
      <Stepper />
      {loading && <Loader />}
      {error && <LoadingError />}
      {!loading && !error && (
        <div className="order-page">
          <div className="order-left">
            <div className="order-summary">
              <h3>Итоговая информация</h3>

              <div className="summary-section">
                <h4>Пассажиры:</h4>
                {data.departure.seats.map((seat, idx) => (
                  <div key={idx} className="passenger-item">
                    <span>
                      {seat.person_info.first_name} {seat.person_info.last_name}
                    </span>
                    <span className="seat-info">Место {seat.seat_number}</span>
                  </div>
                ))}
              </div>

              <div className="summary-section">
                <h4>Покупатель:</h4>
                <p>
                  {data.user.first_name} {data.user.last_name}
                </p>
                <p className="small">{data.user.email}</p>
                <p className="small">{data.user.phone}</p>
              </div>
            </div>
          </div>

          <div className="order-right">
            <div className="order-card">
              <h2>Проверка и оформление</h2>

              <div className="order-details">
                <div className="detail-item">
                  <span>Количество билетов:</span>
                  <strong>{data.departure.seats.length}</strong>
                </div>
                <div className="detail-item">
                  <span>Метод оплаты:</span>
                  <strong>
                    {data.user.payment_method === "cash"
                      ? "Наличные"
                      : "Онлайн"}
                  </strong>
                </div>
              </div>

              <div className="terms-check">
                <label>
                  <input type="checkbox" defaultChecked />Я согласен(а) с
                  условиями использования и политикой конфиденциальности
                </label>
              </div>

              <div className="order-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate("/passengers")}
                >
                  ← Назад
                </button>
                <button
                  className="btn-primary"
                  onClick={handleConfirmOrder}
                  disabled={loading}
                >
                  {loading ? "Обработка..." : "Оформить заказ"}
                </button>
              </div>

              <p className="order-notice">
                ℹ️ После оформления заказа вы получите подтверждение на
                указанный email и сможете распечатать билеты
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderPage;
