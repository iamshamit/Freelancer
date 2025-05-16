// frontend/src/pages/auth/RegisterPage.jsx
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import Button from '../../components/common/Button';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .oneOf(['freelancer', 'employer'], 'Please select a valid role')
    .required('Role is required')
});

const RegisterPage = () => {
  const { register, isAuthLoading, error, clearError } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-teal">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-jade-green hover:text-deep-teal">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: ''
          }}
          validationSchema={RegisterSchema}
          onSubmit={(values) => {
            clearError();
            const { name, email, password, role } = values;
            register({ name, email, password, role });
          }}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="mt-8 space-y-6">
              {error && (
                <div className="bg-rust bg-opacity-10 border border-rust text-rust px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      touched.name && errors.name ? 'border-rust' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-jade-green focus:border-jade-green focus:z-10 sm:text-sm`}
                    placeholder="John Doe"
                  />
                  <ErrorMessage name="name" component="div" className="text-rust text-xs mt-1" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      touched.email && errors.email ? 'border-rust' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-jade-green focus:border-jade-green focus:z-10 sm:text-sm`}
                    placeholder="john@example.com"
                  />
                  <ErrorMessage name="email" component="div" className="text-rust text-xs mt-1" />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      touched.password && errors.password ? 'border-rust' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-jade-green focus:border-jade-green focus:z-10 sm:text-sm`}
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="password" component="div" className="text-rust text-xs mt-1" />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      touched.confirmPassword && errors.confirmPassword ? 'border-rust' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-jade-green focus:border-jade-green focus:z-10 sm:text-sm`}
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-rust text-xs mt-1" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    I am a
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <Field
                        type="radio"
                        name="role"
                        value="freelancer"
                        className="h-4 w-4 text-jade-green focus:ring-jade-green border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Freelancer</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="radio"
                        name="role"
                        value="employer"
                        className="h-4 w-4 text-jade-green focus:ring-jade-green border-gray-300"
                      />
                                            <span className="ml-2 text-sm text-gray-700">Employer</span>
                    </label>
                  </div>
                  <ErrorMessage name="role" component="div" className="text-rust text-xs mt-1" />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
};

export default RegisterPage;