import { Skeleton } from '@/components/ui/skeleton'

export default function CriarLoading() {
  return (
    <div className="py-10 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center flex-1">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-16 ml-1.5 hidden sm:block" />
                  {i < 4 && <Skeleton className="flex-1 h-px mx-2" />}
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 pt-5 border-t border-gray-100 flex justify-between">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
