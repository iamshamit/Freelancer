// src/pages/auth/LoginPage.jsx
import { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowLeft, Smartphone } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const LoginPage = () => {
  const { login, isAuthLoading, error, clearError } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState(null);
  const emailInputRef = useRef(null);
  const formControls = useAnimation();
  
  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

  // Auto-focus email field on load
  useEffect(() => {
    if (emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current.focus();
      }, 500);
    }
  }, []);
  
  // Load saved form data if available
  const getSavedFormData = () => {
    try {
      const savedData = localStorage.getItem('nexara_login_form');
      return savedData ? JSON.parse(savedData) : { email: '', password: '' };
    } catch (err) {
      console.error('Error loading saved form data:', err);
      return { email: '', password: '' };
    }
  };

  // Save form data between refreshes
  const saveFormData = (values) => {
    try {
      localStorage.setItem('nexara_login_form', JSON.stringify({ 
        email: values.email,
        password: '' // Don't save password for security
      }));
    } catch (err) {
      console.error('Error saving form data:', err);
    }
  };
  
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email address is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
  });

  const twoFactorSchema = Yup.object({
    twoFactorCode: Yup.string()
      .required('Two-factor code is required')
      .matches(/^\d{6}$/, 'Code must be 6 digits')
  });
  
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      if (clearError) clearError();
      saveFormData(values);
      
      // First, try login without 2FA
      const response = await api.user.login(values.email, values.password);
      
      if (response.data.requiresTwoFactor) {
        // 2FA required, show 2FA form
        setLoginCredentials(values);
        setShowTwoFactor(true);
        setSubmitting(false);
      } else {
        // Normal login success
        await login(values);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Shake the form on error
      formControls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      });
      // More specific error handling
      if (err.message?.includes('credentials')) {
        setFieldError('email', 'Invalid email or password');
        setFieldError('password', 'Invalid email or password');
      } else if (err.message?.includes('many attempts')) {
        setFieldError('email', 'Too many login attempts. Try again later.');
      }
      
      setSubmitting(false);
    }
  };

  const handleTwoFactorSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      if (clearError) clearError();
      
      // Submit with 2FA code
      const loginData = {
        email: loginCredentials.email,
        password: loginCredentials.password,
        twoFactorCode: values.twoFactorCode
      };
      
      await login(loginData);
    } catch (err) {
      console.error('2FA error:', err);
      
      if (err.message?.includes('Invalid two-factor')) {
        setFieldError('twoFactorCode', 'Invalid verification code');
      }
      
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-600/20 to-transparent blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-orange-500/20 to-transparent blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" />
      </div>
      
      {/* Content container */}
      <div className="container mx-auto px-4 z-10">
        {/* Back to home button */}
        <motion.div 
          className="absolute top-8 left-8"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-400 hover:text-orange-500 transition-colors"
            aria-label="Back to home page"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
        
        <div className="max-w-md mx-auto">
          <motion.div 
            className="mb-10 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={`text-4xl font-bold text-white`}>
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Nex</span>ara
            </span>
            <p className="text-gray-400">Sign in to your account</p>
          </motion.div>
          
          <motion.div 
            className="bg-[#1e293b] rounded-2xl shadow-xl overflow-hidden border border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ backdropFilter: "blur(16px)" }}
          >
            <AnimatePresence>
              {showTwoFactor ? (
                <motion.div 
                  className="p-8"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6 text-center">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="h-8 w-8 text-orange-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      Two-Factor Authentication
                    </h2>
                    <p className="text-gray-400">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  <Formik
                    initialValues={{ twoFactorCode: '' }}
                    validationSchema={twoFactorSchema}
                    onSubmit={handleTwoFactorSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-6">
                        {error && (
                          <div className="p-4 bg-red-900/30 border border-red-700/50 text-red-400 rounded-lg flex items-center">
                            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-300">
                            Verification Code
                          </label>
                          <Field name="twoFactorCode">
                            {({ field, meta }) => (
                              <div className="relative">
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="000000"
                                  maxLength="6"
                                  className="w-full px-4 py-3 bg-[#0f172a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-center text-lg font-mono tracking-widest"
                                  style={{ letterSpacing: '0.5em' }}
                                />
                                {meta.touched && meta.error && (
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                  </div>
                                )}
                              </div>
                            )}
                          </Field>
                          <ErrorMessage name="twoFactorCode" component="div" className="text-red-400 text-sm mt-1" />
                        </div>

                        <div className="space-y-4">
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#1e293b] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Verifying...
                              </div>
                            ) : (
                              'Verify & Sign In'
                            )}
                          </motion.button>

                          <button
                            type="button"
                            onClick={() => setShowTwoFactor(false)}
                            className="w-full text-gray-400 hover:text-white transition-colors"
                          >
                            ← Back to login
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </motion.div>
              ) : (
                <motion.div 
                  className="p-8"
                  animate={formControls}
                >
                  {error && (
                    <motion.div 
                      className="mb-6 p-4 bg-red-900/30 border border-red-700/50 text-red-400 rounded-lg flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  
                  <Formik
                    initialValues={getSavedFormData()}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                        >
                          {/* Email */}
                          <motion.div 
                            className="mb-6"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                          >
                            <label 
                              htmlFor="email" 
                              className="block text-gray-300 font-medium mb-2"
                            >
                              Email Address
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500" />
                              </div>
                              <Field
                                type="email"
                                id="email"
                                name="email"
                                innerRef={emailInputRef}
                                placeholder="Enter your email"
                                aria-label="Email Address"
                                aria-required="true"
                                aria-invalid={errors.email && touched.email ? "true" : "false"}
                                className={`
                                  w-full pl-12 pr-4 py-4 rounded-xl border bg-[#0f172a]/50 text-white
                                  focus:outline-none focus:ring-2 transition-all duration-200
                                  ${errors.email && touched.email 
                                    ? 'border-red-500/50 focus:ring-red-500/30' 
                                    : 'border-gray-700 focus:ring-orange-500/30 focus:border-orange-500/50'}
                                  [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0f172a_inset]
                                  [&:-webkit-autofill]:text-fill-color-white
                                `}
                              />
                            </div>
                            <ErrorMessage 
                              name="email" 
                              component={motion.div}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-red-400 text-sm"
                            />
                          </motion.div>
                          
                          {/* Password */}
                          <motion.div 
                            className="mb-8"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <label 
                                htmlFor="password" 
                                className="block text-gray-300 font-medium"
                              >
                                Password
                              </label>
                              <Link 
                                to="/forgot-password" 
                                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                                aria-label="Forgot password"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500" />
                              </div>
                              <Field
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                aria-label="Password"
                                aria-required="true"
                                aria-invalid={errors.password && touched.password ? "true" : "false"}
                                className={`
                                  w-full pl-12 pr-12 py-4 rounded-xl border bg-[#0f172a]/50 text-white
                                  focus:outline-none focus:ring-2 transition-all duration-200
                                  ${errors.password && touched.password 
                                    ? 'border-red-500/50 focus:ring-red-500/30' 
                                    : 'border-gray-700 focus:ring-orange-500/30 focus:border-orange-500/50'}
                                  [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0f172a_inset]
                                  [&:-webkit-autofill]:text-fill-color-white
                                `}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                            <ErrorMessage 
                              name="password" 
                              component={motion.div}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-red-400 text-sm"
                            />
                          </motion.div>
                          
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                          >
                            <motion.button
                              type="submit"
                              disabled={isAuthLoading || isSubmitting}
                              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-70 shadow-lg shadow-orange-500/10"
                              whileHover={{ 
                                scale: 1.02,
                                boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)"
                              }}
                              whileTap={{ scale: 0.98 }}
                              aria-label="Log in"
                            >
                              {isAuthLoading || isSubmitting ? (
                                <div className="flex items-center justify-center">
                                                                    <svg className="animate-spin mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle 
                                      className="opacity-25" 
                                      cx="12" 
                                      cy="12" 
                                      r="10" 
                                      stroke="currentColor" 
                                      strokeWidth="4"
                                    />
                                    <path 
                                      className="opacity-75" 
                                      fill="currentColor" 
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  <span>Authenticating...</span>
                                </div>
                              ) : (
                                <span>Sign In</span>
                              )}
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      </Form>
                    )}
                  </Formik>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            className="text-center mt-8 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <p className="mb-4">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-orange-400 font-medium hover:text-orange-300 transition-colors"
                aria-label="Sign up for an account"
              >
                Create account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 6 + 2 + "px",
              height: Math.random() * 6 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, Math.random() * -100 - 50],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginPage;