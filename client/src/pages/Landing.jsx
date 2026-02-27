import { useNavigate } from "react-router-dom";
import "../css/Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <h2 className="logo">KLH Project</h2>
        <div>
          <button className="nav-btn" onClick={() => navigate("/auth")}>
            Login
          </button>
        </div>
      </nav>

      <div className="landing-hero">
        <div className="hero-left">
          <h1>
            Smart & Secure <br /> Authentication System
          </h1>
          <p>
            Build scalable applications with secure login, 
            TiDB SQL integration and modern React frontend.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card">
            <h3>Why Choose This?</h3>
            <ul>
              <li>✔ Secure JWT Authentication</li>
              <li>✔ TiDB SQL Database</li>
              <li>✔ Modern React UI</li>
              <li>✔ Hackathon Ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;