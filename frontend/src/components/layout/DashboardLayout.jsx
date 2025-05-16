// frontend/src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from './Layout';

const DashboardLayout = ({ children, role, tabs }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-teal">
              {role === 'freelancer' ? 'Freelancer Dashboard' : 
               role === 'employer' ? 'Employer Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="mt-2 text-gray-600">
              {role === 'freelancer' ? 'Manage your applications and ongoing projects' : 
               role === 'employer' ? 'Post jobs and manage your projects' : 'Manage the platform'}
            </p>
          </div>

          {tabs && (
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === index
                        ? 'border-jade-green text-jade-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {tabs ? tabs[activeTab].content : children}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardLayout;