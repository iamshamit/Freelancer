
// src/components/jobs/steps/BudgetStep.jsx
import { Field, ErrorMessage } from 'formik';
import { DollarSign, Clock, CheckSquare } from 'lucide-react';
import { useState } from 'react';

const BudgetStep = ({ formikProps }) => {
  const { errors, touched, values, setFieldValue } = formikProps;
  const [showBudgetInfo, setShowBudgetInfo] = useState(false);
  
  const timeframeOptions = [
    { value: 'less_than_1_week', label: 'Less than 1 week' },
    { value: '1_to_2_weeks', label: '1-2 weeks' },
    { value: '2_to_4_weeks', label: '2-4 weeks' },
    { value: '1_to_3_months', label: '1-3 months' },
    { value: '3_to_6_months', label: '3-6 months' },
    { value: 'more_than_6_months', label: 'More than 6 months' }
  ];
  
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="budget" className="block text-base font-medium text-gray-700 dark:text-gray-300">
              Budget (USD)
            </label>
            <button
              type="button"
              onClick={() => setShowBudgetInfo(!showBudgetInfo)}
              className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 focus:outline-none"
            >
              {showBudgetInfo ? 'Hide info' : 'Budget info'}
            </button>
          </div>
          
          {showBudgetInfo && (
            <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30 text-sm text-orange-800 dark:text-orange-300">
              <p className="mb-2">Your budget will be held in escrow until you approve the work. You can release payments in milestones as the project progresses.</p>
              <p>Setting a competitive budget helps attract skilled freelancers. Consider the complexity and time required for your project.</p>
            </div>
          )}
          
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
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                errors.budget && touched.budget 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
            />
          </div>
          <ErrorMessage name="budget" component="div" className="mt-1.5 text-sm text-red-500" />
          
          {values.budget && !errors.budget && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div 
                className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center cursor-pointer transition-all ${
                  parseFloat(values.budget) * 0.9 === parseFloat(values.budget) 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30' 
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFieldValue('budget', (parseFloat(values.budget) * 0.9).toFixed(2))}
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Lower</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">${(parseFloat(values.budget) * 0.9).toFixed(2)}</p>
              </div>
              
              <div className="p-2 rounded-lg border border-orange-200 dark:border-orange-800/30 bg-orange-50 dark:bg-orange-900/20 text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">${parseFloat(values.budget).toFixed(2)}</p>
              </div>
              
              <div 
                className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center cursor-pointer transition-all ${
                  parseFloat(values.budget) * 1.1 === parseFloat(values.budget) 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30' 
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFieldValue('budget', (parseFloat(values.budget) * 1.1).toFixed(2))}
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Higher</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">${(parseFloat(values.budget) * 1.1).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="timeframe" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expected Timeframe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <Field
              as="select"
              id="timeframe"
              name="timeframe"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border appearance-none ${
                errors.timeframe && touched.timeframe 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
            >
              <option value="">Select expected timeframe</option>
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Field>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <ErrorMessage name="timeframe" component="div" className="mt-1.5 text-sm text-red-500" />
        </div>
        
        <div className="pt-2">
          <div className="flex items-center">
            <Field
              type="checkbox"
              id="milestones"
              name="milestones"
              className="h-5 w-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500/30"
            />
            <label htmlFor="milestones" className="ml-2 block text-base text-gray-700 dark:text-gray-300">
              Enable milestone payments
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 pl-7">
            Break the project into smaller milestones and release payments as each is completed
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-5 rounded-xl border border-green-100 dark:border-green-800/30">
          <div className="flex items-start mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg mr-3">
              <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-base font-medium text-green-800 dark:text-green-400">
              Payment Protection
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Your payment is held securely in escrow
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Only pay when you approve the work
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Release funds in milestones as work progresses
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Dispute resolution if needed
            </li>
          </ul>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
            Typical rates by expertise level:
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Entry Level</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">$15-30/hr</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Intermediate</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">$30-60/hr</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expert</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">$60-120+/hr</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            *Rates vary by domain, project complexity, and location
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetStep;