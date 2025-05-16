import image from "../../assets/image.png";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.jpg";
import "./Features.css";

const Features = () => {
  return (
    <section id="features" className="about-section">
      <div className="about-content">
        <div className="text-container">
          <div className="about-text">
            <h2>About Us</h2>
            <p>
              As passionate designers and developers, we love building products
              that are easy, usable, neat, and appealing. We explore, design,
              and code for your business success. Unikorns means people who
              care about quality and professional relationships.
            </p>
          </div>
          <div className="about-text">
            <h2>Our Mission</h2>
            <p>
              Just like all people, companies have their personalities. Our
              mission is to help businesses and people express their true
              uniqueness. We want to work with you side by side to give the best
              experience and precious emotions you will remember.
              <strong> &quot;Every detail matters&quot; </strong> is our motto.
            </p>
          </div>
        </div>

        <div className="image-grid">
          <img src={image} alt="Professional" className="about-image" />
          <img src={image1} alt="Team collaboration" className="about-image" />
          <img
            src={image2}
            alt="Working in an office"
            className="about-image"
          />
          <img
            src={image3}
            alt="Professional team member"
            className="about-image"
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
