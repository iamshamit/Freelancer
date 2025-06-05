import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import RatingStarsInput from './RatingStarsInput';
import Button from '../common/Button';
import api from '../../services/api';

const RatingForm = ({ 
  jobId, 
  freelancerName, 
  onSubmitSuccess, 
  onCancel 
}) => {
  const queryClient = useQueryClient();

  // Validation schema
  const validationSchema = Yup.object({
    rating: Yup.number()
      .min(1, 'Rating is required')
      .max(5, 'Rating cannot exceed 5 stars')
      .required('Rating is required'),
    review: Yup.string()
      .max(1000, 'Review must be 1000 characters or less')
  });

  // Rate freelancer mutation
  const rateFreelancerMutation = useMutation({
    mutationFn: (data) => api.job.rateFreelancer(jobId, data.rating, data.review),
    onSuccess: () => {
      toast.success('Rating submitted successfully!');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries(['employerJobs']);
      queryClient.invalidateQueries(['jobDetailsForRating', jobId]);
      
      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to submit rating';
      toast.error(errorMessage);
    }
  });

  const initialValues = {
    rating: 0,
    review: ''
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Rate {freelancerName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Share your experience working with this freelancer
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          rateFreelancerMutation.mutate(values);
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Rating Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Your Rating for {freelancerName}
              </label>
              <div className="flex items-center space-x-4">
                <RatingStarsInput
                  value={values.rating}
                  onChange={(rating) => setFieldValue('rating', rating)}
                  disabled={isSubmitting || rateFreelancerMutation.isPending}
                  size="lg"
                />
                {values.rating > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {values.rating} star{values.rating !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <ErrorMessage 
                name="rating" 
                component="div" 
                className="mt-2 text-sm text-red-500" 
              />
            </div>

            {/* Review Text Input */}
            <div>
              <label 
                htmlFor="review" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Your Review (Optional)
              </label>
              <Field
                as="textarea"
                name="review"
                id="review"
                rows="5"
                placeholder="Share details about your experience working with this freelancer..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                         transition-colors duration-200 resize-none"
                disabled={isSubmitting || rateFreelancerMutation.isPending}
              />
              <div className="mt-1 flex justify-between items-center">
                <ErrorMessage 
                  name="review" 
                  component="div" 
                  className="text-sm text-red-500" 
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {values.review?.length || 0}/1000 characters
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || rateFreelancerMutation.isPending || values.rating === 0}
                className="flex items-center justify-center flex-1 sm:flex-none"
              >
                {(isSubmitting || rateFreelancerMutation.isPending) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || rateFreelancerMutation.isPending}
                  className="flex items-center justify-center flex-1 sm:flex-none"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
};

export default RatingForm;