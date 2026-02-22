import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendSubscribeRequested } from "../../store/actions";
import { resetSubscribe } from "../../store/subscribe/subscribeSlice";
import "./Footer.css";
import call from "../../assets/call.png"
import mail from "../../assets/mail.png"
import skype from "../../assets/skype.png"
import geolocation from "../../assets/geolocation.png"
import youtube from "../../assets/youtube.png"
import linkedin from "../../assets/in.png";
import gplus from "../../assets/gplus.png";
import facebook from "../../assets/facebook.png";
import twitter from "../../assets/twitter.png";
import scrolltop from "../../assets/scroll-top.png";
import exclamationIcon from "../../assets/exclamation.png";
import { Link } from "react-router-dom";

const SUCCESS_MESSAGE =
  "Таким образом консультация с широким активом в значительной степени обуславливает создание модели развития. Повседневная практика показывает, что сложившаяся структура организации играет важную роль в формировании существенных финансовых и административных";
const ERROR_MESSAGE = SUCCESS_MESSAGE;

const Footer = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.subscribe);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    dispatch(sendSubscribeRequested(email.trim()));
    setEmail("");
  };

  const modal = success ? "success" : error ? "error" : null;

  const handleCloseModal = () => {
    dispatch(resetSubscribe());
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer" id="contact">
      <div className="footer__container">
        <div className="footer__section footer__section--contacts">
          <h3 className="footer__title">Свяжитесь с нами</h3>

          <a href="tel:88000000000" className="footer__contact-link">
            <div className="footer__contact-item">
              <img className="footer__contact-icon" src={call} alt="" />8 (800)
              000 00 00
            </div>
          </a>

          <a href="mailto:inbox@mail.ru" className="footer__contact-link">
            <div className="footer__contact-item">
              <img className="footer__contact-icon" src={mail} alt="" />
              inbox@mail.ru
            </div>
          </a>

          <a href="skype:tu.train.tickets" className="footer__contact-link">
            <div className="footer__contact-item">
              <img className="footer__contact-icon" src={skype} alt="" />
              tu.train.tickets
            </div>
          </a>

          <div className="footer__contact-item">
            <img
              className="footer__contact-icon footer__contact-icon-geolocation"
              src={geolocation}
              alt=""
            />
            <div className="footer__address">
              <div>г. Москва</div>
              <div>ул. Московская 27-35</div>
              <div>555 555</div>
            </div>
          </div>
        </div>
        <div className="footer__subscribe--content">
          <div className="footer__section footer__section--subscribe">
            <h3 className="footer__title">Подписка</h3>
            <p className="footer__subscribe-text">Будьте в курсе событий</p>

            <form className="footer__subscribe-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="footer__subscribe-input"
                placeholder="e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="footer__subscribe-button"
                disabled={loading}
              >
                {loading ? "..." : "отправить"}
              </button>
            </form>
          </div>

          <div className="footer__section footer__section--follow">
            <h3 className="footer__title">Подписывайтесь на нас</h3>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="YouTube">
                <img src={youtube} alt="YouTube" />
              </a>
              <a href="#" className="footer__social-link" aria-label="LinkedIn">
                <img src={linkedin} alt="LinkedIn" />
              </a>
              <a href="#" className="footer__social-link" aria-label="Google+">
                <img src={gplus} alt="Google+" />
              </a>
              <a href="#" className="footer__social-link" aria-label="Facebook">
                <img src={facebook} alt="Facebook" />
              </a>
              <a href="#" className="footer__social-link" aria-label="Twitter">
                <img src={twitter} alt="Twitter" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="footer__bottom-container container">
          <Link to="/train-tickets-app" className="footer__logo-link">
            <div className="footer__logo">Лого</div>
          </Link>
          <div className="footer__scroll-top-container">
            <button
              type="button"
              className="footer__scroll-top-btn"
              onClick={scrollToTop}
              aria-label="Наверх"
            >
              <img className="footer__scroll-top" src={scrolltop} alt="" />
            </button>
          </div>
          <div className="footer__copyright">
            <span>2018 WEB</span>
          </div>
        </div>
      </div>
      {modal && (
        <div
          className="footer__subscribe-modal-overlay"
          onClick={handleCloseModal}
          role="presentation"
        >
          <div
            className={`footer__subscribe-modal footer__subscribe-modal--${modal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="footer__subscribe-modal-header">
              <div
                className="footer__subscribe-modal-header-icon"
                style={modal === "error" ? { backgroundImage: `url(${exclamationIcon})` } : undefined}
              />
            </div>
            <hr className="footer__subscribe-modal-divider" />
            <div className="footer__subscribe-modal-body">
              <p className="footer__subscribe-modal-text">
                {modal === "success" ? SUCCESS_MESSAGE : ERROR_MESSAGE}
              </p>
            </div>
            <div className="footer__subscribe-modal-footer">
              <hr className="footer__subscribe-modal-footer-divider" />
              <button
                type="button"
                className="footer__subscribe-modal-btn"
                onClick={handleCloseModal}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
