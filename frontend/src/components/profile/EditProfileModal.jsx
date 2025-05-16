// frontend/src/components/profile/EditProfileModal.jsx
import { useState, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import Button from '../common/Button';

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  bio: Yup.string()
    .max(500, 'Bio is too long'),
  skills: Yup.string()
    .test('skills-format', 'Skills should be comma separated', function(value) {
      if (!value) return true;
      const skills = value.split(',').map(skill => skill.trim());
      return skills.every(skill => skill.length > 0);
    })
});

const EditProfileModal = ({ isOpen, onClose, profile }) => {
  const { updateProfile, uploadProfilePicture, isAuthLoading } = useContext(AuthContext);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Format skills as array
      const formattedValues = {
        ...values,
        skills: values.skills ? values.skills.split(',').map(skill => skill.trim()) : []
      };
      
      // Update profile
      await updateProfile(formattedValues);
      
      // Upload profile picture if changed
      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result.split(',')[1];
          await uploadProfilePicture(base64String);
        };
        reader.readAsDataURL(imageFile);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="false">
              <div className="absolute inset-0 bg-gray-500 opacity-75">
                <motion.div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-dark-teal mb-4">
                      Edit Profile
                    </h3>
                    
                    <Formik
                      initialValues={{
                        name: profile.name || '',
                        email: profile.email || '',
                        bio: profile.bio || '',
                        skills: profile.skills ? profile.skills.join(', ') : '',
                        password: '',
                      }}
                      validationSchema={ProfileSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ isSubmitting, touched, errors }) => (
                        <Form className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Profile Picture
                            </label>
                            <div className="flex items-center">
                              <div className="mr-4">
                                {imagePreview ? (
                                  <img
                                    src={imagePreview}
                                    alt="Profile Preview"
                                    className="h-16 w-16 rounded-full object-cover"
                                  />
                                ) : profile.profilePicture ? (
                                  <img
                                    src={profile.profilePicture}
                                    alt={profile.name}
                                    className="h-16 w-16 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-16 w-16 rounded-full bg-deep-teal flex items-center justify-center text-white text-xl font-bold">
                                    {profile.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-jade-green file:text-white hover:file:bg-opacity-90"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <Field
                              id="name"
                              name="name"
                              type="text"
                              className={`appearance-none block w-full px-3 py-2 border ${
                                touched.name && errors.name ? 'border-rust' : 'border-gray-300'
                              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-jade-green focus:border-jade-green sm:text-sm`}
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
                              className={`appearance-none block w-full px-3 py-2 border ${
                                touched.email && errors.email ? 'border-rust' : 'border-gray-300'
                              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-jade-green focus:border-jade-green sm:text-sm`}
                            />
                            <ErrorMessage name="email" component="div" className="text-rust text-xs mt-1" />
                          </div>
                          
                          <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                              Bio
                            </label>
                            <Field
                              as="textarea"
                              id="bio"
                              name="bio"
                              rows="4"
                              className={`appearance-none block w-full px-3 py-2 border ${
                                touched.bio && errors.bio ? 'border-rust' : 'border-gray-300'
                              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-jade-green focus:border-jade-green sm:text-sm`}
                              placeholder="Tell us about yourself"
                            />
                            <ErrorMessage name="bio" component="div" className="text-rust text-xs mt-1" />
                          </div>
                          
                          {profile.role === 'freelancer' && (
                            <div>
                              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                                Skills (comma separated)
                              </label>
                              <Field
                                id="skills"
                                name="skills"
                                type="text"
                                className={`appearance-none block w-full px-3 py-2 border ${
                                  touched.skills && errors.skills ? 'border-rust' : 'border-gray-300'
                                                                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-jade-green focus:border-jade-green sm:text-sm`}
                                placeholder="e.g. Web Development, JavaScript, React"
                              />
                              <ErrorMessage name="skills" component="div" className="text-rust text-xs mt-1" />
                            </div>
                          )}
                          
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                              Password (leave blank to keep current)
                            </label>
                            <Field
                              id="password"
                              name="password"
                              type="password"
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-jade-green focus:border-jade-green sm:text-sm"
                              placeholder="••••••••"
                            />
                          </div>
                          
                          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={isAuthLoading}
                              className="w-full sm:ml-3 sm:w-auto"
                            >
                              {isAuthLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={onClose}
                              className="mt-3 w-full sm:mt-0 sm:w-auto"
                            >
                              Cancel
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            </motion.div>
              </div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;