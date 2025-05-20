// src/components/profile/ProfileHeader.jsx
import { motion } from 'framer-motion';
import { Star, MapPin, Calendar, Briefcase, Edit } from 'lucide-react';
import Button from '../common/Button';

const ProfileHeader = ({ profile, isOwnProfile, onEditProfile }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cover Background */}
      <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative">
        {/* Edit Button (only for own profile) */}
        {isOwnProfile && (
          <motion.button
            onClick={onEditProfile}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Edit profile"
          >
            <Edit className="h-5 w-5 text-orange-500" />
          </motion.button>
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
                {profile.name.charAt(0).toUpperCase()}
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
              <span className="capitalize">{profile.title || profile.role}</span>
              {profile.location && (
                <>
                  <span className="mx-2">•</span>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.location}</span>
                </>
              )}
              {profile.createdAt && (
                <>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </>
              )}
            </p>
          </div>
          
          {profile.role === 'freelancer' && profile.rating > 0 && (
            <div className="mt-4 md:mt-0 flex items-center bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
              <div className="flex mr-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < Math.floor(profile.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : i < profile.rating 
                          ? 'text-yellow-400 fill-current opacity-50' 
                          : 'text-gray-300 dark:text-gray-600'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {profile.rating.toFixed(1)} ({profile.reviewsCount || 0} reviews)
              </span>
            </div>
          )}
        </div>
        
        {profile.bio && (
          <div className="mt-6">
            <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
          </div>
        )}
        
        {profile.role === 'freelancer' && profile.skills && profile.skills.length > 0 && (
          <div className="mt-6">
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
        )}
        
        {isOwnProfile && (
          <div className="mt-6">
            <Button 
              onClick={onEditProfile} 
              variant="outline"
              className="text-orange-500 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileHeader;