import { useEffect } from "react";
import { useSelector } from "react-redux";
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

const OrderPage = () => {
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const { data } = order;

  useEffect(() => {
    if (!data.departure.seats || data.departure.seats.length === 0) {
      navigate("/routes");
    }
  }, [data.departure.seats, navigate]);

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
