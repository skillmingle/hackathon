import React from "react";
import "../css/Navbar.css"; // Import the CSS file for styling
import leftIcon from "../images/h2h logo.jpg"; // Replace with your left icon image path
import rightIcon from "../images/Skillmingle logo.jpg"; // Replace with your right icon image path

const Navbar = ({ teamName, activeKey }) => {
  return (
    <div className="navbar">
      <img src={leftIcon} alt="Left Icon" className="navbar-icon left-icon" />
      <h1 className="navbar-title"><span style={{color:'#3e98c7'}}>{teamName}</span>{ " | " } <span style={{color:'green'}}>{activeKey}</span></h1>
      <img src={rightIcon} alt="Right Icon" className="navbar-icon right-icon" />
    </div>
  );
};

export default Navbar;
