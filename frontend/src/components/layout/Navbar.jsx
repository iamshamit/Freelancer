// frontend/src/components/layout/Navbar.jsx
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Button from '../common/Button';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.user-menu')) {
        setIsMenuOpen(false);
      }
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isMobileMenuOpen]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    logout();
  };

  return (
    <nav className="bg-dark-teal text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">FreelanceHub</span>
            </Link>
            
            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <Link
                  to={`/${user.role}/dashboard`}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-deep-teal"
                >
                  Dashboard
                </Link>
                {user.role === 'freelancer' && (
                  <Link
                    to="/jobs"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-deep-teal"
                  >
                    Find Jobs
                  </Link>
                )}
                {user.role === 'employer' && (
                  <Link
                    to="/post-job"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-deep-teal"
                  >
                    Post a Job
                  </Link>
                )}
                <Link
                  to="/chats"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-deep-teal"
                >
                  Messages
                </Link>
              </div>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center">
              {/* Notifications */}
              <div className="hidden md:block">
                <NotificationDropdown />
              </div>
              
              {/* User Menu */}
              <div className="ml-4 relative user-menu">
                <div>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jade-green"
                  >
                    <span className="sr-only">Open user menu</span>
                    {user.profilePicture ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.profilePicture}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-deep-teal flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                </div>
                
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-gray-500 capitalize">{user.role}</p>
                      </div>
                      
                      <Link
                        to={`/${user.role}/dashboard`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      
                      {user.role === 'employer' && (
                        <Link
                          to="/post-job"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Post a Job
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                                            {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden ml-2">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-deep-teal focus:outline-none"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Link
                to="/login"
                className="text-white hover:bg-deep-teal px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="ml-4 bg-jade-green hover:opacity-90 px-3 py-2 rounded-md text-sm font-medium"
              >
                Register
              </Link>
              
              {/* Mobile menu button for public pages */}
              <div className="md:hidden ml-2">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-deep-teal focus:outline-none"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-deep-teal">
              {user ? (
                <>
                  <Link
                    to={`/${user.role}/dashboard`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-teal"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === 'freelancer' && (
                    <Link
                      to="/jobs"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-teal"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Find Jobs
                    </Link>
                  )}
                  {user.role === 'employer' && (
                    <Link
                      to="/post-job"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-teal"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Post a Job
                    </Link>
                  )}
                  <Link
                    to="/chats"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-teal"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-teal"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-teal"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-teal"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-dark-teal"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;