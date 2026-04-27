import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-gray-200 mb-4">404</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Página não encontrada</h2>
        <p className="text-gray-500 text-sm mb-6">A página que você procura não existe.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Ir para o dashboard
        </Link>
      </div>
    </div>
  )
}
