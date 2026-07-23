import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try participant route first
      let response;
      try {
        response = await axios.post("/participant-auth/forgot-password", { email });
      } catch (err) {
        // If participant not found, try staff route
        response = await axios.post("/auth/forgot-password", { email });
      }
      
      alert(response.data.message);
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // Try participant route first
      let response;
      try {
        response = await axios.post("/participant-auth/reset-password", { 
          email, 
          otp, 
          newPassword 
        });
      } catch (err) {
        // If participant not found, try staff route
        response = await axios.post("/auth/reset-password", { 
          email, 
          otp, 
          newPassword 
        });
      }

      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header showNavigation={false} showLoginButton={false} showBackButton={true} backTo="/login" />
      <div className="login-container-split">
        <div className="login-left">
          <div className="logo-section">
            <img src="/acalogo.png" alt="AcaConnect Logo" className="login-logo" />
          </div>
        </div>
        <div className="login-right">
          <div className="login-form-container fade-in">
            <div className="login-form-header">
              <h2 className="login-form-title">Forgot Password</h2>
              <p className="login-form-subtitle">
                {step === 1 ? "Enter your email to receive OTP" : "Enter OTP and new password"}
              </p>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSendOTP}>
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
                <button 
                  type="submit"
                  className="btn-login-split"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">OTP</label>
                  <input 
                    className="form-input"
                    placeholder="Enter 6-digit OTP" 
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input 
                    className="form-input"
                    type="password" 
                    placeholder="Enter new password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input 
                    className="form-input"
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="btn-login-split"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password →"}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
              Remember your password? <a href="/login" style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>Login</a>
            </p>
          </div>
        </div>
      </div>
      <Footer showLogos={true} />
    </div>
  );
}
