import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthErroPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const message = searchParams.message || 'Ocorreu um erro de autenticação.'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="flex justify-center mb-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro de autenticação</h2>
      <p className="text-gray-500 text-sm mb-6">{decodeURIComponent(message)}</p>
      <Link
        href="/auth/login"
        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
      >
        Voltar ao login
      </Link>
    </div>
  )
}
