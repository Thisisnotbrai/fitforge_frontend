import  { useState } from "react";
import "./FAQ.css";

const FAQ = () => {
    
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is FitForge?",
      answer:
        "FitForge is a platform designed to help you achieve your fitness goals through personalized workout plans, nutrition guidance, and community support.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply sign up for an account, complete your profile, and start exploring our workout plans and features.",
    },
    {
      question: "Is FitForge free to use?",
      answer:
        "Yes, FitForge offers a free tier with basic features. We also have premium plans for advanced features.",
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "Yes, you can cancel your subscription at any time. Your access will continue until the end of the billing period.",
    },
    {
      question: "How do I contact support?",
      answer:
        "You can contact our support team through the 'Contact Us' page or by emailing support@fitforge.com.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div id="FAQ" className="FAQ">
    <section className="faq">
      <div className="faq-content">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${activeIndex === index ? "active" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <span className="faq-icon">
                  {activeIndex === index ? "−" : "+"}
                </span>
              </div>
              {activeIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
};

export default FAQ;