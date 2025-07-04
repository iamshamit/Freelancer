import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import PaymentStatusBadge from "./PaymentStatusBadge";

const TransactionTable = ({ transactions, onDownloadReceipt, userRole }) => {
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const isEmployer = userRole === "employer";

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.transactionId
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${isEmployer ? "expenses" : "earnings"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th
                className="px-6 py-3 text-left cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                  <SortIcon field="date" />
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {isEmployer ? "Payment To" : "Payment From"}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                  <SortIcon field="amount" />
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedTransactions.map((transaction, index) => (
              <motion.tr
                key={transaction._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-white font-medium">
                      {transaction.job?.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isEmployer
                        ? transaction.milestoneTitle
                        : transaction.description}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      ID: {transaction.transactionId}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {isEmployer ? (
                      <ArrowUpRight className="w-4 h-4 text-red-400" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-green-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${isEmployer ? "text-red-400" : "text-green-400"}`}
                    >
                      {isEmployer ? "-" : "+"}₹{transaction.amount}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PaymentStatusBadge
                    status={transaction.status}
                    size="small"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300 capitalize">
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onDownloadReceipt(transaction._id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title={`Download ${isEmployer ? "Payment" : "Earnings"} Receipt`}
                  >
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
