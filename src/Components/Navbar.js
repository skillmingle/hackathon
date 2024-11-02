import React,{useState,useEffect} from "react";
import "../css/Navbar.css"; // Import the CSS file for styling
import leftIcon from "../images/h2h logo.jpg"; // Replace with your left icon image path
import rightIcon from "../images/Skillmingle logo.jpg"; // Replace with your right icon image path
import smIcon from '../images/sm fav.jpg'
const Navbar = ({ teamName, activeKey }) => {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div className="navbar">
      {!isMobile? <img src={leftIcon} alt="Left Icon" className="navbar-icon left-icon" />:<img src={smIcon} alt="Left Icon" className="navbar-icon left-icon" />}
      <h1 className="navbar-title">{!isMobile && <span style={{color:'#3e98c7'}}>{teamName} { " | " }</span>} <span style={{color:'green'}}>{activeKey}</span></h1>
      {!isMobile && <img src={rightIcon} alt="Right Icon" className="navbar-icon right-icon" />}
    </div>
  );
};

export default Navbar;
