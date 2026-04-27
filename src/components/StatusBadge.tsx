import { cn } from '@/lib/utils'
import { STATUS_LABELS } from '@/types'

type SiteStatus = 'DRAFT' | 'GENERATING' | 'PREVIEW' | 'PUBLISHED' | 'ERROR'

const STATUS_STYLES: Record<SiteStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  GENERATING: 'bg-amber-100 text-amber-700',
  PREVIEW: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ERROR: 'bg-red-100 text-red-700',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full',
        STATUS_STYLES[status as SiteStatus] ?? 'bg-gray-100 text-gray-600'
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
