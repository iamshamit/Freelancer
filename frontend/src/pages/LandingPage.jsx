import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
gsap.registerPlugin(ScrollTrigger);
import {
  FaGithub,
  FaMoneyBillWave,
  FaComments,
  FaStar,
  FaUserAlt,
} from "react-icons/fa";
import {
  SiMongodb,
  SiExpress,
  SiReact,
  SiNodedotjs,
  SiGit,
  SiVite,
} from "react-icons/si";

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return true;
    }
    // Check time-based (evening/night = dark mode)
    const hours = new Date().getHours();
    if (hours < 6 || hours >= 18) {
      return true;
    }
    return false;
  });

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <HeroSection darkMode={darkMode} />
      <FeaturesSection darkMode={darkMode} />
      <HowItWorksSection darkMode={darkMode} />
      <TechStackSection darkMode={darkMode} />
      <GitHubSection darkMode={darkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
};

const ThemeToggle = ({ darkMode, setDarkMode }) => {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`p-2 rounded-full ${
        darkMode
          ? "bg-gray-800 text-orange-400"
          : "bg-orange-100 text-orange-500"
      } focus:outline-none transition-colors duration-200`}
    >
      {darkMode ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

const HeroSection = ({ darkMode }) => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-24 -right-24 w-96 h-96 rounded-full ${
            darkMode ? "bg-orange-500/5" : "bg-orange-500/10"
          }`}
        ></div>
        <div
          className={`absolute -bottom-24 -left-24 w-96 h-96 rounded-full ${
            darkMode ? "bg-orange-500/5" : "bg-orange-500/10"
          }`}
        ></div>

        {/* Grid pattern */}
        <div
          className={`absolute inset-0 ${
            darkMode ? "opacity-10" : "opacity-5"
          }`}
          style={{
            backgroundImage: `radial-gradient(circle, ${
              darkMode ? "#f97316" : "#f97316"
            } 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-16 md:py-0 w-full">
        <div className="flex flex-col lg:flex-row items-center min-h-[calc(100vh-80px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "80px" }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className={`h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-6 mx-auto lg:mx-0`}
            ></motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Connect. Create.{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
                Succeed.
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className={`text-lg sm:text-xl ${
                darkMode ? "text-gray-300" : "text-gray-600"
              } mb-8 max-w-lg mx-auto lg:mx-0`}
            >
              Nexara connects talented freelancers with employers looking for
              quality work. Simple, secure, and straightforward.
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg shadow-orange-500/20 transform transition hover:scale-105">
                Get Started
              </button>
              <button
                className={`px-8 py-3 ${
                  darkMode
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                } rounded-lg shadow-lg border ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } transform transition hover:scale-105`}
              >
                Learn More
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-10 inline-flex items-center"
            >
              <div className="relative">
                <div
                  className={`absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg blur opacity-30`}
                ></div>
                <div
                  className={`relative ${
                    darkMode ? "bg-gray-800/80" : "bg-white/80"
                  } backdrop-blur-sm border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } rounded-lg px-4 py-2`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span
                      className={`${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      } text-sm`}
                    >
                      <span className="font-bold text-orange-500">
                        Open Source
                      </span>{" "}
                      Project
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur opacity-20"></div>

              {/* Main dashboard container */}
              <div
                className={`relative ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-2xl overflow-hidden border ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } shadow-xl transform transition-all hover:scale-[1.02] hover:shadow-2xl duration-300`}
              >
                {/* Dashboard Header */}
                <div className="p-1 bg-gradient-to-r from-orange-400 to-orange-600">
                  <div
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } p-2 flex items-center space-x-2 rounded-t-lg`}
                  >
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } flex-1 text-center`}
                    >
                      Freelancer Dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 h-[350px] sm:h-[400px] overflow-hidden">
                  <div className="flex flex-col h-full">
                    {/* Dashboard Header with User Info */}
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3
                          className={`font-bold text-lg ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Welcome back, Alex
                        </h3>
                        <div className="flex items-center">
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Monday, May 19
                          </p>
                          <div className="flex items-center ml-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < 4 ? "text-orange-500" : "text-gray-400"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span
                              className={`text-xs ml-1 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              4.0
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-white font-medium">A</span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div
                        className={`${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        } rounded-lg p-3 border ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        } relative overflow-hidden group`}
                      >
                        <div className="text-orange-500 text-sm font-medium mb-1">
                          Active Jobs
                        </div>
                        <div
                          className={`text-xl font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          3
                        </div>
                        <div
                          className={`absolute bottom-0 left-0 h-1 w-full bg-orange-500/20`}
                        ></div>
                        <div
                          className={`absolute bottom-0 left-0 h-1 w-2/3 bg-orange-500 transition-all group-hover:w-full duration-500`}
                        ></div>
                      </div>
                      <div
                        className={`${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        } rounded-lg p-3 border ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        } relative overflow-hidden group`}
                      >
                        <div className="text-orange-500 text-sm font-medium mb-1">
                          Applications
                        </div>
                        <div
                          className={`text-xl font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          12
                        </div>
                        <div
                          className={`absolute bottom-0 left-0 h-1 w-full bg-orange-500/20`}
                        ></div>
                        <div
                          className={`absolute bottom-0 left-0 h-1 w-1/2 bg-orange-500 transition-all group-hover:w-full duration-500`}
                        ></div>
                      </div>
                      <div
                        className={`${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        } rounded-lg p-3 border ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        } relative overflow-hidden group`}
                      >
                        <div className="text-orange-500 text-sm font-medium mb-1">
                          Earnings
                        </div>
                        <div
                          className={`text-xl font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          ₹ 1,840
                        </div>
                        <div
                          className={`absolute bottom-0 left-0 h-1 w-full bg-orange-500/20`}
                        ></div>
                        <div
                          className={`absolute bottom-0 left-0 h-1 w-3/4 bg-orange-500 transition-all group-hover:w-full duration-500`}
                        ></div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b mb-4 pb-1 border-gray-700">
                      <button
                        className={`mr-4 pb-2 text-sm font-medium border-b-2 border-orange-500 text-orange-500`}
                      >
                        Active Projects
                      </button>
                      <button
                        className={`mr-4 pb-2 text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } border-b-2 border-transparent`}
                      >
                        Available Jobs
                      </button>
                      <button
                        className={`mr-4 pb-2 text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } border-b-2 border-transparent`}
                      >
                        Messages
                      </button>
                    </div>

                    {/* Active Projects List */}
                    <div className="flex-1 overflow-hidden">
                      {/* Project Item 1 - In Progress */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className={`${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        } rounded-lg p-3 mb-3 border ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        } hover:border-orange-500 transition-colors duration-300`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div
                              className={`font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Web Development
                            </div>
                            <div
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Due in 5 days
                            </div>
                          </div>
                          <div className="text-orange-500 text-sm font-medium">
                            ₹850
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                            style={{ width: "65%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Progress
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            65%
                          </span>
                        </div>
                      </motion.div>

                      {/* Project Item 2 - Just Started */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className={`${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        } rounded-lg p-3 mb-3 border ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        } hover:border-orange-500 transition-colors duration-300`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div
                              className={`font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Financial Advice
                            </div>
                            <div
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Due in 2 weeks
                            </div>
                          </div>
                          <div className="text-orange-500 text-sm font-medium">
                            ₹500
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                            style={{ width: "25%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Progress
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            25%
                          </span>
                        </div>
                      </motion.div>

                      {/* Project Item 3 - Almost Complete */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.5 }}
                        className={`${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        } rounded-lg p-3 mb-3 border ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        } hover:border-orange-500 transition-colors duration-300`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div
                              className={`font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              UI/UX Design
                            </div>
                            <div
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Due in 3 days
                            </div>
                          </div>
                          <div className="text-orange-500 text-sm font-medium">
                            ₹490
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Progress
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            90%
                          </span>
                        </div>
                      </motion.div>

                      {/* Action Buttons */}
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.5 }}
                        className="mt-4 flex space-x-2"
                      >
                        <button
                          className={`flex-1 ${
                            darkMode
                              ? "bg-gray-700 hover:bg-gray-600"
                              : "bg-orange-100 hover:bg-orange-200"
                          } ${
                            darkMode ? "text-white" : "text-orange-600"
                          } py-2 rounded-lg text-sm transition-all duration-300 border ${
                            darkMode ? "border-gray-600" : "border-orange-200"
                          }`}
                        >
                          Find Jobs
                        </button>
                        <button
                          className={`flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm transition-all duration-300`}
                        >
                          Messages
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500 rounded-full filter blur-xl opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-orange-500 rounded-full filter blur-xl opacity-20"></div>

              {/* Notification cards with improved floating animations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 1.2, duration: 0.5 },
                }}
                className="absolute -right-6 top-1/4"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    transition: {
                      repeat: Infinity,
                      duration: 6,
                      ease: "easeInOut",
                      times: [0, 0.5, 1], // Makes the animation more natural
                    },
                  }}
                  whileHover={{
                    opacity: 0.7,
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  className="cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg blur opacity-30"></div>
                    <div
                      className={`relative ${
                        darkMode ? "bg-gray-800/90" : "bg-white/90"
                      } backdrop-blur-sm px-4 py-3 rounded-lg border ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      } transition-all duration-300 hover:backdrop-blur-none`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            darkMode ? "bg-gray-700" : "bg-orange-100"
                          } flex items-center justify-center`}
                        >
                          <FaComments className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            New Message
                          </div>
                          <div
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            from Client #3
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 1.4, duration: 0.5 },
                }}
                className="absolute -left-6 bottom-1/4"
              >
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    transition: {
                      repeat: Infinity,
                      duration: 7, // Slightly longer for more variety
                      ease: "easeInOut",
                      times: [0, 0.5, 1], // Makes the animation more natural
                      delay: 0.5, // Offset timing from the other notification
                    },
                  }}
                  whileHover={{
                    opacity: 0.7,
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  className="cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg blur opacity-30"></div>
                    <div
                      className={`relative ${
                        darkMode ? "bg-gray-800/90" : "bg-white/90"
                      } backdrop-blur-sm px-4 py-3 rounded-lg border ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      } transition-all duration-300 hover:backdrop-blur-none`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            darkMode ? "bg-gray-700" : "bg-orange-100"
                          } flex items-center justify-center`}
                        >
                          <FaMoneyBillWave className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Payment Received
                          </div>
                          <div
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            ₹500.00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span
          className={`text-sm mb-2 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Scroll to explore
        </span>
        <motion.div
          className={`w-6 h-10 border-2 ${
            darkMode ? "border-gray-700" : "border-gray-300"
          } rounded-full flex justify-center p-1 relative`}
          initial={{ y: 0 }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <motion.div
            className="w-1.5 h-1.5 bg-orange-500 rounded-full"
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

const FeaturesSection = ({ darkMode }) => {
  const features = [
    {
      title: "Secure Payments",
      description:
        "Funds are held safely until work is completed and approved, protecting both parties.",
      icon: <FaMoneyBillWave className="h-6 w-6 text-orange-500" />,
    },
    {
      title: "Messaging System",
      description:
        "Communicate directly with clients or freelancers through our built-in chat system.",
      icon: <FaComments className="h-6 w-6 text-orange-500" />,
    },
    {
      title: "Reviews & Ratings",
      description:
        "Build your reputation with client reviews and ratings to stand out from the crowd.",
      icon: <FaStar className="h-6 w-6 text-orange-500" />,
    },
    {
      title: "Skills Showcase",
      description:
        "Highlight your expertise with a comprehensive bio and skills profile.",
      icon: <FaUserAlt className="h-6 w-6 text-orange-500" />,
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden" id="features">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-orange-500 to-transparent opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-orange-500 to-transparent opacity-10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-6 mx-auto"></div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Features that <span className="text-orange-500">empower</span> you
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Our platform is designed to streamline the freelancing experience
            from start to finish.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div
                className={`relative ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 h-full border ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative ${
                    darkMode ? "bg-gray-700" : "bg-orange-100"
                  }`}
                >
                  {feature.icon}
                  <div className="absolute -inset-1 bg-orange-500 rounded-xl opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                </div>
                <h3
                  className={`text-xl sm:text-2xl font-bold mb-4 group-hover:text-orange-500 transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`${
                    darkMode
                      ? "text-gray-400 group-hover:text-gray-300"
                      : "text-gray-600 group-hover:text-gray-700"
                  } transition-colors duration-300`}
                >
                  {feature.description}
                </p>

                <div className="absolute top-4 right-4">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path
                      d="M10 10C20 10 30 20 30 30"
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = ({ darkMode }) => {
  const timelineRef = useRef(null);
  const employerStepsRef = useRef([]);
  const freelancerStepsRef = useRef([]);

  // Reset refs for dynamic content
  employerStepsRef.current = [];
  freelancerStepsRef.current = [];

  const employerSteps = [
    {
      number: "01",
      title: "Post a Job",
      description:
        "Specify job type, payment amount, and provide a detailed description.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Pay Upfront",
      description:
        "Secure the job by paying the specified amount (held in escrow).",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Review Applicants",
      description:
        "Choose the best freelancer based on their profile, skills, and ratings.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Collaborate",
      description:
        "Communicate through our chat system to explain requirements.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      number: "05",
      title: "Approve Work",
      description:
        "Release payment in increments as work is completed and approved.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      number: "06",
      title: "Rate & Review",
      description:
        "Provide feedback to help the freelancer build their reputation.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
    },
  ];

  const freelancerSteps = [
    {
      number: "01",
      title: "Create Profile",
      description:
        "Showcase your skills, experience, and portfolio to stand out.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Browse Jobs",
      description:
        "Find opportunities that match your expertise and interests.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Apply for Jobs",
      description: "Submit applications to jobs that interest you.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Get Selected",
      description: "If chosen, you'll be notified and can begin communication.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      number: "05",
      title: "Complete Work",
      description:
        "Deliver quality work in stages to receive incremental payments.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      number: "06",
      title: "Get Paid & Rated",
      description:
        "Receive payment and build your reputation with positive reviews.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  // Add to refs for GSAP animations
  const addToEmployerRefs = (el) => {
    if (el && !employerStepsRef.current.includes(el)) {
      employerStepsRef.current.push(el);
    }
  };

  const addToFreelancerRefs = (el) => {
    if (el && !freelancerStepsRef.current.includes(el)) {
      freelancerStepsRef.current.push(el);
    }
  };

  // GSAP animations
  useEffect(() => {
    if (!timelineRef.current) return;

    // Timeline progress animation
    const timelineAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: timelineRef.current,
        start: "top 80%",
        end: "bottom 20%",
        scrub: true,
      },
    });

    // Animate the timeline progress line
    timelineAnimation.to(".timeline-progress", {
      height: "100%",
      duration: 1,
      ease: "none",
    });

    // Animate employer steps
    employerStepsRef.current.forEach((step, index) => {
      gsap.fromTo(
        step,
        {
          x: -50,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: step,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // Animate freelancer steps
    freelancerStepsRef.current.forEach((step, index) => {
      gsap.fromTo(
        step,
        {
          x: 50,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: step,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    return () => {
      // Clean up ScrollTrigger instances
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      id="how-it-works"
      className={`py-20 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-6 mx-auto"></div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            How <span className="text-orange-500">It Works</span>
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            A simple process for both employers and freelancers
          </p>
        </motion.div>

        <div className="hidden md:flex flex-col lg:flex-row justify-between mb-8">
          <div className="lg:w-1/2 mb-8 lg:mb-0 text-center lg:text-left">
            <h3
              className={`text-2xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="text-orange-500">For Employers</span>
            </h3>
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-600"
              } max-w-md mx-auto lg:mx-0`}
            >
              Post jobs, find talent, and get your projects completed with ease.
            </p>
          </div>
          <div className="lg:w-1/2 text-center lg:text-right">
            <h3
              className={`text-2xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="text-orange-500">For Freelancers</span>
            </h3>
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-600"
              } max-w-md mx-auto lg:ml-auto lg:mr-0`}
            >
              Showcase your skills, find work, and build your professional
              reputation.
            </p>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="relative hidden md:block" ref={timelineRef}>
          {/* Center Timeline */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400/20 to-orange-600/20 rounded-full"></div>
          <div
            className="absolute left-1/2 transform -translate-x-1/2 top-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full timeline-progress"
            style={{ height: "0%" }}
          ></div>

          <div className="space-y-24 py-8">
            {employerSteps.map((step, index) => (
              <div key={`timeline-${index}`} className="relative">
                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-orange-500 z-10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>

                <div className="flex flex-col md:flex-row items-start">
                  {/* Employer Step - Left Side */}
                  <div
                    ref={addToEmployerRefs}
                    className="md:w-1/2 md:pr-12 mb-8 md:mb-0 flex justify-end"
                  >
                    <div
                      className={`relative ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      } rounded-xl shadow-lg overflow-hidden max-w-md transform transition-all duration-300 hover:shadow-xl`}
                    >
                      {/* Arrow shape on the right side */}
                      <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 rotate-45 bg-inherit"></div>

                      <div className="p-6">
                        {/* Step Number */}
                        <div className="mb-3">
                          <span className="text-orange-500 text-sm font-semibold">
                            Step {step.number}
                          </span>
                        </div>

                        {/* Title and Icon */}
                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className={`text-xl font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {step.title}
                          </h3>
                          <div
                            className={`w-12 h-12 rounded-full ${
                              darkMode ? "bg-gray-700" : "bg-orange-100"
                            } flex items-center justify-center text-orange-500`}
                          >
                            {step.icon}
                          </div>
                        </div>

                        {/* Description */}
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Freelancer Step - Right Side */}
                  <div
                    ref={addToFreelancerRefs}
                    className="md:w-1/2 md:pl-12 md:mt-0 flex justify-start"
                  >
                    <div
                      className={`relative ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      } rounded-xl shadow-lg overflow-hidden max-w-md transform transition-all duration-300 hover:shadow-xl`}
                    >
                      {/* Arrow shape on the left side */}
                      <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-8 h-8 rotate-45 bg-inherit"></div>

                      <div className="p-6">
                        {/* Step Number */}
                        <div className="mb-3">
                          <span className="text-orange-500 text-sm font-semibold">
                            Step {freelancerSteps[index].number}
                          </span>
                        </div>

                        {/* Title and Icon */}
                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className={`text-xl font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {freelancerSteps[index].title}
                          </h3>
                          <div
                            className={`w-12 h-12 rounded-full ${
                              darkMode ? "bg-gray-700" : "bg-orange-100"
                            } flex items-center justify-center text-orange-500`}
                          >
                            {freelancerSteps[index].icon}
                          </div>
                        </div>

                        {/* Description */}
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {freelancerSteps[index].description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline View */}
        <div className="md:hidden mt-12">
          <div
            className={`p-4 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg mb-8`}
          >
            <h4
              className={`text-lg font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="text-orange-500">For Employers</span>
            </h4>
            <div className="space-y-6">
              {employerSteps.map((step, index) => (
                <div
                  key={`mobile-employer-${index}`}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h5
                      className={`font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {step.title}
                    </h5>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <h4
              className={`text-lg font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="text-orange-500">For Freelancers</span>
            </h4>
            <div className="space-y-6">
              {freelancerSteps.map((step, index) => (
                <div
                  key={`mobile-freelancer-${index}`}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h5
                      className={`font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {step.title}
                    </h5>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div
            className={`inline-block p-8 rounded-xl ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border shadow-xl`}
          >
            <h3
              className={`text-2xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Ready to get started?
            </h3>
            <p
              className={`mb-6 max-w-lg mx-auto ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Join Nexara today and experience the future of freelancing.
              Whether you're looking to hire talent or find work, we've got you
              covered.
            </p>
            <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg shadow-orange-500/20 transform transition hover:scale-105">
              Get Started Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const TechStackSection = ({ darkMode }) => {
  const technologies = [
    { name: "MongoDB", icon: <SiMongodb size={40} />, color: "#47A248" },
    { name: "Express.js", icon: <SiExpress size={40} />, color: "#000000" },
    { name: "React.js", icon: <SiReact size={40} />, color: "#61DAFB" },
    { name: "Node.js", icon: <SiNodedotjs size={40} />, color: "#339933" },
    { name: "Git & GitHub", icon: <FaGithub size={40} />, color: "#F05032" },
    { name: "Vite", icon: <SiVite size={40} />, color: "#646CFF" },
  ];

  return (
    <section id="tech-stack" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-6 mx-auto"></div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Our <span className="text-orange-500">Tech Stack</span>
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Built with modern technologies for performance and scalability
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -10 }}
              className={`${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-50"
              } rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg border ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } transform transition-all duration-300 hover:shadow-xl`}
            >
              <div className="mb-4" style={{ color: tech.color }}>
                {tech.icon}
              </div>
              <h3
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {tech.name}
              </h3>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div
            className={`inline-block p-6 rounded-xl ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border shadow-lg`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              MERN Stack Architecture
            </h3>
            <p
              className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Nexara is built on the powerful MERN stack, enhanced with Vite for
              faster development.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                MongoDB
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                Express.js
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                React.js
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                Node.js
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                Vite
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const GitHubSection = ({ darkMode }) => {
  return (
    <section
      id="github"
      className={`py-20 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-6 mx-auto"></div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Open <span className="text-orange-500">Source</span>
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Nexara is an open-source project available on GitHub
          </p>
        </motion.div>

        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`max-w-3xl w-full p-8 rounded-xl ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border shadow-xl`}
          >
            <div className="flex items-center mb-6">
              <FaGithub
                className={`h-10 w-10 mr-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              />
              <div>
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  GitHub Repository
                </h3>
                <a
                  href="https://github.com/iamshamit/Freelancer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 transition-colors"
                >
                  github.com/iamshamit/Freelancer
                </a>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg mb-6 ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div className="flex items-center mb-2">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    darkMode ? "bg-gray-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`text-sm font-mono ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  git clone https://github.com/iamshamit/Freelancer.git
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <h4
                  className={`font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Tech Stack
                </h4>
                <ul
                  className={`space-y-1 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    MongoDB
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Express.js
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    React.js
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Node.js
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Git & GitHub
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Vite
                  </li>
                </ul>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <h4
                  className={`font-medium mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Getting Started
                </h4>
                <ol
                  className={`space-y-1 text-sm list-decimal list-inside ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <li>Clone the repository</li>
                  <li>Install dependencies with npm install</li>
                  <li>Set up environment variables</li>
                  <li>Run npm run dev to start development server</li>
                </ol>
              </div>
            </div>

            <a
              href="https://github.com/iamshamit/Freelancer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-orange-500/20"
            >
              View on GitHub
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
