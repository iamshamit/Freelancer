// frontend/src/components/layout/Layout.jsx
import { useContext } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const Layout = ({ children, darkMode, setDarkMode }) => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Layout;