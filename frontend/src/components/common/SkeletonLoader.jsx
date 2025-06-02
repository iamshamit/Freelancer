// frontend/src/components/common/SkeletonLoader.jsx
const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-[#1C2531] rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-[#2B3543] rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-[#2B3543] rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-[#2B3543] rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-[#2B3543] rounded w-2/3"></div>
            <div className="mt-6 flex justify-between">
              <div className="h-8 bg-[#2B3543] rounded w-1/4"></div>
              <div className="h-8 bg-[#2B3543] rounded w-1/4"></div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-[#1C2531] rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="rounded-full bg-[#2B3543] h-16 w-16"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-[#2B3543] rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-[#2B3543] rounded w-1/3"></div>
              </div>
            </div>
            <div className="h-4 bg-[#2B3543] rounded w-full mb-4"></div>
            <div className="h-4 bg-[#2B3543] rounded w-full mb-4"></div>
            <div className="h-4 bg-[#2B3543] rounded w-3/4"></div>
          </div>
        );
      case 'chat':
        return (
          <div className="bg-[#1C2531] rounded-lg shadow p-6 animate-pulse">
            <div className="flex justify-start mb-4">
              <div className="rounded-full bg-[#2B3543] h-8 w-8"></div>
              <div className="ml-2 bg-[#2B3543] rounded-lg p-3 w-2/3">
                <div className="h-3 bg-[#3A4758] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#3A4758] rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <div className="mr-2 bg-[#2B3543] rounded-lg p-3 w-2/3">
                <div className="h-3 bg-[#3A4758] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#3A4758] rounded w-1/2"></div>
              </div>
              <div className="rounded-full bg-[#2B3543] h-8 w-8"></div>
            </div>
          </div>
        );
      case 'chatList':
        return (
          <div className="flex items-start gap-4 p-4 bg-[#1C2531] rounded-lg shadow animate-pulse">
            <div className="rounded-full bg-[#2B3543] h-12 w-12"></div>
            <div className="flex-1">
              <div className="h-4 bg-[#2B3543] rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-[#2B3543] rounded w-2/3"></div>
            </div>
            <div className="ml-auto h-3 w-12 bg-[#2B3543] rounded"></div>
          </div>
        );
      case 'list-jobs':
        return (
          <div className="bg-[#1C2434] rounded-lg shadow-lg p-6 animate-pulse text-white">
            <div className="h-4 bg-gray-600 rounded w-20 mb-3"></div> {/* Status badge */}
            <div className="h-6 bg-gray-500 rounded w-1/3 mb-2"></div> {/* Title */}
            <div className="h-4 bg-gray-600 rounded w-full mb-4"></div> {/* Description line 1 */}
            <div className="h-4 bg-gray-600 rounded w-4/5 mb-4"></div> {/* Description line 2 */}
            <div className="flex items-center justify-between mt-4">
              <div className="h-4 bg-green-500 rounded w-20"></div> {/* Price */}
              <div className="h-4 bg-gray-500 rounded w-32"></div> {/* Applicants */}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <div className="h-10 w-20 bg-orange-500 rounded-lg"></div> {/* Details btn */}
              <div className="h-10 w-24 bg-gray-600 rounded-lg"></div> {/* Applicants btn */}
            </div>
          </div>
        );
      case 'list-item':
        return (
          <div className="bg-[#1C2434] rounded-lg shadow-lg p-6 animate-pulse text-white">
            <div className="flex gap-2 mb-2">
              <div className="h-5 w-24 bg-orange-500 rounded-full"></div> {/* Category badge */}
              <div className="h-5 w-12 bg-green-500 rounded-full"></div> {/* Status badge */}
            </div>
            <div className="h-6 bg-gray-500 rounded w-1/3 mb-2"></div> {/* Title */}
            <div className="h-4 bg-gray-600 rounded w-full mb-4"></div> {/* Description */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <div className="h-4 w-20 bg-green-500 rounded"></div> {/* Price */}
              <div className="h-4 w-28 bg-gray-600 rounded"></div> {/* Date */}
              <div className="h-4 w-24 bg-gray-600 rounded"></div> {/* Employer */}
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-28 bg-orange-500 rounded-lg"></div> {/* View Details */}
            </div>
          </div>
        );
      default:
        return <div className="h-4 bg-[#2B3543] rounded w-full animate-pulse"></div>;
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
