// src/components/profile/EditProfileModal.jsx
import { useState, useContext, useRef, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Plus, Trash2, Loader } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const EditProfileModal = ({ isOpen, onClose, profile }) => {
  const { updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('basic');
  const [previewImage, setPreviewImage] = useState(profile?.profilePicture || null);
  const [imageFile, setImageFile] = useState(null);
  const modalRef = useRef(null);
  const queryClient = useQueryClient();
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => api.user.updateProfile(profileData),
    onSuccess: () => {
      if (imageFile) {
        uploadProfilePictureMutation.mutate(imageFile);
      } else {
        queryClient.invalidateQueries(['profile', profile._id]);
        onClose();
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
      queryClient.invalidateQueries(['profile', profile._id]);
      onClose();
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
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    title: Yup.string(),
    bio: Yup.string().max(500, 'Bio must be 500 characters or less'),
    location: Yup.string(),
    website: Yup.string().url('Must be a valid URL'),
    skills: Yup.array().of(
      Yup.object({
        name: Yup.string().required('Skill name is required'),
        level: Yup.string().oneOf(['beginner', 'intermediate', 'advanced', 'expert'], 'Invalid skill level'),
      })
    ),
  });
  
  // Initial form values
  const initialValues = {
    name: profile?.name || '',
    email: profile?.email || '',
    title: profile?.title || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    skills: profile?.skills?.map(skill => {
      if (typeof skill === 'string') {
        return { name: skill, level: 'intermediate' };
      }
      return skill;
    }) || [],
  };
  
  const isLoading = updateProfileMutation.isPending || uploadProfilePictureMutation.isPending;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'basic'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            disabled={isLoading}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'skills'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            disabled={isLoading}
          >
            Skills
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              updateProfileMutation.mutate(values);
            }}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <AnimatePresence mode="wait">
                  {activeTab === 'basic' && (
                    <motion.div
                      key="basic"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Profile Picture */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Profile Picture
                        </label>
                        <div className="flex items-center">
                          <div className="relative mr-4">
                            <img
                              src={previewImage || profile.profilePicture || "/default-avatar.png"}
                              alt="Profile"
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            />
                            <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-full cursor-pointer">
                              <Camera className="h-4 w-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                disabled={isLoading}
                              />
                            </label>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p>Upload a new profile picture</p>
                            <p>JPG, PNG or GIF, max 5MB</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Name */}
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Name
                        </label>
                        <Field
                                                    type="text"
                          id="name"
                          name="name"
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.name && touched.name 
                              ? 'border-red-500 focus:ring-red-500/30' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                          disabled={isLoading}
                        />
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-500" />
                      </div>
                      
                      {/* Email */}
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.email && touched.email 
                              ? 'border-red-500 focus:ring-red-500/30' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                          disabled={isLoading}
                        />
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
                      </div>
                      
                      {/* Title */}
                      <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Professional Title
                        </label>
                        <Field
                          type="text"
                          id="title"
                          name="title"
                          placeholder="e.g. Full Stack Developer"
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.title && touched.title 
                              ? 'border-red-500 focus:ring-red-500/30' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                          disabled={isLoading}
                        />
                        <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-500" />
                      </div>
                      
                      {/* Location */}
                      <div className="mb-4">
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <Field
                          type="text"
                          id="location"
                          name="location"
                          placeholder="e.g. New York, USA"
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.location && touched.location 
                              ? 'border-red-500 focus:ring-red-500/30' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                          disabled={isLoading}
                        />
                        <ErrorMessage name="location" component="div" className="mt-1 text-sm text-red-500" />
                      </div>
                      
                      {/* Website */}
                      <div className="mb-4">
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website
                        </label>
                        <Field
                          type="text"
                          id="website"
                          name="website"
                          placeholder="e.g. https://yourwebsite.com"
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.website && touched.website 
                              ? 'border-red-500 focus:ring-red-500/30' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                          disabled={isLoading}
                        />
                        <ErrorMessage name="website" component="div" className="mt-1 text-sm text-red-500" />
                      </div>
                      
                      {/* Bio */}
                      <div className="mb-4">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bio
                        </label>
                        <Field
                          as="textarea"
                          id="bio"
                          name="bio"
                          rows="4"
                          placeholder="Tell us about yourself..."
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.bio && touched.bio 
                              ? 'border-red-500 focus:ring-red-500/30' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                          disabled={isLoading}
                        />
                        <ErrorMessage name="bio" component="div" className="mt-1 text-sm text-red-500" />
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                          {values.bio?.length || 0}/500 characters
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-6">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('skills')}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                          disabled={isLoading}
                        >
                          Next: Skills
                        </button>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'skills' && (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Skills</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add skills to showcase your expertise
                          </p>
                        </div>
                        
                        <FieldArray name="skills">
                          {({ push, remove }) => (
                            <div>
                              {values.skills.length > 0 ? (
                                <div className="space-y-4 mb-4">
                                  {values.skills.map((skill, index) => (
                                    <div key={index} className="flex items-center space-x-4">
                                      <div className="flex-1">
                                        <Field
                                          type="text"
                                          name={`skills.${index}.name`}
                                          placeholder="Skill name"
                                          className={`w-full px-4 py-2 rounded-lg border ${
                                            errors.skills?.[index]?.name && touched.skills?.[index]?.name 
                                              ? 'border-red-500 focus:ring-red-500/30' 
                                              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                                          disabled={isLoading}
                                        />
                                        <ErrorMessage name={`skills.${index}.name`} component="div" className="mt-1 text-sm text-red-500" />
                                      </div>
                                      
                                      <div className="w-40">
                                        <Field
                                          as="select"
                                          name={`skills.${index}.level`}
                                          className={`w-full px-4 py-2 rounded-lg border ${
                                            errors.skills?.[index]?.level && touched.skills?.[index]?.level 
                                              ? 'border-red-500 focus:ring-red-500/30' 
                                              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
                                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                                          disabled={isLoading}
                                        >
                                          <option value="">Select level</option>
                                          <option value="beginner">Beginner</option>
                                          <option value="intermediate">Intermediate</option>
                                          <option value="advanced">Advanced</option>
                                          <option value="expert">Expert</option>
                                        </Field>
                                        <ErrorMessage name={`skills.${index}.level`} component="div" className="mt-1 text-sm text-red-500" />
                                      </div>
                                      
                                      <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 focus:outline-none"
                                        disabled={isLoading}
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
                                  <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
                                </div>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => push({ name: '', level: '' })}
                                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                                disabled={isLoading}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Skill
                              </button>
                            </div>
                          )}
                        </FieldArray>
                      </div>
                      
                      <div className="flex justify-between mt-6">
                        <button
                          type="button"
                          onClick={() => setActiveTab('basic')}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                          disabled={isLoading}
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-70 flex items-center"
                        >
                          {isLoading ? (
                            <>
                              <Loader className="animate-spin h-4 w-4 mr-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Profile'
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Form>
            )}
          </Formik>
        </div>
      </motion.div>
    </div>
  );
};

export default EditProfileModal;