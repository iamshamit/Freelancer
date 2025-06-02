// src/pages/profile/ProfilePage.jsx
import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Edit, 
  Camera, 
  Star,
  Calendar,
  ExternalLink,
  Save,
  X,
  Plus,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const ProfilePage = ({ darkMode, toggleDarkMode }) => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('about');
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Determine if viewing own profile or someone else's
  const profileId = id || (user ? user._id : null);
  const isOwnProfile = !id || (user && id === user._id);
  
  // Fetch profile data
  const { 
    data: profile, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => isOwnProfile 
      ? api.user.getProfile()
      : api.user.getById(profileId),
    enabled: !!profileId,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => api.user.updateProfile(profileData),
    onSuccess: () => {
      if (imageFile) {
        uploadProfilePictureMutation.mutate(imageFile);
      } else {
        queryClient.invalidateQueries(['profile', profileId]);
        setIsEditing(false);
      }
    },
  });
  
  // Upload profile picture mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: (file) => {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1];
          api.user.uploadProfilePicture(base64String)
            .then(resolve)
            .catch(reject);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', profileId]);
      setIsEditing(false);
      setImageFile(null);
      setPreviewImage(null);
    },
  });
  
  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login', { state: { from: location } });
    }
  }, [user, isLoading, navigate, location]);
  
  // Validation schema - matching the User model structure
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    bio: Yup.string().max(500, 'Bio must be 500 characters or less'),
    skills: Yup.array().of(Yup.string().required('Skill is required'))
  });
  
  if (isLoading) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <SkeletonLoader type="profile" />
          <div className="mt-8">
            <SkeletonLoader type="card" count={1} />
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            title="Error Loading Profile"
            description={error.message || "There was an error loading this profile."}
            icon={<AlertCircle className="h-12 w-12" />}
            actionText="Try Again"
            onAction={() => queryClient.invalidateQueries(['profile', profileId])}
          />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!profile) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            title="Profile Not Found"
            description="The profile you're looking for doesn't exist or you don't have permission to view it."
            icon={<User className="h-12 w-12" />}
          />
        </div>
      </DashboardLayout>
    );
  }
  
  // Initial form values - matching the User model structure
  const initialValues = {
    name: profile?.name || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    skills: profile?.skills || []
  };
  
  const isSaving = updateProfileMutation.isPending || uploadProfilePictureMutation.isPending;
  
  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isEditing ? (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              updateProfileMutation.mutate(values);
            }}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                {/* Edit Mode Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
                  {/* Cover Background */}
                  <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative">
                    {/* Save/Cancel Buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setImageFile(null);
                          setPreviewImage(null);
                        }}
                        className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={isSaving}
                        aria-label="Cancel editing"
                      >
                        <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        type="submit"
                        className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={isSaving}
                        aria-label="Save profile"
                      >
                        {isSaving ? (
                          <div className="h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="h-5 w-5 text-orange-500" />
                        )}
                      </button>
                    </div>
                    
                    {/* Profile Picture */}
                    <div className="absolute -bottom-16 left-8">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-700 shadow-md">
                          {previewImage ? (
                            <img 
                              src={previewImage} 
                              alt={values.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : profile.profilePicture ? (
                            <img 
                              src={profile.profilePicture} 
                              alt={profile.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white">
                              {values.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        {/* Camera icon for uploading */}
                        <label 
                          htmlFor="profilePicture"
                          className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer shadow-md hover:bg-orange-600 transition-colors"
                        >
                          <Camera className="h-5 w-5 text-white" />
                          <input
                            type="file"
                            id="profilePicture"
                            name="profilePicture"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                            disabled={isSaving}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Info Form */}
                  <div className="pt-20 pb-6 px-8">
                    <div className="mb-4">
                      <Field
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        className={`w-full text-2xl font-bold bg-transparent border-b-2 ${
                          errors.name && touched.name 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-200 dark:border-gray-700 focus:border-orange-500'
                        } text-gray-900 dark:text-white focus:outline-none`}
                        disabled={isSaving}
                      />
                      <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-500" />
                    </div>
                    
                    <div className="mb-4">
                      <Field
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        className={`w-full text-gray-600 dark:text-gray-400 bg-transparent border-b-2 ${
                          errors.email && touched.email 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-200 dark:border-gray-700 focus:border-orange-500'
                        } focus:outline-none`}
                        disabled={isSaving}
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span className="capitalize">{profile.role}</span>
                      {profile.createdAt && (
                        <>
                          <span className="mx-2">•</span>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Joined {format(new Date(profile.createdAt), 'MMM yyyy')}</span>
                        </>
                      )}
                    </p>
                    
                    {/* Tabs */}
                    <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
                      <nav className="flex space-x-8">
                        <button
                          type="button"
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            selectedTab === 'about'
                              ? 'border-orange-500 text-orange-500'
                              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          onClick={() => setSelectedTab('about')}
                        >
                          About
                        </button>
                        {profile.role === 'freelancer' && (
                          <button
                            type="button"
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                              selectedTab === 'skills'
                                ? 'border-orange-500 text-orange-500'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setSelectedTab('skills')}
                          >
                            Skills
                          </button>
                        )}
                        {profile.role === 'freelancer' && (
                          <button
                            type="button"
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                              selectedTab === 'reviews'
                                ? 'border-orange-500 text-orange-500'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setSelectedTab('reviews')}
                          >
                            Reviews
                          </button>
                        )}
                      </nav>
                    </div>
                    
                    {/* Tab Content - Edit Mode */}
                    <div className="mt-6">
                      <AnimatePresence mode="wait">
                        {selectedTab === 'about' && (
                          <motion.div
                                                        key="about-edit"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              {/* Bio */}
                              <div className="md:col-span-3">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h2>
                                <Field
                                  as="textarea"
                                  name="bio"
                                  rows="6"
                                  placeholder="Tell us about yourself..."
                                  className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.bio && touched.bio 
                                      ? 'border-red-500 focus:ring-red-500/30' 
                                      : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                                  disabled={isSaving}
                                />
                                <ErrorMessage name="bio" component="div" className="mt-1 text-sm text-red-500" />
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                                  {values.bio?.length || 0}/500 characters
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        {selectedTab === 'skills' && profile.role === 'freelancer' && (
                          <motion.div
                            key="skills-edit"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
                            
                            <FieldArray name="skills">
                              {({ push, remove }) => (
                                <div>
                                  {values.skills.length > 0 ? (
                                    <div className="space-y-4 mb-6">
                                      {values.skills.map((skill, index) => (
                                        <div key={index} className="flex items-center space-x-4">
                                          <div className="flex-1">
                                            <Field
                                              type="text"
                                              name={`skills.${index}`}
                                              placeholder="Skill name"
                                              className={`w-full px-4 py-2 rounded-lg border ${
                                                errors.skills?.[index] && touched.skills?.[index] 
                                                  ? 'border-red-500 focus:ring-red-500/30' 
                                                  : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                                              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                                              disabled={isSaving}
                                            />
                                            <ErrorMessage name={`skills.${index}`} component="div" className="mt-1 text-sm text-red-500" />
                                          </div>
                                          
                                          <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 focus:outline-none"
                                            disabled={isSaving}
                                          >
                                            <Trash2 className="h-5 w-5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
                                      <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
                                    </div>
                                  )}
                                  
                                  <button
                                    type="button"
                                    onClick={() => push('')}
                                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                                    disabled={isSaving}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Skill
                                  </button>
                                </div>
                              )}
                            </FieldArray>
                          </motion.div>
                        )}
                        
                        {selectedTab === 'reviews' && profile.role === 'freelancer' && (
                          <motion.div
                            key="reviews-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ProfileReviews profile={profile} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <>
            {/* View Mode */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
              {/* Cover Background */}
              <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative">
                {/* Edit Button (only for own profile) */}
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Edit profile"
                  >
                    <Edit className="h-5 w-5 text-orange-500" />
                  </button>
                )}
                
                {/* Profile Picture */}
                <div className="absolute -bottom-16 left-8">
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-700 shadow-md">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt={profile.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white">
                        <User className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="pt-20 pb-6 px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span className="capitalize">{profile.role}</span>
                      {profile.createdAt && (
                        <>
                          <span className="mx-2">•</span>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Joined {format(new Date(profile.createdAt), 'MMM yyyy')}</span>
                        </>
                      )}
                    </p>
                  </div>
                  
                  {profile.role === 'freelancer' && profile.averageRating > 0 && (
                    <div className="mt-4 md:mt-0 flex items-center bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                      <div className="flex mr-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(profile.averageRating) 
                                ? 'text-yellow-400 fill-current' 
                                : i < profile.averageRating 
                                  ? 'text-yellow-400 fill-current opacity-50' 
                                  : 'text-gray-300 dark:text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {profile.averageRating.toFixed(1)} ({profile.ratings?.length || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Tabs */}
                <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-8">
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        selectedTab === 'about'
                          ? 'border-orange-500 text-orange-500'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedTab('about')}
                    >
                      About
                    </button>
                    {profile.role === 'freelancer' && (
                      <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          selectedTab === 'skills'
                            ? 'border-orange-500 text-orange-500'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedTab('skills')}
                      >
                        Skills
                      </button>
                    )}
                    {profile.role === 'freelancer' && (
                      <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          selectedTab === 'reviews'
                            ? 'border-orange-500 text-orange-500'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedTab('reviews')}
                      >
                        Reviews
                      </button>
                    )}
                  </nav>
                </div>
                
                {/* Tab Content - View Mode */}
                <div className="mt-6">
                  <AnimatePresence mode="wait">
                    {selectedTab === 'about' && (
                      <motion.div
                        key="about-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProfileInfo profile={profile} />
                      </motion.div>
                    )}
                    
                    {selectedTab === 'skills' && profile.role === 'freelancer' && (
                      <motion.div
                        key="skills-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProfileSkills profile={profile} />
                      </motion.div>
                    )}
                    
                    {selectedTab === 'reviews' && profile.role === 'freelancer' && (
                      <motion.div
                        key="reviews-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProfileReviews profile={profile} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

// Profile Info Component (View Mode)
const ProfileInfo = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Bio */}
      <div className="md:col-span-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {profile.bio || 'No bio provided.'}
        </p>
      </div>
      {/* Contact Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h2>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-gray-800 dark:text-gray-200">{profile.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
            </div>
          </div>
          {profile.phone && (
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-gray-800 dark:text-gray-200">{profile.phone}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
              </div>
            </div>
          )}
          {profile.location && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-gray-800 dark:text-gray-200">{profile.location}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
              </div>
            </div>
          )}
          {profile.website && (
            <div className="flex items-start">
              <Globe className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:underline flex items-center"
                >
                  {profile.website}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
              </div>
            </div>
          )}
        </div>
        {/* Stats for freelancers */}
        {profile.role === 'freelancer' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Stats</h2>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Jobs Completed</span>
                <span className="font-medium text-gray-900 dark:text-white">{profile.completedJobs || 0}</span>
              </div>  
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Profile Skills Component (View Mode)
const ProfileSkills = ({ profile }) => {
  if (!profile.skills || profile.skills.length === 0) {
    return (
      <EmptyState
        title="No Skills Added"
        description="This profile hasn't added any skills yet."
        icon={<Briefcase className="h-12 w-12" />}
      />
    );
  }
  
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {profile.skills.map((skill, index) => (
          <span 
            key={index}
            className="inline-block px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-gray-800 dark:text-orange-300 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

// Profile Reviews Component
const ProfileReviews = ({ profile }) => {
  const reviews = profile.ratings || [];
  
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No Reviews Yet"
        description="This profile hasn't received any reviews yet."
        icon={<Star className="h-12 w-12" />}
      />
    );
  }
  
  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[5 - review.rating]++;
    }
  });
  
  return (
    <div>
      {/* Rating Summary */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center mb-6 md:mb-0 md:mr-8">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mr-4">
              {profile.averageRating ? profile.averageRating.toFixed(1) : '0.0'}
            </div>
            <div>
              <div className="flex mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.round(profile.averageRating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 gap-2">
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const count = ratingCounts[5 - rating];
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center mr-2 w-10">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center mt-1">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : 'Unknown date'}
                  </div>
                </div>
                <p className="mt-3 text-gray-700 dark:text-gray-300">
                  {review.review || "No comment provided."}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;