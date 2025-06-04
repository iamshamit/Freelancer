// src/components/payments/EscrowBalance.jsx
import { motion } from 'framer-motion';
import { Lock, TrendingUp, DollarSign } from 'lucide-react';

const EscrowBalance = ({ balance, totalBudget, released }) => {
  const percentageReleased = (released / totalBudget) * 100;
  const percentageInEscrow = (balance / totalBudget) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-orange-400" />
          Escrow Balance
        </h3>
        <span className="text-2xl font-bold text-orange-400">${balance}</span>
      </div>

      <div className="space-y-4">
        {/* Total Budget */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Total Budget</span>
            <span className="text-white">${totalBudget}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gray-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Released Amount */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Released</span>
            <span className="text-green-400">${released} ({percentageReleased.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentageReleased}%` }}
            />
          </div>
        </div>

        {/* In Escrow */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">In Escrow</span>
            <span className="text-orange-400">${balance} ({percentageInEscrow.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentageInEscrow}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-900 rounded-lg">
        <p className="text-xs text-gray-400">
          Funds are securely held in escrow and will be released upon milestone approval.
        </p>
      </div>
    </motion.div>
  );
};

export default EscrowBalance;