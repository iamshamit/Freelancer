import { Grid, List } from 'lucide-react';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center justify-center p-2 rounded-md transition-colors ${
          view === 'grid'
            ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        aria-label="Grid view"
      >
        <Grid className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center justify-center p-2 rounded-md transition-colors ${
          view === 'list'
            ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        aria-label="List view"
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ViewToggle;