import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      
      // Redirect based on user role
      if (res.data.user.role === 'PARTICIPANT') {
        navigate('/participant-home');
      } else if (res.data.user.role === 'STUDENT') {
        navigate('/dashboard');
      } else {
        navigate('/events');
      }
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.message || "Invalid credentials"));
    }
  };

  return (
    <div>
      <Header showNavigation={false} showLoginButton={false} showBackButton={true} backTo="/" />
      <div className="login-container-split">
      <div className="login-left">
        <div className="logo-section">
          <img src="/acalogo.png" alt="AcaConnect Logo" className="login-logo" />
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-container fade-in">
          <div className="login-form-header">
            <h2 className="login-form-title">Welcome Back</h2>
            <p className="login-form-subtitle">Login into your account</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                className="form-input"
                placeholder="Enter your email" 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                className="form-input"
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <p style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <a href="/forgot-password" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontSize: '14px' }}>Forgot Password?</a>
            </p>
            <button 
              type="submit"
              className="btn-login-split"
            >
              Login →
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
              New participant? <a href="/participant-signup" style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>Sign Up</a>
            </p>
          </form>
        </div>
      </div>
      </div>
      <Footer showLogos={true} />
    </div>
  );
}
