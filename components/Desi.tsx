'use client'

import { useState, useEffect, useRef } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  showContactForm?: boolean
}

type ContactForm = {
  name: string
  email: string
  message: string
}

export default function Desi() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [contactForm, setContactForm] = useState<ContactForm>({ name: '', email: '', message: '' })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSent, setContactSent] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const greeting = "Hi! I'm Desi, your TDI guide. Whether you're a teacher looking for better PD or a school leader exploring partnerships - I'm here to help. What can I answer for you?"

  // Pulse behavior (no auto-open)
  useEffect(() => {
    if (hasInteracted) return

    const pulseTimer = setTimeout(() => {
      setIsPulsing(true)
    }, 8000)

    return () => {
      clearTimeout(pulseTimer)
    }
  }, [hasInteracted])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleToggle = () => {
    setIsPulsing(false)
    setHasInteracted(true)
    if (!isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: greeting }])
    }
    setIsOpen(!isOpen)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/desi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      })

      if (!response.ok) throw new Error('API error')

      const data = await response.json()
      const assistantContent = data.message || ''
      const showForm = data.showContactForm || false

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantContent,
        showContactForm: showForm,
      }])

      // Pre-fill contact form with user's question
      if (showForm) {
        setContactForm(prev => ({ ...prev, message: userMessage }))
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a little trouble connecting. You can find more info at teachersdeserveit.com/contact - our team replies within 24 hours.",
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const sendContactForm = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message || contactLoading) return

    setContactLoading(true)

    // Build transcript from message history
    const transcript = messages
      .map(m => `${m.role === 'user' ? 'Visitor' : 'Desi'}: ${m.content}`)
      .join('\n')

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: `Website Chat Ticket - ${contactForm.name}`,
          from_name: contactForm.name,
          email: contactForm.email,
          message: `
NAME: ${contactForm.name}
EMAIL: ${contactForm.email}

THEIR QUESTION:
${contactForm.message}

--- FULL CHAT TRANSCRIPT ---
${transcript}
          `.trim(),
          to: 'info@teachersdeserveit.com',
        }),
      })

      if (res.ok) {
        setContactSent(true)
        setShowContactForm(false)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant' as const,
            content: `Got it, ${contactForm.name.split(' ')[0]}! Your message and our full conversation have been sent to our team. A real person will reply within 24 hours. Is there anything else I can help with in the meantime?`,
          },
        ])
        setContactForm({ name: '', email: '', message: '' })
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant' as const,
          content: `Something went wrong on my end. Our team can be reached at teachersdeserveit.com/contact and will get back to you within 24 hours.`,
        },
      ])
    } finally {
      setContactLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes desi-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(27,42,74,0.35), 0 0 0 0 rgba(0,181,173,0.5); }
          50%       { box-shadow: 0 4px 20px rgba(27,42,74,0.35), 0 0 0 14px rgba(0,181,173,0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes desi-bubble-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Need anything? bubble */}
      {isPulsing && !isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          background: 'white',
          borderRadius: '12px',
          padding: '8px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          fontSize: '13px',
          fontWeight: 500,
          color: '#1B2A4A',
          zIndex: 9999,
          animation: 'desi-bubble-in 0.3s ease-out',
        }}>
          Need anything?
        </div>
      )}

      {/* Chat Button */}
      <button
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#1B2A4A',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(27,42,74,0.35)',
          zIndex: 9999,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          animation: isPulsing ? 'desi-pulse 1.6s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(27,42,74,0.45)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(27,42,74,0.35)'
        }}
        onClick={handleToggle}
        aria-label="Chat with Desi"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <img
            src="/images/desi.jpg"
            alt="Desi"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '92px',
          right: '24px',
          width: '360px',
          maxWidth: 'calc(100vw - 32px)',
          height: '520px',
          maxHeight: 'calc(100vh - 120px)',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9998,
        }}>
          {/* Header */}
          <div style={{ background: '#1B2A4A', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <img
                src="/images/desi.jpg"
                alt="Desi"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: '14px', fontWeight: 600, lineHeight: 1.2 }}>Desi</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }}/>
                TDI Guide - Online
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((message, index) => (
              <div key={index}>
                {message.role === 'assistant' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      <img
                        src="/images/desi.jpg"
                        alt="Desi"
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px 16px 16px 16px',
                      padding: '10px 14px',
                      maxWidth: '80%',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: '#111827',
                    }}>
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: '#1B2A4A',
                      borderRadius: '16px 16px 4px 16px',
                      padding: '10px 14px',
                      maxWidth: '80%',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: 'white',
                    }}>
                      {message.content}
                    </div>
                  </div>
                )}

                {/* Inline Contact Form */}
                {message.showContactForm && !contactSent && (
                  <div style={{
                    background: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    borderRadius: '12px',
                    padding: '14px',
                    margin: '8px 0 0 36px',
                    position: 'relative',
                  }}>
                    <button
                      onClick={() => {
                        // Remove showContactForm from this message
                        setMessages(prev => prev.map((m, i) =>
                          i === index ? { ...m, showContactForm: false } : m
                        ))
                        setContactForm({ name: '', email: '', message: '' })
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280',
                        padding: '4px',
                        display: 'flex',
                        borderRadius: '4px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                      onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                      aria-label="Close contact form"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
                      Send a message to our team
                    </p>
                    <p style={{ fontSize: '11px', color: '#4B7C59', marginBottom: '10px', lineHeight: 1.5 }}>
                      Fill this out and we will send your question to our team. A real person will reply within 24 hours.
                    </p>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                      style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '6px', boxSizing: 'border-box' }}
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={contactForm.email}
                      onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                      style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '6px', boxSizing: 'border-box' }}
                    />
                    <textarea
                      placeholder="Your message"
                      value={contactForm.message}
                      rows={2}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                      style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '8px', resize: 'none', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={sendContactForm}
                      disabled={contactLoading || !contactForm.name || !contactForm.email || !contactForm.message}
                      style={{
                        width: '100%',
                        padding: '9px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#16A34A',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: contactLoading ? 0.6 : 1,
                      }}
                    >
                      {contactLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  <img
                    src="/images/desi.jpg"
                    alt="Desi"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0, 150, 300].map(delay => (
                    <div key={delay} style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#9CA3AF',
                      animation: `bounce 1.2s ease-in-out ${delay}ms infinite`,
                    }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Standalone Contact Form (triggered by button) */}
            {showContactForm && !contactSent && (
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: '12px',
                padding: '14px',
                margin: '8px 0',
                position: 'relative',
              }}>
                <button
                  onClick={() => {
                    setShowContactForm(false)
                    setContactForm({ name: '', email: '', message: '' })
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                    padding: '4px',
                    display: 'flex',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  aria-label="Close contact form"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
                  Send a message to our team
                </p>
                <p style={{ fontSize: '11px', color: '#4B7C59', marginBottom: '10px', lineHeight: 1.5 }}>
                  Fill this out and we will send your question to our team. A real person will reply within 24 hours.
                </p>
                <input
                  type="text"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '6px', boxSizing: 'border-box' }}
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={contactForm.email}
                  onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                  style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '6px', boxSizing: 'border-box' }}
                />
                <textarea
                  placeholder="Your question or message"
                  value={contactForm.message}
                  rows={2}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '8px', resize: 'none', boxSizing: 'border-box' }}
                />
                <button
                  onClick={sendContactForm}
                  disabled={contactLoading || !contactForm.name || !contactForm.email || !contactForm.message}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#16A34A',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: contactLoading ? 0.6 : 1,
                  }}
                >
                  {contactLoading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            )}

            {/* Talk to our team button - always visible unless form is open */}
            {!showContactForm && !contactSent && !messages.some(m => m.showContactForm) && (
              <button
                onClick={() => {
                  setShowContactForm(true)
                  setContactForm(prev => ({ ...prev, message: '' }))
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '8px',
                  margin: '8px 0 4px',
                  background: 'transparent',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#80a4ed'
                  e.currentTarget.style.color = '#1B2A4A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E5E7EB'
                  e.currentTarget.style.color = '#6B7280'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Talk to our team
              </button>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '12px', borderTop: '1px solid #F3F4F6', background: 'white', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                style={{
                  flex: 1,
                  fontSize: '13px',
                  padding: '10px 14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  resize: 'none',
                  maxHeight: '80px',
                  lineHeight: 1.4,
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: input.trim() && !isLoading ? '#1B2A4A' : '#E5E7EB',
                  border: 'none',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#9CA3AF', margin: '8px 0 0' }}>
              Powered by TDI
            </p>
          </div>
        </div>
      )}
    </>
  )
}
