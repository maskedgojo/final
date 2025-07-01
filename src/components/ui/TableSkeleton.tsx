'use client'

export default function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse divide-y divide-gray-200">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 py-4 px-3">
          {[...Array(columns)].map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-gray-200 rounded w-full"
              style={{ width: `${60 - colIndex * 10}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
