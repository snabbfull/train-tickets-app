import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HeroOrderSection from "../components/OrderSuccessed/HeroOrderSection/HeroOrderSection";
import OrderSuccessInfo from "../components/OrderSuccessed/OrderSuccessInfo/OrderSuccessInfo";
import Stepper from "../components/Stepper/Stepper";

const OrderSuccessedPage = () => {
  const navigate = useNavigate();
  const { success, orderNumber } = useSelector((state) => state.order);

  useEffect(() => {
    if (!success && !orderNumber) {
      navigate("/order", { replace: true });
    }
  }, [success, orderNumber, navigate]);

  return (
    <>
      <HeroOrderSection />
      <OrderSuccessInfo />
    </>
  );
};

export default OrderSuccessedPage;
