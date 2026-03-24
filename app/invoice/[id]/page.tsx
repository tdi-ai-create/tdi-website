'use client'

import { useEffect, useState, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'

type Quote = {
  id: string
  title: string
  quote_number: string
  intro_message: string | null
  video_url: string | null
  service_start_date: string | null
  service_end_date: string | null
  payment_instructions: string | null
  terms_of_service: string | null
  po_required: boolean
  contact_name: string | null
  contact_email: string | null
  contact_organization: string | null
  status: string
  signed_by_name: string | null
  signed_at: string | null
  selected_package_index: number | null
  expires_at: string | null
  quote_packages: Package[]
}

type Package = {
  id: string
  package_index: number
  package_name: string
  description: string | null
  line_items: LineItem[]
  total_amount: number
  is_recommended: boolean
}

type LineItem = {
  label: string
  quantity: number
  unit_price: number
  total: number
  is_complimentary: boolean
}

const STEPS = [
  { key: 'intro', label: 'Introduction' },
  { key: 'video', label: 'Welcome Video' },
  { key: 'services', label: 'Review Services' },
  { key: 'terms', label: 'Terms of Service' },
  { key: 'sign', label: 'Review & Sign' },
]

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (!match) return null
  return `https://www.youtube.com/embed/${match[1]}`
}

