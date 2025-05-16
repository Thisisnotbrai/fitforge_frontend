import { Globe, Key, Moon, PenSquare, Lock, Tag, ThumbsUp, Bell } from "lucide-react";
import "./Services.css";

const Services = () => {
  const features = [
    {
      icon: <Globe size={24} className="feature-icon1" />,
      title: "Personalized Dashboard",
      description: "Access your workouts, progress, and nutrition plans all in one place.",
    },
    {
      icon: <Key size={24}  className="feature-icon1"/>,
      title: "Secure Login",
      description: "Seamlessly log in and manage your fitness profile with secure authentication.",
    },
    {
      icon: <Moon size={24} className="feature-icon1" />,
      title: "Dark & Light Mode",
      description: "Choose a theme that enhances your focus and training experience.",
    },
    {
      icon: <PenSquare size={24}  className="feature-icon1"/>,
      title: "Workout Planner",
      description: "Easily create and track your workouts for optimized performance.",
    },
    {
      icon: <Lock size={24}  className="feature-icon1"/>,
      title: "Exclusive Training Programs",
      description: "Unlock premium workout plans tailored to your fitness goals.",
    },
    {
      icon: <Tag size={24}  className="feature-icon1"/>,
      title: "Custom Workout Tags",
      description: "Organize exercises with tags to better track your progress.",
    },
    {
      icon: <ThumbsUp size={24}  className="feature-icon1"/>,
      title: "Community Engagement",
      description: "Share progress, upvote favorite routines, and connect with trainers.",
    },
    {
      icon: <Bell size={24} className="feature-icon1" />,
      title: "Real-Time Notifications",
      description: "Stay updated with workout reminders, goal achievements, and trainer messages.",
    },
  ];

  return (
    <section className="services">
      <div className="services-content">
        <h2>Powerful features to supercharge your product development</h2>
        <p className="subtitle">
          Some of our amazing features that will help you build a better product.
        </p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;