import './Loader.css'
import loading from '../../assets/loading.gif'

const Loader = () => {
  return (
    <div className="loader">
        <span className="loader-text">ИДЕТ ПОИСК</span>
        <img src={loading} alt="Loading..." />
    </div>
  );
}

export default Loader;