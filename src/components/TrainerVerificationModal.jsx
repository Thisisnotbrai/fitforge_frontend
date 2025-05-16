import { useEffect, useState } from "react";
import Modal from "./Modal";
import "./TrainerVerificationModal.css";

const TrainerVerificationModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if we should display the modal
    const shouldShowModal = localStorage.getItem("showTrainerVerificationModal") === "true";
    
    if (shouldShowModal) {
      setIsModalOpen(true);
      // Remove the flag after displaying the modal
      localStorage.removeItem("showTrainerVerificationModal");
    }
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal} size="small">
      <div className="trainer-verification-modal">
        <div className="trainer-verification-content">
          <div className="trainer-verification-icon">✓</div>
          <h2>Email Verified Successfully!</h2>
          <p>
            Your trainer account has been created, but you need administrator approval
            before you can access your dashboard.
          </p>
          <p>
            Please wait while our administrators review your account. You&apos;ll be
            notified when your account is approved.
          </p>
          <button className="trainer-verification-button" onClick={closeModal}>
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TrainerVerificationModal; 