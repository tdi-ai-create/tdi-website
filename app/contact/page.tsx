'use client';

import { useState } from 'react';
import { Section, Container, Button, Input, Textarea, Select } from '@/components/ui';
import { Instagram, Linkedin, Facebook, Mail } from 'lucide-react';

const roleOptions = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'principal', label: 'Principal' },
  { value: 'assistant-principal', label: 'Assistant Principal' },
  { value: 'superintendent', label: 'Superintendent' },
  { value: 'curriculum-director', label: 'Curriculum Director' },
  { value: 'hr-director', label: 'HR Director' },
  { value: 'instructional-coach', label: 'Instructional Coach' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Replace with your actual Formspree endpoint
      const response = await fetch('https://formspree.io/f/mojvkpqp', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <Section background="white" className="pt-16 md:pt-24">
        <Container width="default">
          <div className="text-center">
            <h1 className="mb-4">Get in Touch</h1>
            <p className="text-xl" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              Questions, ideas, or just want to say hi? We'd love to hear from you.
            </p>
          </div>
        </Container>
      </Section>

      {/* Contact Form & Info */}
      <Section background="white" className="pt-0">
        <Container width="default">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              {status === 'success' ? (
                <div className="p-8 rounded-xl text-center" style={{ backgroundColor: 'var(--tdi-peach)' }}>
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="mb-2">Thanks for reaching out!</h3>
                  <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                    We'll get back to you within 1-2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                  />
                  
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                  
                  <Select
                    label="Your Role"
                    name="role"
                    options={roleOptions}
                    placeholder="Select your role"
                    required
                  />
                  
                  <Textarea
                    label="Message"
                    name="message"
                    placeholder="How can we help?"
                    rows={5}
                    required
                  />

                  <Button type="submit" disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </Button>

                  {status === 'error' && (
                    <p className="text-sm" style={{ color: 'var(--tdi-coral)' }}>
                      Something went wrong. Please try again or email us directly.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="mb-6">Other Ways to Reach Us</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="mb-2">Email</h4>
                  <a 
                    href="mailto:info@teachersdeserveit.com"
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    info@teachersdeserveit.com
                  </a>
                </div>

                <div>
                  <h4 className="mb-3">Social</h4>
                  <div className="flex gap-4">
                    <a
                      href="https://www.instagram.com/teachersdeserveit/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/rae-hughart/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61568079585675"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-6 h-6" />
                    </a>
                  </div>
                </div>

                <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
                  <h4 className="mb-2">For School Partnerships</h4>
                  <p className="mb-4" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                    Ready to discuss bringing TDI to your school or district?
                  </p>
                  <Button href="/for-schools/schedule-call" variant="secondary">
                    Schedule a Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
