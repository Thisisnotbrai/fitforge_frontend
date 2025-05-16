import SocialMediaIcons from './SocialMediaIcons';
import './Footer.css';

const Footer = () => {
  return (
    <div id="contact-us" className="contact-us">
    <footer className="footer">
      <div className="footer-content">
        <p>Contact us at: info@mybrand.com</p>
        <SocialMediaIcons /> {/* Add Social Media Icons */}
      </div>
    </footer>
    </div>
  );
};

export default Footer;