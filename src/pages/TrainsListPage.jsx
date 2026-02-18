import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRef } from "react";
import FilterSideBar from "../components/TrainsListPage/FilterSidebar/FilterSidebar";
import LastTickets from "../components/TrainsListPage/LastTickets/LastTickets";
import TrainsSection from "../components/TrainsListPage/TrainsSection/TrainsSection";
import "./TrainsListPage.css";
import HeroSection2 from "../components/TrainsListPage/HeroSection2/HeroSection2";
import Loader from "../components/Loader/Loader";
import LoadingError from "../components/LoadingError/LoadingError";

const TrainsListPage = () => {
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.trainsList);
  const fetchedRef = useRef(new Set());

  return (
    <>
      <HeroSection2 />
      {loading && <Loader />}
      {error && <LoadingError />}
      {!loading && !error && (
        <div className="trains-page">
          <div className="trains-left">
            <FilterSideBar />
            <LastTickets />
          </div>
          <div className="trains-right">
            <TrainsSection
              locationSearch={location.search}
              fetchedRef={fetchedRef}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TrainsListPage;