export default function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = getSupabase()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [selectedPackage, setSelectedPackage] = useState<number>(0)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [signedName, setSignedName] = useState('')
  const [signedEmail, setSignedEmail] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const viewTracked = useRef(false)

  useEffect(() => {
    loadQuote()
  }, [params.id])

  async function loadQuote() {
    const { data, error } = await supabase
      .from('quotes')
      .select(`*, quote_packages(*)`)
      .eq('id', params.id)
      .single()

    if (error || !data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // Sort packages by index
    data.quote_packages = (data.quote_packages ?? []).sort(
      (a: Package, b: Package) => a.package_index - b.package_index
    )

    setQuote(data)
    setLoading(false)

    // Track view
    if (!viewTracked.current && ['sent', 'viewed'].includes(data.status)) {
      viewTracked.current = true
      fetch(`/api/quotes/${params.id}/view`, { method: 'POST' })
    }

    // If already signed, jump to confirmation
    if (data.status === 'signed') setSigned(true)
  }

  // Get active steps (skip video if no URL)
  const activeSteps = quote?.video_url
    ? STEPS
    : STEPS.filter(s => s.key !== 'video')

  function goNext() {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    setCurrentStep(prev => Math.min(prev + 1, activeSteps.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Canvas drawing for signature
  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()
    setIsDrawing(true)
    setHasDrawn(true)
    lastPos.current = getPos(e, canvas)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()
    const ctx = canvas.getContext('2d')
    if (!ctx || !lastPos.current) return
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  function stopDraw() {
    setIsDrawing(false)
    lastPos.current = null
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  async function handleSign() {
    if (!signedName.trim() || !agreedToTerms) return
    setSigning(true)

    const canvas = canvasRef.current
    const signatureDrawn = hasDrawn && canvas ? canvas.toDataURL() : null

    const response = await fetch(`/api/quotes/${params.id}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signedByName: signedName,
        signedByEmail: signedEmail,
        signatureTyped: signedName,
        signatureDrawn,
        selectedPackageIndex: selectedPackage,
      }),
    })

    const data = await response.json()
    if (data.success) {
      setSigned(true)
      setQuote(prev => prev ? { ...prev, status: 'signed', signed_by_name: signedName, signed_at: new Date().toISOString() } : prev)
    }

    setSigning(false)
  }

  const currentStepKey = activeSteps[currentStep]?.key

  // ---- LOADING ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ---- NOT FOUND ----
  if (notFound || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">&#128269;</p>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Quote not found</h2>
          <p className="text-sm text-gray-500">This link may be invalid or the quote may have been removed.</p>
          <p className="text-sm text-gray-400 mt-4">Questions? Contact <a href="mailto:Billing@Teachersdeserveit.com" className="text-amber-600 hover:underline">Billing@Teachersdeserveit.com</a></p>
        </div>
      </div>
    )
  }

  // ---- EXPIRED ----
  if (quote.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <img src="/images/logo.webp" alt="Teachers Deserve It" className="h-10 mx-auto mb-6" onError={e => (e.currentTarget.style.display = 'none')} />
          <p className="text-4xl mb-4">&#9203;</p>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">This quote has expired</h2>
          <p className="text-sm text-gray-500 mb-4">This proposal was open for 30 days and has now expired. Please reach out to your TDI contact to request a new quote.</p>
          <a href="mailto:rae@teachersdeserveit.com" className="inline-block bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg">
            Contact TDI to Reissue &rarr;
          </a>
          <p className="text-xs text-gray-400 mt-4">Billing@Teachersdeserveit.com</p>
        </div>
      </div>
    )
  }

  // ---- ALREADY SIGNED / CONFIRMATION ----
  if (signed || quote.status === 'signed') {
    const pkg = quote.quote_packages?.[quote.selected_package_index ?? 0]
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <img src="/images/logo.webp" alt="Teachers Deserve It" className="h-10 mx-auto mb-6" onError={e => (e.currentTarget.style.display = 'none')} />
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agreement Approved</h2>
          <p className="text-gray-600 mb-1">
            Signed by <strong>{quote.signed_by_name}</strong>
          </p>
          {quote.signed_at && (
            <p className="text-sm text-gray-400 mb-6">
              {new Date(quote.signed_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {pkg && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Selected Package</p>
              <p className="font-semibold text-gray-900">{pkg.package_name}</p>
              <p className="text-lg font-bold text-amber-600 mt-1">${Number(pkg.total_amount).toLocaleString()}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">A copy of this agreement has been recorded. Our team will be in touch shortly to coordinate next steps.</p>
          <p className="text-xs text-gray-400 mt-4">Questions? <a href="mailto:Billing@Teachersdeserveit.com" className="text-amber-600 hover:underline">Billing@Teachersdeserveit.com</a></p>
        </div>
      </div>
    )
  }

  const selectedPkg = quote.quote_packages?.[selectedPackage]

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDEBAR */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col p-6 fixed h-full hidden lg:flex">
        {/* TDI Logo */}
        <div className="mb-8">
          <img src="/images/logo.webp" alt="Teachers Deserve It" className="h-12" onError={e => (e.currentTarget.style.display = 'none')} />
        </div>

        {/* Progress steps */}
        <nav className="flex-1">
          <ul className="space-y-0">
            {activeSteps.map((step, index) => {
              const isCompleted = completedSteps.has(index)
              const isCurrent = index === currentStep
              const isPast = index < currentStep

              return (
                <li key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      isCompleted || isPast
                        ? 'bg-amber-500 border-amber-500'
                        : isCurrent
                        ? 'border-amber-500 bg-white'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isCompleted || isPast ? (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      ) : null}
                    </div>
                    {index < activeSteps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${isPast ? 'bg-amber-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <span className={`text-sm pt-0.5 ${isCurrent ? 'font-semibold text-gray-900' : isPast ? 'text-gray-500' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">Questions?</p>
          <a href="mailto:Billing@Teachersdeserveit.com" className="text-xs text-amber-600 hover:underline">Billing@Teachersdeserveit.com</a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 max-w-3xl">

        {/* STEP 1: INTRODUCTION */}
        {currentStepKey === 'intro' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Introduction</h1>
              <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download as PDF
              </button>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <p className="text-sm text-gray-500 mb-4">Agreement between</p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold text-gray-900">Rae Hughart</p>
                  <p className="text-sm text-gray-600">Teachers Deserve It</p>
                  <p className="text-sm text-gray-500">rae@teachersdeserveit.com</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{quote.contact_name}</p>
                  <p className="text-sm text-gray-600">{quote.contact_organization}</p>
                  <p className="text-sm text-gray-500">{quote.contact_email}</p>
                </div>
              </div>
            </div>

            {quote.intro_message && (
              <div className="prose prose-sm max-w-none">
                {quote.intro_message.split('\n').map((line, i) => (
                  <p key={i} className="text-gray-700 mb-2">{line}</p>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button onClick={goNext} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg text-sm">
                Review the agreement &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WELCOME VIDEO */}
        {currentStepKey === 'video' && quote.video_url && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Video</h1>
            <p className="text-gray-600">A personal message from the TDI team.</p>

            <div className="rounded-xl overflow-hidden shadow-lg aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(quote.video_url) ?? ''}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back</button>
              <button onClick={goNext} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg text-sm">
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW SERVICES */}
        {currentStepKey === 'services' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Review Services</h1>

            {quote.service_start_date && quote.service_end_date && (
              <p className="text-sm text-gray-500">
                Service period: {new Date(quote.service_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - {new Date(quote.service_end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}

            {/* Package selector if multiple */}
            {quote.quote_packages.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {quote.quote_packages.map((pkg, i) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      selectedPackage === i
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {pkg.package_name}
                    {pkg.is_recommended && <span className="ml-2 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Recommended</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Selected package line items */}
            {selectedPkg && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {selectedPkg.description && (
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm text-gray-600">{selectedPkg.description}</p>
                  </div>
                )}
                <div className="divide-y divide-gray-100">
                  {(selectedPkg.line_items ?? []).map((item: LineItem, i: number) => (
                    <div key={i} className="flex items-center justify-between px-5 py-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.quantity} &times; ${Number(item.unit_price).toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded">Billed once</span>
                        {item.is_complimentary ? (
                          <div className="text-right">
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Complimentary</span>
                            <p className="text-sm text-gray-400 line-through mt-0.5">${Number(item.unit_price * item.quantity).toLocaleString()}</p>
                          </div>
                        ) : (
                          <p className="font-semibold text-gray-900">${Number(item.total).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <p className="font-semibold text-gray-700">Total</p>
                  <p className="text-xl font-bold text-gray-900">${Number(selectedPkg.total_amount).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back</button>
              <button onClick={goNext} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg text-sm">
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TERMS OF SERVICE */}
        {currentStepKey === 'terms' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>

            <div className="bg-white border border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto prose prose-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-3">General Terms of Service</h3>
              {(quote.terms_of_service ?? 'No terms provided.').split('\n').map((line, i) => (
                <p key={i} className="text-gray-700 text-sm mb-2">{line}</p>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back</button>
              <button onClick={goNext} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg text-sm">
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SIGN */}
        {currentStepKey === 'sign' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Review &amp; Sign</h1>

            {/* Payment instructions */}
            {quote.payment_instructions && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Terms</p>
                {quote.payment_instructions.split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-gray-700">{line}</p>
                ))}
              </div>
            )}

            {/* Selected package summary */}
            {selectedPkg && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">You are approving</p>
                <p className="font-semibold text-gray-900">{selectedPkg.package_name}</p>
                <p className="text-xl font-bold text-amber-600">${Number(selectedPkg.total_amount).toLocaleString()}</p>
              </div>
            )}

            {/* PO Number */}
            {quote.po_required && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number (required)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={poNumber}
                  onChange={e => setPoNumber(e.target.value)}
                  placeholder="Enter your PO number"
                />
              </div>
            )}

            {/* Typed name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={signedName}
                onChange={e => setSignedName(e.target.value)}
                placeholder="Type your full name to sign"
              />
              {signedName && (
                <p className="mt-2 font-['Georgia'] text-2xl text-gray-700 italic">{signedName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={signedEmail}
                onChange={e => setSignedEmail(e.target.value)}
                placeholder={quote.contact_email ?? 'your@email.com'}
              />
            </div>

            {/* Drawn signature */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Draw Signature (optional)</label>
                <button onClick={clearCanvas} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
              </div>
              <canvas
                ref={canvasRef}
                width={600}
                height={120}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair bg-white"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <p className="text-xs text-gray-400 mt-1">Draw your signature above, or leave blank to sign with typed name only.</p>
            </div>

            {/* Agreement checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded"
              />
              <span className="text-sm text-gray-700">
                I have reviewed and agree to the services, pricing, and terms outlined in this agreement. I understand this constitutes a binding agreement between my organization and Teachers Deserve It.
              </span>
            </label>

            <div className="flex items-center justify-between pt-2">
              <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back</button>
              <button
                onClick={handleSign}
                disabled={signing || !signedName.trim() || !agreedToTerms || (quote.po_required && !poNumber.trim())}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-lg text-sm transition-colors"
              >
                {signing ? 'Saving...' : 'Click to Approve Agreement'}
              </button>
            </div>

            <p className="text-xs text-center text-gray-400">
              Questions? <a href="mailto:Billing@Teachersdeserveit.com" className="text-amber-600 hover:underline">Billing@Teachersdeserveit.com</a>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
