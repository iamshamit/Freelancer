// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-teal text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold mb-4">FreelanceHub</h3>
            <p className="text-light-aqua">
              Connect with top freelancers and find quality projects.
              Our platform makes it easy to collaborate and get work done.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-light-aqua hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-light-aqua hover:text-white transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-light-aqua hover:text-white transition-colors">
                  Join as Freelancer
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-light-aqua hover:text-white transition-colors">
                  Hire Freelancers
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-light-aqua mb-2">
              Email: support@freelancehub.com
            </p>
            <p className="text-light-aqua">
              Phone: +1 (555) 123-4567
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-light-aqua hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-light-aqua hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light-aqua hover:text-white transition-colors">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-deep-teal text-center">
          <p className="text-light-aqua">
            &copy; {currentYear} FreelanceHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;