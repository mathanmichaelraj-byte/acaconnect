import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ParticipantLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/participant-auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate('/participant-home');
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
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
              <h2 className="login-form-title">Participant Login</h2>
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
              <button 
                type="submit"
                className="btn-login-split"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login →"}
              </button>
              <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                Don't have an account? <a href="/participant-signup" style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>Sign Up</a>
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer showLogos={true} />
    </div>
  );
}
