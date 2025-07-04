// src/pages/settings/PaymentSettings.jsx
import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Plus, Edit3, Trash2 } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import SettingsLayout from "../../components/layout/SettingsLayout";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

const PaymentSettings = ({ darkMode, toggleDarkMode }) => {
  const { user } = useContext(AuthContext);

  return (
    <SettingsLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your payment methods and billing information
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PaymentMethods user={user} />
        </motion.div>
      </div>
    </SettingsLayout>
  );
};

// Payment Methods Component
const PaymentMethods = ({ user }) => {
  const [paymentMethods] = useState([
    {
      id: 1,
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: 2,
      type: "paypal",
      email: user?.email,
      isDefault: false,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Add Payment Method */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Payment Methods
          </h3>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
          >
            Add Method
          </Button>
        </div>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center mr-4">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  {method.type === "card" ? (
                    <>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {method.brand} •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900 dark:text-white">
                        PayPal
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {method.email}
                      </p>
                    </>
                  )}
                  {method.isDefault && (
                    <Badge variant="success" className="mt-1">
                      Default
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Edit3 className="h-4 w-4" />}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Billing Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country/Region
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>INR - Indian Rupee</option>
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>GBP - British Pound</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
