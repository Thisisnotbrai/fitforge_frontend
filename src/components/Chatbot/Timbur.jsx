import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Timbur.css';
import { processMessage } from '../../services/chatbotService';
import ChatHistory from '../ChatHistory';

// Import Timburr image
const timburImage = "https://img.pokemondb.net/sprites/black-white/anim/normal/timburr.gif";

const Timbur = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add initial welcome message if no history exists
      const welcomeMessage = {
        type: 'bot',
        text: "Hi! I'm Timbur, your fitness assistant. How can I help you today?",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      localStorage.setItem('chatHistory', JSON.stringify([welcomeMessage]));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await processMessage(userMessage.text);
      const botMessage = {
        type: 'bot',
        text: response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        type: 'bot',
        text: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const clearHistory = () => {
    const welcomeMessage = {
      type: 'bot',
      text: "Chat history cleared. How can I help you today?",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    localStorage.setItem('chatHistory', JSON.stringify([welcomeMessage]));
    setShowHistory(false);
  };

  return (
    <div className="timbur-container">
      <div className="timbur-header">
        <div className="header-left">
          <div className="avatar">
            <img src={timburImage} alt="Timburr" className="avatar-image" />
          </div>
          <div className="header-text">
            <h2>Timburr</h2>
            <p className="status">Online</p>
          </div>
        </div>
        <div className="header-right">
          <button 
            className="history-toggle-button" 
            onClick={toggleHistory}
            aria-label="Toggle history"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button 
            className="clear-history-button"
            onClick={clearHistory}
            aria-label="Clear history"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 6h-4V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1H5" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 6v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button 
            className="timbur-close-button" 
            onClick={onClose}
            aria-label="Close chat"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="timbur-content">
        {showHistory && <ChatHistory />}
        
        <div className="timbur-messages">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message-wrapper ${message.type}-wrapper`}
            >
              {message.type === 'bot' && (
                <div className="message-icon">
                  <img src={timburImage} alt="Timburr" className="message-avatar" />
                </div>
              )}
              <div className="message-content">
                <div className={`message ${message.type}`}>
                  <p>{message.text}</p>
                </div>
                <span className="message-time">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper bot-wrapper">
              <div className="message-icon">
                <img src={timburImage} alt="Timburr" className="message-avatar" />
              </div>
              <div className="message typing">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="timbur-input-area">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="timbur-input"
        />
        <button 
          type="submit" 
          className="timbur-send-button"
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
};

Timbur.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default Timbur; 