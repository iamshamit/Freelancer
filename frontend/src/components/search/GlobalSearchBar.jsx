import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Star, Briefcase, User, Tag } from 'lucide-react';
import api from '../../services/api';

const GlobalSearchBar = ({ className = "" }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: () => api.search.suggestions(query),
    enabled: query.length >= 2,
    debounce: 300
  });

  // Get saved searches
  const { data: savedSearches } = useQuery({
    queryKey: ['savedSearches'],
    queryFn: api.search.getSavedSearches
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submit
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const recent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));

    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
    setQuery('');
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Handle delete recent search
  const handleDeleteRecentSearch = (searchToDelete, event) => {
    event.stopPropagation(); // Prevent triggering the search
    const updatedSearches = recentSearches.filter(search => search !== searchToDelete);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Clear all recent searches
  const handleClearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4" />;
      case 'skill':
        return <Tag className="w-4 h-4" />;
      case 'domain':
        return <Tag className="w-4 h-4" />;
      case 'freelancer':
        return <User className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search jobs, freelancers, skills..."
            className="w-full py-2.5 pl-10 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600 focus:border-transparent transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {/* Search suggestions */}
            {query.length >= 2 && suggestions?.suggestions?.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Suggestions
                </div>
                {suggestions.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
                  >
                    <span className="text-gray-400">
                      {getIcon(suggestion.type)}
                    </span>
                    <span className="flex-1 text-gray-700 dark:text-gray-200">
                      {suggestion.text}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {suggestion.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Recent Searches
                  </span>
                  <button
                    onClick={handleClearAllRecentSearches}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <button
                      onClick={() => handleSearch(search)}
                      className="flex-1 px-3 py-2 flex items-center gap-3 text-left"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 text-gray-700 dark:text-gray-200">
                        {search}
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteRecentSearch(search, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 mr-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                      title="Remove from recent searches"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Saved searches */}
            {!query && savedSearches?.savedSearches?.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Saved Searches
                </div>
                {savedSearches.savedSearches.slice(0, 3).map((search) => (
                  <button
                    key={search._id}
                    onClick={() => handleSearch(search.query)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
                  >
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="flex-1 text-gray-700 dark:text-gray-200">
                      {search.query}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {search.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick actions */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => navigate('/jobs')}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
              >
                <Briefcase className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700 dark:text-gray-200">Browse all jobs</span>
              </button>
              <button
                onClick={() => navigate('/freelancers')}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
              >
                <User className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700 dark:text-gray-200">Find freelancers</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearchBar;