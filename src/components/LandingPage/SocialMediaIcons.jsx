import './SocialMediaIcons.css';

const SocialMediaIcons = () => {
  return (
    <ul className="social-media-icons">
      <li>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <i className="icon fab fa-facebook-f"></i>
        </a>
      </li>
      <li>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <i className="icon fab fa-twitter"></i>
        </a>
      </li>
      <li>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <i className="icon fab fa-linkedin-in"></i>
        </a>
      </li>
      <li>
        <a href="https://google.com" target="_blank" rel="noopener noreferrer">
          <i className="icon fab fa-google"></i>
        </a>
      </li>
    </ul>
  );
};

export default SocialMediaIcons;