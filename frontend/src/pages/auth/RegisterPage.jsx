// src/pages/auth/RegisterPage.jsx
import { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  User,
  ChevronLeft,
  ChevronRight,
  Upload,
  Check,
  X,
  Camera,
  ArrowLeft,
  Building,
  AlertCircle,
  Search
} from "lucide-react";
import AuthContext from "../../context/AuthContext";

const RegisterPage = () => {
  const { register, isAuthLoading, error, clearError } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    skills: [],
    bio: "",
    profilePicture: null,
    profilePicturePreview: null,
  });

  // Get role from URL query params if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    if (roleParam && ["freelancer", "employer"].includes(roleParam)) {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [location]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

  const handleNext = (values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  // In RegisterPage.jsx
const handleImageUpload = (e, setFieldValue) => {
  const file = e.target.files[0];
  if (file) {
    setFieldValue('profilePicture', file);
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      setFormData(prev => ({ 
        ...prev, 
        profilePicturePreview: base64String,
        profilePicture: file
      }));
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async (values) => {
  try {
    if (clearError) clearError();
    
    // Prepare the registration data
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      bio: formData.bio || ''
    };
    
    // Add skills only for freelancers
    if (formData.role === 'freelancer' && formData.skills) {
      userData.skills = Array.isArray(formData.skills) ? formData.skills : [];
    } else {
      userData.skills = [];
    }
    
    // Include the base64 image data if available
    if (formData.profilePicturePreview) {
      userData.profilePicture = formData.profilePicturePreview;
    }
    
    // Call the register function from AuthContext
    await register(userData);
    
  } catch (err) {
    console.error('Registration error:', err);
  }
};


  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
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
            repeatType: "reverse",
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
            delay: 1,
          }}
        />
        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" />
      </div>

      {/* Content container */}
      <div className="container mx-auto px-4 py-10 z-10">
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

        <div className="max-w-3xl mx-auto">
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={`text-4xl font-bold text-white`}>
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Join Nex</span>ara
              </span>
            <p className="text-gray-400">
              Create your account in a few simple steps
            </p>
          </motion.div>

          <motion.div
            className="bg-[#1e293b] rounded-2xl shadow-xl overflow-hidden border border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ backdropFilter: "blur(16px)" }}
          >
            {/* Progress Bar */}
            <div className="bg-[#131e2f] p-6 border-b border-gray-700/50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {step === 1
                    ? "Basic Information"
                    : step === 2
                    ? "Professional Details"
                    : "Complete Your Profile"}
                </h2>
                <div className="text-orange-400 font-medium">
                  Step {step} of 3
                </div>
              </div>

              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600"
                  initial={{ width: `${(step - 1) * 33.33}%` }}
                  animate={{ width: `${step * 33.33}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Form Steps */}
            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <StepOne
                      initialValues={{
                        role: formData.role || "",
                        name: formData.name || "",
                        email: formData.email || "",
                        password: formData.password || "",
                      }}
                      onNext={handleNext}
                      error={error}
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <StepTwo
                      initialValues={{
                        skills: formData.skills || [],
                        bio: formData.bio || "",
                      }}
                      role={formData.role}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      error={error}
                    />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <StepThree
                      initialValues={{
                        profilePicture: formData.profilePicture || null,
                      }}
                      profilePicturePreview={formData.profilePicturePreview}
                      formData={formData}
                      onSubmit={handleSubmit}
                      onPrevious={handlePrevious}
                      error={error}
                      isLoading={isAuthLoading}
                      handleImageUpload={handleImageUpload}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            className="text-center mt-6 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-orange-400 font-medium hover:text-orange-300 transition-colors"
              aria-label="Log in to your account"
            >
              Sign in
            </Link>
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

// Step 1: Basic Information
const StepOne = ({ initialValues, onNext, error }) => {
  const formControls = useAnimation();

  const validationSchema = Yup.object({
    role: Yup.string().required("Please select a role"),
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const handleValidationError = () => {
    formControls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    });
  };

  return (
    <motion.div animate={formControls}>
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
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onNext}
        onSubmitError={handleValidationError}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }) => (
          <Form>
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-3">
                I want to join as:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.div
                  className={`
                    relative block cursor-pointer rounded-lg border p-2.5
                    ${
                      errors.role && touched.role
                        ? "border-red-500/50"
                        : values.role === "freelancer"
                        ? "border-orange-500 bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                        : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/30"
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFieldValue("role", "freelancer")}
                >
                  <input
                    type="radio"
                    name="role"
                    value="freelancer"
                    checked={values.role === "freelancer"}
                    onChange={() => {}}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          values.role === "freelancer"
                            ? "text-white"
                            : "text-gray-200"
                        }`}
                      >
                        Freelancer
                      </span>
                      <p
                        className={`text-xs ${
                          values.role === "freelancer"
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        I want to find work and get hired
                      </p>
                    </div>
                  </div>
                  {values.role === "freelancer" && (
                    <div className="absolute top-2 right-2">
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="h-3 w-3 text-orange-500" />
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className={`
                    relative block cursor-pointer rounded-lg border p-2.5
                    ${
                      errors.role && touched.role
                        ? "border-red-500/50"
                        : values.role === "employer"
                        ? "border-orange-500 bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                        : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/30"
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFieldValue("role", "employer")}
                >
                  <input
                    type="radio"
                    name="role"
                    value="employer"
                    checked={values.role === "employer"}
                    onChange={() => {}}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                      <Building className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          values.role === "employer"
                            ? "text-white"
                            : "text-gray-200"
                        }`}
                      >
                        Employer
                      </span>
                      <p
                        className={`text-xs ${
                          values.role === "employer"
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        I want to hire talented freelancers
                      </p>
                    </div>
                  </div>
                  {values.role === "employer" && (
                    <div className="absolute top-2 right-2">
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="h-3 w-3 text-orange-500" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              <ErrorMessage
                name="role"
                component={motion.div}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-red-400 text-sm"
              />
            </div>

            {/* Name */}
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-gray-300 font-medium mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <Field
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  className={`
                    w-full pl-4 pr-4 py-4 rounded-xl border bg-[#0f172a]/50 text-white
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${
                      errors.name && touched.name
                        ? "border-red-500/50 focus:ring-red-500/30"
                        : "border-gray-700 focus:ring-orange-500/30 focus:border-orange-500/50"
                    }
                    [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0f172a_inset]
                    [&:-webkit-autofill]:text-fill-color-white
                  `}
                />
              </div>
              <ErrorMessage
                name="name"
                component={motion.div}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-red-400 text-sm"
              />
            </div>

            {/* Email */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-300 font-medium mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Field
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  className={`
                    w-full pl-4 pr-4 py-4 rounded-xl border bg-[#0f172a]/50 text-white
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${
                      errors.email && touched.email
                        ? "border-red-500/50 focus:ring-red-500/30"
                        : "border-gray-700 focus:ring-orange-500/30 focus:border-orange-500/50"
                    }
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
            </div>

            {/* Password */}
            <div className="mb-8">
              <label
                htmlFor="password"
                className="block text-gray-300 font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Field
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a secure password"
                  className={`
                    w-full pl-4 pr-4 py-4 rounded-xl border bg-[#0f172a]/50 text-white
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${
                      errors.password && touched.password
                        ? "border-red-500/50 focus:ring-red-500/30"
                        : "border-gray-700 focus:ring-orange-500/30 focus:border-orange-500/50"
                    }
                    [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0f172a_inset]
                    [&:-webkit-autofill]:text-fill-color-white
                  `}
                />
              </div>
              <ErrorMessage
                name="password"
                component={motion.div}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-red-400 text-sm"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-70 shadow-lg shadow-orange-500/10"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              Continue <ChevronRight className="ml-2 h-5 w-5 inline" />
            </motion.button>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
};

// Step 2: Professional Information
const StepTwo = ({ initialValues, role, onNext, onPrevious, error }) => {
  const formControls = useAnimation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Organized skill clusters
  const skillClusters = {
    'Frontend Development': {
      icon: '🌐',
      skills: ['JavaScript', 'React', 'Vue.js', 'Angular', 'HTML/CSS', 'TypeScript', 'Sass/SCSS']
    },
    'Backend Development': {
      icon: '⚙️',
      skills: ['Node.js', 'Python', 'Java', 'PHP', 'C#', 'Ruby', 'Go', 'Express.js']
    },
    'Mobile Development': {
      icon: '📱',
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic', 'Xamarin']
    },
    'Design & Creative': {
      icon: '🎨',
      skills: ['UI/UX Design', 'Graphic Design', 'Adobe Photoshop', 'Figma', 'Sketch', 'Illustrator', 'Canva']
    },
    'Marketing & Content': {
      icon: '📈',
      skills: ['Digital Marketing', 'SEO', 'Content Writing', 'Social Media Marketing', 'Email Marketing', 'Copywriting', 'Google Ads']
    },
    'Data & Analytics': {
      icon: '📊',
      skills: ['Data Analysis', 'Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Google Analytics', 'Machine Learning']
    },
    'DevOps & Cloud': {
      icon: '☁️',
      skills: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Azure', 'Google Cloud']
    },
    'CMS & Platforms': {
      icon: '🔧',
      skills: ['WordPress', 'Shopify', 'Drupal', 'Webflow', 'Squarespace', 'Magento']
    }
  };

  // Skill relationships for suggestions
  const skillRelationships = {
    'JavaScript': ['React', 'Node.js', 'TypeScript', 'Vue.js', 'Angular'],
    'React': ['JavaScript', 'TypeScript', 'Node.js', 'React Native'],
    'Node.js': ['JavaScript', 'Express.js', 'MongoDB', 'DevOps'],
    'Python': ['Data Analysis', 'Machine Learning', 'Django', 'Flask'],
    'UI/UX Design': ['Figma', 'Adobe Photoshop', 'Sketch', 'Graphic Design'],
    'Digital Marketing': ['SEO', 'Google Ads', 'Social Media Marketing', 'Content Writing'],
    'SEO': ['Digital Marketing', 'Google Analytics', 'Content Writing'],
    'WordPress': ['PHP', 'HTML/CSS', 'JavaScript']
  };

  // Get all skills flattened
  const allSkills = useMemo(() => {
    return Object.values(skillClusters).flatMap(cluster => cluster.skills);
  }, []);

  // Filter skills based on search and category
  const filteredSkills = useMemo(() => {
    let skills = allSkills;
    
    if (activeCategory !== 'all') {
      skills = skillClusters[activeCategory]?.skills || [];
    }
    
    if (searchTerm) {
      skills = skills.filter(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return skills;
  }, [searchTerm, activeCategory, allSkills]);

  // Get suggested skills based on selected skills
  const getSuggestedSkills = (selectedSkills) => {
    const suggestions = new Set();
    
    selectedSkills.forEach(skill => {
      if (skillRelationships[skill]) {
        skillRelationships[skill].forEach(related => {
          if (!selectedSkills.includes(related)) {
            suggestions.add(related);
          }
        });
      }
    });
    
    return Array.from(suggestions).slice(0, 6); // Limit suggestions
  };

  const validationSchema = Yup.object({
    skills:
      role === "freelancer"
        ? Yup.array()
            .min(1, "Please select at least one skill")
            .required("Skills are required")
        : Yup.array(),
    bio: Yup.string().required("Bio is required"),
  });

  const handleValidationError = () => {
    formControls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    });
  };

  return (
    <motion.div animate={formControls}>
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
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onNext}
        onSubmitError={handleValidationError}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }) => {
          const suggestedSkills = getSuggestedSkills(values.skills || []);
          
          return (
            <Form>
              {/* Skills (for freelancers) */}
              {role === "freelancer" && (
                <div className="mb-8">
                  <label className="block text-gray-300 font-medium mb-2">
                    Skills
                  </label>
                  <div className="mb-4 text-sm text-gray-400">
                    Select the skills you want to offer to potential clients
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-700 bg-[#0f172a]/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === 'all'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      All Skills
                    </button>
                    {Object.entries(skillClusters).map(([category, data]) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                          activeCategory === category
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <span>{data.icon}</span>
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Selected Skills Display */}
                  {values.skills && values.skills.length > 0 && (
                    <div className="mb-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                      <div className="text-sm text-gray-300 mb-2">
                        Selected Skills ({values.skills.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {values.skills.map((skill) => (
                          <motion.span
                            key={skill}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => {
                                const newSkills = values.skills.filter(s => s !== skill);
                                setFieldValue("skills", newSkills);
                              }}
                              className="ml-2 hover:bg-orange-600 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Skills */}
                  {suggestedSkills.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
                      <div className="text-sm text-blue-300 mb-2">
                        💡 Suggested skills based on your selection:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSkills.map((skill) => (
                          <motion.button
                            key={skill}
                            type="button"
                            onClick={() => {
                              if (!values.skills.includes(skill)) {
                                setFieldValue("skills", [...values.skills, skill]);
                              }
                            }}
                            className="px-3 py-1 rounded-full bg-blue-800/30 text-blue-300 border border-blue-600/30 hover:bg-blue-700/40 text-sm transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            + {skill}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Grid */}
                  <div className="flex flex-wrap gap-2 mb-2 max-h-64 overflow-y-auto p-2">
                    {filteredSkills.map((skill) => (
                      <motion.label
                        key={skill}
                        className={`
                          inline-flex items-center px-4 py-2 rounded-full cursor-pointer transition-colors
                          ${
                            values.skills?.includes(skill)
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                              : "bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-gray-600"
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={values.skills?.includes(skill) || false}
                          onChange={() => {
                            const currentSkills = values.skills || [];
                            const newSkills = currentSkills.includes(skill)
                              ? currentSkills.filter((s) => s !== skill)
                              : [...currentSkills, skill];
                            setFieldValue("skills", newSkills);
                          }}
                        />
                        {skill}
                      </motion.label>
                    ))}
                  </div>

                  {/* No results message */}
                  {filteredSkills.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-gray-400">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No skills found for "{searchTerm}"</p>
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="text-orange-400 hover:text-orange-300 text-sm mt-2"
                      >
                        Clear search
                      </button>
                    </div>
                  )}

                  <ErrorMessage
                    name="skills"
                    component={motion.div}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-red-400 text-sm"
                  />
                </div>
              )}

              {/* Bio */}
              <div className="mb-8">
                <label
                  htmlFor="bio"
                  className="block text-gray-300 font-medium mb-2"
                >
                  {role === "freelancer"
                    ? "Professional Bio"
                    : "Company Description"}
                </label>
                <div className="mb-3 text-sm text-gray-400">
                  {role === "freelancer"
                    ? "Tell clients about your expertise and experience"
                    : "Tell freelancers about your company and projects"}
                </div>
                <Field
                  as="textarea"
                  id="bio"
                  name="bio"
                  rows="4"
                  placeholder={
                    role === "freelancer"
                      ? "I am a professional with experience in..."
                      : "Our company specializes in..."
                  }
                  className={`
                    w-full px-4 py-4 rounded-xl border bg-[#0f172a]/50 text-white
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${
                      errors.bio && touched.bio
                        ? "border-red-500/50 focus:ring-red-500/30"
                        : "border-gray-700 focus:ring-orange-500/30 focus:border-orange-500/50"
                    }
                  `}
                />
                <ErrorMessage
                  name="bio"
                  component={motion.div}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-red-400 text-sm"
                />
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="button"
                  onClick={onPrevious}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center border border-gray-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-70 shadow-lg shadow-orange-500/10"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue <ChevronRight className="ml-2 h-5 w-5" />
                </motion.button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </motion.div>
  );
};


// Step 3: Profile Picture & Completion
const StepThree = ({
  initialValues,
  profilePicturePreview,
  formData,
  onSubmit,
  onPrevious,
  error,
  isLoading,
  handleImageUpload,
}) => {
  const formControls = useAnimation();

  const handleValidationError = () => {
    formControls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    });
  };

  return (
    <motion.div animate={formControls}>
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
        initialValues={initialValues}
        onSubmit={onSubmit}
        onSubmitError={handleValidationError}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            {/* Profile Picture */}
            <div className="mb-8">
              <label className="block text-gray-300 font-medium mb-4">
                Profile Picture
              </label>

              <div className="flex flex-col items-center">
                <motion.div
                  className="mb-6 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-800 border-4 border-gray-700 shadow-lg shadow-black/30">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400">
                        <User className="h-20 w-20" />
                      </div>
                    )}
                  </div>

                  <motion.label
                    htmlFor="profilePicture"
                    className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center cursor-pointer shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera className="h-6 w-6 text-white" />
                    <input
                      type="file"
                      id="profilePicture"
                      name="profilePicture"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleImageUpload(e, setFieldValue)}
                    />
                  </motion.label>
                </motion.div>

                <div className="text-sm text-gray-400 text-center max-w-xs">
                  Upload a professional profile picture. A clear, friendly
                  headshot works best.
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-[#131e2f] rounded-xl p-6 mb-8 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">
                Account Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
                  <span className="text-gray-400">Name</span>
                  <span className="font-medium text-white">
                    {formData.name}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
                  <span className="text-gray-400">Email</span>
                  <span className="font-medium text-white">
                    {formData.email}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
                  <span className="text-gray-400">Role</span>
                  <span className="font-medium text-white capitalize">
                    {formData.role}
                  </span>
                </div>
                {formData.role === "freelancer" &&
                  formData.skills.length > 0 && (
                    <div>
                      <div className="text-gray-400 mb-2">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-block px-3 py-1 bg-gray-800 text-orange-400 text-sm rounded-full border border-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex space-x-4">
              <motion.button
                type="button"
                onClick={onPrevious}
                disabled={isLoading}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center border border-gray-700 disabled:opacity-70"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </motion.button>

              <motion.button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-70 shadow-lg shadow-orange-500/10"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin mr-2 h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                    >
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
                    Creating Account...
                  </div>
                ) : (
                  <>Complete Registration</>
                )}
              </motion.button>
            </div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
};

export default RegisterPage;
