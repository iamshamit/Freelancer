import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, Calendar, TrendingUp, DollarSign, CreditCard, Wallet, Table, Grid3X3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TransactionTable from '../../components/payments/TransactionTable';
import PaymentCard from '../../components/payments/PaymentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import { downloadBlob, formatDateForFilename } from '../../utils/fileDownload';

const PaymentHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState('table');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const isEmployer = user?.role === 'employer';
  const isFreelancer = user?.role === 'freelancer';

  // Fetch payment history
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', dateRange, statusFilter, user?.role],
    queryFn: () => api.payment.getHistory({ dateRange, status: statusFilter }),
  });

  // Calculate role-specific statistics
  const calculateStats = () => {
    if (isEmployer) {
      return {
        totalSpent: payments.reduce((sum, p) => sum + p.amount, 0),
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
    } else {
      return {
        totalEarned: payments.reduce((sum, p) => sum + p.amount, 0),
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
    }
  };

  const stats = calculateStats();

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const loadingToast = toast.loading('Generating receipt...');
      
      const blob = await api.payment.getReceipt(paymentId);
      const filename = `receipt-${paymentId.slice(-8)}.pdf`;
      downloadBlob(blob, filename);
      
      toast.dismiss(loadingToast);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to download receipt');
      console.error('Receipt download error:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const loadingToast = toast.loading('Generating CSV export...');
      
      const blob = await api.payment.exportHistory('csv', {
        dateRange,
        status: statusFilter,
        userRole: user?.role
      });
      
      const rolePrefix = isEmployer ? 'expenses' : 'earnings';
      const filename = `${rolePrefix}-history-${formatDateForFilename()}.csv`;
      downloadBlob(blob, filename);
      
      toast.dismiss(loadingToast);
      toast.success(`${isEmployer ? 'Expense' : 'Earnings'} history exported successfully!`);
    } catch (error) {
      toast.error('Failed to export payment history');
      console.error('Export error:', error);
    }
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
        {/* Role-specific Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {isEmployer ? 'Payment History' : 'Earnings History'}
          </h1>
          <p className="text-gray-400">
            {isEmployer 
              ? 'Track your project expenses and payments to freelancers'
              : 'View your earnings and payment history from projects'
            }
          </p>
        </div>

        {/* Role-specific Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              {isEmployer ? (
                <CreditCard className="w-8 h-8 text-red-400" />
              ) : (
                <Wallet className="w-8 h-8 text-green-400" />
              )}
              <span className="text-xs text-gray-500">
                {isEmployer ? 'Total Spent' : 'Total Earned'}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${isEmployer ? stats.totalSpent : stats.totalEarned}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {isEmployer ? 'All time expenses' : 'All time earnings'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-gray-500">This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">${stats.thisMonth}</p>
            <p className="text-sm text-gray-400 mt-1">
              {isEmployer ? 'Monthly spending' : 'Monthly earnings'}
            </p>
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
            <p className="text-sm text-gray-400 mt-1">
              {isEmployer ? 'Payments made' : 'Payments received'}
            </p>
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
            <p className="text-sm text-gray-400 mt-1">
              {isEmployer ? 'Pending releases' : 'Awaiting payment'}
            </p>
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
              {/* Inline View Toggle */}
              <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setView('table')}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${view === 'table'
                      ? 'bg-orange-600 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  <Table className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setView('cards')}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${view === 'cards'
                      ? 'bg-orange-600 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export {isEmployer ? 'Expenses' : 'Earnings'}
              </button>
            </div>
          </div>
        </div>

        {/* Payment List */}
        {payments.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {isEmployer ? 'No payment history found' : 'No earnings history found'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {isEmployer 
                ? 'Start by posting a job and hiring freelancers'
                : 'Complete projects to start earning'
              }
            </p>
          </div>
        ) : view === 'table' ? (
          <TransactionTable
            transactions={payments}
            onDownloadReceipt={handleDownloadReceipt}
            userRole={user?.role}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payments.map((payment, index) => (
              <PaymentCard
                key={payment._id}
                payment={payment}
                onDownloadReceipt={handleDownloadReceipt}
                userRole={user?.role}
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