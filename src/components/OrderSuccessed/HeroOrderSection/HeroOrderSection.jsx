import React from "react";
import "./HeroOrderSection.css";

const HeroOrderSection = () => {
  return (
    <section className="hero-order-section">
      <div className="hero-order-section__content" role="presentation">
        <h1 className="hero-order-section__title">
          <span className="hero-order-section__title-highlight">Благодарим Вас за заказ!</span>
        </h1>
      </div>
    </section>
  );
};

export default HeroOrderSection;
