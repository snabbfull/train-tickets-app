import { useLocation, useNavigate } from "react-router-dom";

const TrainsHeader = ({ total }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const changeSort = (value) => {
    const params = new URLSearchParams(location.search);
    params.set("sort", value);
    params.set("page", 1);
    navigate(`?${params.toString()}`);
  };

  return (
    <div className="trains-header">
      <div>Найдено: {total}</div>

      <select onChange={(e) => changeSort(e.target.value)}>
        <option value="date">По времени</option>
        <option value="price">По цене</option>
        <option value="duration">По длительности</option>
      </select>
    </div>
  );
};

export default TrainsHeader;