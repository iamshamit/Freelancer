import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import api from "../../services/api";

const SearchFilters = ({ activeTab, filters, onFiltersChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    budget: true,
    rating: true,
    domain: true,
  });

  // Fetch domains
  const { data: domains } = useQuery({
    queryKey: ["domains"],
    queryFn: api.domains.getAll,
  });

  // Popular skills (could be fetched from API)
  const popularSkills = [
    "React",
    "Node.js",
    "Python",
    "JavaScript",
    "TypeScript",
    "UI/UX Design",
    "WordPress",
    "Mobile Development",
    "Data Analysis",
    "Content Writing",
    "Digital Marketing",
    "Video Editing",
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSkillToggle = (skill) => {
    const currentSkills = filters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill];

    onFiltersChange({
      ...filters,
      skills: newSkills.length > 0 ? newSkills : undefined,
    });
  };

  const handleBudgetChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value ? parseFloat(value) : undefined,
    });
  };

  const handleRatingChange = (rating) => {
    onFiltersChange({
      ...filters,
      minRating: filters.minRating === rating ? undefined : rating,
    });
  };

  const handleDomainChange = (domainId) => {
    onFiltersChange({
      ...filters,
      domain: filters.domain === domainId ? undefined : domainId,
    });
  };

  const clearFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Active filters */}
      {Object.keys(filters).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.skills?.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => handleSkillToggle(skill)}
                  className="hover:text-orange-900 dark:hover:text-orange-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.minBudget && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-sm">
                Min: ₹{filters.minBudget}
                <button
                  onClick={() => clearFilter("minBudget")}
                  className="hover:text-orange-900 dark:hover:text-orange-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.maxBudget && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-sm">
                Max: ₹{filters.maxBudget}
                <button
                  onClick={() => clearFilter("maxBudget")}
                  className="hover:text-orange-900 dark:hover:text-orange-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.minRating && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-sm">
                {filters.minRating}+ Stars
                <button
                  onClick={() => clearFilter("minRating")}
                  className="hover:text-orange-900 dark:hover:text-orange-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Skills filter */}
      {(activeTab === "all" || activeTab === "freelancers") && (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <button
            onClick={() => toggleSection("skills")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Skills
            </h4>
            {expandedSections.skills ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSections.skills && (
            <div className="mt-3 space-y-2">
              {popularSkills.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.skills?.includes(skill) || false}
                    onChange={() => handleSkillToggle(skill)}
                    className="w-4 h-4 text-orange-500 rounded border-gray-300 dark:border-gray-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {skill}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Budget filter */}
      {(activeTab === "all" || activeTab === "jobs") && (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <button
            onClick={() => toggleSection("budget")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget Range
            </h4>
            {expandedSections.budget ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSections.budget && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Minimum
                </label>
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={filters.minBudget || ""}
                  onChange={(e) =>
                    handleBudgetChange("minBudget", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Maximum
                </label>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={filters.maxBudget || ""}
                  onChange={(e) =>
                    handleBudgetChange("maxBudget", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating filter */}
      {(activeTab === "all" || activeTab === "freelancers") && (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <button
            onClick={() => toggleSection("rating")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Minimum Rating
            </h4>
            {expandedSections.rating ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSections.rating && (
            <div className="mt-3 space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="w-4 h-4 text-orange-500 border-gray-300 dark:border-gray-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300">
                    {rating}+ Stars
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Domain filter */}
      {domains && domains.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection("domain")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Domain
            </h4>
            {expandedSections.domain ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSections.domain && (
            <div className="mt-3 space-y-2">
              {domains.map((domain) => (
                <label
                  key={domain._id}
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="radio"
                    name="domain"
                    checked={filters.domain === domain._id}
                    onChange={() => handleDomainChange(domain._id)}
                    className="w-4 h-4 text-orange-500 border-gray-300 dark:border-gray-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {domain.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
