// src/pages/milestones/MilestonePage.jsx
import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MilestoneBar from '../../components/milestones/MilestoneBar';
import MilestoneList from '../../components/milestones/MilestoneList';
import MilestoneForm from '../../components/milestones/MilestoneForm';
import PaymentReleaseModal from '../../components/milestones/PaymentReleaseModal';
import EscrowBalance from '../../components/payments/EscrowBalance';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const MilestonePage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api.job.getById(jobId),
  });

  // Fetch milestones
  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ['milestones', jobId],
    queryFn: () => api.milestone.getAll(jobId),
    enabled: !!jobId,
  });

  // Fetch escrow balance
  const { data: escrowData } = useQuery({
    queryKey: ['escrow', jobId],
    queryFn: () => api.payment.getEscrowBalance(jobId),
    enabled: !!jobId,
  });

  // Create milestones mutation
  const createMilestonesMutation = useMutation({
    mutationFn: (milestonesData) => api.milestone.create(jobId, milestonesData),
    onSuccess: () => {
      queryClient.invalidateQueries(['milestones', jobId]);
      setShowMilestoneForm(false);
      toast.success('Milestones created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create milestones');
    },
  });

  // Request approval mutation
  const requestApprovalMutation = useMutation({
    mutationFn: (milestoneId) => api.milestone.requestApproval(jobId, milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries(['milestones', jobId]);
      toast.success('Approval requested successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to request approval');
    },
  });

  // Approve milestone mutation
  const approveMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, feedback }) => 
      api.milestone.approve(jobId, milestoneId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries(['milestones', jobId]);
      queryClient.invalidateQueries(['escrow', jobId]);
      setShowPaymentModal(false);
      setSelectedMilestone(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve milestone');
    },
  });

  const isEmployer = user?._id === job?.employer?._id;
  const isFreelancer = user?._id === job?.freelancer?._id;
  
  const canManageMilestones = isEmployer || isFreelancer;

  const totalProgress = milestones.reduce((sum, m) => 
    m.status === 'approved' ? sum + m.percentage : sum, 0
  );

  const handleApprove = (milestoneId) => {
    const milestone = milestones.find(m => m._id === milestoneId);
    setSelectedMilestone(milestone);
    setShowPaymentModal(true);
  };

  const handleRequestApproval = (milestoneId) => {
    requestApprovalMutation.mutate(milestoneId);
  };

  const handleViewMilestone = (milestoneId) => {
    // Navigate to milestone detail page or open modal
    console.log('View milestone:', milestoneId);
  };

  const handleConfirmPayment = async (milestoneId, feedback) => {
    await approveMilestoneMutation.mutateAsync({ milestoneId, feedback });
  };

  if (jobLoading || milestonesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!job || !canManageMilestones) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">You don't have access to this project's milestones.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto p-6"
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
              <p className="text-gray-400">Manage project milestones and payments</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/chat/${job.chatId}`)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Discuss
              </Button>
              
              {isEmployer && milestones.length === 0 && (
                <Button
                  variant="primary"
                  onClick={() => setShowMilestoneForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Milestones
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Overall Progress</h3>
              <MilestoneBar percentage={totalProgress} showMarkers={true} />
            </div>
          </div>

          <div>
            {escrowData && (
              <EscrowBalance
                balance={escrowData.balance}
                totalBudget={job.budget}
                released={escrowData.released}
              />
            )}
          </div>
        </div>

        {/* Milestones List */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Project Milestones</h3>
          
          {milestones.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No milestones have been created yet.</p>
              {isEmployer && (
                <Button
                  variant="primary"
                  onClick={() => setShowMilestoneForm(true)}
                  className="mx-auto"
                >
                  Create Milestones
                </Button>
              )}
            </div>
          ) : (
            <MilestoneList
              milestones={milestones}
              onApprove={handleApprove}
              onRequestApproval={handleRequestApproval}
              onView={handleViewMilestone}
              isEmployer={isEmployer}
            />
          )}
        </div>

        {/* Milestone Form Modal */}
        {showMilestoneForm && (
          <MilestoneForm
            jobBudget={job.budget}
            onSubmit={(milestonesData) => createMilestonesMutation.mutate(milestonesData)}
            onClose={() => setShowMilestoneForm(false)}
            existingMilestones={milestones}
          />
        )}

        {/* Payment Release Modal */}
        {showPaymentModal && selectedMilestone && (
          <PaymentReleaseModal
            milestone={selectedMilestone}
            onConfirm={handleConfirmPayment}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedMilestone(null);
            }}
            isLoading={approveMilestoneMutation.isPending}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default MilestonePage;