// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`py-12 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-orange-500">Nex</span>ara
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Connect with top freelancers and find quality projects.
              Our platform makes it easy to collaborate and get work done.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/jobs" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/register?role=freelancer" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  Join as Freelancer
                </Link>
              </li>
              <li>
                <Link to="/register?role=employer" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  Hire Freelancers
                </Link>
              </li>
              <li>
                <a href="https://github.com/iamshamit/Freelancer" target="_blank" rel="noopener noreferrer" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  GitHub Repository
                </a>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Contact</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Email: shamitmishra22@gmail.com
            </p>
            <div className="mt-4 flex space-x-4">
              <a 
                href="https://github.com/iamshamit/Freelancer"
                target="_blank" 
                rel="noopener noreferrer"
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                <FaGithub className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/mishrashamit" 
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                <FaLinkedinIn className="h-5 w-5" />
              </a>
            </div>
          </motion.div>
        </div>
        
        <div className={`mt-12 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col md:flex-row justify-between items-center`}>
          <div className={`text-sm mb-4 md:mb-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © {currentYear} Nexara. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="https://github.com/iamshamit/Freelancer" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              <FaGithub className="h-5 w-5" />
            </a>
            <div className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>Made with love</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
