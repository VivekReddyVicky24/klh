import { useState } from "react";
import axios from "axios";
//import 
import "../css/Signin.css";

function Signin() {
  const [isActive, setIsActive] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/register",
        registerData
      );

      alert("Registered Successfully!");
      setIsActive(false);

    } catch (error) {
      alert(error.response?.data?.error || "Registration failed");
    }
  };

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        loginData
      );

      // Save JWT
      localStorage.setItem("token", res.data.token);

      alert("Login Successful!");
      console.log("Token:", res.data.token);

      // Example redirect
      // navigate("/dashboard");

    } catch (error) {
      alert(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className={`auth-wrapper ${isActive ? "panel-active" : ""}`}>

      {/* REGISTER */}
      <div className="auth-form-box register-form-box">
        <form onSubmit={handleRegister}>
          <h1>Create Account</h1>

          <input
            type="text"
            placeholder="Full Name"
            required
            onChange={(e) =>
              setRegisterData({ ...registerData, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
          />

          <button type="submit">Sign Up</button>

          <div className="mobile-switch">
            <p>Already have an account?</p>
            <button type="button" onClick={() => setIsActive(false)}>
              Sign In
            </button>
          </div>
        </form>
      </div>

      {/* LOGIN */}
      <div className="auth-form-box login-form-box">
        <form onSubmit={handleLogin}>
          <h1>Sign In</h1>

          <input
            type="email"
            placeholder="Email Address"
            required
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />

          <button type="submit">Sign In</button>

          <div className="mobile-switch">
            <p>Don't have an account?</p>
            <button type="button" onClick={() => setIsActive(true)}>
              Sign Up
            </button>
          </div>
        </form>
      </div>

      {/* SIDE PANEL */}
      <div className="slide-panel-wrapper">
        <div className="slide-panel">

          <div className="panel-content panel-content-left">
            <h1>Welcome Back!</h1>
            <button
              className="transparent-btn"
              onClick={() => setIsActive(false)}
            >
              Sign In
            </button>
          </div>

          <div className="panel-content panel-content-right">
            <h1>Hey There!</h1>
            <button
              className="transparent-btn"
              onClick={() => setIsActive(true)}
            >
              Sign Up
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Signin;