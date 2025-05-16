// frontend/src/pages/dashboard/FreelancerDashboard.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import api from '../../services/api';

// Placeholder components for tabs
const AvailableJobs = () => <div>Available Jobs Content</div>;
const MyApplications = () => <div>My Applications Content</div>;
const OngoingJobs = () => <div>Ongoing Jobs Content</div>;
const CompletedJobs = () => <div>Completed Jobs Content</div>;

const FreelancerDashboard = () => {
  // Fetch freelancer jobs
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['freelancer-jobs'],
    queryFn: () => api.job.getFreelancerJobs().then(res => res.data),
  });

  const dashboardTabs = [
    {
      label: 'Available Jobs',
      content: <AvailableJobs />
    },
    {
      label: 'My Applications',
      content: isLoading ? <SkeletonLoader type="card" count={3} /> : <MyApplications jobs={jobsData?.applied} />
    },
    {
      label: 'Ongoing Jobs',
      content: isLoading ? <SkeletonLoader type="card" count={2} /> : <OngoingJobs jobs={jobsData?.assigned} />
    },
    {
      label: 'Completed Jobs',
      content: isLoading ? <SkeletonLoader type="card" count={2} /> : <CompletedJobs jobs={jobsData?.completed} />
    }
  ];

  return (
    <DashboardLayout role="freelancer" tabs={dashboardTabs} />
  );
};

export default FreelancerDashboard;