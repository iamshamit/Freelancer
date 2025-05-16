// frontend/src/components/common/SkeletonLoader.jsx
const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="mt-6 flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="rounded-full bg-gray-200 h-16 w-16"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        );
      case 'chat':
        return (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex justify-start mb-4">
              <div className="rounded-full bg-gray-200 h-8 w-8"></div>
              <div className="ml-2 bg-gray-200 rounded-lg p-3 w-2/3">
                <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <div className="mr-2 bg-gray-200 rounded-lg p-3 w-2/3">
                <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="rounded-full bg-gray-200 h-8 w-8"></div>
            </div>
          </div>
        );
      default:
        return <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;