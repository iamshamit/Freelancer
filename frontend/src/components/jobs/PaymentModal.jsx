// src/components/jobs/PaymentModal.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, CheckCircle, Loader } from "lucide-react";
import Button from "../common/Button";

const PaymentModal = ({ isOpen, onClose, onSuccess, amount }) => {
  const [step, setStep] = useState("form"); // form, processing, success
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setCardNumber("");
      setCardName("");
      setExpiryDate("");
      setCvv("");
      setErrors({});
    }
  }, [isOpen]);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return v;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (cardNumber.replace(/\s+/g, "").length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    if (!cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    }

    if (!expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = "Invalid format (MM/YY)";
    }

    if (!cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setStep("processing");

      // Simulate payment processing
      setTimeout(() => {
        setStep("success");

        // Trigger success callback after showing success message
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === "form" && "Payment Details"}
            {step === "processing" && "Processing Payment"}
            {step === "success" && "Payment Successful"}
          </h2>
          {step === "form" && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
              >
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
                      Total Amount:
                    </span>
                    <span className="text-lg font-bold text-blue-800 dark:text-blue-400">
                      ₹{parseFloat(amount).toFixed(2)} INR
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Card Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          errors.cardNumber
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50"
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                    </div>
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label
                      htmlFor="cardName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.cardName
                          ? "border-red-500 focus:ring-red-500/30"
                          : "border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50"
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                    />
                    {errors.cardName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.cardName}
                      </p>
                    )}
                  </div>

                  {/* Expiry Date and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="expiryDate"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) =>
                          setExpiryDate(formatExpiryDate(e.target.value))
                        }
                        placeholder="MM/YY"
                        maxLength="5"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.expiryDate
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50"
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                      {errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="cvv"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="123"
                        maxLength="4"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.cvv
                            ? "border-red-500 focus:ring-red-500/30"
                            : "border-gray-300 dark:border-gray-600 focus:ring-orange-500/30 focus:border-orange-500/50"
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200`}
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button type="submit" className="w-full">
                    Pay ₹{parseFloat(amount).toFixed(2)}
                  </Button>
                </div>

                <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    This is a simulation. No actual payment will be processed.
                  </p>
                  <p>Any card details entered are not stored or transmitted.</p>
                </div>
              </motion.form>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="py-8 flex flex-col items-center"
              >
                <Loader className="h-16 w-16 text-orange-500 animate-spin mb-6" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Processing Your Payment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Please wait while we process your payment of ₹
                  {parseFloat(amount).toFixed(2)}.
                </p>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="py-8 flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
                </motion.div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  Your payment of ₹{parseFloat(amount).toFixed(2)} has been
                  processed successfully.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Your job will be posted momentarily...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
