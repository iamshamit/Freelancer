// src/components/layout/DashboardLayout.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  FileText,
  Shield,
  BarChart3,
  Activity,
  IndianRupee
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import AuthContext from "../../context/AuthContext";
import ErrorFallback from "../common/ErrorFallback";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { useSocket } from "../../context/SocketContext";
import GlobalSearchBar from "../search/GlobalSearchBar";

const DashboardLayout = ({ children, darkMode, toggleDarkMode }) => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState ? JSON.parse(savedState) : false;
  });
  const [isSidebarManuallyToggled, setIsSidebarManuallyToggled] =
    useState(false);
  const isManuallyToggled = useRef(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isConnected, isUserOnline } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 DashboardLayout - Connection status changed:", {
      isConnected,
      userId: user?._id,
      isCurrentUserOnline: user?._id ? isUserOnline(user._id) : "no user ID",
    });
  }, [isConnected, user?._id, isUserOnline]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Check if current path matches any of the given paths
  const isPathActive = (paths) => {
    if (Array.isArray(paths)) {
      return paths.some((path) => location.pathname.startsWith(path));
    }
    return location.pathname === paths || location.pathname.startsWith(paths);
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      {
        name: "Dashboard",
        icon: <Home className="w-5 h-5" />,
        path: `/${user?.role}/dashboard`,
        paths: [`/${user?.role}/dashboard`],
      },
      {
        name: "Messages",
        icon: <MessageSquare className="w-5 h-5" />,
        path: "/chat",
        paths: ["/chat"],
      },
      {
        name: "Profile",
        icon: <User className="w-5 h-5" />,
        path: "/profile",
        paths: ["/profile"],
      },
      {
        name: "Payment History",
        icon: <IndianRupee className="w-5 h-5" />,
        path: "/payments/history",
        paths: ["/payments"],
      },
      {
        name: "Notifications",
        icon: <Bell className="w-5 h-5" />,
        path: "/notifications",
        paths: ["/notifications"],
      },
    ];

    const freelancerItems = [
      {
        name: "Find Jobs",
        icon: <Briefcase className="w-5 h-5" />,
        path: "/jobs",
        paths: ["/jobs", "/job/"],
      },
      {
        name: "My Applications",
        icon: <FileText className="w-5 h-5" />,
        path: "/applications",
        paths: ["/applications"],
      },
    ];

    const employerItems = [
      {
        name: "My Jobs",
        icon: <Briefcase className="w-5 h-5" />,
        path: "/employer/jobs",
        paths: ["/employer/jobs"],
      },
      {
        name: "Post a Job",
        icon: <Plus className="w-5 h-5" />,
        path: "/employer/post-job",
        paths: ["/employer/post-job"],
      },
    ];

    const adminItems = [
      {
        name: "Admin Dashboard",
        icon: <BarChart3 className="w-5 h-5" />,
        path: "/admin/dashboard",
        paths: ["/admin/dashboard"],
      },
      {
        name: "User Management",
        icon: <Users className="w-5 h-5" />,
        path: "/admin/users",
        paths: ["/admin/users"],
      },
      {
        name: "Job Moderation",
        icon: <Briefcase className="w-5 h-5" />,
        path: "/admin/jobs",
        paths: ["/admin/jobs"],
      },
      {
        name: "Activity Monitor",
        icon: <Activity className="w-5 h-5" />,
        path: "/admin/activity",
        paths: ["/admin/activity"],
      },
    ];

    const settingsItem = {
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: user.role === "admin" ? "/settings/security" : "/settings/payment",
      paths: ["/settings"],
    };

    let baseItems;

    if (user?.role === "admin") {
      // Admin gets admin-specific items plus basic common items (profile, notifications) - NO MESSAGES
      baseItems = [
        ...adminItems,
        {
          name: "Profile",
          icon: <User className="w-5 h-5" />,
          path: "/profile",
          paths: ["/profile"],
        },
      ];
    } else if (user?.role === "freelancer") {
      baseItems = [
        ...commonItems.slice(0, 1),
        ...freelancerItems,
        ...commonItems.slice(1),
      ];
    } else {
      baseItems = [
        ...commonItems.slice(0, 1),
        ...employerItems,
        ...commonItems.slice(1),
      ];
    }

    return [...baseItems, settingsItem];
  };

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsSidebarManuallyToggled(true);
    isManuallyToggled.current = true;
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Get user display name with role badge
  const getUserDisplayInfo = () => {
    const roleColors = {
      admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      employer:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      freelancer:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };

    const roleIcons = {
      admin: <Shield className="w-3 h-3" />,
      employer: <Briefcase className="w-3 h-3" />,
      freelancer: <Users className="w-3 h-3" />,
    };

    return {
      name: user?.name?.split(" ")[0] || "User",
      role: user?.role || "user",
      roleColor: roleColors[user?.role] || roleColors.freelancer,
      roleIcon: roleIcons[user?.role] || roleIcons.freelancer,
    };
  };

  const userInfo = getUserDisplayInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section: Logo and mobile menu button */}
            <div className="flex items-center">
              {/* Mobile menu button - only visible on small screens */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              <Link to="/" className="ml-4 flex items-center">
                <span className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Nex
                  </span>
                  <span className="text-gray-900 dark:text-white">ara</span>
                </span>
                {user?.role === "admin" && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                    Admin
                  </span>
                )}
              </Link>
            </div>

            {/* Center section: Search */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              {user?.role !== "admin" && <GlobalSearchBar />}
            </div>

            {/* Right section: Theme toggle, Notifications, profile */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              {toggleDarkMode && (
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                  aria-label={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              )}

              {/* Notifications */}
              <NotificationDropdown />

              {/* Profile dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-label="Open user menu"
                >
                  <div className="relative">
                    <img
                      src={user?.profilePicture || "/default-avatar.png"}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
                        isUserOnline(user?._id) ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium truncate max-w-[100px]">
                        {userInfo.name}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user?.profilePicture || "/default-avatar.png"}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {userInfo.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user?.email}
                            </p>
                            <div
                              className={`flex items-center space-x-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${userInfo.roleColor} w-fit`}
                            >
                              {userInfo.roleIcon}
                              <span className="capitalize">
                                {userInfo.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-2">
                          <div
                            className={`h-2 w-2 rounded-full mr-2 flex-shrink-0 ${
                              isConnected ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {isConnected ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>Your Profile</span>
                        </Link>

                        <Link
                          to="/settings/payment"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>Settings</span>
                        </Link>

                        <Link
                          to="/settings/security"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Shield className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>Security</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search - visible on small screens */}
      {user?.role !== "admin" && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 pt-16 px-4 pb-3">
          <GlobalSearchBar />
        </div>
      )}

      {/* Mobile sidebar - slides in from left */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto md:hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <Link to="/" className="flex items-center">
                  <span className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                      Nex
                    </span>
                    <span className="text-gray-900 dark:text-white">ara</span>
                  </span>
                  {user?.role === "admin" && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                      Admin
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="mt-4 px-2 space-y-1">
                {getNavItems().map((item) => {
                  const isActive = isPathActive(item.paths || item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-orange-500 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Theme Toggle */}
              {toggleDarkMode && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setSidebarOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {darkMode ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                    <span className="ml-3">
                      {darkMode ? "Light Mode" : "Dark Mode"}
                    </span>
                  </button>
                </div>
              )}

              {/* Mobile Logout */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    logout();
                  }}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Sign out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar - using CSS transitions instead of Framer Motion for stability */}
      <div
        className={`hidden md:block fixed inset-y-0 left-0 z-20 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-[width] duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
        style={{ transitionProperty: "width" }}
      >
        <div className="flex flex-col h-full pt-16">
          {/* Sidebar toggle button */}
          <motion.button
            onClick={toggleSidebar}
            className="absolute right-0 top-20 transform translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-1.5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 focus:outline-none shadow-sm z-10"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{
                rotate: sidebarCollapsed ? 180 : 0,
              }}
              transition={{ duration: isSidebarManuallyToggled ? 0.3 : 0 }}
              onAnimationComplete={() => {
                setIsSidebarManuallyToggled(false);
                isManuallyToggled.current = false;
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </motion.button>

          {/* Navigation */}
          <nav className="mt-6 px-3 flex-1 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-2">
              {getNavItems().map((item) => {
                const isActive = isPathActive(item.paths || item.path);

                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`relative flex items-center px-3 py-3 rounded-lg transition-colors duration-200 group ${
                        isActive
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      title={sidebarCollapsed ? item.name : ""}
                    >
                      {/* Icon container */}
                      <div
                        className={`flex items-center justify-center ${sidebarCollapsed ? "w-6" : "w-5"}`}
                      >
                        {item.icon}
                      </div>

                      {/* Text label with CSS transition */}
                      <span
                        className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                          sidebarCollapsed
                            ? "opacity-0 w-0 overflow-hidden"
                            : "opacity-100"
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md whitespace-nowrap pointer-events-none z-50"
                        >
                          {item.name}
                        </motion.div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={logout}
              className="relative flex items-center px-3 py-3 w-full rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
              title={sidebarCollapsed ? "Sign out" : ""}
            >
              <div
                className={`flex items-center justify-center ${sidebarCollapsed ? "w-6" : "w-5"}`}
              >
                <LogOut className="h-5 w-5" />
              </div>

              <span
                className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                  sidebarCollapsed
                    ? "opacity-0 w-0 overflow-hidden"
                    : "opacity-100"
                }`}
              >
                Sign out
              </span>

              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md whitespace-nowrap pointer-events-none z-50"
                >
                  Sign out
                </motion.div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content - using CSS transitions for stability */}
      <main
        className={`transition-[padding-left] duration-300 ease-in-out ${
          user?.role === "admin" ? "pt-16 md:pt-16" : "pt-16 md:pt-16"
        } ${sidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}
      >
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            window.location.reload();
          }}
          resetKeys={[location.pathname]}
        >
          <motion.div
            key={
              location.pathname.startsWith("/chat")
                ? "/chat"
                : location.pathname
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-[calc(100vh-64px)]"
          >
            {children}
          </motion.div>
        </ErrorBoundary>
      </main>

      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full filter blur-3xl" />
      </div>
    </div>
  );
};

export default DashboardLayout;
