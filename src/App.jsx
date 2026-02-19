import "./App.css";
import HomePage from "./pages/HomePage";
import TrainsListPage from "./pages/TrainsListPage";
import SeatsPage from "./pages/SeatsPage";
import PassengersPage from "./pages/PassengersPage";
import OrderPage from "./pages/OrderPage";
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
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
