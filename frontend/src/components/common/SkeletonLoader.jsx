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
        case 'chatbox':
          return (
            <div className="flex flex-col bg-gray-900 h-full w-full animate-pulse">
              {/* Chat Header Skeleton */}
              <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-600 rounded-full border-2 border-gray-800"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                      <div className="flex items-center space-x-2">
                        <div className="h-3 bg-gray-600 rounded w-24"></div>
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <div className="h-3 bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 bg-gray-700 rounded-lg"></div>
                    <div className="w-9 h-9 bg-gray-700 rounded-lg"></div>
                    <div className="w-9 h-9 bg-gray-700 rounded-lg"></div>
                    <div className="w-9 h-9 bg-gray-700 rounded-lg"></div>
                  </div>
                </div>
              </div>
        
              {/* Messages Area Skeleton */}
              <div className="flex-1 bg-gray-900 p-4 md:p-6 lg:p-8 overflow-hidden">
                {/* Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="bg-gray-800 border border-gray-700 px-4 py-1.5 rounded-full">
                    <div className="h-3 bg-gray-600 rounded w-12"></div>
                  </div>
                </div>
        
                {/* Message Bubbles */}
                <div className="space-y-4">
                  {/* Received Message */}
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                      <div className="bg-gray-800 rounded-lg p-3 flex-1">
                        <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
        
                  {/* Sent Message */}
                  <div className="flex justify-end">
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      <div className="bg-orange-500 rounded-lg p-3 flex-1">
                        <div className="h-3 bg-orange-400 rounded w-full mb-2"></div>
                        <div className="h-3 bg-orange-400 rounded w-2/3"></div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                    </div>
                  </div>
        
                  {/* Another Received Message */}
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                      <div className="bg-gray-800 rounded-lg p-3 flex-1">
                        <div className="h-3 bg-gray-600 rounded w-4/5 mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
        
                  {/* Another Sent Message */}
                  <div className="flex justify-end">
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      <div className="bg-orange-500 rounded-lg p-3 flex-1">
                        <div className="h-3 bg-orange-400 rounded w-3/4"></div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                    </div>
                  </div>
        
                  {/* More messages to fill space */}
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                      <div className="bg-gray-800 rounded-lg p-3 flex-1">
                        <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
        
                  <div className="flex justify-end">
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      <div className="bg-orange-500 rounded-lg p-3 flex-1">
                        <div className="h-3 bg-orange-400 rounded w-full mb-2"></div>
                        <div className="h-3 bg-orange-400 rounded w-4/5"></div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                    </div>
                  </div>
                </div>
                {/* Message Bubbles - Second Block (could be a loop for more messages) */}
                <div className="space-y-4">
                  {/* Received Message */}
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                      <div className="bg-gray-800 rounded-lg p-3 flex-1">
                        <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                  {/* More messages to fill space */}
                  <div className="flex justify-end">
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      <div className="bg-orange-500 rounded-lg p-3 flex-1">
                        <div className="h-3 bg-orange-400 rounded w-full mb-2"></div>
                        <div className="h-3 bg-orange-400 rounded w-4/5"></div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
                    </div>
                  </div>
                </div>
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
        case 'milestone-page':
          return (
            <div className="max-w-7xl mx-auto p-6 animate-pulse">
              {/* Header Skeleton */}
              <div className="mb-8">
                {/* Back button */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-600 rounded w-12"></div>
                </div>
        
                <div className="flex items-start justify-between">
                  <div>
                    {/* Title */}
                    <div className="h-8 bg-gray-500 rounded w-80 mb-2"></div>
                    {/* Description */}
                    <div className="h-4 bg-gray-600 rounded w-64"></div>
                  </div>
        
                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-24 bg-gray-600 rounded-lg"></div>
                    <div className="h-10 w-32 bg-orange-500 rounded-lg"></div>
                  </div>
                </div>
              </div>
        
              {/* Progress Overview Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Overall Progress Card */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="h-6 bg-gray-600 rounded w-40 mb-4"></div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                      <div className="bg-orange-500 h-4 rounded-full w-1/3"></div>
                    </div>
                    {/* Progress markers */}
                    <div className="flex justify-between mt-2">
                      <div className="h-3 bg-gray-600 rounded w-8"></div>
                      <div className="h-3 bg-gray-600 rounded w-8"></div>
                      <div className="h-3 bg-gray-600 rounded w-8"></div>
                      <div className="h-3 bg-gray-600 rounded w-8"></div>
                    </div>
                  </div>
                </div>
        
                {/* Escrow Balance Card */}
                <div>
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="h-6 bg-gray-600 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-600 rounded w-20"></div>
                        <div className="h-4 bg-green-500 rounded w-16"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-600 rounded w-24"></div>
                        <div className="h-4 bg-gray-600 rounded w-16"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-600 rounded w-16"></div>
                        <div className="h-4 bg-orange-500 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        
              {/* Milestones List Skeleton */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="h-6 bg-gray-600 rounded w-48 mb-6"></div>
                
                {/* Milestone Items */}
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-600 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-gray-600 rounded w-32"></div>
                        </div>
                        <div className="h-6 w-20 bg-orange-500 rounded-full"></div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                      </div>
        
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-4 bg-green-500 rounded w-16"></div>
                          <div className="h-4 bg-gray-600 rounded w-20"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 w-20 bg-gray-600 rounded-lg"></div>
                          <div className="h-8 w-24 bg-orange-500 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
