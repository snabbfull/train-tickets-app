export default function WagonTypeBlock({ types, activeTypeId, onSelect }) {
  return (
    <div className="seats-wagon-type-block">
      <h3 className="seats-block-title">Тип вагона</h3>
      <div className="seats-wagon-type-icons">
        {types.map((type) => {
          const isActive = activeTypeId === type.id;
          return (
            <button
              key={type.id}
              type="button"
              className={`seats-wagon-type-btn ${isActive ? "active" : ""}`}
              onClick={() => onSelect(type.id)}
            >
              <span className="seats-wagon-type-icon">
                <img src={type.icon} alt={type.name} />
              </span>
              <span className="seats-wagon-type-name">{type.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
