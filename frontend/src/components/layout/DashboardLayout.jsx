// src/components/layout/DashboardLayout.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  User, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Bell,
  Search
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';

const DashboardLayout = ({ children, role = 'freelancer', tabs = [] }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Navigation items based on user role
  const navItems = role === 'freelancer' 
    ? [
        { icon: <Briefcase />, label: 'Find Jobs', path: '/freelancer/jobs' },
        { icon: <FileText />, label: 'My Applications', path: '/freelancer/applications' },
        { icon: <MessageSquare />, label: 'Messages', path: '/freelancer/messages' },
      ]
    : [
        { icon: <Briefcase />, label: 'Post a Job', path: '/employer/post-job' },
        { icon: <User />, label: 'Find Talent', path: '/employer/freelancers' },
        { icon: <MessageSquare />, label: 'Messages', path: '/employer/messages' },
      ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header 
        className={`fixed top-0 w-full z-30 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md py-2' : 'bg-white py-3'
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link to="/" className="flex items-center">
              <Briefcase className="h-8 w-8 text-[#0FAA4F]" />
              <span className="ml-2 text-xl font-bold text-[#003135]">FreelanceHub</span>
            </Link>
          </div>
          
          {/* Search bar - desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder={role === 'freelancer' ? "Search for jobs..." : "Search for freelancers..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FAA4F] focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            
            {/* Profile dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#AFDDE5]">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#024950] flex items-center justify-center text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {/* Profile dropdown menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </div>
                    </Link>
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </div>
                    </Link>
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 fixed h-full pt-6">
          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-[#0FAA4F] bg-opacity-10 text-[#0FAA4F]'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Mobile sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsSidebarOpen(false)}
              />
              
              <motion.aside
                className="fixed inset-y-0 left-0 w-64 bg-white z-30 lg:hidden pt-16"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <nav className="mt-6 px-4">
                  <ul className="space-y-2">
                    {navItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          to={item.path}
                          className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                            location.pathname === item.path
                              ? 'bg-[#0FAA4F] bg-opacity-10 text-[#0FAA4F]'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className="mr-3">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        
        {/* Main content area */}
        <main className="flex-1 lg:ml-64 p-6">
          <div className="container mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#003135]">
                {role === 'freelancer' ? 'Freelancer Dashboard' : 'Employer Dashboard'}
              </h1>
              <p className="text-gray-600">
                {role === 'freelancer' 
                  ? 'Find jobs, manage applications, and track your progress'
                  : 'Post jobs, find talent, and manage your projects'
                }
              </p>
            </div>
            
            {/* Tabs if provided */}
            {tabs.length > 0 && (
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8">
                    {tabs.map((tab, index) => (
                      <button
                        key={index}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === index
                            ? 'border-[#0FAA4F] text-[#0FAA4F]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab(index)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
                
                <div className="mt-6">
                  {tabs[activeTab]?.content}
                </div>
              </div>
            )}
            
            {/* Main content if no tabs */}
            {tabs.length === 0 && children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;