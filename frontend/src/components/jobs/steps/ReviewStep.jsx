// src/components/jobs/steps/ReviewStep.jsx
const ReviewStep = ({ formikProps, domains }) => {
  const { values } = formikProps;
  
  // Find domain name from ID
  const getDomainName = (domainId) => {
    const domain = domains.find(d => d._id === domainId);
    return domain ? domain.name : 'Unknown Domain';
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Summary</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h4>
            <p className="text-gray-900 dark:text-white">{values.title}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Domain</h4>
            <p className="text-gray-900 dark:text-white">{getDomainName(values.domain)}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</h4>
            <p className="text-gray-900 dark:text-white">${parseFloat(values.budget).toFixed(2)} USD</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
            <p className="text-gray-900 dark:text-white whitespace-pre-line">{values.description}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800/30">
        <h3 className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-2">Ready to post?</h3>
        <p className="text-sm text-orange-700 dark:text-orange-300">
          Once you submit, your job will be posted and visible to freelancers. You'll be asked to make a payment to fund the job escrow. This amount will only be released to the freelancer when you approve their work.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;