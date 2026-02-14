const ReviewCard = ({ image, name, text }) => {
  return (
    <div className="review-card">
      <img className="review-card__img" src={image} alt={name} />
      <div className="review-card__text">
        <h4>{name}</h4>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
