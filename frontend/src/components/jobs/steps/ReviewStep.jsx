// src/components/jobs/steps/ReviewStep.jsx
import { motion } from 'framer-motion';
import { DollarSign, Clock, Tag, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const ReviewStep = ({ formikProps, domains, skills }) => {
  const { values } = formikProps;
  
  // Find domain name from ID
  const getDomainName = (domainId) => {
    const domain = domains.find(d => d._id === domainId);
    return domain ? domain.name : 'Unknown Domain';
  };
  
  // Get skill names from IDs
  const getSkillNames = (skillIds) => {
    return skillIds.map(id => {
      const skill = skills.find(s => s._id === id);
      return skill ? skill.name : 'Unknown Skill';
    });
  };
  
  // Get timeframe label
  const getTimeframeLabel = (value) => {
    const timeframes = {
      'less_than_1_week': 'Less than 1 week',
      '1_to_2_weeks': '1-2 weeks',
      '2_to_4_weeks': '2-4 weeks',
      '1_to_3_months': '1-3 months',
      '3_to_6_months': '3-6 months',
      'more_than_6_months': 'More than 6 months'
    };
    return timeframes[value] || value;
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Job Summary
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {values.title}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {getDomainName(values.domain)}
                </span>
                {values.skills.map(skillId => (
                  <span 
                    key={skillId}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                  >
                    {skills.find(s => s._id === skillId)?.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      ${parseFloat(values.budget).toFixed(2)} USD
                    </p>
                    {values.milestones && (
                      <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                        Milestone payments enabled
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeframe</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {getTimeframeLabel(values.timeframe)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills Required</h4>
                    <div className="mt-1">
                      {getSkillNames(values.skills).map((skill, index) => (
                        <span key={index} className="inline-block mr-2 mb-1 text-gray-900 dark:text-white">
                          • {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                    <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">
                      {values.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Deliverables</h4>
                    <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">
                      {values.deliverables}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-xl border border-orange-100 dark:border-orange-800/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
            <h3 className="text-base font-medium text-orange-800 dark:text-orange-400">
              Before you post
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 text-orange-500 dark:text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Review all details carefully - they can't be changed after posting
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 text-orange-500 dark:text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Your budget will be held in escrow until you approve the work
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 mr-1.5 text-orange-500 dark:text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              You'll be able to review applicants before selecting a freelancer
            </li>
          </ul>
        </motion.div>
        
        <motion.div 
          className="bg-green-50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-800/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center mb-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-base font-medium text-green-800 dark:text-green-400">
              What happens next?
            </h3>
          </div>
          <ol className="space-y-2 text-sm text-green-700 dark:text-green-300">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 font-medium text-xs mr-1.5">
                1
              </div>
              <span>Your job will be posted immediately after payment</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 font-medium text-xs mr-1.5">
                2
              </div>
              <span>Freelancers will apply with proposals</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 font-medium text-xs mr-1.5">
                3
              </div>
              <span>You'll review and select the best candidate</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 font-medium text-xs mr-1.5">
                4
              </div>
              <span>Work begins and you can communicate through our platform</span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewStep;