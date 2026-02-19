import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPassengerInfo, setUserInfo } from "../../../store/order/orderSlice";
import "./PassengersForm.css";

const PassengersForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const { data } = order;
  const { departure } = data;
  const passengers = departure.seats;
  const [currentStep, setCurrentStep] = useState(0); // 0 = passengers, 1 = buyer

  const handlePassengerChange = (seatIndex, field, value) => {
    const personInfo = { ...passengers[seatIndex].person_info };

    if (
      field === "gender" ||
      field === "is_adult" ||
      field === "is_child" ||
      field === "include_children_seat"
    ) {
      // Boolean fields
      personInfo[field] = value === "true" || value === true;
    } else {
      personInfo[field] = value;
    }

    dispatch(setPassengerInfo({ seatIndex, personInfo }));
  };

  const handleBuyerChange = (field, value) => {
    dispatch(setUserInfo({ [field]: value }));
  };

  const isPassengersValid = passengers.every((passenger) => {
    const info = passenger.person_info;
    return (
      info.first_name.trim() &&
      info.last_name.trim() &&
      info.birthday &&
      info.gender !== "" &&
      info.document_type &&
      info.document_data.trim()
    );
  });

  const isBuyerValid =
    data.user.first_name.trim() &&
    data.user.last_name.trim() &&
    data.user.phone.trim() &&
    data.user.email.trim();

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (isPassengersValid) {
        setCurrentStep(1);
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(0);
  };

  const handleSubmit = () => {
    if (isBuyerValid) {
      navigate("/order");
    }
  };

  return (
    <div className="passengers-form">
      {currentStep === 0 ? (
        // Passengers form
        <div className="passengers-section">
          <h2>Информация о пассажирах</h2>

          {passengers.map((passenger, seatIndex) => (
            <div key={seatIndex} className="passenger-card">
              <div className="passenger-header">
                <h3>Пассажир {seatIndex + 1}</h3>
                <span className="seat-badge">
                  Место {passenger.seat_number}
                </span>
              </div>

              <div className="form-grid">
                {/* Личные данные */}
                <div className="form-group">
                  <label>Имя *</label>
                  <input
                    type="text"
                    value={passenger.person_info.first_name}
                    onChange={(e) =>
                      handlePassengerChange(
                        seatIndex,
                        "first_name",
                        e.target.value,
                      )
                    }
                    placeholder="Иван"
                  />
                </div>

                <div className="form-group">
                  <label>Фамилия *</label>
                  <input
                    type="text"
                    value={passenger.person_info.last_name}
                    onChange={(e) =>
                      handlePassengerChange(
                        seatIndex,
                        "last_name",
                        e.target.value,
                      )
                    }
                    placeholder="Смирнов"
                  />
                </div>

                <div className="form-group">
                  <label>Отчество</label>
                  <input
                    type="text"
                    value={passenger.person_info.patronymic}
                    onChange={(e) =>
                      handlePassengerChange(
                        seatIndex,
                        "patronymic",
                        e.target.value,
                      )
                    }
                    placeholder="Олегович"
                  />
                </div>

                <div className="form-group">
                  <label>Дата рождения *</label>
                  <input
                    type="date"
                    value={passenger.person_info.birthday}
                    onChange={(e) =>
                      handlePassengerChange(
                        seatIndex,
                        "birthday",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Пол *</label>
                  <select
                    value={passenger.person_info.gender ? "true" : "false"}
                    onChange={(e) =>
                      handlePassengerChange(seatIndex, "gender", e.target.value)
                    }
                  >
                    <option value="">Выберите пол</option>
                    <option value="true">Мужской</option>
                    <option value="false">Женский</option>
                  </select>
                </div>

                {/* Документ */}
                <div className="form-group">
                  <label>Тип документа *</label>
                  <select
                    value={passenger.person_info.document_type}
                    onChange={(e) =>
                      handlePassengerChange(
                        seatIndex,
                        "document_type",
                        e.target.value,
                      )
                    }
                  >
                    <option value="">Выберите тип</option>
                    <option value="паспорт">Паспорт</option>
                    <option value="свидетельство">
                      Свидетельство о рождении
                    </option>
                    <option value="права">Водительские права</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Данные документа *</label>
                  <input
                    type="text"
                    value={passenger.person_info.document_data}
                    onChange={(e) =>
                      handlePassengerChange(
                        seatIndex,
                        "document_data",
                        e.target.value,
                      )
                    }
                    placeholder="45 6790195"
                  />
                </div>

                {/* Тип билета */}
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={!passenger.person_info.is_adult}
                      onChange={(e) =>
                        handlePassengerChange(
                          seatIndex,
                          "is_adult",
                          !e.target.checked,
                        )
                      }
                    />
                    Детский билет
                  </label>
                </div>

                {!passenger.person_info.is_adult && (
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={passenger.include_children_seat}
                        onChange={(e) =>
                          dispatch(
                            setPassengerInfo({
                              seatIndex,
                              personInfo: {
                                ...passenger.person_info,
                              },
                              include_children_seat: e.target.checked,
                            }),
                          )
                        }
                      />
                      Нужно доп. место для ребенка
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={handleNextStep}
              disabled={!isPassengersValid}
            >
              Далее →
            </button>
          </div>
        </div>
      ) : (
        // Buyer form
        <div className="buyer-section">
          <h2>Данные покупателя</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Имя *</label>
              <input
                type="text"
                value={data.user.first_name}
                onChange={(e) =>
                  handleBuyerChange("first_name", e.target.value)
                }
                placeholder="Иван"
              />
            </div>

            <div className="form-group">
              <label>Фамилия *</label>
              <input
                type="text"
                value={data.user.last_name}
                onChange={(e) => handleBuyerChange("last_name", e.target.value)}
                placeholder="Иванов"
              />
            </div>

            <div className="form-group">
              <label>Отчество</label>
              <input
                type="text"
                value={data.user.patronymic}
                onChange={(e) =>
                  handleBuyerChange("patronymic", e.target.value)
                }
                placeholder="Иванович"
              />
            </div>

            <div className="form-group">
              <label>Телефон *</label>
              <input
                type="tel"
                value={data.user.phone}
                onChange={(e) => handleBuyerChange("phone", e.target.value)}
                placeholder="+7 (900) 123-12-34"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={data.user.email}
                onChange={(e) => handleBuyerChange("email", e.target.value)}
                placeholder="example@mail.ru"
              />
            </div>

            <div className="form-group">
              <label>Метод оплаты</label>
              <select
                value={data.user.payment_method}
                onChange={(e) =>
                  handleBuyerChange("payment_method", e.target.value)
                }
              >
                <option value="cash">Наличные</option>
                <option value="online">Онлайн</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={handlePrevStep}>
              ← Назад
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!isBuyerValid}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengersForm;
