'use client'

export async function updateDashboardField(
  partnershipId: string,
  field:         string,
  value:         any
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.error || 'Update failed' }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Network error' }
  }
}
