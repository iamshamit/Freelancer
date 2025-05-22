// src/components/applications/ApplicationForm.jsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Info } from 'lucide-react';
import Button from '../common/Button';
import api from '../../services/api';

const ApplicationForm = ({ jobId, onSuccess, onCancel }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  
  // Apply to job mutation
  const applyMutation = useMutation({
    mutationFn: () => api.job.apply(jobId, { coverLetter }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => {
      setError(err.message || 'Failed to submit application. Please try again.');
    }
  });
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate cover letter
    if (!coverLetter.trim()) {
      setError('Please provide a cover letter.');
      return;
    }
    
    // Submit application
    applyMutation.mutate();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Submit Your Application
        </h2>
        
        {/* Tips box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Application Tips</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-4">
                <li>Introduce yourself and explain why you're interested in this job</li>
                <li>Highlight relevant skills and experience</li>
                <li>Mention similar projects you've worked on</li>
                <li>Ask any clarifying questions about the project</li>
                <li>Be professional and proofread before submitting</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Cover letter */}
          <div className="mb-4">
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and explain why you're a good fit for this job..."
              rows={8}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
              required
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Be specific and personalize your message to stand out
              </span>
              <span className={`text-xs ${
                coverLetter.length > 1000 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {coverLetter.length}/2000 characters
              </span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={applyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={applyMutation.isPending}
              disabled={applyMutation.isPending || coverLetter.length > 2000}
              className="flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ApplicationForm;