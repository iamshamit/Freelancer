// src/components/milestones/MilestoneForm.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertCircle } from "lucide-react";
import Button from "../common/Button";

const MilestoneForm = ({
  jobBudget,
  onSubmit,
  onClose,
  existingMilestones = [],
}) => {
  const [milestones, setMilestones] = useState(
    existingMilestones.length > 0
      ? existingMilestones
      : [
          { title: "", description: "", percentage: 25, dueDate: "" },
          { title: "", description: "", percentage: 25, dueDate: "" },
          { title: "", description: "", percentage: 25, dueDate: "" },
          { title: "", description: "", percentage: 25, dueDate: "" },
        ],
  );

  const totalPercentage = milestones.reduce(
    (sum, m) => sum + (m.percentage || 0),
    0,
  );
  const isValid =
    totalPercentage === 100 &&
    milestones.every((m) => m.title && m.percentage > 0);

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "", description: "", percentage: 0, dueDate: "" },
    ]);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(milestones);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Define Project Milestones
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-400">
              Total Budget:{" "}
              <span className="text-white font-medium">₹{jobBudget}</span>
            </p>
          </div>

          {/* Milestones List */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">
                    Milestone {index + 1}
                  </h4>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) =>
                        updateMilestone(index, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., Initial Design"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Percentage
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={milestone.percentage}
                        onChange={(e) =>
                          updateMilestone(
                            index,
                            "percentage",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        min="1"
                        max="100"
                        required
                      />
                      <span className="text-gray-400 text-sm">%</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={milestone.description}
                      onChange={(e) =>
                        updateMilestone(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      rows="2"
                      placeholder="Describe what needs to be completed..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={milestone.dueDate}
                      onChange={(e) =>
                        updateMilestone(index, "dueDate", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Amount
                    </label>
                    <div className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm">
                      ₹{((jobBudget * milestone.percentage) / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Milestone Button */}
          <button
            type="button"
            onClick={addMilestone}
            className="mt-4 w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>

          {/* Total Percentage Indicator */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Percentage</span>
              <span
                className={`text-sm font-medium ${totalPercentage === 100 ? "text-green-400" : "text-orange-400"}`}
              >
                {totalPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalPercentage === 100 ? "bg-green-500" : "bg-orange-500"
                }`}
                style={{ width: `${Math.min(totalPercentage, 100)}%` }}
              />
            </div>
            {totalPercentage !== 100 && (
              <p className="mt-2 text-xs text-orange-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Percentages must add up to 100%
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isValid}
              className="flex-1"
            >
              Create Milestones
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MilestoneForm;
