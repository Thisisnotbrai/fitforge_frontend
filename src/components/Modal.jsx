import PropTypes from "prop-types"; // Import prop-types
import "./Modal.css";

const Modal = ({ isOpen, onClose, children, size = "default" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

// Add prop-type validation
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // isOpen must be a boolean and is required
  onClose: PropTypes.func.isRequired, // onClose must be a function and is required
  children: PropTypes.node.isRequired, // children must be a React node and is required
  size: PropTypes.oneOf(["small", "default", "large", "auth"]), // size can be one of these values
};

export default Modal;
