import React from "react";
import "./HowItWorks.css";

const FeatureCard = ({ icon, text }) => {
  return (
    <div className="feature-card">
      <div className="feature-card__icon-wrapper">
        <img src={icon} className="feature-card__icon" alt="" />
      </div>
      <div className="feature-card__text-container">
        <p className="feature-card__text">{text}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
