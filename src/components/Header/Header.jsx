import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/train-tickets-app" className="header__logo-link">
          <div className="header__logo">
            <span>Лого</span>
          </div>
        </Link>
        <nav className="header__nav">
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <a href="#about" className="header__nav-link">
                О нас
              </a>
            </li>
            <li className="header__nav-item">
              <a href="#how-it-works" className="header__nav-link">
                Как это работает
              </a>
            </li>
            <li className="header__nav-item">
              <a href="#reviews" className="header__nav-link">
                Отзывы
              </a>
            </li>
            <li className="header__nav-item">
              <a href="#contact" className="header__nav-link">
                Контакты
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
