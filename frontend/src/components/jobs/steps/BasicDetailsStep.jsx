// src/components/jobs/steps/BasicDetailsStep.jsx
import { Field, ErrorMessage, useField } from 'formik';
import { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';

const BasicDetailsStep = ({ formikProps, domains, skills }) => {
  const { errors, touched, values, setFieldValue } = formikProps;
  const [, , skillsHelpers] = useField('skills');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !values.skills.includes(skill._id)
  );
  
  const handleAddSkill = (skillId) => {
    if (!values.skills.includes(skillId)) {
      skillsHelpers.setValue([...values.skills, skillId]);
    }
    setSearchTerm('');
  };
  
  const handleRemoveSkill = (skillId) => {
    skillsHelpers.setValue(values.skills.filter(id => id !== skillId));
  };
  
  const getSkillName = (skillId) => {
    const skill = skills.find(s => s._id === skillId);
    return skill ? skill.name : '';
  };
  
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Title
          </label>
          <Field
            type="text"
            id="title"
            name="title"
            placeholder="e.g. Website Development, Logo Design, Content Writing"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.title && touched.title 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
          />
          <ErrorMessage name="title" component="div" className="mt-1.5 text-sm text-red-500" />
        </div>
        
        <div>
          <label htmlFor="domain" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Domain
          </label>
          <div className="relative">
            <Field
              as="select"
              id="domain"
              name="domain"
              className={`w-full pl-4 pr-10 py-3 rounded-lg border appearance-none ${
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <ErrorMessage name="domain" component="div" className="mt-1.5 text-sm text-red-500" />
        </div>
        
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Required Skills
          </label>
          
          {/* Selected skills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {values.skills.length > 0 ? (
              values.skills.map(skillId => (
                <div 
                  key={skillId}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm"
                >
                  {getSkillName(skillId)}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skillId)}
                    className="ml-1.5 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 focus:outline-none"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                No skills selected
              </div>
            )}
          </div>
          
          {/* Search and add skills */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for skills to add..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all duration-200"
            />
          </div>
          
          {/* Skill suggestions */}
          {searchTerm && filteredSkills.length > 0 && (
            <div className="mt-2 p-2 max-h-40 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
              {filteredSkills.slice(0, 5).map(skill => (
                <button
                  key={skill._id}
                  type="button"
                  onClick={() => handleAddSkill(skill._id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded flex items-center text-gray-800 dark:text-gray-200"
                >
                  <Plus className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  {skill.name}
                </button>
              ))}
            </div>
          )}
          
          {errors.skills && touched.skills && (
            <div className="mt-1.5 text-sm text-red-500">{errors.skills}</div>
          )}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30">
        <h3 className="text-base font-medium text-blue-800 dark:text-blue-400 mb-3 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          Tips for a great job title and skills selection:
        </h3>
        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-1.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            Be specific about the task or project (e.g., "WordPress E-commerce Site" instead of just "Website")
          </li>
           <li className="flex items-start">
            <svg className="h-5 w-5 mr-1.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            Include the most important skills to attract qualified freelancers
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-1.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            Keep your title concise and clear (under 10 words is ideal)
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-1.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            Select 3-5 skills that are most relevant to your project
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BasicDetailsStep;