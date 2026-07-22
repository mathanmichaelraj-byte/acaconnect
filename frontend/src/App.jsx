import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";
import ParticipantLogin from "./auth/ParticipantLogin";
import ParticipantSignup from "./auth/ParticipantSignup";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import ParticipantHomePage from "./pages/ParticipantHomePage";
import MyRegistrations from "./pages/MyRegistrations";
import MockPaymentPage from "./pages/MockPaymentPage";
import QRPaymentPage from "./pages/QRPaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import TreasurerPaymentVerification from "./pages/TreasurerPaymentVerification";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminEventsPage from "./pages/AdminEventsPage";
import EventTeamEventsPage from "./pages/EventTeamEventsPage";
import TreasurerEventsPage from "./pages/TreasurerEventsPage";
import GeneralSecretaryEventsPage from "./pages/GeneralSecretaryEventsPage";
import ChairpersonEventsPage from "./pages/ChairpersonEventsPage";
import LogisticsEventsPage from "./pages/LogisticsEventsPage";
import HospitalityEventsPage from "./pages/HospitalityEventsPage";
import HREventsPage from "./pages/HREventsPage";
import TechopsEventsPage from "./pages/TechopsEventsPage";
import AlumniEventsPage from "./pages/AlumniEventsPage";
import DesignEventsPage from "./pages/DesignEventsPage";
import MarketingEventsPage from "./pages/MarketingEventsPage";
import PhotographyEventsPage from "./pages/PhotographyEventsPage";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

import AdminDashboard from "./dashboards/AdminDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";
import EventTeamDashboard from "./dashboards/EventTeamDashboard";
import TreasurerDashboard from "./dashboards/TreasurerDashboard";
import GenSecDashboard from "./dashboards/GenSecDashboard";
import ChairpersonDashboard from "./dashboards/ChairpersonDashboard";
import LogisticsDashboard from "./dashboards/LogisticsDashboard";
import HospitalityDashboard from "./dashboards/HospitalityDashboard";
import HRDashboard from "./dashboards/HRDashboard";
import TechopsDashboard from "./dashboards/TechopsDashboard";
import AlumniDashboard from "./dashboards/AlumniDashboard";
import DesignDashboard from "./dashboards/DesignDashboard";
import MarketingDashboard from "./dashboards/MarketingDashboard";
import PhotographyDashboard from "./dashboards/PhotographyDashboard";
import SchedulingDashboard from "./dashboards/SchedulingDashboard";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

function EventsRouter() {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "ADMIN":
      return <AdminEventsPage />;
    case "EVENT_TEAM":
      return <EventTeamEventsPage />;
    case "TREASURER":
      return <TreasurerEventsPage />;
    case "GENERAL_SECRETARY":
      return <GeneralSecretaryEventsPage />;
    case "CHAIRPERSON":
      return <ChairpersonEventsPage />;
    case "LOGISTICS":
      return <LogisticsEventsPage />;
    case "HR":
      return <HREventsPage />;
    case "HOSPITALITY":
      return <HospitalityEventsPage />;
    case "TECHOPS":
      return <TechopsEventsPage />;
    case "ALUMNI":
      return <AlumniEventsPage />;
    case "DESIGN":
      return <DesignEventsPage />;
    case "MARKETING":
      return <MarketingEventsPage />;
    case "PHOTOGRAPHY":
      return <PhotographyEventsPage />;
    case "STUDENT":
    case "PARTICIPANT":
      return <ParticipantHomePage />;
    default:
      return <Navigate to="/login" />;
  }
}

function DashboardRouter() {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "EVENT_TEAM":
      return <EventTeamDashboard />;
    case "TREASURER":
      return <TreasurerDashboard />;
    case "GENERAL_SECRETARY":
      return <GenSecDashboard />;
    case "CHAIRPERSON":
      return <ChairpersonDashboard />;
    case "LOGISTICS":
      return <LogisticsDashboard />;
    case "HR":
      return <HRDashboard />;
    case "HOSPITALITY":
      return <HospitalityDashboard />;
    case "TECHOPS":
      return <TechopsDashboard />;
    case "ALUMNI":
      return <AlumniDashboard />;
    case "DESIGN":
      return <DesignDashboard />;
    case "MARKETING":
      return <MarketingDashboard />;
    case "PHOTOGRAPHY":
      return <PhotographyDashboard />;
    case "STUDENT":
    case "PARTICIPANT":
      return <StudentDashboard />;
    default:
      return (
        <div className="app-container">
          <div className="dashboard-container">
            <div className="card">
              <h2>Welcome {user.name}!</h2>
              <p>Dashboard for {user.role} role is coming soon...</p>
            </div>
          </div>
        </div>
      );
  }
}

export default function App() {
  return (
    <div className="app-container">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/participant-login" element={<ParticipantLogin />} />
            <Route path="/participant-signup" element={<ParticipantSignup />} />
            <Route path="/participant-home" element={
              <ProtectedRoute>
                <ParticipantHomePage />
              </ProtectedRoute>
            } />
            <Route path="/my-registrations" element={
              <ProtectedRoute>
                <MyRegistrations />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <QRPaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/mock-payment" element={
              <ProtectedRoute>
                <MockPaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/payment-success" element={
              <ProtectedRoute>
                <PaymentSuccessPage />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/events" element={
              <ProtectedRoute>
                <EventsRouter />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />
            <Route path="/payment-verification" element={
              <ProtectedRoute>
                <TreasurerPaymentVerification />
              </ProtectedRoute>
            } />
            <Route path="/scheduling" element={
              <ProtectedRoute>
                <SchedulingDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
