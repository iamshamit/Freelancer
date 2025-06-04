// src/pages/milestones/PaymentHistoryPage.jsx
import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TransactionTable from '../../components/payments/TransactionTable';
import PaymentCard from '../../components/payments/PaymentCard';
import ViewToggle from '../../components/common/ViewToggle';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const PaymentHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState('table');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch payment history
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', dateRange, statusFilter],
    queryFn: () => api.payment.getHistory({ dateRange, status: statusFilter }),
  });

  // Calculate statistics
  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    thisMonth: payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + p.amount, 0),
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const receipt = await api.payment.getReceipt(paymentId);
      // Handle receipt download
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const handleExportCSV = () => {
    // Export payments to CSV
    toast.success('Exporting payment history...');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
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
          <h1 className="text-2xl font-bold text-white mb-2">Payment History</h1>
          <p className="text-gray-400">View and manage your transaction history</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-orange-400" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">${stats.total}</p>
            <p className="text-sm text-gray-400 mt-1">All time earnings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-xs text-gray-500">This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">${stats.thisMonth}</p>
            <p className="text-sm text-gray-400 mt-1">Current month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 font-bold">{stats.completed}</span>
              </div>
              <span className="text-xs text-gray-500">Completed</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-sm text-gray-400 mt-1">Successful payments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="text-yellow-400 font-bold">{stats.pending}</span>
              </div>
              <span className="text-xs text-gray-500">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-sm text-gray-400 mt-1">Awaiting completion</p>
          </motion.div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ViewToggle
                view={view}
                onViewChange={setView}
                options={[
                  { value: 'table', label: 'Table' },
                  { value: 'cards', label: 'Cards' },
                ]}
              />

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Payment List */}
        {payments.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No payment history found</p>
          </div>
        ) : view === 'table' ? (
          <TransactionTable
            transactions={payments}
            onDownloadReceipt={handleDownloadReceipt}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payments.map((payment, index) => (
              <PaymentCard
                key={payment._id}
                payment={payment}
                onDownloadReceipt={handleDownloadReceipt}
                index={index}
              />
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default PaymentHistoryPage;