import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../services/api';
import UserManagementTable from '../../components/admin/UserManagementTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorFallback from '../../components/common/ErrorFallback';

const UserManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin-users', currentPage, filters],
    queryFn: () => api.admin.getUsers({
      page: currentPage,
      limit: 10,
      ...filters
    }),
    keepPreviousData: true
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorFallback 
        error={error} 
        resetError={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <UserManagementTable
        users={data?.users || []}
        pagination={data?.pagination}
        onPageChange={handlePageChange}
        onFiltersChange={handleFiltersChange}
        filters={filters}
      />
    </div>
  );
};

export default UserManagement;