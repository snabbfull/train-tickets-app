import trainSeatsImg from "../../../assets/train-seats.png";
import { formatTime, formatDuration } from "./seatsSectionUtils";

export default function RouteBlock({
  trainNumber,
  fromCity,
  toCity,
  fromStation,
  toStation,
  fromDatetime,
  toDatetime,
  duration,
  compact = false,
}) {
  return (
    <div className={`seats-route-block ${compact ? "seats-route-block-compact" : ""}`}>
      <div className="seats-route-col seats-route-col-train">
        <div className="seats-route-train-icon-wrap">
          <img src={trainSeatsImg} alt="" className="seats-route-train-img" />
        </div>
        <div className="seats-route-train-info">
          <div className="seats-route-train-info-wrapper">
            <div className="seats-route-train-number">{trainNumber}</div>
            <div className="seats-route-cities-main">
              <span className="seats-route-city">
                {fromCity} <span className="seats-route-city-arrow">→</span>
              </span>
              <span className="seats-route-city seats-route-city-to">{toCity}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="seats-route-col seats-route-col-depart">
        <div className="seats-route-time-main">{formatTime(fromDatetime)}</div>
        <div className="seats-route-station">{fromCity}, {fromStation}</div>
      </div>
      <div className="seats-route-col seats-route-col-arrow">
        <div className="seats-route-arrow-line">━━━━━━━━━━►</div>
      </div>
      <div className="seats-route-col seats-route-col-arrive">
        <div className="seats-route-time-main">{formatTime(toDatetime)}</div>
        <div className="seats-route-station">{toCity}, {toStation}</div>
      </div>
      <div className="seats-route-col seats-route-col-duration">
        <div className="seats-route-duration-icon">⏱</div>
        <div className="seats-route-duration-text">{formatDuration(duration)}</div>
      </div>
    </div>
  );
}
