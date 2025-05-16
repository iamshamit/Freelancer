// frontend/src/components/profile/ProfileHeader.jsx
import { useContext } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import Button from '../common/Button';

const ProfileHeader = ({ profile, isOwnProfile, onEditProfile }) => {
  const { user } = useContext(AuthContext);

  return (
    <motion.div
      className="bg-white shadow rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row items-center">
        <div className="mb-4 md:mb-0 md:mr-6">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-deep-teal flex items-center justify-center text-white text-2xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-dark-teal">{profile.name}</h2>
          <p className="text-gray-600 capitalize">{profile.role}</p>
          
          {profile.role === 'freelancer' && (
            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start">
              <div className="flex items-center mr-4">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="font-medium">{profile.averageRating || 'No ratings'}</span>
                {profile.ratings && profile.ratings.length > 0 && (
                  <span className="text-gray-500 text-sm ml-1">({profile.ratings.length})</span>
                )}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">{profile.completedJobs || 0}</span> jobs completed
              </div>
            </div>
          )}
        </div>
        
        {isOwnProfile && (
          <div className="mt-4 md:mt-0">
            <Button onClick={onEditProfile} variant="outline">
              Edit Profile
            </Button>
          </div>
        )}
      </div>
      
      {profile.bio && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-dark-teal mb-2">About</h3>
          <p className="text-gray-600">{profile.bio}</p>
        </div>
      )}
      
      {profile.role === 'freelancer' && profile.skills && profile.skills.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-dark-teal mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-light-aqua text-deep-teal px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileHeader;