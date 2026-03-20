'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { ChevronRight, Plus, X } from 'lucide-react'

type Contact = {
  id?: string
  name: string
  title: string
  email: string
  phone: string
  department: string
  is_primary: boolean
  _deleted?: boolean
}

type District = {
  id: string
  name: string
  state: string | null
  segment: string
  status: string
  notes: string | null
  district_contacts?: Contact[]
}

export default function EditDistrictPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const supabase = getSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', state: '', segment: 'district', status: 'prospect', notes: ''
  })
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => { if (id) loadDistrict() }, [id])

  async function loadDistrict() {
    const { data } = await supabase
      .from('districts')
      .select('*, district_contacts(*)')
      .eq('id', id)
      .single()

    if (data) {
      const d = data as District
      setForm({
        name: d.name ?? '',
        state: d.state ?? '',
        segment: d.segment ?? 'district',
        status: d.status ?? 'prospect',
        notes: d.notes ?? '',
      })
      setContacts((d.district_contacts ?? []).map((c) => ({
        id: c.id,
        name: c.name ?? '',
        title: c.title ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        department: c.department ?? '',
        is_primary: c.is_primary ?? false,
      })))
    }
    setLoading(false)
  }

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateContact(index: number, field: string, value: string | boolean) {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  function addContact() {
    setContacts(prev => [...prev, { name: '', title: '', email: '', phone: '', department: '', is_primary: false }])
  }

  function removeContact(index: number) {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, _deleted: true } : c))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('District name is required.'); return }
    setSaving(true)
    setError('')

    // Update district
    const { error: districtError } = await supabase
      .from('districts')
      .update({
        name: form.name.trim(),
        state: form.state.trim() || null,
        segment: form.segment,
        status: form.status,
        notes: form.notes.trim() || null,
      })
      .eq('id', id)

    if (districtError) { setError('Failed to save. Please try again.'); setSaving(false); return }

    // Handle contacts
    for (const contact of contacts) {
      if (contact._deleted && contact.id) {
        await supabase.from('district_contacts').delete().eq('id', contact.id)
      } else if (contact.id && !contact._deleted) {
        await supabase.from('district_contacts').update({
          name: contact.name.trim(),
          title: contact.title.trim() || null,
          email: contact.email.trim() || null,
          phone: contact.phone.trim() || null,
          department: contact.department.trim() || null,
          is_primary: contact.is_primary,
        }).eq('id', contact.id)
      } else if (!contact.id && !contact._deleted && contact.name.trim()) {
        await supabase.from('district_contacts').insert({
          district_id: id,
          name: contact.name.trim(),
          title: contact.title.trim() || null,
          email: contact.email.trim() || null,
          phone: contact.phone.trim() || null,
          department: contact.department.trim() || null,
          is_primary: contact.is_primary,
        })
      }
    }

    router.push(`/tdi-admin/intelligence/districts/${id}`)
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  if (loading) return <div className="p-8 text-gray-400 text-sm animate-pulse">Loading...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">

      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Link href="/tdi-admin/intelligence" className="hover:text-amber-600">Intelligence Hub</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/tdi-admin/intelligence/districts/${id}`} className="hover:text-amber-600">{form.name || 'District'}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">Edit</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Edit District</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* District Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">District Info</h2>

        <div>
          <label className={labelClass}>District Name *</label>
          <input className={inputClass} value={form.name} onChange={e => updateForm('name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>State</label>
            <input className={inputClass} value={form.state} onChange={e => updateForm('state', e.target.value)} maxLength={2} />
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
          <textarea className={inputClass} rows={3} value={form.notes} onChange={e => updateForm('notes', e.target.value)} />
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

        {contacts.filter(c => !c._deleted).length === 0 && (
          <p className="text-sm text-gray-400">No contacts. Click &quot;Add Contact&quot; to add one.</p>
        )}

        {contacts.filter(c => !c._deleted).map((contact, visibleIndex) => {
          const realIndex = contacts.indexOf(contact)
          return (
            <div key={contact.id ?? `new-${visibleIndex}`} className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Contact {visibleIndex + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={contact.is_primary} onChange={e => updateContact(realIndex, 'is_primary', e.target.checked)} className="rounded" />
                    Primary
                  </label>
                  <button onClick={() => removeContact(realIndex)} className="inline-flex items-center gap-0.5 text-xs text-red-400 hover:text-red-600">
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Name</label><input className={inputClass} value={contact.name} onChange={e => updateContact(realIndex, 'name', e.target.value)} /></div>
                <div><label className={labelClass}>Title</label><input className={inputClass} value={contact.title} onChange={e => updateContact(realIndex, 'title', e.target.value)} /></div>
                <div><label className={labelClass}>Email</label><input className={inputClass} type="email" value={contact.email} onChange={e => updateContact(realIndex, 'email', e.target.value)} /></div>
                <div><label className={labelClass}>Phone</label><input className={inputClass} value={contact.phone} onChange={e => updateContact(realIndex, 'phone', e.target.value)} /></div>
                <div className="col-span-2"><label className={labelClass}>Department</label><input className={inputClass} value={contact.department} onChange={e => updateContact(realIndex, 'department', e.target.value)} /></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <Link href={`/tdi-admin/intelligence/districts/${id}`} className="text-sm text-gray-500 hover:text-gray-700">Cancel</Link>
        <button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
