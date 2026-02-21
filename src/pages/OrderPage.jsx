import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HeroSection2 from "../components/TrainsListPage/HeroSection2/HeroSection2";
import Stepper from "../components/Stepper/Stepper";
import Loader from "../components/Loader/Loader";
import LoadingError from "../components/LoadingError/LoadingError";
import OrderInformationSideBar from "../components/PassengersPage/OrderInformationSideBar/OrderInformationSideBar";
import OrderConfirmContent from "../components/OrderPage/OrderConfirmContent";
import "./TrainsListPage.css";
import "./PassengersPage.css";
import "./OrderPage.css";
import { resetOrder } from "../store/order/orderSlice";

const OrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const { data, success, orderNumber } = order;

  useEffect(() => {
    if (!data.departure.seats || data.departure.seats.length === 0) {
      navigate("/routes");
    }
  }, [data.departure.seats, navigate]);

  const handleBackHome = () => {
    dispatch(resetOrder());
    navigate("/");
  };

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
      {order.loading && <Loader />}
      {order.error && <LoadingError />}
      {!order.loading && !order.error && (
        <div className="trains-page order-page-layout">
          <div className="trains-left">
            <OrderInformationSideBar />
          </div>
          <div className="trains-right">
            <OrderConfirmContent />
          </div>
        </div>
      )}
    </>
  );
};

export default OrderPage;
