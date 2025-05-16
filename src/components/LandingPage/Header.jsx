import "./Header.css";
import logo from "../../assets/FitForge Logo.jpg"; // Importing the logo
import Modal from "../Modal";
import { useState, useEffect } from "react";
import Signin from "../Signin/Signin";
import Signup from "../Signup/Signup";

const Header = () => {
  const [isSigninOpen, setIsSigninOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openSigninModal = () => setIsSigninOpen(true);
  const closeSigninModal = () => setIsSigninOpen(false);

  const openSignupModal = () => setIsSignupOpen(true);
  const closeSignupModal = () => setIsSignupOpen(false);

  // Handle scroll event to update header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Improved smooth scroll to section when clicking nav links
  const scrollToSection = (e, targetId) => {
    e.preventDefault();

    // Only apply smooth scroll if there's a valid target
    if (targetId === "#") return;

    // Wait briefly to ensure all components are properly rendered
    setTimeout(() => {
      const targetElement = document.getElementById(targetId.substring(1));

      if (targetElement) {
        // Calculate header height dynamically
        const headerHeight =
          document.querySelector(".land-header").offsetHeight;

        window.scrollTo({
          top: targetElement.offsetTop - headerHeight - 20, // Additional 20px padding
          behavior: "smooth",
        });
      } else {
        console.log(`Target element ${targetId} not found`);
      }
    }, 100);
  };

  return (
    <header className={`land-header ${scrolled ? "scrolled" : ""}`}>
      <div className="land-logo">
        <img src={logo} alt="FitForge Logo" className="logo-icon" />
        <span>
          <span className="fit">Fit</span>
          <span className="forge">Forge</span>
        </span>
      </div>

      <nav className="land-nav">
        <a href="#" onClick={(e) => scrollToSection(e, "#")}>
          Products
        </a>
        <a href="#about" onClick={(e) => scrollToSection(e, "#about")}>
          Get Started
        </a>
        <a href="#FAQ" onClick={(e) => scrollToSection(e, "#FAQ")}>
          FAQs
        </a>
        <a href="#features" onClick={(e) => scrollToSection(e, "#features")}>
          Our Team
        </a>
        <a
          href="#contact-us"
          onClick={(e) => scrollToSection(e, "#contact-us")}
        >
          Contact Us
        </a>
      </nav>
      <div className="auth-buttons">
        <button className="sign-in" onClick={openSigninModal}>
          Sign In
        </button>
        <button className="sign-up" onClick={openSignupModal}>
          Sign Up
        </button>

        <Modal isOpen={isSigninOpen} onClose={closeSigninModal} size="auth">
          <Signin />
        </Modal>

        {/* Signup Modal */}
        <Modal isOpen={isSignupOpen} onClose={closeSignupModal} size="auth">
          <Signup />
        </Modal>
      </div>
    </header>
  );
};

export default Header;
