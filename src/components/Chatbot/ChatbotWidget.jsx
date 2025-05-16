import React, { useState } from 'react';
import Timbur from './Timbur';
import ChatbotToggle from './ChatbotToggle';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <div className="chatbot-widget">
      {isOpen && <Timbur onClose={closeChat} />}
      {!isOpen && <ChatbotToggle isOpen={isOpen} toggleChat={toggleChat} />}
    </div>
  );
};

export default ChatbotWidget; 