// src/pages/jobs/PostJobPage.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { 
  Briefcase, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import PaymentModal from '../../components/jobs/PaymentModal';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

// Step components
import BasicDetailsStep from '../../components/jobs/steps/BasicDetailsStep';
import DescriptionStep from '../../components/jobs/steps/DescriptionStep';
import BudgetStep from '../../components/jobs/steps/BudgetStep';
import ReviewStep from '../../components/jobs/steps/ReviewStep';

// Validation schemas for each step
const stepValidationSchemas = [
  // Step 1: Basic Details
  Yup.object({
    title: Yup.string()
      .required('Job title is required')
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must be less than 100 characters'),
    domain: Yup.string()
      .required('Please select a domain')
  }),
  
  // Step 2: Description
  Yup.object({
    description: Yup.string()
      .required('Job description is required')
      .min(50, 'Description must be at least 50 characters')
  }),
  
  // Step 3: Budget
  Yup.object({
    budget: Yup.number()
      .required('Budget is required')
      .min(5, 'Budget must be at least $5')
      .typeError('Budget must be a number')
  }),
  
  // Step 4: Review (no additional validation)
  Yup.object({})
];

const PostJobPage = ({ darkMode, toggleDarkMode }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  // Fetch domains
  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => api.domains.getAll(),
  });
  
  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (jobData) => api.job.create(jobData),
    onSuccess: () => {
      setSubmissionSuccess(true);
      setTimeout(() => {
        navigate('/employer/jobs');
      }, 2000);
    },
    onError: (error) => {
      setSubmissionError(error.response?.data?.message || 'Failed to create job');
      setShowPaymentModal(false);
    }
  });
  
  // Check if user is employer
  useEffect(() => {
    if (user && user.role !== 'employer') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Steps configuration
  const steps = [
    { title: 'Basic Details', icon: <Briefcase /> },
    { title: 'Description', icon: <FileText /> },
    { title: 'Budget', icon: <DollarSign /> },
    { title: 'Review', icon: <CheckCircle /> }
  ];
  
  // Initial form values
  const initialValues = {
    title: '',
    domain: '',
    description: '',
    budget: ''
  };
  
  // Handle form submission
  const handleSubmit = (values) => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setFormData(values);
      setShowPaymentModal(true);
    }
  };
  
  // Handle payment success
  const handlePaymentSuccess = () => {
    if (formData) {
      createJobMutation.mutate({
        ...formData,
        budget: parseFloat(formData.budget)
      });
    }
  };
  
  // Handle back button
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Render current step
  const renderStep = (formikProps) => {
    switch (currentStep) {
      case 0:
        return <BasicDetailsStep formikProps={formikProps} domains={domains || []} />;
      case 1:
        return <DescriptionStep formikProps={formikProps} />;
      case 2:
        return <BudgetStep formikProps={formikProps} />;
      case 3:
        return <ReviewStep formikProps={formikProps} domains={domains || []} />;
      default:
        return null;
    }
  };
  
  if (domainsLoading) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <SkeletonLoader type="card" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Post a New Job
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Create a job posting to find the perfect freelancer for your project
          </p>
          
          {/* Success message */}
          {submissionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 rounded-lg flex items-center"
            >
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Job posted successfully! Redirecting to your jobs...</span>
            </motion.div>
          )}
          
          {/* Error message */}
          {submissionError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 rounded-lg flex items-center"
            >
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{submissionError}</span>
            </motion.div>
          )}
          
          {/* Steps progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex-1 ${index < steps.length - 1 ? 'relative' : ''}`}
                >
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full mx-auto ${
                      index <= currentStep 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="text-center mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {step.title}
                  </div>
                  
                  {/* Progress line */}
                  {index < steps.length - 1 && (
                    <div 
                      className="absolute top-5 left-1/2 w-full h-0.5 transform -translate-y-1/2"
                      aria-hidden="true"
                    >
                      <div 
                        className={`h-full ${
                          index < currentStep 
                            ? 'bg-orange-500' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <Formik
              initialValues={initialValues}
              validationSchema={stepValidationSchemas[currentStep]}
              onSubmit={handleSubmit}
            >
              {(formikProps) => (
                <Form>
                  <div className="p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {renderStep(formikProps)}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 0 || createJobMutation.isPending}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    
                    <Button
                      type="submit"
                      isLoading={createJobMutation.isPending}
                      disabled={createJobMutation.isPending}
                    >
                      {currentStep < steps.length - 1 ? (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        'Post Job'
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </motion.div>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={formData?.budget}
      />
    </DashboardLayout>
  );
};

export default PostJobPage;