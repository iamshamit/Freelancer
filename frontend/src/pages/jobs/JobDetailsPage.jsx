// src/pages/jobs/JobDetailPage.jsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobStatusBadge from '../../components/jobs/JobStatusBadge';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const JobDetailPage = ({ darkMode, toggleDarkMode }) => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showApplySuccess, setShowApplySuccess] = useState(false);
  
  // Fetch job details
  const { 
    data: job, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.job.getById(id),
  });
  
  // Apply to job mutation
  const applyMutation = useMutation({
    mutationFn: () => api.job.apply(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['job', id]);
      setShowApplySuccess(true);
      setTimeout(() => setShowApplySuccess(false), 3000);
    },
  });
  
  if (isLoading) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <SkeletonLoader type="card" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Error Loading Job"
            description={error.message || "There was an error loading this job."}
            icon={<AlertCircle className="h-12 w-12" />}
            actionText="Go Back"
            actionLink="/jobs"
          />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!job) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Job Not Found"
            description="The job you're looking for doesn't exist or has been removed."
            icon={<Briefcase className="h-12 w-12" />}
            actionText="Browse Jobs"
            actionLink="/jobs"
          />
        </div>
      </DashboardLayout>
    );
  }
  
  console.log('Job data:', job);

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success message */}
          {showApplySuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 rounded-lg flex items-center"
            >
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Application submitted successfully!</span>
            </motion.div>
          )}
          
          {/* Job header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {job.title}
                </h1>
                <JobStatusBadge status={job.status} />
              </div>
              
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span>${typeof job.budget === 'number' ? job.budget.toFixed(2) : 'N/A'}</span>
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 mr-1" />
                  <span>Posted on {format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Briefcase className="h-5 w-5 mr-1" />
                  <span>{job.domain.name}</span>
                </div>
              </div>
              
              {/* Employer info */}
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-3">
                  {job.employer?.profilePicture ? (
                    <img 
                      src={job.employer.profilePicture} 
                      alt={job.employer.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {job.employer?.name || 'Anonymous Employer'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {job.employer?.completedJobs || 0} jobs posted
                  </p>
                </div>
              </div>
              
              {/* Apply button */}
              {job.status === 'open' && (
                <div className="mb-6">
                  <Button
                    onClick={() => applyMutation.mutate()}
                    isLoading={applyMutation.isPending}
                    disabled={job.hasApplied || applyMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {job.hasApplied ? 'Already Applied' : 'Apply Now'}
                  </Button>
                  {job.hasApplied && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      You have already applied to this job.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Job description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Job Description
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Requirements
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                  {job.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Back button */}
          <div className="mt-8">
            <Link to="/jobs">
              <Button variant="outline">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetailPage;