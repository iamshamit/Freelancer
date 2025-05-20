import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Custom ScrollLink component for smooth scrolling
const ScrollLink = ({ to, children, className, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    const sectionId = to.replace('#', '');
    const element = document.getElementById(sectionId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (onClick) onClick();
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

const Navbar = ({ darkMode, setDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle navigation
  const navigateTo = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  // Theme toggle component
  const ThemeToggle = () => {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setDarkMode(!darkMode)}
        className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-orange-400' : 'bg-orange-100 text-orange-500'} focus:outline-none transition-colors duration-300 shadow-md`}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </motion.button>
    );
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'} ${darkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md shadow-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={() => navigateTo("/")}
              className="flex-shrink-0 cursor-pointer"
            >
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Nex</span>ara
              </span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              <ScrollLink 
                to="#home" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} hover:bg-orange-500/10 transition-colors duration-200`}
              >
                Home
              </ScrollLink>
              <ScrollLink 
                to="#features" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} hover:bg-orange-500/10 transition-colors duration-200`}
              >
                Features
              </ScrollLink>
              <ScrollLink 
                to="#how-it-works" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} hover:bg-orange-500/10 transition-colors duration-200`}
              >
                How It Works
              </ScrollLink>
              <ScrollLink 
                to="#tech-stack" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} hover:bg-orange-500/10 transition-colors duration-200`}
              >
                Tech Stack
              </ScrollLink>
              <ScrollLink 
                to="#github" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} hover:bg-orange-500/10 transition-colors duration-200`}
              >
                GitHub
              </ScrollLink>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateTo('/login')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} hover:bg-orange-500/10 transition-colors duration-200`}
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateTo('/register')}
                className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white px-5 py-2 rounded-md text-sm font-medium shadow-lg shadow-orange-500/20 transition-all duration-300"
              >
                Get Started
              </motion.button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}
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
              </motion.button>
            </div>
          </div>
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className={`px-2 pt-2 pb-3 space-y-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-b-lg mx-4 mt-2`}>
              <ScrollLink
                to="#home"
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'} transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </ScrollLink>
              <ScrollLink
                to="#features"
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'} transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </ScrollLink>
              <ScrollLink
                to="#how-it-works"
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'} transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </ScrollLink>
              <ScrollLink
                to="#tech-stack"
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'} transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tech Stack
              </ScrollLink>
              <ScrollLink
                to="#github"
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'} transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                GitHub
              </ScrollLink>
              <div className={`pt-4 pb-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => navigateTo('/login')}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'} transition-colors duration-200`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigateTo('/register')}
                  className="block w-full text-left mt-2 px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white transition-colors duration-200"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;