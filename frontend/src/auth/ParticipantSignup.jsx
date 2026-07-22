import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

export default function ParticipantSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    mobile: "", college: "", department: "", year: ""
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/participant-auth/signup", {
        name: formData.name, email: formData.email, password: formData.password,
        mobile: formData.mobile, college: formData.college,
        department: formData.department, year: formData.year
      });
      if (res.data.success) {
        alert("OTP sent to your email!");
        setStep(2);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/participant-auth/verify-otp", {
        email: formData.email, otp
      });
      if (res.data.success) {
        alert("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/participant-auth/resend-otp", { email: formData.email });
      if (res.data.success) {
        alert("OTP resent to your email!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {step === 1 ? (
          <>
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Register for NIRAL 2026</p>
            </div>
            <form className="auth-form" onSubmit={handleSignup}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" placeholder="Enter your full name" type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input className="form-input" placeholder="you@example.com" type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input className="form-input" placeholder="10-digit mobile number" type="tel" name="mobile" value={formData.mobile} onChange={handleChange} pattern="[0-9]{10}" required />
              </div>
              <div className="form-group">
                <label>College Name</label>
                <input className="form-input" placeholder="Enter your college name" type="text" name="college" value={formData.college} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input className="form-input" placeholder="Enter your department" type="text" name="department" value={formData.department} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Year of Study</label>
                <select className="form-select" name="year" value={formData.year} onChange={handleChange} required>
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters" name="password" value={formData.password} onChange={handleChange} minLength="6" required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input className="form-input" type="password" placeholder="Confirm your password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Sending OTP..." : "Create Account"}
              </button>
            </form>
            <div className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h1>Verify Email</h1>
              <p>Enter the OTP sent to {formData.email}</p>
            </div>
            <form className="auth-form" onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>Enter OTP</label>
                <input className="form-input" placeholder="6-digit code" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" pattern="[0-9]{6}" required />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <div className="auth-footer">
              Didn't receive OTP?{' '}
              <button type="button" onClick={handleResendOTP} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>
                Resend
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
