// frontend/src/pages/dashboard/EmployerDashboard.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import api from '../../services/api';

// Placeholder components for tabs
const PostedJobs = () => <div>Posted Jobs Content</div>;
const OngoingJobs = () => <div>Ongoing Jobs Content</div>;
const CompletedJobs = () => <div>Completed Jobs Content</div>;

const EmployerDashboard = () => {
  // Fetch employer jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => api.job.getEmployerJobs().then(res => res.data),
  });

  const dashboardTabs = [
    {
      label: 'Posted Jobs',
      content: isLoading ? <SkeletonLoader type="card" count={3} /> : <PostedJobs jobs={jobs?.filter(job => job.status === 'open')} />
    },
    {
      label: 'Ongoing Jobs',
      content: isLoading ? <SkeletonLoader type="card" count={2} /> : <OngoingJobs jobs={jobs?.filter(job => job.status === 'assigned')} />
    },
    {
      label: 'Completed Jobs',
      content: isLoading ? <SkeletonLoader type="card" count={2} /> : <CompletedJobs jobs={jobs?.filter(job => job.status === 'completed')} />
    }
  ];

  return (
    <DashboardLayout role="employer" tabs={dashboardTabs} />
  );
};

export default EmployerDashboard;