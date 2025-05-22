// src/pages/jobs/PostJobPage.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Briefcase,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  Clock,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import PaymentModal from "../../components/jobs/PaymentModal";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";

// Validation schema
const validationSchema = Yup.object({
  title: Yup.string()
    .required("Job title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  domain: Yup.string().required("Please select a domain"),
  description: Yup.string()
    .required("Job description is required")
    .min(50, "Description must be at least 50 characters"),
  budget: Yup.number()
    .required("Budget is required")
    .min(5, "Budget must be at least $5")
    .typeError("Budget must be a number"),
});

const PostJobPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("basicDetails");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  // Section refs for scrolling
  const basicDetailsRef = useRef(null);
  const descriptionRef = useRef(null);
  const budgetRef = useRef(null);
  const reviewRef = useRef(null);
  
  // Fetch domains
  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ["domains"],
    queryFn: () => api.domains.getAll(),
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (jobData) => api.job.create(jobData),
    onSuccess: () => {
      setSubmissionSuccess(true);
      setTimeout(() => {
        navigate("/employer/jobs");
      }, 2000);
    },
    onError: (error) => {
      setSubmissionError(
        error.response?.data?.message || "Failed to create job"
      );
      setShowPaymentModal(false);
    },
  });

  // Check if user is employer
  useEffect(() => {
    if (user && user.role !== "employer") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Scroll to section when activeSection changes
  useEffect(() => {
    const scrollToSection = (ref) => {
      if (ref && ref.current) {
        ref.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    switch (activeSection) {
      case "basicDetails":
        scrollToSection(basicDetailsRef);
        break;
      case "description":
        scrollToSection(descriptionRef);
        break;
      case "budget":
        scrollToSection(budgetRef);
        break;
      case "review":
        scrollToSection(reviewRef);
        break;
      default:
        break;
    }
  }, [activeSection]);

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      if (
        reviewRef.current &&
        scrollPosition >= reviewRef.current.offsetTop
      ) {
        setActiveSection("review");
      } else if (
        budgetRef.current &&
        scrollPosition >= budgetRef.current.offsetTop
      ) {
        setActiveSection("budget");
      } else if (
        descriptionRef.current &&
        scrollPosition >= descriptionRef.current.offsetTop
      ) {
        setActiveSection("description");
      } else {
        setActiveSection("basicDetails");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle form submission
  const handleSubmit = (values) => {
    // Add milestones=true to the form data since all payments are milestone-based
    const formDataWithMilestones = {
      ...values,
      milestones: true
    };
    setFormData(formDataWithMilestones);
    setShowPaymentModal(true);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    if (formData) {
      createJobMutation.mutate({
        ...formData,
        budget: parseFloat(formData.budget),
      });
    }
  };

  // Scroll to section
  const scrollToSection = (section) => {
    setActiveSection(section);
  };

  // Initial form values
  const initialValues = {
    title: "",
    domain: "",
    description: "",
    budget: "",
  };

  // Get domain name by ID
  const getDomainName = (domainId) => {
    if (!domains) return "";
    const domain = domains.find((d) => d._id === domainId);
    return domain ? domain.name : "";
  };

  if (domainsLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <SkeletonLoader type="card" count={3} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="relative">
            <div className="absolute top-0 left-0 w-2 h-12 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
            <div className="pl-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                Post a New Job
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                Create a detailed job posting to attract the perfect freelancer
                for your project
              </p>
            </div>
          </div>

          {/* Success message */}
          {submissionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-400 rounded-xl flex items-start shadow-sm"
            >
              <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-300">
                  Job Posted Successfully!
                </h3>
                <p className="mt-1">
                  Your job has been posted and is now visible to freelancers.
                  Redirecting to your jobs dashboard...
                </p>
              </div>
            </motion.div>
          )}

          {/* Error message */}
          {submissionError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400 rounded-xl flex items-start shadow-sm"
            >
              <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-300">
                  Error Posting Job
                </h3>
                <p className="mt-1">{submissionError}</p>
              </div>
            </motion.div>
          )}

          {/* Form with floating navigation */}
          <div className="relative flex flex-col lg:flex-row gap-8">
            {/* Floating navigation sidebar */}
            <div className="lg:w-64 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Job Sections
                  </h3>
                </div>
                <nav className="p-2">
                  <ul className="space-y-1">
                    {[
                      {
                        id: "basicDetails",
                        name: "Basic Details",
                        icon: <Briefcase className="h-4 w-4" />,
                      },
                      {
                        id: "description",
                        name: "Description",
                        icon: <FileText className="h-4 w-4" />,
                      },
                      {
                        id: "budget",
                        name: "Budget",
                        icon: <DollarSign className="h-4 w-4" />,
                      },
                      {
                        id: "review",
                        name: "Review & Submit",
                        icon: <CheckCircle className="h-4 w-4" />,
                      },
                    ].map((section) => (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                            activeSection === section.id
                              ? "bg-orange-500 text-white"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {section.icon}
                          <span className="ml-2">{section.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-100 dark:border-orange-800/30">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-800 dark:text-orange-300">
                      All fields are required to successfully post your job.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main form content */}
            <div className="flex-1">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                  isValid,
                  dirty,
                }) => (
                  <Form className="space-y-8">
                    {/* Basic Details Section */}
                    <motion.div
                      ref={basicDetailsRef}
                      id="basicDetails"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-orange-500 mr-2" />
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Basic Details
                          </h2>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              errors.title || errors.domain
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : values.title && values.domain
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {errors.title || errors.domain
                              ? "Incomplete"
                              : values.title && values.domain
                              ? "Complete"
                              : "Required"}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Job Title */}
                        <div>
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Job Title
                          </label>
                          <Field
                            type="text"
                            id="title"
                            name="title"
                            placeholder="e.g. Website Redesign, Mobile App Development"
                            className={`w-full px-4 py-2 rounded-lg border ${
                              errors.title && touched.title
                                ? "border-red-500 focus:ring-red-500/30"
                                : "border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                          />
                          <ErrorMessage
                            name="title"
                            component="p"
                            className="mt-1 text-sm text-red-500"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {values.title.length}/100 characters - Be specific and descriptive
                          </p>
                        </div>

                        {/* Domain Selection */}
                        <div>
                          <label
                            htmlFor="domain"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Job Domain
                          </label>
                          <div className="relative">
                            <Field
                              as="select"
                              id="domain"
                              name="domain"
                              className={`w-full px-4 py-2 rounded-lg border appearance-none ${
                                errors.domain && touched.domain
                                  ? "border-red-500 focus:ring-red-500/30"
                                  : "border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50"
                              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                            >
                              <option value="">Select a domain</option>
                              {domains.map((domain) => (
                                <option key={domain._id} value={domain._id}>
                                  {domain.name}
                                </option>
                              ))}
                            </Field>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <ErrorMessage
                            name="domain"
                            component="p"
                            className="mt-1 text-sm text-red-500"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Description Section */}
                    <motion.div
                      ref={descriptionRef}
                      id="description"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-orange-500 mr-2" />
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Description
                          </h2>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              errors.description
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : values.description
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {errors.description
                              ? "Incomplete"
                              : values.description
                              ? "Complete"
                              : "Required"}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Job Description */}
                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Job Description
                          </label>
                          <Field
                            as="textarea"
                            id="description"
                            name="description"
                            rows={6}
                            placeholder="Describe the job in detail. Include project scope, goals, and any specific requirements."
                            className={`w-full px-4 py-2 rounded-lg border ${
                              errors.description && touched.description
                                ? "border-red-500 focus:ring-red-500/30"
                                : "border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                          />
                          <ErrorMessage
                            name="description"
                            component="p"
                            className="mt-1 text-sm text-red-500"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {values.description.length} characters - Minimum 50 characters
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Budget Section */}
                    <motion.div
                      ref={budgetRef}
                      id="budget"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-orange-500 mr-2" />
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Budget
                          </h2>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              errors.budget
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : values.budget
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {errors.budget
                              ? "Incomplete"
                              : values.budget
                              ? "Complete"
                              : "Required"}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Budget */}
                        <div>
                          <label
                            htmlFor="budget"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Budget (USD)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign className="h-5 w-5 text-gray-400" />
                            </div>
                            <Field
                              type="number"
                              id="budget"
                              name="budget"
                              min="5"
                              step="1"
                              placeholder="Enter amount"
                              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                                errors.budget && touched.budget
                                  ? "border-red-500 focus:ring-red-500/30"
                                  : "border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50"
                              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                            />
                          </div>
                          <ErrorMessage
                            name="budget"
                            component="p"
                            className="mt-1 text-sm text-red-500"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            This amount will be held in escrow until project completion
                          </p>
                        </div>

                        {/* Milestone Payment Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
                          <div className="flex items-start">
                            <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                Milestone-based Payments
                              </h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                Funds will be released to the freelancer as they complete agreed-upon milestones
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Review Section */}
                    <motion.div
                      ref={reviewRef}
                      id="review"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-orange-500 mr-2" />
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Review & Submit
                          </h2>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              !isValid
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {!isValid ? "Form Incomplete" : "Ready to Submit"}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Review content */}
                        <div className="space-y-6">
                          {/* Basic Details Review */}
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="mb-3">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                                <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                Basic Details
                              </h3>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Job Title
                                </p>
                                <p className="text-gray-900 dark:text-white font-medium">
                                  {values.title || "Not specified"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Domain
                                </p>
                                <p className="text-gray-900 dark:text-white font-medium">
                                  {getDomainName(values.domain) || "Not specified"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Description Review */}
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="mb-3">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                Description
                              </h3>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Job Description
                                </p>
                                <div className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">
                                  {values.description || "Not specified"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Budget Review */}
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="mb-3">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                                <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                Budget
                              </h3>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Budget
                                  </p>
                                  <p className="text-gray-900 dark:text-white font-medium">
                                    {values.budget
                                      ? `$${parseFloat(values.budget).toFixed(2)} USD`
                                      : "Not specified"}
                                  </p>
                                </div>
                                <div className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-lg">
                                  <p className="text-orange-800 dark:text-orange-300 font-medium text-sm">
                                    Milestone Payments
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment notice */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
                          <div className="flex items-start">
                            <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                Payment Information
                              </h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                Upon submission, you'll be prompted to make a payment of{" "}
                                <strong>
                                  ${parseFloat(values.budget || 0).toFixed(2)} USD
                                </strong>
                                . This amount will be held in escrow until the project is completed.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <Clock className="h-4 w-4 mr-1.5" />
                          <span>Estimated posting time: 1 minute</span>
                        </div>
                        <Button
                          type="submit"
                          disabled={!isValid || !dirty || createJobMutation.isPending}
                          isLoading={createJobMutation.isPending}
                          className="px-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                          Post Job
                        </Button>
                      </div>
                    </motion.div>
                  </Form>
                )}
              </Formik>
            </div>
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