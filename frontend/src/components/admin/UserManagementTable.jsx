// src/components/admin/UserManagementTable.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Mail, Calendar, Shield, ShieldOff,
  Eye, CheckCircle, AlertTriangle, Crown, Briefcase
} from 'lucide-react';
import Badge from '../common/Badge';
import Tooltip from '../common/Tooltip';

const Avatar = ({ src, alt, size = 'sm', fallback }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base'
  };

  const getFallbackInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src || imageError) {
    return (
      <div className={`
        ${sizeClasses[size]}
        bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium
        rounded-full flex items-center justify-center shadow-sm
      `}>
        {getFallbackInitials(fallback || alt)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImageError(true)}
      className={`
        ${sizeClasses[size]}
        rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm
      `}
    />
  );
};

const UserManagementTable = ({ 
  users, 
  pagination, 
  onPageChange, 
  onFiltersChange, 
  filters,
  onUserAction 
}) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Crown;
      case 'employer': return Briefcase;
      case 'freelancer': return Users;
      default: return Users;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'employer': return 'blue';
      case 'freelancer': return 'green';
      default: return 'gray';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users?.map((user, index) => {
              const RoleIcon = getRoleIcon(user.role);
              const isActive = user.accountStatus?.isActive !== false;
              
              return (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.profilePicture}
                        alt={user.name}
                        size="md"
                        fallback={user.name}
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <RoleIcon className={`w-4 h-4 ${
                        user.role === 'admin' ? 'text-red-500' :
                        user.role === 'employer' ? 'text-blue-500' :
                        'text-green-500'
                      }`} />
                      <Badge color={getRoleBadgeColor(user.role)} className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge color={isActive ? 'green' : 'red'}>
                        {isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tooltip content="View Profile">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onUserAction && onUserAction('view', user._id)}
                          className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </Tooltip>
                      
                      {isActive ? (
                        <Tooltip content="Suspend User">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onUserAction && onUserAction('suspend', user._id)}
                            className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </motion.button>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Activate User">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onUserAction && onUserAction('activate', user._id)}
                            className="p-2 text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                          >
                            <Shield className="w-4 h-4" />
                          </motion.button>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementTable;