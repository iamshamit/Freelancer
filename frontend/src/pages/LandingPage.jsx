// frontend/src/pages/LandingPage.jsx
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-dark-teal to-deep-teal text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Connect with Top Talent and Quality Projects
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
              FreelanceHub makes it easy to find freelancers or get hired for the projects you love.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              {user ? (
                <Link to={`/${user.role}/dashboard`}>
                  <Button size="lg" variant="primary">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="primary">
                      Join as Freelancer
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="bg-white">
                      Hire Talent
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-dark-teal mb-4">
              Why Choose FreelanceHub?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform offers the best experience for both freelancers and employers.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-white p-8 rounded-lg shadow-md"
              variants={itemVariants}
            >
              <div className="text-jade-green text-4xl mb-4">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-xl font-bold text-dark-teal mb-2">
                Find the Perfect Match
              </h3>
              <p className="text-gray-600">
                Our advanced matching system helps you find the right talent or projects that fit your skills and interests.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-lg shadow-md"
              variants={itemVariants}
            >
              <div className="text-jade-green text-4xl mb-4">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-xl font-bold text-dark-teal mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Our milestone-based payment system ensures that work is completed before payment is released.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-lg shadow-md"
              variants={itemVariants}
            >
              <div className="text-jade-green text-4xl mb-4">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="text-xl font-bold text-dark-teal mb-2">
                Seamless Communication
              </h3>
              <p className="text-gray-600">
                Our built-in messaging system makes it easy to collaborate and stay on the same page.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-dark-teal mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Getting started is easy, whether you're hiring or looking for work.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-dark-teal mb-6 text-center">
                For Employers
              </h3>
              <ol className="space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-jade-green text-white flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-teal">Post a Job</h4>
                    <p className="text-gray-600">
                      Describe your project, set your budget, and specify the skills you need.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-jade-green text-white flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-teal">Review Applications</h4>
                    <p className="text-gray-600">
                      Browse profiles, reviews, and portfolios of interested freelancers.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-jade-green text-white flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-teal">Collaborate & Pay</h4>
                    <p className="text-gray-600">
                      Work together through our platform and release payments as milestones are completed.
                    </p>
                  </div>
                </li>
              </ol>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-dark-teal mb-6 text-center">
                For Freelancers
              </h3>
              <ol className="space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-deep-teal text-white flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-teal">Create Your Profile</h4>
                    <p className="text-gray-600">
                      Showcase your skills, experience, and portfolio to stand out.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-deep-teal text-white flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-teal">Find & Apply to Jobs</h4>
                    <p className="text-gray-600">
                      Browse job listings that match your skills and interests.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-deep-teal text-white flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-teal">Get Paid Securely</h4>
                    <p className="text-gray-600">
                      Receive payments as you complete milestones and build your reputation.
                    </p>
                  </div>
                </li>
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-light-aqua py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-dark-teal mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-deep-teal mb-8 max-w-3xl mx-auto">
              Join thousands of freelancers and businesses already using FreelanceHub.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              {user ? (
                <Link to={`/${user.role}/dashboard`}>
                  <Button size="lg" variant="primary">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="primary">
                      Create an Account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="secondary">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;