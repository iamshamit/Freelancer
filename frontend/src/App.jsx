// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext"; // New import
import { ChatProvider } from "./context/ChatContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import PublicRoute from "./components/auth/PublicRoute";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboard Pages
import FreelancerDashboard from "./pages/dashboard/FreelancerDashboard";
import EmployerDashboard from "./pages/dashboard/EmployerDashboard";

// Profile Pages
import ProfilePage from "./pages/profile/ProfilePage";

// Job Pages
import JobListingPage from "./pages/jobs/JobListingPage";
import JobDetailPage from "./pages/jobs/JobDetailsPage";
import EmployerJobPage from "./pages/employer/EmployerJobsPage";
import PostJobPage from "./pages/jobs/PostJobPage";

// Applicant Pages
import ApplicantReviewPage from "./pages/applicants/ApplicantReviewPage";
import ApplicationsPage from "./pages/applicants/ApplicationsPage";

// Chat Pages (renamed from messages to chat)
import ChatPage from "./pages/chat/ChatPage";
import ArchivedChatsPage from "./pages/chat/ArchivedChatsPage";

// Milestone Pages
import MilestonePage from "./pages/milestones/MilestonePage";
import PaymentHistoryPage from "./pages/milestones/PaymentHistoryPage";

// Notifications
import NotificationPage from "./pages/notifications/NotificationPage";

// Ratings Pages
import RateFreelancerPage from "./pages/ratings/RateFreelancerPage";

// Search Pages
import SearchResultsPage from './pages/search/SearchResultsPage';
import FreelancerDirectoryPage from './pages/search/FreelancerDirectoryPage';

//settings
import PaymentSettings from "./pages/settings/PaymentSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import PrivacySettings from "./pages/settings/PrivacySettings";

// Placeholder for admin
const AdminDashboard = () => <div>Admin Dashboard</div>;

function App({ darkMode, setDarkMode }) {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider> {/* Wrap with SocketProvider */}
          <ChatProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: "#fff",
                  color: "#333",
                },
                success: {
                  style: {
                    border: "1px solid #0FAA4F",
                  },
                },
                error: {
                  style: {
                    border: "1px solid #964734",
                  },
                },
              }}
            />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage darkMode={darkMode} setDarkMode={setDarkMode} />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />

              {/* Freelancer Routes */}
              <Route
                path="/freelancer/dashboard"
                element={
                  <PrivateRoute role="freelancer">
                    <FreelancerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs"
                element={
                  <PrivateRoute role="freelancer">
                    <JobListingPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <PrivateRoute role="freelancer">
                    <ApplicationsPage />
                  </PrivateRoute>
                }
              />

              {/* Employer Routes */}
              <Route
                path="/employer/dashboard"
                element={
                  <PrivateRoute role="employer">
                    <EmployerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/post-job"
                element={
                  <PrivateRoute role="employer">
                    <PostJobPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/jobs"
                element={
                  <PrivateRoute role="employer">
                    <EmployerJobPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/jobs/:jobId/applicants"
                element={
                  <PrivateRoute role="employer">
                    <ApplicantReviewPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/job/:jobId/rate-freelancer"
                element={
                  <PrivateRoute role="employer">
                    <RateFreelancerPage />
                  </PrivateRoute>
                }
              />

              {/* Shared Routes */}
              <Route
                path="/settings/payment"
                element={
                  <PrivateRoute>
                    <PaymentSettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings/security"
                element={
                  <PrivateRoute>
                    <SecuritySettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings/privacy"
                element={
                  <PrivateRoute>
                    <PrivacySettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/job/:id"
                element={
                  <PrivateRoute>
                    <JobDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <NotificationPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications/settings"
                element={
                  <PrivateRoute>
                    <NotificationPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <PrivateRoute>
                    <SearchResultsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/freelancers"
                element={
                  <PrivateRoute>
                    <FreelancerDirectoryPage />
                  </PrivateRoute>
                }
              />
              {/* 🆕 Chat Routes (standardized) */}
              <Route
                path="/chat"
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat/archived"
                element={
                  <PrivateRoute>
                    <ArchivedChatsPage />
                  </PrivateRoute>
                }
              />

              {/* Milestones */}
              <Route
                path="/job/:jobId/milestones"
                element={
                  <PrivateRoute>
                    <MilestonePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payments/history"
                element={
                  <PrivateRoute>
                    <PaymentHistoryPage />
                  </PrivateRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute role="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;