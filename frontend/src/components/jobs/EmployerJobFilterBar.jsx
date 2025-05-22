// src/components/jobs/EmployerJobFilterBar.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import PropTypes from 'prop-types';

const EmployerJobFilterBar = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof onFilterChange === 'function') {
        onFilterChange({ search, status });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, status, onFilterChange]);

  const applyFilters = () => {
    if (typeof onFilterChange === 'function') {
      onFilterChange({ search, status });
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    if (typeof onFilterChange === 'function') {
      onFilterChange({ search: '', status: '' });
    }
  };

  return (
    <div className="flex-grow max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search your jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>
      {showFilters && (
        <div className="mt-4 flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px]">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

EmployerJobFilterBar.propTypes = {
  onFilterChange: PropTypes.func.isRequired
};

export default EmployerJobFilterBar;