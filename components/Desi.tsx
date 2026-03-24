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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const greeting = "Hi! I'm Desi, your TDI guide. Whether you're a teacher looking for better PD or a school leader exploring partnerships - I'm here to help. What can I answer for you?"

  // Auto-open behavior
  useEffect(() => {
    if (hasInteracted) return

    const pulseTimer = setTimeout(() => {
      setIsPulsing(true)
    }, 8000)

    const openTimer = setTimeout(() => {
      setIsPulsing(false)
      setIsOpen(true)
      setMessages([{ role: 'assistant', content: greeting }])
      setHasInteracted(true)
    }, 10000)

    return () => {
      clearTimeout(pulseTimer)
      clearTimeout(openTimer)
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
      const assistantContent = data.content || ''
      const showContactForm = assistantContent.includes('[SHOW_CONTACT_FORM]')
      const cleanContent = assistantContent.replace('[SHOW_CONTACT_FORM]', '').trim()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleanContent,
        showContactForm,
      }])

      // Pre-fill contact form with user's question
      if (showContactForm) {
        setContactForm(prev => ({ ...prev, message: userMessage }))
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a little trouble connecting. You can reach us at hello@teachersdeserveit.com and we'll reply within 24 hours.",
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const sendContactForm = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message || contactLoading) return

    setContactLoading(true)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: 'Website Chat - Desi Contact Form',
          from_name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
          to: 'info@teachersdeserveit.com',
        }),
      })

      if (response.ok) {
        const firstName = contactForm.name.split(' ')[0]
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Got it, ${firstName}! Your message is on its way. We reply within 24 hours. Anything else I can help with?`,
        }])
        setContactForm({ name: '', email: '', message: '' })
        setContactSent(true)
      }
    } catch {
      // Silent fail - form submission error
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
      `}</style>

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
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#166534', marginBottom: '10px' }}>
                      Send us a message - we reply within 24 hours
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
