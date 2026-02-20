import HeroSection2 from "../components/TrainsListPage/HeroSection2/HeroSection2";
import Stepper from "../components/Stepper/Stepper";
import PassengersForm from "../components/PassengersPage/PassengersForm/PassengersForm";
import OrderInformationSideBar from "../components/PassengersPage/OrderInformationSideBar/OrderInformationSideBar";
import "./TrainsListPage.css";
import "./PassengersPage.css";
import LoadingError from "../components/LoadingError/LoadingError";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PassengersPage = () => {
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const { data } = order;
  const error =
    !data.departure.seats || data.departure.seats.length === 0
      ? "Сначала выберите места"
      : null;

  // Redirect if no seats selected (проверяем data.departure.seats — там хранятся выбранные места)
  useEffect(() => {
    if (!data.departure.seats || data.departure.seats.length === 0) {
      navigate("/routes");
    }
  }, [data.departure.seats, navigate]);

  return (
    <>
      <HeroSection2 />
      <Stepper />
      {error && <LoadingError />}
      {!error && (
        <div className="trains-page passengers-page-layout">
          <div className="trains-left">
            <OrderInformationSideBar />
          </div>
          <div className="trains-right">
            <PassengersForm />
          </div>
        </div>
      )}
    </>
  );
};

export default PassengersPage;
