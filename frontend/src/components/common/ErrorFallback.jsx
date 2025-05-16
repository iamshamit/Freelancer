// frontend/src/components/common/ErrorFallback.jsx
import { motion } from 'framer-motion';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-rust text-6xl text-center mb-4">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h2 className="text-2xl font-bold text-dark-teal mb-4 text-center">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error.message || "An unexpected error occurred"}</p>
        <div className="bg-gray-100 p-4 rounded mb-6 overflow-auto max-h-40">
          <pre className="text-xs text-gray-700">{error.stack}</pre>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="btn-primary w-full"
        >
          Try again
        </button>
      </div>
    </motion.div>
  );
};

export default ErrorFallback;