import HeroSection2 from "../components/TrainsListPage/HeroSection2/HeroSection2";
import Stepper from "../components/Stepper/Stepper";
import PassengersForm from "../components/PassengersPage/PassengersForm/PassengersForm";
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

  // Redirect if no seats selected
  useEffect(() => {
    if (!data.selectedSeats || data.selectedSeats.length === 0) {
      navigate("/routes");
    }
  }, [data.selectedSeats, navigate]);

  return (
    <>
      <HeroSection2 />
      <Stepper />
      {error && <LoadingError />}
      {!error && (
        <div className="trains-page">
          <div className="trains-left">
            <div className="passengers-summary">
              <h3>Информация о заказе</h3>
              <div className="summary-item">
                <span>Выбранные места:</span>
                <strong>{data.selectedSeats.join(", ")}</strong>
              </div>
              <div className="summary-item">
                <span>Количество пассажиров:</span>
                <strong>{data.selectedSeats.length}</strong>
              </div>
            </div>
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
