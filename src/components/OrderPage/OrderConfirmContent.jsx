import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendOrderRequested } from "../../store/actions";
import { selectFpkTotalPrice } from "../../store/order/orderSlice";
import TrainCard from "../TrainsListPage/TrainCard/TrainCard";
import passengerOrderImg from "../../assets/passenger-order.png";
import trainIcon from "../../assets/train-icon.png";
import "./OrderConfirmContent.css";

const formatTime = (ts) => {
  if (ts == null) return "--:--";
  const date = new Date(typeof ts === "number" ? ts * 1000 : ts);
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

const formatDuration = (seconds) => {
  if (seconds == null) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h} ч ${m} мин`;
};

const formatBirthday = (val) => {
  if (!val) return "";
  const str = String(val);
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) return str;
  const d = new Date(typeof val === "number" ? val * 1000 : val);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const PAYMENT_LABELS = {
  card: "Банковской картой",
  paypal: "PayPal",
  qiwi: "QIWI",
  online: "Онлайн",
  cash: "Наличными",
};

const OrderConfirmContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const { data, trainSummary, lastSelectedTrain, lastRoutesSearch, loading } = order;
  const fpkTotal = useSelector(selectFpkTotalPrice);
  const dep = data?.departure;
  const arr = data?.arrival;
  const summaryDep = trainSummary?.departure;
  const summaryArr = trainSummary?.arrival;
  const seatsDep = dep?.seats || [];
  const seatsArr = arr?.seats || [];

  const adultsDepTotal = seatsDep
    .filter((s) => !s.is_child)
    .reduce((sum, s) => sum + (Number(s.seat_price) || 0), 0);
  const childrenDepTotal = seatsDep
    .filter((s) => s.is_child)
    .reduce((sum, s) => sum + (Number(s.seat_price) || 0), 0);
  const adultsArrTotal = seatsArr
    .filter((s) => !s.is_child)
    .reduce((sum, s) => sum + (Number(s.seat_price) || 0), 0);
  const childrenArrTotal = seatsArr
    .filter((s) => s.is_child)
    .reduce((sum, s) => sum + (Number(s.seat_price) || 0), 0);
  const seatsTotal = adultsDepTotal + childrenDepTotal + adultsArrTotal + childrenArrTotal;
  const total = seatsTotal + fpkTotal;

  const handleConfirm = () => {
    const orderData = {
      user: data.user,
      departure: {
        ...data.departure,
        optional_services: order.fpkOptions?.length ? order.fpkOptions : undefined,
      },
      ...(data.arrival && { arrival: data.arrival }),
    };
    dispatch(sendOrderRequested(orderData));
  };

  const handleChangeTrain = () => {
    navigate(`/routes${lastRoutesSearch || ""}`);
  };

  const handleChangePassengers = () => navigate("/passengers");
  const handleChangePayment = () => navigate("/payment");

  if (!summaryDep && !lastSelectedTrain) return null;

  return (
    <div className="order-confirm-content">
      <div className="order-confirm-card order-confirm-train">
        {lastSelectedTrain ? (
          <TrainCard
            train={lastSelectedTrain}
            buttonLabel="Изменить"
            onButtonClick={handleChangeTrain}
          />
        ) : (
          <div className="order-train-fallback">
            <div className="order-train-left">
              <div className="order-train-image">
                <img src={trainIcon} alt="" />
              </div>
              <div className="order-train-name">{summaryDep?.trainName}</div>
              <div className="order-train-cities">
                {summaryDep?.fromCity} → {summaryDep?.toCity}
              </div>
            </div>
            <div className="order-train-right">
              <button type="button" className="order-btn-edit" onClick={handleChangeTrain}>
                Изменить
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="order-confirm-card order-confirm-passengers">
        <h3 className="order-confirm-title">Пассажиры</h3>
        <div className="order-confirm-divider" />
        <div className="order-passengers-body">
          <div className="order-passengers-left">
            {seatsDep.concat(seatsArr).map((seat, idx) => {
              const info = seat.person_info || {};
              const fullName = [info.last_name, info.first_name, info.patronymic].filter(Boolean).join(" ");
              const genderText = info.gender === false ? "женский" : "мужской";
              const typeText = seat.is_child ? "Детский" : "Взрослый";
              const docText =
                info.document_type === "свидетельство"
                  ? `Свидетельство о рождении ${info.document_data || ""}`
                  : `Паспорт РФ ${info.document_series || ""} ${info.document_data || ""}`.trim();
              return (
                <div key={idx} className="order-passenger-left-item">
                  <div className="order-passenger-icon-block">
                    <img src={passengerOrderImg} alt="" className="order-passenger-icon" />
                    <span className="order-passenger-type-label">{typeText}</span>
                  </div>
                  <div className="order-passenger-info">
                    <div className="order-passenger-name">{fullName || "—"}</div>
                    <div className="order-passenger-meta">Пол {genderText}</div>
                    <div className="order-passenger-meta">Дата рождения {formatBirthday(info.birthday)}</div>
                    <div className="order-passenger-meta">{docText}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="order-passengers-right">
            <div className="order-passengers-total">
              <span className="order-total-label">Всего</span>
              <span className="order-total-amount">{total.toLocaleString("ru-RU")}</span>
              <span className="order-total-currency">₽</span>
            </div>
            <button type="button" className="order-btn-edit" onClick={handleChangePassengers}>
              Изменить
            </button>
          </div>
        </div>
      </div>

      <div className="order-confirm-card order-confirm-payment">
        <h3 className="order-confirm-title">Способ оплаты</h3>
        <div className="order-confirm-divider" />
        <div className="order-payment-row">
          <span className="order-payment-value">
            {PAYMENT_LABELS[data.user?.payment_method] || data.user?.payment_method || "—"}
          </span>
          <button type="button" className="order-btn-edit" onClick={handleChangePayment}>
            Изменить
          </button>
        </div>
      </div>

      <div className="order-confirm-actions">
        <button
          type="button"
          className="order-btn-confirm"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Обработка..." : "Подтвердить"}
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmContent;
