import HeroSection2 from "../components/TrainsListPage/HeroSection2/HeroSection2";
import Stepper from "../components/Stepper/Stepper";
import OrderInformationSideBar from "../components/PassengersPage/OrderInformationSideBar/OrderInformationSideBar";
import PaymentForm from "../components/PassengersPage/PaymentForm/PaymentForm";
import "./TrainsListPage.css";
import "./PassengersPage.css";
import "./PaymentPage.css";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const { data } = order;
  const error =
    !data.departure.seats || data.departure.seats.length === 0
      ? "Сначала выберите места"
      : null;

  useEffect(() => {
    if (!data.departure.seats || data.departure.seats.length === 0) {
      navigate("/routes");
    }
  }, [data.departure.seats, navigate]);

  if (error) return null;

  return (
    <>
      <HeroSection2 />
      <Stepper />
      <div className="trains-page payment-page-layout">
        <div className="trains-left">
          <OrderInformationSideBar />
        </div>
        <div className="trains-right">
          <PaymentForm />
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
