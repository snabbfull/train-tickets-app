import './App.css'
import { HomePage } from './pages/HomePage';
import { Routes, Route } from "react-router-dom";
import Header from "./components/HomePage/Header/Header";
import Footer from "./components/HomePage/Footer/Footer";

function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/train-tickets-app" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App
