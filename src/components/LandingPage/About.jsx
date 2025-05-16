import React from "react";
import "./About.css";
import HeroCarousel from "./HeroCarousel";

const About = () => {
  return (
    <div id="about" className="about"> {/* Add the id="about" */}
      <HeroCarousel /> {/* Integrating the HeroCarousel component */}
      <div className="overlay">

        <div className="nav-controls">
        </div>
      </div>
    </div>
  );
};

export default About;
