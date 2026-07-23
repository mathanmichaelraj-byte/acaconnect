import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ParticipantSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    college: "",
    department: "",
    year: ""
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
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        college: formData.college,
        department: formData.department,
        year: formData.year
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
        email: formData.email,
        otp
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
      const res = await axios.post("/participant-auth/resend-otp", {
        email: formData.email
      });

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
            {step === 1 ? (
              <>
                <div className="login-form-header">
                  <h2 className="login-form-title">Create Account</h2>
                  <p className="login-form-subtitle">Register for NIRAL 2026</p>
                </div>
                <form onSubmit={handleSignup}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      className="form-input"
                      placeholder="Enter your full name" 
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      className="form-input"
                      placeholder="Enter your email" 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input 
                      className="form-input"
                      placeholder="Enter your mobile number" 
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">College Name</label>
                    <input 
                      className="form-input"
                      placeholder="Enter your college name" 
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input 
                      className="form-input"
                      placeholder="Enter your department" 
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year of Study</label>
                    <select 
                      className="form-input"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      className="form-input"
                      type="password" 
                      placeholder="Create a password" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength="6"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input 
                      className="form-input"
                      type="password" 
                      placeholder="Confirm your password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="btn-login-split"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Sign Up →"}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                    Already have an account? <a href="/login" style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>Login</a>
                  </p>
                </form>
              </>
            ) : (
              <>
                <div className="login-form-header">
                  <h2 className="login-form-title">Verify Email</h2>
                  <p className="login-form-subtitle">Enter the OTP sent to {formData.email}</p>
                </div>
                <form onSubmit={handleVerifyOTP}>
                  <div className="form-group">
                    <label className="form-label">Enter OTP</label>
                    <input 
                      className="form-input"
                      placeholder="Enter 6-digit OTP" 
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="btn-login-split"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP →"}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                    Didn't receive OTP? <button type="button" onClick={handleResendOTP} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', textDecoration: 'underline' }}>Resend</button>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer showLogos={true} />
    </div>
  );
}
