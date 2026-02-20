import conderWagonIcon from "../../../assets/conder-wagon.png";
import wifiWagonIcon from "../../../assets/wifi-wagon.png";
import underwearWagonIcon from "../../../assets/underwear-wagon.png";
import foodWagonIcon from "../../../assets/food-wagon.png";

const FPK_OPTIONS = [
  { key: "conder", title: "Кондиционер", src: conderWagonIcon },
  { key: "wifi", title: "Wi-Fi", src: wifiWagonIcon },
  { key: "underwear", title: "Бельё", src: underwearWagonIcon },
  { key: "food", title: "Питание", src: foodWagonIcon },
];

export default function CarriageDetailRow({
  carriage,
  carriageIdx,
  coachId,
  wagonLabel,
  selectedSeatsByCoach,
  fpkSelectedByCoach,
  onSeatClick,
  onFpkToggle,
}) {
  const carriageCoach = carriage?.coach ?? carriage;
  const carriageSeats =
    Array.isArray(carriage?.seats)
      ? carriage.seats.reduce((acc, seat) => {
          acc[String(seat.index)] = { is_available: seat.available !== false };
          return acc;
        }, {})
      : carriage?.seats || {};
  const carriageSeatNumbers = Object.keys(carriageSeats).sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10),
  );
  const carriageUpperSeats = carriageSeatNumbers.filter((n) => parseInt(n, 10) % 2 === 0);
  const carriageLowerSeats = carriageSeatNumbers.filter((n) => parseInt(n, 10) % 2 === 1);
  const carriageTopPrice = carriageCoach?.top_price ?? carriageCoach?.price ?? 0;
  const carriageBottomPrice = carriageCoach?.bottom_price ?? carriageCoach?.price ?? 0;
  const carriageHasAirConditioning = !!carriageCoach?.have_air_conditioning;
  const carriageHasWifi = !!carriageCoach?.have_wifi;
  const carriageHasLinens =
    carriageCoach?.is_linens_included || (carriageCoach?.linens_price ?? 0) > 0;
  const carriageHasFood = !!carriageCoach?.have_express;
  const carriageSelectedSet = selectedSeatsByCoach[coachId] || new Set();

  const carriageSeatPairs = (() => {
    const sorted = [...carriageSeatNumbers].map(Number).sort((a, b) => a - b);
    const pairs = [];
    for (let i = 0; i < sorted.length; i += 2) {
      const lower = sorted[i];
      const upper = sorted[i + 1] ?? null;
      pairs.push({ lower: String(lower), upper: upper !== null ? String(upper) : null });
    }
    return pairs;
  })();
  const carriageHalf = Math.ceil(carriageSeatPairs.length / 2);
  const carriageTopRowPairs = carriageSeatPairs.slice(0, carriageHalf);
  const carriageBottomRowPairs = carriageSeatPairs.slice(carriageHalf);

  return (
    <div key={coachId || carriageIdx} className="seats-wagon-detail-row">
      <div className="seats-wagon-badge-large">
        <span className="seats-wagon-badge-num">{wagonLabel}</span>
        <span className="seats-wagon-badge-label">вагон</span>
      </div>
      <div className="seats-layout-left">
        <div className="seats-summary-card">
          <div className="seats-summary-main">
            <div className="seats-summary-column">
              <div className="seats-summary-title-row">
                <span className="seats-summary-title">Места</span>
                <span className="seats-total-value">{carriageSeatNumbers.length}</span>
              </div>
              <span className="seats-places-line">
                Верхние <span className="seats-count">{carriageUpperSeats.length}</span>
              </span>
              <span className="seats-places-line">
                Нижние <span className="seats-count">{carriageLowerSeats.length}</span>
              </span>
            </div>
            <div className="seats-summary-column seats-summary-column-cost">
              <span className="seats-summary-title">Стоимость</span>
              <div className="seats-cost-value-wrapper">
                <span className="seats-cost-value">
                  {carriageUpperSeats.length ? (
                    <>
                      {Math.round(carriageTopPrice).toLocaleString("ru-RU")}{" "}
                      <span className="seats-cost-currency" aria-hidden="true">₽</span>
                    </>
                  ) : (
                    "—"
                  )}
                </span>
                <span className="seats-cost-value">
                  {carriageLowerSeats.length ? (
                    <>
                      {Math.round(carriageBottomPrice).toLocaleString("ru-RU")}{" "}
                      <span className="seats-cost-currency" aria-hidden="true">₽</span>
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            </div>
            <div className="seats-summary-column seats-summary-right">
              <span className="seats-services-label">Обслуживание <span>ФПК</span></span>
              <div className="seats-services-icons">
                {FPK_OPTIONS.map(({ key, title, src }) => {
                  const included =
                    key === "conder"
                      ? carriageHasAirConditioning
                      : key === "wifi"
                        ? carriageHasWifi
                        : key === "underwear"
                          ? carriageHasLinens
                          : carriageHasFood;
                  const selected = !!(fpkSelectedByCoach[coachId] || {})[key];
                  const stateClass = included
                    ? "seats-service-btn--included"
                    : selected
                      ? "seats-service-btn--selected"
                      : "seats-service-btn--inactive";
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`seats-service-btn seats-service-btn--${key} ${stateClass}`}
                      onClick={() => !included && onFpkToggle(coachId, key)}
                      title={title}
                      aria-pressed={included ? undefined : selected}
                    >
                      <span className="seats-service-icon-inner">
                        <img src={src} alt="" className="seats-service-icon-img" aria-hidden />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="seats-legend">
          <div className="seats-legend-item">
            <div className="seats-legend-box available" />
            <span>Свободное</span>
          </div>
          <div className="seats-legend-item">
            <div className="seats-legend-box occupied" />
            <span>Занято</span>
          </div>
          <div className="seats-legend-item">
            <div className="seats-legend-box selected" />
            <span>Выбрано</span>
          </div>
        </div>
        <div className="carriage-scheme">
          <div className="carriage-scheme-header">
            <div className="carriage-number-badge">{wagonLabel}</div>
            <div className="carriage-end-icons carriage-end-left" />
            <div className="carriage-aisle-header" />
            <div className="carriage-end-icons carriage-end-right" />
          </div>
          <div className="carriage-rows">
            <div className="carriage-row carriage-row-top">
              {carriageTopRowPairs.map((pair, idx) => (
                <div key={idx} className="seat-block">
                  <button
                    type="button"
                    className={`seat-btn-inline ${
                      carriageSeats[pair.upper]?.is_available === false ? "occupied" : ""
                    } ${carriageSelectedSet.has(pair.upper) ? "selected" : ""}`}
                    disabled={carriageSeats[pair.upper]?.is_available === false}
                    onClick={() => onSeatClick(pair.upper, coachId)}
                    title={`Место ${pair.upper}`}
                  >
                    {pair.upper}
                  </button>
                  <button
                    type="button"
                    className={`seat-btn-inline ${
                      carriageSeats[pair.lower]?.is_available === false ? "occupied" : ""
                    } ${carriageSelectedSet.has(pair.lower) ? "selected" : ""}`}
                    disabled={carriageSeats[pair.lower]?.is_available === false}
                    onClick={() => onSeatClick(pair.lower, coachId)}
                    title={`Место ${pair.lower}`}
                  >
                    {pair.lower}
                  </button>
                </div>
              ))}
            </div>
            <div className="carriage-aisle-visual" />
            <div className="carriage-row carriage-row-bottom">
              {carriageBottomRowPairs.map((pair, idx) => (
                <div key={idx} className="seat-block">
                  <button
                    type="button"
                    className={`seat-btn-inline ${
                      carriageSeats[pair.upper]?.is_available === false ? "occupied" : ""
                    } ${carriageSelectedSet.has(pair.upper) ? "selected" : ""}`}
                    disabled={
                      pair.upper && carriageSeats[pair.upper]?.is_available === false
                    }
                    onClick={() => pair.upper && onSeatClick(pair.upper, coachId)}
                    title={pair.upper ? `Место ${pair.upper}` : ""}
                  >
                    {pair.upper ?? "—"}
                  </button>
                  <button
                    type="button"
                    className={`seat-btn-inline ${
                      carriageSeats[pair.lower]?.is_available === false ? "occupied" : ""
                    } ${carriageSelectedSet.has(pair.lower) ? "selected" : ""}`}
                    disabled={carriageSeats[pair.lower]?.is_available === false}
                    onClick={() => onSeatClick(pair.lower, coachId)}
                    title={`Место ${pair.lower}`}
                  >
                    {pair.lower}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
