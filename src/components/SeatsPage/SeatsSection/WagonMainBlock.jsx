import { getCoachId, getWagonDisplayNumber } from "./seatsSectionUtils";
import CarriageDetailRow from "./CarriageDetailRow";

export default function WagonMainBlock({
  filteredCarriages,
  selectedCoachIds,
  onCoachToggle,
  selectedSeatsByCoach,
  fpkSelectedByCoach,
  onSeatClick,
  onFpkToggle,
}) {
  return (
    <div className="seats-wagon-main">
      <div className="seats-wagon-bar">
        Нумерация вагонов начинается с головы поезда
      </div>
      <div className="seats-wagon-selector-row">
        <span className="seats-wagon-label">Вагоны</span>
        <div className="seats-wagon-numbers">
          {filteredCarriages.map((carriage, idx) => {
            const wagonLabel = getWagonDisplayNumber(carriage, idx);
            const coachId = getCoachId(carriage, idx);
            const isActive = selectedCoachIds.includes(coachId);
            return (
              <button
                key={coachId}
                type="button"
                className={`seats-wagon-num ${isActive ? "active" : ""}`}
                onClick={() => onCoachToggle(coachId)}
              >
                {wagonLabel}
              </button>
            );
          })}
        </div>
      </div>
      {filteredCarriages
        .filter((carriage, carriageIdx) =>
          selectedCoachIds.includes(getCoachId(carriage, carriageIdx)),
        )
        .map((carriage, carriageIdx) => {
          const coachId = getCoachId(carriage, carriageIdx);
          const wagonLabel = getWagonDisplayNumber(carriage, carriageIdx);
          return (
            <CarriageDetailRow
              key={coachId}
              carriage={carriage}
              carriageIdx={carriageIdx}
              coachId={coachId}
              wagonLabel={wagonLabel}
              selectedSeatsByCoach={selectedSeatsByCoach}
              fpkSelectedByCoach={fpkSelectedByCoach}
              onSeatClick={onSeatClick}
              onFpkToggle={onFpkToggle}
            />
          );
        })}
    </div>
  );
}
