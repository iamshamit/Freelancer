// frontend/src/pages/profile/ProfilePage.jsx
import { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import Layout from '../../components/layout/Layout';
import ProfileHeader from '../../components/profile/ProfileHeader';
import EditProfileModal from '../../components/profile/EditProfileModal';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Card from '../../components/common/Card';

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Determine if viewing own profile
  const isOwnProfile = !id || id === user?._id;
  const profileId = isOwnProfile ? user?._id : id;

  // Fetch profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => isOwnProfile 
      ? api.user.getProfile().then(res => res.data)
      : api.user.getById(profileId).then(res => res.data),
    enabled: !!profileId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <SkeletonLoader type="profile" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-rust bg-opacity-10 border border-rust text-rust px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Failed to load profile. Please try again later.</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-rust bg-opacity-10 border border-rust text-rust px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Profile not found.</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            onEditProfile={() => setIsEditModalOpen(true)}
          />
          
          {profile.role === 'freelancer' && profile.ratings && profile.ratings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-dark-teal mb-4">Ratings & Reviews</h2>
              <div className="space-y-4">
                {profile.ratings.map((rating, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        {rating.from?.profilePicture ? (
                          <img
                            src={rating.from.profilePicture}
                            alt={rating.from.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-deep-teal flex items-center justify-center text-white">
                            {rating.from?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-medium text-dark-teal">{rating.from?.name || 'Anonymous'}</p>
                          <div className="ml-2 flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < rating.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mt-1">{rating.review}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
          
          {isOwnProfile && (
            <EditProfileModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              profile={profile}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;