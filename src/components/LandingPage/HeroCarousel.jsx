import { useState, useEffect, useCallback } from 'react';
import slide1 from '../../assets/slide1.jpg'; // Import image 1
import slide2 from '../../assets/slide2.jpg'; // Import image 2
import slide3 from '../../assets/slide3.jpg'; // Import image 3
import slide4 from '../../assets/slide4.jpg'; // Import image 4
import './HeroCarousel.css';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: slide1,
      title: "Experience",
      subtitle: "Elevated Living",
      description:
        "Experience state-of-the-art equipment, expert coaching, and a supportive community designed to push your limits and redefine your fitness journey.",
      buttonText: "Learn more",
    },
    {
      image: slide2,
      title: "Discover",
      subtitle: "Refined Spaces",
      description:
        "Discover a gym where passion meets performance—equipped with elite gear, expert-led classes, and a community that pushes you to be your best.",
      buttonText: "Explore Now",
    },
    {
      image: slide3,
      title: "Unleash Your Potential",
      subtitle: "Elevated Living",
      description:
        "Push your limits with expert coaching and top-tier equipment. Join a community that's passionate, determined, and supportive—just like you.",
      buttonText: "Learn more",
    },
    {
      image: slide4,
      title: "Elevate Your Lifestyle",
      subtitle: "Elevated Living",
      description:
        "Eat smarter with personalized diet and high-energy classes. Get the support you need to reach your goals and become your best self.",
      buttonText: "Learn more",
    },
    // Add more slides as needed
  ];

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  }, [slides.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(goToNextSlide, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [goToNextSlide]); // Include goToNextSlide in dependencies

  return (
    <div className="carousel">
      <div
        className="carousel-inner"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="carousel-item">
            <img src={slide.image} alt={`slide ${index + 1}`} className="carousel-image" />
            <div className="carousel-caption">
              <h5>{slide.title}</h5>
              <p>{slide.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-control prev" onClick={goToPrevSlide}>
        &#10094;
      </button>
      <button className="carousel-control next" onClick={goToNextSlide}>
        &#10095;
      </button>
    </div>
  );
};

export default HeroCarousel;