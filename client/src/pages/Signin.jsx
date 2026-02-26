import { useEffect } from "react";
import "../assets/style.css";

function Signin() {

  useEffect(() => {
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");
    const mobileRegisterBtn = document.getElementById("mobileRegisterBtn");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");
    const authWrapper = document.getElementById("authWrapper");

    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        authWrapper.classList.add("panel-active");
      });
    }

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        authWrapper.classList.remove("panel-active");
      });
    }

    if (mobileRegisterBtn) {
      mobileRegisterBtn.addEventListener("click", () => {
        authWrapper.classList.add("panel-active");
      });
    }

    if (mobileLoginBtn) {
      mobileLoginBtn.addEventListener("click", () => {
        authWrapper.classList.remove("panel-active");
      });
    }
  }, []);

  return (
    <div className="auth-wrapper" id="authWrapper">
      
      {/* REGISTER */}
      <div className="auth-form-box register-form-box">
        <form onSubmit={(e) => e.preventDefault()}>
          <h1>Create Account</h1>

          <div className="social-links">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-google"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
          </div>

          <span>or use your email for registration</span>
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email Address" required />
          <input type="password" placeholder="Password" required />

          <button type="submit">Sign Up</button>

          <div className="mobile-switch">
            <p>Already have an account?</p>
            <button type="button" id="mobileLoginBtn">Sign In</button>
          </div>
        </form>
      </div>

      {/* LOGIN */}
      <div className="auth-form-box login-form-box">
        <form onSubmit={(e) => e.preventDefault()}>
          <h1>Sign In</h1>

          <div className="social-links">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-google"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
          </div>

          <span>or use your account</span>
          <input type="email" placeholder="Email Address" required />
          <input type="password" placeholder="Password" required />

          <a href="#">Forgot your password?</a>
          <button type="submit">Sign In</button>

          <div className="mobile-switch">
            <p>Don't have an account?</p>
            <button type="button" id="mobileRegisterBtn">Sign Up</button>
          </div>
        </form>
      </div>

      {/* SIDE PANEL */}
      <div className="slide-panel-wrapper">
        <div className="slide-panel">

          <div className="panel-content panel-content-left">
            <h1>Welcome Back!</h1>
            <p>Stay connected by logging in with your credentials</p>
            <button className="transparent-btn" id="loginBtn">Sign In</button>
          </div>

          <div className="panel-content panel-content-right">
            <h1>Hey There!</h1>
            <p>Begin your journey by creating an account today</p>
            <button className="transparent-btn" id="registerBtn">Sign Up</button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Signin;