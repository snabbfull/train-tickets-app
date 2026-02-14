import React from "react";
import "./HowItWorks.css";
import FeatureCard from "./FeatureCard";
import comp from '../../../assets/comp.png'
import building from "../../../assets/building.png";
import planet from "../../../assets/planet.png";

const HowItWorks = () => {
  const features = [
    {
      icon: comp,
      text: "Удобный заказ на сайте",
    },
    {
      icon: building,
      text: "Нет необходимости ехать в офис",
    },
    {
      icon: planet,
      text: "Огромный выбор направлений",
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__container">
        <div className="how-it-works__header">
          <h2 className="how-it-works__title">КАК ЭТО РАБОТАЕТ</h2>
          <button className="how-it-works__learn-more">Узнать больше</button>
        </div>

        <div className="features">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              text={feature.text}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
