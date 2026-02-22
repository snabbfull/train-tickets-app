import "./App.css";
import HomePage from "./pages/HomePage";
import TrainsListPage from "./pages/TrainsListPage";
import SeatsPage from "./pages/SeatsPage";
import PassengersPage from "./pages/PassengersPage";
import PaymentPage from "./pages/PaymentPage";
import OrderPage from "./pages/OrderPage";
import OrderSuccessedPage from "./pages/OrderSuccessedPage";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/routes" element={<TrainsListPage />} />
          <Route path="/routes/:routeId/seats" element={<SeatsPage />} />
          <Route path="/passengers" element={<PassengersPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order-success" element={<OrderSuccessedPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
