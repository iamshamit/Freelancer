// src/components/jobs/JobFilterBar.jsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import api from "../../services/api";

const JobFilterBar = ({ onFilterChange, viewToggle }) => {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch domains
  const { data: domains } = useQuery({
    queryKey: ["domains"],
    queryFn: () => api.domains.getAll(),
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      search,
      domain,
      minBudget: minBudget ? parseFloat(minBudget) : undefined,
      maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setDomain("");
    setMinBudget("");
    setMaxBudget("");
    onFilterChange({});
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* View toggle */}
        <div className="hidden md:block">{viewToggle}</div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </button>
        {showFilters && (
          <>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </button>
          </>
        )}
      </div>

      {/* Mobile view toggle */}
      <div className="md:hidden flex justify-center mt-4">{viewToggle}</div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Domain filter */}
          <div>
            <label
              htmlFor="domain"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Domain
            </label>
            <select
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
            >
              <option value="">All Domains</option>
              {domains?.map((domain) => (
                <option key={domain._id} value={domain._id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Min budget filter */}
          <div>
            <label
              htmlFor="minBudget"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Min Budget
            </label>
            <input
              type="number"
              id="minBudget"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              placeholder="Min ₹"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
            />
          </div>

          {/* Max budget filter */}
          <div>
            <label
              htmlFor="maxBudget"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Max Budget
            </label>
            <input
              type="number"
              id="maxBudget"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Max ₹"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilterBar;
