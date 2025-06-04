// src/components/milestones/MilestoneList.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid3X3, List } from 'lucide-react';
import MilestoneCard from './MilestoneCard';
import MilestoneTimeline from './MilestoneTimeline';
import ViewToggle from '../common/ViewToggle';

const MilestoneList = ({ 
  milestones, 
  onApprove, 
  onRequestApproval, 
  onView,
  isEmployer 
}) => {
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');

  const filteredMilestones = milestones.filter(milestone => {
    if (filter === 'all') return true;
    return milestone.status === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'approved', label: 'Approved' },
  ];

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <ViewToggle
          view={view}
          onViewChange={setView}
          options={[
            { value: 'grid', icon: Grid3X3 },
            { value: 'timeline', icon: List },
          ]}
        />
      </div>

      {/* Content */}
      {filteredMilestones.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No milestones found</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMilestones.map((milestone, index) => (
            <MilestoneCard
              key={milestone._id}
              milestone={milestone}
              onApprove={onApprove}
              onRequestApproval={onRequestApproval}
              onView={onView}
              isEmployer={isEmployer}
              index={index}
            />
          ))}
        </div>
      ) : (
        <MilestoneTimeline milestones={filteredMilestones} />
      )}
    </div>
  );
};

export default MilestoneList;