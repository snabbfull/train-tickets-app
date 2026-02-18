import './App.css'
import HomePage from './pages/HomePage';
import TrainsListPage from './pages/TrainsListPage';
// import PassengerDetailsPage from './pages/PassengerDetailsPage';
// import SearchResultsPage from './pages/SearchResultsPage';
// import SeatSelectionPage from './pages/SeatSelectionPage';
// import PaymentPage from './pages/PaymentPage';
// import ConfirmationPage from './pages/ConfirmationPage';
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
          {/* <Route path="/select-seats" element={<SeatSelectionPage />} />
          <Route path="/passengers" element={<PassengerDetailsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} /> */}
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App
