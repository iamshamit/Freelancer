// frontend/src/App.jsx (updated)
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
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

// Placeholder for other pages
const AdminDashboard = () => <div>Admin Dashboard</div>;
const JobListingPage = () => <div>Job Listing Page</div>;
const PostJobPage = () => <div>Post Job Page</div>;
const JobDetailPage = () => <div>Job Detail Page</div>;
const ChatPage = () => <div>Chat Page</div>;

function App({ darkMode, setDarkMode }) {
  return (
    <Router>
      <AuthProvider>
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
            path="/post-job"
            element={
              <PrivateRoute role="employer">
                <PostJobPage />
              </PrivateRoute>
            }
          />

          {/* Shared Routes */}
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
            path="/chat/:id"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App