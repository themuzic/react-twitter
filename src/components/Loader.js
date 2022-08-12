import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";

const Loader = () => {
  return (
    <div id="loader_back">
      <div id="loader_img">
        <FontAwesomeIcon icon={faTwitter} color={"#04AAFF"} size="5x" />
      </div>
    </div>
  );
};

export default Loader;
