// src/components/jobs/steps/BasicDetailsStep.jsx
import { Field, ErrorMessage } from 'formik';

const BasicDetailsStep = ({ formikProps, domains }) => {
  const { errors, touched } = formikProps;
  
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Job Title
        </label>
        <Field
          type="text"
          id="title"
          name="title"
          placeholder="e.g. Website Development, Logo Design, Content Writing"
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.title && touched.title 
              ? 'border-red-500 focus:ring-red-500/30' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
        />
        <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-500" />
      </div>
      
      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Domain
        </label>
        <Field
          as="select"
          id="domain"
          name="domain"
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.domain && touched.domain 
              ? 'border-red-500 focus:ring-red-500/30' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
        >
          <option value="">Select a domain</option>
          {domains.map((domain) => (
            <option key={domain._id} value={domain._id}>
              {domain.name}
            </option>
          ))}
        </Field>
        <ErrorMessage name="domain" component="div" className="mt-1 text-sm text-red-500" />
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Tips for a great job title:</h3>
        <ul className="list-disc pl-5 text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>Be specific about the task or project</li>
          <li>Include the key skills required</li>
          <li>Keep it concise and clear</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicDetailsStep;