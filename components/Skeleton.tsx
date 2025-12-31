export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-40 bg-gray-300 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex justify-start">
        <div className="max-w-xs bg-gray-300 h-12 rounded-2xl"></div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-xs bg-gray-300 h-12 rounded-2xl"></div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-xs bg-gray-300 h-16 rounded-2xl"></div>
      </div>
    </div>
  );
}

export function UserListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 sm:p-4 bg-gray-100 rounded-lg space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl h-48"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
