'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { ChevronRight, Plus, X } from 'lucide-react'

type Contact = {
  name: string
  title: string
  email: string
  phone: string
  department: string
  is_primary: boolean
}

const emptyContact = (): Contact => ({
  name: '', title: '', email: '', phone: '', department: '', is_primary: false
})

export default function NewDistrictPage() {
  const router = useRouter()
  const supabase = getSupabase()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    state: '',
    segment: 'district',
    status: 'prospect',
    notes: '',
  })

  const [contacts, setContacts] = useState<Contact[]>([emptyContact()])

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateContact(index: number, field: string, value: string | boolean) {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  function addContact() {
    setContacts(prev => [...prev, emptyContact()])
  }

  function removeContact(index: number) {
    setContacts(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('District name is required.'); return }
    setSaving(true)
    setError('')

    // Insert district
    const { data: district, error: districtError } = await supabase
      .from('districts')
      .insert({
        name: form.name.trim(),
        state: form.state.trim() || null,
        segment: form.segment,
        status: form.status,
        notes: form.notes.trim() || null,
      })
      .select()
      .single()

    if (districtError || !district) {
      setError('Failed to save district. Please try again.')
      setSaving(false)
      return
    }

    // Insert contacts (filter out blank ones)
    const validContacts = contacts.filter(c => c.name.trim())
    if (validContacts.length > 0) {
      await supabase.from('district_contacts').insert(
        validContacts.map(c => ({
          district_id: district.id,
          name: c.name.trim(),
          title: c.title.trim() || null,
          email: c.email.trim() || null,
          phone: c.phone.trim() || null,
          department: c.department.trim() || null,
          is_primary: c.is_primary,
        }))
      )
    }

    router.push(`/tdi-admin/intelligence/districts/${district.id}`)
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Link href="/tdi-admin/intelligence" className="hover:text-amber-600">Operations</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/tdi-admin/intelligence/districts" className="hover:text-amber-600">Districts</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">Add District</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Add District</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* District Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">District Info</h2>

        <div>
          <label className={labelClass}>District Name *</label>
          <input className={inputClass} value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="e.g. Addison School District 4" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>State</label>
            <input className={inputClass} value={form.state} onChange={e => updateForm('state', e.target.value)} placeholder="IL" maxLength={2} />
          </div>
          <div>
            <label className={labelClass}>Segment</label>
            <select className={inputClass} value={form.segment} onChange={e => updateForm('segment', e.target.value)}>
              <option value="district">District</option>
              <option value="single_school">Single School</option>
              <option value="charter_network">Charter Network</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={e => updateForm('status', e.target.value)}>
            <option value="prospect">Prospect</option>
            <option value="pilot">Pilot</option>
            <option value="active">Active</option>
            <option value="churned">Churned</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea className={inputClass} rows={3} value={form.notes} onChange={e => updateForm('notes', e.target.value)} placeholder="Key context, funding situation, relationship notes..." />
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Contacts</h2>
          <button onClick={addContact} className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
            <Plus className="w-3 h-3" />
            Add Contact
          </button>
        </div>

        {contacts.map((contact, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Contact {i + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contact.is_primary}
                    onChange={e => updateContact(i, 'is_primary', e.target.checked)}
                    className="rounded"
                  />
                  Primary
                </label>
                {contacts.length > 1 && (
                  <button onClick={() => removeContact(i)} className="inline-flex items-center gap-0.5 text-xs text-red-400 hover:text-red-600">
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={contact.name} onChange={e => updateContact(i, 'name', e.target.value)} placeholder="Janet Diaz" />
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={contact.title} onChange={e => updateContact(i, 'title', e.target.value)} placeholder="Coordinator" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} type="email" value={contact.email} onChange={e => updateContact(i, 'email', e.target.value)} placeholder="janet@district.org" />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={contact.phone} onChange={e => updateContact(i, 'phone', e.target.value)} placeholder="555-000-0000" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Department</label>
                <input className={inputClass} value={contact.department} onChange={e => updateContact(i, 'department', e.target.value)} placeholder="e.g. AP, CFO, Principal, SPED" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/tdi-admin/intelligence/districts" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save District'}
        </button>
      </div>
    </div>
  )
}
