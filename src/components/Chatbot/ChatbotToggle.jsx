import PropTypes from 'prop-types';
import './ChatbotToggle.css';

// Import Timburr image
const timburImage = "https://img.pokemondb.net/sprites/black-white/anim/normal/timburr.gif";

const ChatbotToggle = ({ isOpen, toggleChat }) => {
  return (
    <button 
      className={`chatbot-toggle ${isOpen ? 'open' : ''}`} 
      onClick={toggleChat}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
        </svg>
      ) : (
        <img src={timburImage} alt="Timburr" className="toggle-image" />
      )}
    </button>
  );
};

ChatbotToggle.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleChat: PropTypes.func.isRequired
};

export default ChatbotToggle; 