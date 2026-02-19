import FilterSideBar from "../components/TrainsListPage/FilterSideBar/FilterSideBar";
import LastTickets from "../components/TrainsListPage/LastTickets/LastTickets";
import HeroSection2 from "../components/TrainsListPage/HeroSection2/HeroSection2";
import Stepper from "../components/Stepper/Stepper";
import SeatsSection from "../components/SeatsPage/SeatsSection/SeatsSection";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRef } from "react";
import "./TrainsListPage.css";
import Loader from "../components/Loader/Loader";
import LoadingError from "../components/LoadingError/LoadingError";

const SeatsPage = () => {
  const { routeId } = useParams();
  const { loading, error } = useSelector((state) => state.trainSeats);
  const fetchedRef = useRef(new Set());

  return (
    <>
      <HeroSection2 />
      <Stepper />
      {loading && <Loader />}
      {error && <LoadingError />}
      {!loading && !error && (
        <div className="trains-page">
          <div className="trains-left">
            <FilterSideBar />
            <LastTickets />
          </div>
          <div className="trains-right">
            <SeatsSection routeId={routeId} fetchedRef={fetchedRef} />
          </div>
        </div>
      )}
    </>
  );
};

export default SeatsPage;
