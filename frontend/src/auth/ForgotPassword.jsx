import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

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
      let response;
      try {
        response = await axios.post("/participant-auth/forgot-password", { email });
      } catch (err) {
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
      let response;
      try {
        response = await axios.post("/participant-auth/reset-password", { email, otp, newPassword });
      } catch (err) {
        response = await axios.post("/auth/reset-password", { email, otp, newPassword });
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
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>{step === 1 ? "Enter your email to receive a verification code" : "Enter the code and choose a new password"}</p>
        </div>

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-input" placeholder="you@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Verification Code</label>
              <input className="form-input" placeholder="6-digit code" type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input className="form-input" type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
