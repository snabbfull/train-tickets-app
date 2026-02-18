import React from "react";
import "./HeroSection2.css";
import SearchForm2 from "../SearchForm2/SearchForm2";

const HeroSection2 = () => {
  return (
    <section className="hero-2">
      <div className="hero__overlay-2">
        <div className="hero__content-2">
          <SearchForm2 />
        </div>
      </div>
    </section>
  );
};

export default HeroSection2;
