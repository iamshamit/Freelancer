// src/pages/profile/ProfilePage.jsx
import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
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
  X, 
  Check, 
  Star,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('about');
  
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
      ? api.user.getProfile().then(res => res.data)
      : api.user.getById(profileId).then(res => res.data),
    enabled: !!profileId,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (userData) => api.user.updateProfile(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', profileId] });
      setIsEditing(false);
    }
  });
  
  // Upload profile picture mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: (imageData) => api.user.uploadProfilePicture(imageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', profileId] });
    }
  });
  
  // Handle profile picture upload
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Get base64 string
        const base64String = reader.result.split(',')[1];
        uploadProfilePictureMutation.mutate(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = (values) => {
    updateProfileMutation.mutate(values);
  };
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login', { state: { from: location } });
    }
  }, [user, isLoading, navigate, location]);
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <SkeletonLoader type="profile" />
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Error loading profile: {error.message}
        </div>
      </DashboardLayout>
    );
  }
  
  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700">Profile not found</h2>
          <p className="text-gray-500 mt-2">The profile you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-[#003135] to-[#024950]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-[#0FAA4F]"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-[#AFDDE5]"></div>
          </div>
          
          {/* Edit Button (only for own profile) */}
          {isOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <Edit className="h-5 w-5 text-[#003135]" />
            </button>
          )}
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-8 w-32 h-32">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#024950] text-white">
                    <User className="h-16 w-16" />
                  </div>
                )}
              </div>
              
              {/* Camera icon for uploading (only for own profile) */}
              {isOwnProfile && (
                <label 
                  htmlFor="profilePicture"
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#0FAA4F] flex items-center justify-center cursor-pointer shadow-md hover:bg-opacity-90 transition-colors"
                >
                  <Camera className="h-5 w-5 text-white" />
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleProfilePictureUpload}
                    disabled={uploadProfilePictureMutation.isPending}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="pt-20 pb-6 px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#003135]">{profile.name}</h1>
              <p className="text-gray-600 flex items-center mt-1">
                <Briefcase className="h-4 w-4 mr-1" />
                <span className="capitalize">{profile.role}</span>
                {profile.joinedAt && (
                  <>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {format(new Date(profile.joinedAt), 'MMM yyyy')}</span>
                  </>
                )}
              </p>
            </div>
            
            {profile.role === 'freelancer' && profile.rating && (
              <div className="mt-4 md:mt-0 flex items-center bg-[#AFDDE5] bg-opacity-20 px-3 py-1 rounded-full">
                <div className="flex mr-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(profile.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : i < profile.rating 
                            ? 'text-yellow-400 fill-current opacity-50' 
                            : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-[#003135]">
                  {profile.rating.toFixed(1)} ({profile.reviewCount || 0} reviews)
                </span>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'about'
                    ? 'border-[#0FAA4F] text-[#0FAA4F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTab('about')}
              >
                About
              </button>
              {profile.role === 'freelancer' && (
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'reviews'
                      ? 'border-[#0FAA4F] text-[#0FAA4F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTab('reviews')}
                >
                  Reviews
                </button>
              )}
              {profile.role === 'freelancer' && (
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'portfolio'
                      ? 'border-[#0FAA4F] text-[#0FAA4F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTab('portfolio')}
                >
                  Portfolio
                </button>
              )}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {selectedTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isEditing ? (
                    <ProfileEditForm 
                      profile={profile} 
                      onSubmit={handleSubmit} 
                      onCancel={() => setIsEditing(false)}
                      isLoading={updateProfileMutation.isPending}
                    />
                  ) : (
                    <ProfileInfo profile={profile} />
                  )}
                </motion.div>
              )}
              
              {selectedTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileReviews profile={profile} />
                </motion.div>
              )}
              
              {selectedTab === 'portfolio' && (
                <motion.div
                  key="portfolio"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfilePortfolio profile={profile} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Profile Info Component
const ProfileInfo = ({ profile }) => {
  return (
    <div>
      {/* Bio */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#003135] mb-3">Bio</h2>
        <p className="text-gray-600">{profile.bio || 'No bio provided.'}</p>
      </div>
      
      {/* Contact Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#003135] mb-3">Contact Information</h2>
        <div className="space-y-3">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-[#0FAA4F] mt-0.5 mr-3" />
            <div>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-xs text-gray-500">Email</p>
            </div>
          </div>
          
          {profile.phone && (
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-[#0FAA4F] mt-0.5 mr-3" />
              <div>
                <p className="text-gray-600">{profile.phone}</p>
                <p className="text-xs text-gray-500">Phone</p>
              </div>
            </div>
          )}
          
          {profile.location && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-[#0FAA4F] mt-0.5 mr-3" />
              <div>
                <p className="text-gray-600">{profile.location}</p>
                <p className="text-xs text-gray-500">Location</p>
              </div>
            </div>
          )}
          
          {profile.website && (
            <div className="flex items-start">
              <Globe className="h-5 w-5 text-[#0FAA4F] mt-0.5 mr-3" />
              <div>
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#0FAA4F] hover:underline"
                >
                  {profile.website}
                </a>
                <p className="text-xs text-gray-500">Website</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Skills (for freelancers) */}
      {profile.role === 'freelancer' && profile.skills && profile.skills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#003135] mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span 
                key={skill}
                                className="inline-block px-3 py-1.5 bg-[#AFDDE5] bg-opacity-30 text-[#024950] rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Profile Edit Form Component
const ProfileEditForm = ({ profile, onSubmit, onCancel, isLoading }) => {
  const skillOptions = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'PHP', 'HTML/CSS',
    'UI/UX Design', 'Graphic Design', 'Content Writing', 'Digital Marketing',
    'SEO', 'Data Analysis', 'Mobile Development', 'WordPress', 'DevOps'
  ];
  
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    bio: Yup.string().required('Bio is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string(),
    location: Yup.string(),
    website: Yup.string().url('Must be a valid URL'),
    skills: profile.role === 'freelancer' 
      ? Yup.array().min(1, 'Please select at least one skill')
      : Yup.array()
  });
  
  const initialValues = {
    name: profile.name || '',
    bio: profile.bio || '',
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    website: profile.website || '',
    skills: profile.skills || []
  };
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched, values, setFieldValue }) => (
        <Form>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Field
                type="text"
                id="name"
                name="name"
                className={`
                  w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2
                  ${errors.name && touched.name 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#0FAA4F] focus:ring-opacity-50'
                  }
                `}
              />
              <ErrorMessage 
                name="name" 
                component="div" 
                className="mt-1 text-red-500 text-sm"
              />
            </div>
            
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <Field
                as="textarea"
                id="bio"
                name="bio"
                rows="4"
                className={`
                  w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2
                  ${errors.bio && touched.bio 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#0FAA4F] focus:ring-opacity-50'
                  }
                `}
              />
              <ErrorMessage 
                name="bio" 
                component="div" 
                className="mt-1 text-red-500 text-sm"
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Field
                type="email"
                id="email"
                name="email"
                className={`
                  w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2
                  ${errors.email && touched.email 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#0FAA4F] focus:ring-opacity-50'
                  }
                `}
              />
              <ErrorMessage 
                name="email" 
                component="div" 
                className="mt-1 text-red-500 text-sm"
              />
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <Field
                type="text"
                id="phone"
                name="phone"
                className={`
                  w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2
                  ${errors.phone && touched.phone 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#0FAA4F] focus:ring-opacity-50'
                  }
                `}
              />
              <ErrorMessage 
                name="phone" 
                component="div" 
                className="mt-1 text-red-500 text-sm"
              />
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location (optional)
              </label>
              <Field
                type="text"
                id="location"
                name="location"
                className={`
                  w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2
                  ${errors.location && touched.location 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#0FAA4F] focus:ring-opacity-50'
                  }
                `}
              />
              <ErrorMessage 
                name="location" 
                component="div" 
                className="mt-1 text-red-500 text-sm"
              />
            </div>
            
            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website (optional)
              </label>
              <Field
                type="text"
                id="website"
                name="website"
                className={`
                  w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2
                  ${errors.website && touched.website 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#0FAA4F] focus:ring-opacity-50'
                  }
                `}
              />
              <ErrorMessage 
                name="website" 
                component="div" 
                className="mt-1 text-red-500 text-sm"
              />
            </div>
            
            {/* Skills (for freelancers) */}
            {profile.role === 'freelancer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {skillOptions.map((skill) => (
                    <label 
                      key={skill}
                      className={`
                        inline-flex items-center px-3 py-1.5 rounded-full cursor-pointer transition-colors
                        ${values.skills.includes(skill) 
                          ? 'bg-[#0FAA4F] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={values.skills.includes(skill)}
                        onChange={() => {
                          const newSkills = values.skills.includes(skill)
                            ? values.skills.filter(s => s !== skill)
                            : [...values.skills, skill];
                          setFieldValue('skills', newSkills);
                        }}
                      />
                      {skill}
                    </label>
                  ))}
                </div>
                
                <ErrorMessage 
                  name="skills" 
                  component="div" 
                  className="mt-1 text-red-500 text-sm"
                />
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0FAA4F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0FAA4F] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0FAA4F] flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

// Profile Reviews Component
const ProfileReviews = ({ profile }) => {
  const reviews = profile.reviews || [];
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
          <div className="flex items-start">
            <div className="mr-4">
              {review.reviewer?.profilePicture ? (
                <img 
                  src={review.reviewer.profilePicture} 
                  alt={review.reviewer.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#024950] flex items-center justify-center text-white">
                  {review.reviewer?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <h3 className="font-medium text-[#003135]">{review.reviewer?.name || 'Anonymous'}</h3>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-600">{review.comment}</p>
              
              {review.jobTitle && (
                <div className="mt-2 text-sm text-gray-500">
                  Project: {review.jobTitle}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Profile Portfolio Component
const ProfilePortfolio = ({ profile }) => {
  const portfolio = profile.portfolio || [];
  
  if (portfolio.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No portfolio items yet.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {portfolio.map((item, index) => (
        <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {item.image && (
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="font-semibold text-[#003135]">{item.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center text-[#0FAA4F] text-sm hover:underline"
              >
                View Project <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePage;