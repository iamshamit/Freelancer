// src/components/jobs/steps/BudgetStep.jsx
import { Field, ErrorMessage } from 'formik';
import { DollarSign } from 'lucide-react';

const BudgetStep = ({ formikProps }) => {
  const { errors, touched } = formikProps;
  
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Budget (USD)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <Field
            type="number"
            id="budget"
            name="budget"
            placeholder="Enter amount"
            min="5"
            step="0.01"
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              errors.budget && touched.budget 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
          />
        </div>
        <ErrorMessage name="budget" component="div" className="mt-1 text-sm text-red-500" />
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">About budgeting:</h3>
        <ul className="list-disc pl-5 text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>Set a fair budget based on the complexity of your project</li>
          <li>The entire budget will be held in escrow until the job is completed</li>
          <li>You can release payments in milestones as the work progresses</li>
          <li>Higher budgets typically attract more experienced freelancers</li>
        </ul>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Protection:</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your payment will be securely held in escrow until you approve the work. You'll only release payment when you're completely satisfied with the delivered work.
        </p>
      </div>
    </div>
  );
};

export default BudgetStep;