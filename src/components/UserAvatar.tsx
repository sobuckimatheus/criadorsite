export function UserAvatar({ name, email }: { name?: string; email?: string }) {
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        {name && <p className="text-sm font-medium text-gray-800 truncate">{name}</p>}
        {email && <p className="text-xs text-gray-400 truncate">{email}</p>}
      </div>
    </div>
  )
}
