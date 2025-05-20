// src/components/jobs/steps/DescriptionStep.jsx
import { Field, ErrorMessage } from 'formik';

const DescriptionStep = ({ formikProps }) => {
  const { errors, touched, values } = formikProps;
  
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Job Description
        </label>
        <Field
          as="textarea"
          id="description"
          name="description"
          rows="8"
          placeholder="Describe the job in detail. Include specific requirements, deliverables, and any other relevant information."
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.description && touched.description 
              ? 'border-red-500 focus:ring-red-500/30' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
        />
        <div className="mt-1 flex justify-between">
          <ErrorMessage name="description" component="div" className="text-sm text-red-500" />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {values.description.length} characters
            {errors.description && touched.description && errors.description.includes('50') && 
              ` (minimum 50)`
            }
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Tips for a great job description:</h3>
        <ul className="list-disc pl-5 text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>Be specific about what you need</li>
          <li>Include all requirements and deliverables</li>
          <li>Mention any specific skills or experience needed</li>
          <li>Provide context about your project or business</li>
          <li>Set clear expectations about timeline and communication</li>
        </ul>
      </div>
    </div>
  );
};

export default DescriptionStep;
