// src/components/jobs/steps/DescriptionStep.jsx
import { Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const DescriptionStep = ({ formikProps }) => {
  const { errors, touched, values } = formikProps;
  const [showDescriptionTips, setShowDescriptionTips] = useState(false);
  const [showDeliverablesTips, setShowDeliverablesTips] = useState(false);
  
  const minDescriptionLength = 50;
  const minDeliverablesLength = 20;
  const descriptionProgress = Math.min(100, (values.description.length / minDescriptionLength) * 100);
  const deliverablesProgress = Math.min(100, (values.deliverables.length / minDeliverablesLength) * 100);
  
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-300">
              Job Description
            </label>
            <button
              type="button"
              onClick={() => setShowDescriptionTips(!showDescriptionTips)}
              className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 focus:outline-none"
            >
              {showDescriptionTips ? 'Hide tips' : 'Show tips'}
            </button>
          </div>
          
          {showDescriptionTips && (
            <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30 text-sm text-orange-800 dark:text-orange-300">
              <ul className="space-y-1 list-disc pl-5">
                <li>Clearly explain what the project involves</li>
                <li>Mention any specific requirements or preferences</li>
                <li>Include context about your business or project goals</li>
                <li>Be specific about what you're looking for</li>
              </ul>
            </div>
          )}
          
          <Field
            as="textarea"
            id="description"
            name="description"
            rows="6"
            placeholder="Describe your project in detail. What are you looking to achieve? What specific tasks need to be completed? Include any relevant background information."
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.description && touched.description 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
          />
          
          <div className="mt-2 flex items-center justify-between">
            <div className="w-full max-w-xs">
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    descriptionProgress >= 100 
                      ? 'bg-green-500' 
                      : descriptionProgress > 50 
                        ? 'bg-orange-500' 
                        : 'bg-red-500'
                  }`} 
                  style={{ width: `${descriptionProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center ml-3">
              {values.description.length >= minDescriptionLength ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500 mr-1.5" />
              )}
              <span className={`text-xs ${
                values.description.length >= minDescriptionLength 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {values.description.length}/{minDescriptionLength}+ characters
              </span>
            </div>
          </div>
          
          <ErrorMessage name="description" component="div" className="mt-1.5 text-sm text-red-500" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="deliverables" className="block text-base font-medium text-gray-700 dark:text-gray-300">
              Deliverables
            </label>
            <button
              type="button"
              onClick={() => setShowDeliverablesTips(!showDeliverablesTips)}
              className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 focus:outline-none"
            >
              {showDeliverablesTips ? 'Hide tips' : 'Show tips'}
            </button>
          </div>
          
          {showDeliverablesTips && (
            <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30 text-sm text-orange-800 dark:text-orange-300">
              <ul className="space-y-1 list-disc pl-5">
                <li>List specific outputs you expect from the freelancer</li>
                <li>Be clear about file formats or specifications</li>
                <li>Mention any milestones or phases if applicable</li>
                <li>Include any quality standards or requirements</li>
              </ul>
            </div>
          )}
          
          <Field
            as="textarea"
            id="deliverables"
            name="deliverables"
            rows="4"
            placeholder="List the specific deliverables you expect from this project. What will the freelancer provide to you? Be as specific as possible."
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.deliverables && touched.deliverables 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
          />
          
          <div className="mt-2 flex items-center justify-between">
            <div className="w-full max-w-xs">
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    deliverablesProgress >= 100 
                      ? 'bg-green-500' 
                      : deliverablesProgress > 50 
                        ? 'bg-orange-500' 
                        : 'bg-red-500'
                  }`} 
                  style={{ width: `${deliverablesProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center ml-3">
              {values.deliverables.length >= minDeliverablesLength ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500 mr-1.5" />
              )}
              <span className={`text-xs ${
                values.deliverables.length >= minDeliverablesLength 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {values.deliverables.length}/{minDeliverablesLength}+ characters
              </span>
            </div>
          </div>
          
          <ErrorMessage name="deliverables" component="div" className="mt-1.5 text-sm text-red-500" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 p-5 rounded-xl border border-purple-100 dark:border-purple-800/30">
        <h3 className="text-base font-medium text-purple-800 dark:text-purple-400 mb-3">
          Why detailed descriptions matter:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-30 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1.5">
              Better Matches
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Clear descriptions help attract freelancers with the right skills and experience for your project.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-30 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1.5">
              Fewer Revisions
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Detailed requirements reduce misunderstandings and the need for multiple revisions.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-30 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1.5">
              Faster Completion
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              When expectations are clear from the start, projects typically finish more quickly.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-30 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1.5">
              Higher Quality
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Specific requirements help freelancers deliver exactly what you're looking for.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionStep;