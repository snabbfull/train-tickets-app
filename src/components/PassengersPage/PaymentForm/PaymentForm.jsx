import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserInfo, setPaymentMethod } from "../../../store/order/orderSlice";
import "./PaymentForm.css";

const ONLINE_METHODS_LABELS = [
  "Банковской картой",
  "PayPal",
  "Visa QIWI Wallet",
];

/** Валидный формат: +7 + 10 цифр */
const PHONE_REGEX = /^\+7\d{10}$/;

/** Простая проверка email по стандартному паттерну */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Форматирует телефон: только цифры, 8/7 заменяем на +7, далее макс 10 цифр */
const formatPhone = (value) => {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.length === 0) return "";
  let rest = digits;
  if (rest.startsWith("8")) rest = "7" + rest.slice(1);
  else if (!rest.startsWith("7")) rest = "7" + rest;
  const ten = rest.slice(1, 11);
  if (ten.length === 0) return "+7";
  return "+7" + ten;
};

const PaymentForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const { data } = order;
  const user = data.user;

  const isPhoneValid = PHONE_REGEX.test((user.phone || "").trim());
  const isEmailValid = EMAIL_REGEX.test((user.email || "").trim());
  const isBuyerValid =
    user.last_name?.trim() &&
    user.first_name?.trim() &&
    isPhoneValid &&
    isEmailValid;

  const handleBuyerChange = (field, value) => {
    dispatch(setUserInfo({ [field]: value }));
  };

  const handlePhoneChange = (value) => {
    dispatch(setUserInfo({ phone: formatPhone(value) }));
  };

  const isOnline = ["card", "paypal", "qiwi"].includes(user.payment_method || "card");

  const handleOnlineCheck = (checked) => {
    dispatch(setPaymentMethod(checked ? "card" : "cash"));
  };

  const handleCashCheck = (checked) => {
    dispatch(setPaymentMethod(checked ? "cash" : "card"));
  };

  const handleSubmit = () => {
    if (!isBuyerValid) return;
    navigate("/order");
  };

  return (
    <div className="payment-form">
      <div className="payment-card">
        <div className="payment-section-header">
          <h2 className="payment-section-title">Персональные данные</h2>
        </div>
        <div className="payment-section-body">
          <div className="payment-divider-dashed" aria-hidden />
          <div className="payment-field-row">
            <div className="payment-field">
              <label>Фамилия</label>
              <input
                type="text"
                value={user.last_name || ""}
                onChange={(e) => handleBuyerChange("last_name", e.target.value)}
                placeholder="Мартынюк"
              />
            </div>
            <div className="payment-field">
              <label>Имя</label>
              <input
                type="text"
                value={user.first_name || ""}
                onChange={(e) => handleBuyerChange("first_name", e.target.value)}
                placeholder="Ирина"
              />
            </div>
            <div className="payment-field">
              <label>Отчество</label>
              <input
                type="text"
                value={user.patronymic || ""}
                onChange={(e) => handleBuyerChange("patronymic", e.target.value)}
                placeholder="Эдуардовна"
              />
            </div>
          </div>
          <div className="payment-field">
            <label>Контактный телефон</label>
            <input
              type="tel"
              inputMode="numeric"
              value={user.phone || ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+7 ___ ___ __ __"
              maxLength={12}
              autoComplete="tel"
            />
          </div>
          <div className="payment-field">
            <label>E-mail</label>
            <input
              type="email"
              value={user.email || ""}
              onChange={(e) => handleBuyerChange("email", e.target.value)}
              placeholder="inbox@gmail.ru"
              autoComplete="email"
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            />
          </div>
        </div>
      </div>

      <div className="payment-card">
        <div className="payment-section-header">
          <h2 className="payment-section-title">Способ оплаты</h2>
        </div>
        <div className="payment-section-body payment-section-payment">
          <div className="payment-divider-dashed" aria-hidden />
          <div className="payment-method-section">
            <label className="payment-checkbox-row">
              <input
                type="checkbox"
                checked={isOnline}
                onChange={(e) => handleOnlineCheck(e.target.checked)}
              />
              <span className="payment-checkbox-label">Онлайн</span>
            </label>
            <div className="payment-methods-info">
              {ONLINE_METHODS_LABELS.map((label) => (
                <span key={label} className="payment-method-info-item">{label}</span>
              ))}
            </div>
          </div>
          <div className="payment-divider-dashed payment-divider-between" aria-hidden />
          <div className="payment-method-section">
            <label className="payment-checkbox-row">
              <input
                type="checkbox"
                checked={(user.payment_method || "card") === "cash"}
                onChange={(e) => handleCashCheck(e.target.checked)}
              />
              <span className="payment-checkbox-label">Наличными</span>
            </label>
          </div>
        </div>
      </div>

      <div className="payment-actions">
        <button
          type="button"
          className="payment-btn-buy"
          onClick={handleSubmit}
          disabled={!isBuyerValid}
        >
          Купить билеты
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
