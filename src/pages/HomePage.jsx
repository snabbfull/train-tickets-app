import HeroSection from "../components/HomePage/HeroSection/HeroSection";
import About from "../components/HomePage/About/About";
import HowItWorks from "../components/HomePage/HowItWorks/HowItWorks";
import Reviews from "../components/HomePage/Reviews/Reviews";

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <About />
      <HowItWorks />
      <Reviews />
    </div>
  );
};

export default HomePage;