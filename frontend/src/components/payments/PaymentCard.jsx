import { motion } from "framer-motion";
import {
  Download,
  ExternalLink,
  Calendar,
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import PaymentStatusBadge from "./PaymentStatusBadge";

const PaymentCard = ({ payment, onDownloadReceipt, userRole, index = 0 }) => {
  const {
    amount,
    status,
    date,
    description,
    transactionId,
    milestoneTitle,
    job,
  } = payment;
  const isEmployer = userRole === "employer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-white">{job?.title}</h4>
          <p className="text-sm text-gray-400 mt-1">
            {isEmployer ? milestoneTitle : description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEmployer ? (
            <ArrowUpRight className="w-4 h-4 text-red-400" />
          ) : (
            <ArrowDownLeft className="w-4 h-4 text-green-400" />
          )}
          <PaymentStatusBadge status={status} size="small" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="w-4 h-4 text-gray-500" />
            <span
              className={`font-medium ${isEmployer ? "text-red-400" : "text-green-400"}`}
            >
              {isEmployer ? "-" : "+"}₹{amount}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownloadReceipt(payment._id)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={`Download ${isEmployer ? "Payment" : "Earnings"} Receipt`}
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="View Transaction Details"
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {transactionId && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Transaction ID:{" "}
            <span className="font-mono text-gray-400">{transactionId}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentCard;
