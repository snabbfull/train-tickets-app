import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { trainSeatsRequested } from "../../../store/actions";
import { setSelectedSeats } from "../../../store/order/orderSlice";
import "./SeatsSection.css";

const SeatsSection = ({ routeId, fetchedRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = useSelector((state) => state.trainSeats);
  const [selectedCarriage, setSelectedCarriage] = useState(0);
  const [selectedSeatsLocal, setSelectedSeatsLocal] = useState(new Set());

  // Fetch seats data
  useEffect(() => {
    if (!routeId) return;
    if (fetchedRef.current.has(routeId)) return;

    fetchedRef.current.add(routeId);

    dispatch(trainSeatsRequested(routeId));
  }, [routeId, dispatch, fetchedRef]);

  const handleSeatClick = (seatNumber) => {
    const seat = currentCarriage?.seats?.[seatNumber];

    // Can't select occupied or unavailable seats
    if (!seat || seat.is_available === false) {
      return;
    }

    const newSelected = new Set(selectedSeatsLocal);
    if (newSelected.has(seatNumber)) {
      newSelected.delete(seatNumber);
    } else {
      newSelected.add(seatNumber);
    }
    setSelectedSeatsLocal(newSelected);
  };

  const handleConfirmSeats = () => {
    if (selectedSeatsLocal.size === 0) return;

    // Save selected seats and route ID to order state
    dispatch(
      setSelectedSeats({
        seatNumbers: Array.from(selectedSeatsLocal),
        routeId: routeId,
      }),
    );

    // Navigate to next step (passengers page)
    navigate("/passengers");
  };

  const currentCarriage = data?.[selectedCarriage];
  const carriageType = currentCarriage?.name || "Сидячий";
  const seats = currentCarriage?.seats || {};
  const seatNumbers = Object.keys(seats).sort(
    (a, b) => parseInt(a) - parseInt(b),
  );

  // Calculate seats info
  const availableSeats = seatNumbers.filter(
    (num) => seats[num]?.is_available !== false,
  ).length;
  const selectedCount = selectedSeatsLocal.size;

  return (
    <div className="seats-section">
      <div className="seats-header">
        <h2>Выбор мест</h2>
        <div className="carriage-selector">
          <label>Выбрать вагон:</label>
          <select
            value={selectedCarriage}
            onChange={(e) => {
              setSelectedCarriage(parseInt(e.target.value));
              setSelectedSeatsLocal(new Set());
            }}
            className="carriage-select"
          >
            {data?.map((carriage, index) => (
              <option key={index} value={index}>
                Вагон {index + 1} - {carriage.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="seats-info-block">
        <div className="carriage-types">
          <div className="type-label">
            Тип вагона: <span>{carriageType}</span>
          </div>
        </div>

        <div className="seats-stats">
          <div className="stat-item">
            <span className="stat-label">Свободно мест:</span>
            <span className="stat-value">{availableSeats}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Выбрано мест:</span>
            <span className="stat-value">{selectedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Стоимость:</span>
            <span className="stat-value">
              {currentCarriage?.price
                ? `${currentCarriage.price * selectedCount} ₽`
                : "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="seats-legend">
        <div className="legend-item">
          <div className="seat-preview available"></div>
          <span>Свободное место</span>
        </div>
        <div className="legend-item">
          <div className="seat-preview occupied"></div>
          <span>Занятое место</span>
        </div>
        <div className="legend-item">
          <div className="seat-preview selected"></div>
          <span>Выбранное место</span>
        </div>
      </div>

      <div className="seats-plan">
        <div className="seats-container">
          {seatNumbers.map((seatNum) => {
            const seat = seats[seatNum];
            const isAvailable = seat?.is_available !== false;
            const isSelected = selectedSeatsLocal.has(seatNum);

            return (
              <button
                key={seatNum}
                className={`seat ${!isAvailable ? "occupied" : ""} ${isSelected ? "selected" : ""}`}
                onClick={() => handleSeatClick(seatNum)}
                disabled={!isAvailable}
                title={`Место ${seatNum}`}
              >
                {seatNum}
              </button>
            );
          })}
        </div>
      </div>

      <div className="seats-actions">
        <button
          className="btn-confirm"
          disabled={selectedCount === 0}
          onClick={handleConfirmSeats}
        >
          Выбрать места ({selectedCount})
        </button>
      </div>
    </div>
  );
};

export default SeatsSection;
