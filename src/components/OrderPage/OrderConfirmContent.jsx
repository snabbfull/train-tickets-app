import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendOrderRequested } from "../../store/actions";
import { selectFpkTotalPrice } from "../../store/order/orderSlice";
import TrainCard from "../TrainsListPage/TrainCard/TrainCard";
import passengerOrderImg from "../../assets/passenger-order.png";
import trainIcon from "../../assets/train-icon.png";
import "./OrderConfirmContent.css";

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

/** Преобразует DD.MM.YYYY в YYYY-MM-DD */
const birthdayToApi = (val) => {
  if (!val) return "";
  const m = String(val).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return val;
};

/** Подготавливает payload для API order (order.md) */
const prepareOrderPayload = (order) => {
  const { data, fpkOptions } = order;
  const mapSeat = (seat) => {
    const info = seat.person_info || {};
    let documentData = info.document_data || "";
    if (info.document_type === "паспорт" && (info.document_series || info.document_data)) {
      documentData = [info.document_series, info.document_data].filter(Boolean).join(" ").trim();
    }
    return {
      coach_id: seat.coach_id,
      person_info: {
        is_adult: info.is_adult !== false,
        first_name: info.first_name || "",
        last_name: info.last_name || "",
        patronymic: info.patronymic || "",
        gender: info.gender !== false,
        birthday: birthdayToApi(info.birthday),
        document_type: info.document_type || "паспорт",
        document_data: documentData,
      },
      seat_number: Number(seat.seat_number) || 0,
      is_child: seat.is_child === true,
      include_children_seat: seat.include_children_seat === true,
    };
  };
  const paymentMethod = data.user?.payment_method === "cash" ? "cash" : "online";
  const payload = {
    user: { ...data.user, payment_method: paymentMethod },
    departure: {
      route_direction_id: data.departure.route_direction_id,
      seats: (data.departure.seats || []).map(mapSeat),
      ...(fpkOptions?.length && { optional_services: fpkOptions }),
    },
  };
  if (data.arrival?.seats?.length) {
    payload.arrival = {
      route_direction_id: data.arrival.route_direction_id,
      seats: data.arrival.seats.map(mapSeat),
    };
  }
  return payload;
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
    const orderData = prepareOrderPayload(order);
    dispatch(sendOrderRequested(orderData));
  };

  const handleChangeTrain = () => {
    navigate(`/routes${lastRoutesSearch || ""}`);
  };

  const handleChangePassengers = () => navigate("/passengers");
  const handleChangePayment = () => navigate("/payment");

  useEffect(() => {
    if (order.success) {
      navigate("/order-success", { replace: true });
    }
  }, [order.success, navigate]);

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
