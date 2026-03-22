'use client'

interface Quote {
  id: string
  quote_text: string
  teacher_role: string
  session_type: string
  created_at: string
}

interface TeacherQuotesProps {
  quotes: Quote[]
}

export function TeacherQuotes({ quotes }: TeacherQuotesProps) {
  if (!quotes || quotes.length === 0) return null

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-6 mb-4"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Voices From Your School</h2>
      <p className="text-sm text-gray-400 mb-5">What your educators are saying about TDI</p>

      <div className="space-y-4">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="p-4 rounded-xl border-l-4"
            style={{ background: '#F9FAFB', borderLeftColor: '#2D7D78' }}
          >
            <p className="text-sm text-gray-700 italic leading-relaxed">
              &ldquo;{quote.quote_text}&rdquo;
            </p>
            {quote.teacher_role && (
              <p className="text-xs text-gray-400 mt-2 font-medium">- {quote.teacher_role}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
