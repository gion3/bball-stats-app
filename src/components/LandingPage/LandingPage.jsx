import React from "react";
import hoopLogo from "../../assets/logo_with_ball.png";
import playerImg from "../../assets/Untitled.png";
import icon1 from "../../assets/icon1.png";
import icon2 from "../../assets/icon2.svg";
import icon3 from "../../assets/icon3.png"; // Placeholder, replace as needed
import "./LandingPage.css";

const LandingPage = ({ onSignUp }) => (
  <div className="hooppanel-landing-bg">
    <header className="hooppanel-landing-header">
      <img src={hoopLogo} alt="HoopPanel Logo" className="hooppanel-landing-logo" />
    </header>
    <section className="hooppanel-landing-hero">
      <div className="hooppanel-landing-hero-text">
        <h1>Data, Stats, Fantasy - All in one place.</h1>
        <h2>Analyze data, select your team and compete against your friends! HoopPanel is the place to be for basketball enthusiasts.</h2>
        <button className="hooppanel-landing-btn" onClick={onSignUp}>Create an account</button>
      </div>
      <div className="hooppanel-landing-hero-img">
        <img src={playerImg} alt="Basketball Player" />
      </div>
    </section>
    <section className="hooppanel-landing-sellingpoints">
      <div className="hooppanel-landing-sellingpoint">
        <div className="hooppanel-landing-icon"><img src={icon1}></img></div>
        <h3>Elite Stats</h3>
        <p>Access advanced statistics and analytics to power your fantasy decisions.</p>
      </div>
      <div className="hooppanel-landing-sellingpoint">
        <div className="hooppanel-landing-icon"><img src={icon2}></img></div>
        <h3>AI Insights</h3>
        <p>Get personalized, AI-driven recommendations and projections for your team.</p>
      </div>
      <div className="hooppanel-landing-sellingpoint">
        <div className="hooppanel-landing-icon"><img src={icon3}></img></div>
        <h3>League Mastery</h3>
        <p>Manage, compete, and win in fantasy leagues with friends or against the world.</p>
      </div>
    </section>
  </div>
);

export default LandingPage;
