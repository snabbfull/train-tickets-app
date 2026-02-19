import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import "./Stepper.css";

const Stepper = () => {
  const location = useLocation();

  // Определяем текущий шаг на основе URL
  const currentStep = useMemo(() => {
    const path = location.pathname;

    if (path.includes("/routes")) return 1; // Билеты
    if (path.includes("/passengers")) return 2; // Пассажиры
    if (path.includes("/payment")) return 3; // Оплата
    if (path.includes("/verification") || path.includes("/check")) return 4; // Проверка

    return 1;
  }, [location.pathname]);

  const steps = [
    { number: 1, label: "Билеты" },
    { number: 2, label: "Пассажиры" },
    { number: 3, label: "Оплата" },
    { number: 4, label: "Проверка" },
  ];

  return (
    <div className="stepper-chevron">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={`chevron-step ${step.number === currentStep ? "active" : ""} ${
            step.number < currentStep ? "completed" : ""
          } ${index === 0 ? "first" : ""} ${index === steps.length - 1 ? "last" : ""}`}
        >
          <div className="chevron-content">
            <span className="chevron-number">
              <span className="chevron-number-value">{step.number}</span>
            </span>
            <span className="chevron-label">{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
