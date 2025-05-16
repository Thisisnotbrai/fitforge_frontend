import React, { useEffect, useState } from 'react';
import './ChatHistory.css';

const ChatHistory = () => {
  const [chatSections, setChatSections] = useState([]);

  useEffect(() => {
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const allMessages = JSON.parse(localStorage.getItem('chatHistory')) || [];
    
    // Filter messages for current user
    const userMessages = allMessages.filter(msg => msg.userId === user?.id);
    
    // Get date boundaries
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Initialize chat sections
    const todayChats = new Set();
    const yesterdayChats = new Set();
    const last7DaysChats = new Set();
    const last30DaysChats = new Set();

    // Group messages into conversations by date
    let currentDate = null;
    let currentConversation = [];

    // Sort messages by date, newest first
    const sortedMessages = [...userMessages].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    sortedMessages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      const messageDay = messageDate.toDateString();

      if (messageDay !== currentDate) {
        if (currentConversation.length > 0) {
          const conversationTitle = `Chat from ${new Date(currentDate).toLocaleDateString()}`;
          const messageDateTime = new Date(currentDate);
          
          // Categorize the conversation based on its date
          if (messageDateTime >= today) {
            todayChats.add(conversationTitle);
          } else if (messageDateTime >= yesterday) {
            yesterdayChats.add(conversationTitle);
          } else if (messageDateTime >= sevenDaysAgo) {
            last7DaysChats.add(conversationTitle);
          } else if (messageDateTime >= thirtyDaysAgo) {
            last30DaysChats.add(conversationTitle);
          }
        }
        currentDate = messageDay;
        currentConversation = [message];
      } else {
        currentConversation.push(message);
      }
    });

    // Add the last conversation if exists
    if (currentConversation.length > 0 && currentDate) {
      const conversationTitle = `Chat from ${new Date(currentDate).toLocaleDateString()}`;
      const messageDateTime = new Date(currentDate);
      
      if (messageDateTime >= today) {
        todayChats.add(conversationTitle);
      } else if (messageDateTime >= yesterday) {
        yesterdayChats.add(conversationTitle);
      } else if (messageDateTime >= sevenDaysAgo) {
        last7DaysChats.add(conversationTitle);
      } else if (messageDateTime >= thirtyDaysAgo) {
        last30DaysChats.add(conversationTitle);
      }
    }

    // Create sections array with non-empty sections only
    const sections = [];
    
    if (todayChats.size > 0) {
      sections.push({
        title: "Today",
        chats: Array.from(todayChats)
      });
    }
    
    if (yesterdayChats.size > 0) {
      sections.push({
        title: "Yesterday",
        chats: Array.from(yesterdayChats)
      });
    }
    
    if (last7DaysChats.size > 0) {
      sections.push({
        title: "Previous 7 Days",
        chats: Array.from(last7DaysChats)
      });
    }
    
    if (last30DaysChats.size > 0) {
      sections.push({
        title: "Previous 30 Days",
        chats: Array.from(last30DaysChats)
      });
    }

    setChatSections(sections);
  }, []);

  const handleChatClick = (chat) => {
    // TODO: Implement loading the specific chat when clicked
    console.log('Loading chat:', chat);
  };

  return (
    <div className="chat-history">
      {chatSections.length > 0 ? (
        chatSections.map((section, index) => (
          <div key={index} className="history-section">
            <h3 className="section-title">{section.title}</h3>
            <ul className="chat-list">
              {section.chats.map((chat, chatIndex) => (
                <li 
                  key={chatIndex} 
                  className="chat-item"
                  onClick={() => handleChatClick(chat)}
                >
                  {chat}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div className="history-section">
          <h3 className="section-title">Chat History</h3>
          <ul className="chat-list">
            <li className="chat-item no-history">No chat history</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;