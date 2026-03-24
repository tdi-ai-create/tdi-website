import { getServiceSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import InvoiceClient from './InvoiceClient'

export default async function InvoicePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = getServiceSupabase()

  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`*, quote_packages(*)`)
    .eq('id', id)
    .single()

  // If not found or draft, show 404
  if (error || !quote || quote.status === 'draft') {
    notFound()
  }

  // Sort packages by index
  quote.quote_packages = (quote.quote_packages ?? []).sort(
    (a: { package_index: number }, b: { package_index: number }) =>
      a.package_index - b.package_index
  )

  return <InvoiceClient quote={quote} />
}
