import React from "react";
import "./HeroSection.css";
import SearchForm from "../SearchForm/SearchForm";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__overlay">
        <div className="hero__content">
          <div className="hero__text">
            <h1 className="hero__title">
              Вся жизнь — <br />
              <span className="hero__highlight">путешествие!</span>
            </h1>
          </div>

          <SearchForm />
        </div>
      </div>
    </section>
  );
};

export default Hero;
