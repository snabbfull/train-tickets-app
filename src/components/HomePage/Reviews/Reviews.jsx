import React from "react";
import "./Reviews.css";
import user1 from '../../../assets/user1.png'
import user2 from "../../../assets/user2.png";

const Reviews = () => (
  <section className="reviews-section">
    <div className="reviews-container">
      <h2>ОТЗЫВЫ</h2>

      <div className="reviews">
        <div className="review">
          <div className="review-header">
            <img src={user1} alt="Екатерина Вальнова" className="avatar" />
            <div className="reviewer-info">
              <h3>Екатерина Вальнова</h3>
              <div className="review-text">
                <p>
                  "Доброжелательные подсказки на всех этапах помогут правильно
                  заполнить поля и без затруднений купить авиа или ж/д билет,
                  даже если вы заказываете онлайн билет впервые."
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="review">
          <div className="review-header">
            <img src={user2} alt="Евгений Стрыкало" className="avatar" />
            <div className="reviewer-info">
              <h3>Евгений Стрыкало</h3>
              <div className="review-text">
                <p>
                  "СМС-сопровождение до посадки. Сразу после оплаты ж/д билетов
                  и за 3 часа до отправления мы пришлем вам СМС-напоминание о
                  поездке."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="review-dots" role="tablist">
        <button
          type="button"
          className="dot active"
          aria-label="Слайд 1"
        ></button>
        <button type="button" className="dot" aria-label="Слайд 2"></button>
        <button type="button" className="dot" aria-label="Слайд 3"></button>
        <button type="button" className="dot" aria-label="Слайд 4"></button>
        <button type="button" className="dot" aria-label="Слайд 5"></button>
      </div>
    </div>
  </section>
);

export default Reviews;
