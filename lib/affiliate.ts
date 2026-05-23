import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Read affiliate tracking cookies from a request.
 * Returns null if no affiliate tracking is present.
 */
function getAffiliateContext(request: NextRequest): { slug: string; visitorId: string } | null {
  const slug = request.cookies.get('tdi_ref')?.value
  const visitorId = request.cookies.get('tdi_visitor')?.value
  if (!slug || !visitorId) return null
  return { slug, visitorId }
}

/**
 * Record an affiliate signup when a new user creates an account.
 * Call this after successful user registration.
 * No-op if no affiliate cookie is present.
 */
export async function recordAffiliateSignup({
  userEmail,
  userId,
  request,
}: {
  userEmail: string
  userId?: string
  request: NextRequest
}): Promise<{ signupId: string; creatorSlug: string } | null> {
  try {
    const ctx = getAffiliateContext(request)
    if (!ctx) return null

    const supabase = getSupabaseAdmin()

    // Look up creator
    const { data: creator } = await (supabase
      .from('creators') as any)
      .select('id')
      .eq('affiliate_slug', ctx.slug)
      .maybeSingle()

    if (!creator) return null

    // Find the original click (most recent within 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: click } = await (supabase
      .from('affiliate_clicks') as any)
      .select('id')
      .eq('visitor_id', ctx.visitorId)
      .eq('creator_id', creator.id)
      .gte('clicked_at', ninetyDaysAgo.toISOString())
      .order('clicked_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Insert signup
    const { data: signup, error } = await (supabase
      .from('affiliate_signups') as any)
      .insert({
        creator_id: creator.id,
        affiliate_slug: ctx.slug,
        visitor_id: ctx.visitorId,
        user_email: userEmail,
        user_id: userId || null,
        click_id: click?.id || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[affiliate-signup] Insert error:', error.message)
      return null
    }

    return { signupId: signup.id, creatorSlug: ctx.slug }
  } catch (error) {
    console.error('[affiliate-signup] Error:', error)
    return null
  }
}

/**
 * Record an affiliate conversion when a tracked user makes a purchase.
 * Call this after successful payment processing.
 * No-op if no affiliate cookie is present.
 */
export async function recordAffiliateConversion({
  userEmail,
  userId,
  conversionType,
  productName,
  grossAmountCents,
  processingFeeCents,
  taxCents,
  externalPaymentId,
  request,
}: {
  userEmail: string
  userId?: string
  conversionType: 'subscription' | 'one_time_purchase' | 'other'
  productName?: string
  grossAmountCents: number
  processingFeeCents?: number
  taxCents?: number
  externalPaymentId?: string
  request: NextRequest
}): Promise<{ conversionId: string; creatorSlug: string } | null> {
  try {
    const ctx = getAffiliateContext(request)
    if (!ctx) return null

    const supabase = getSupabaseAdmin()

    // Look up creator
    const { data: creator } = await (supabase
      .from('creators') as any)
      .select('id, affiliate_slug')
      .eq('affiliate_slug', ctx.slug)
      .maybeSingle()

    if (!creator) return null

    // Find the original click
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: click } = await (supabase
      .from('affiliate_clicks') as any)
      .select('id')
      .eq('visitor_id', ctx.visitorId)
      .eq('creator_id', creator.id)
      .gte('clicked_at', ninetyDaysAgo.toISOString())
      .order('clicked_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Find or reference the signup
    const { data: signup } = await (supabase
      .from('affiliate_signups') as any)
      .select('id')
      .eq('creator_id', creator.id)
      .eq('user_email', userEmail)
      .order('signed_up_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Calculate net amount
    const netAmountCents = grossAmountCents - (processingFeeCents || 0) - (taxCents || 0)

    // Insert conversion
    const { data: conversion, error } = await (supabase
      .from('affiliate_conversions') as any)
      .insert({
        creator_id: creator.id,
        affiliate_slug: ctx.slug,
        signup_id: signup?.id || null,
        click_id: click?.id || null,
        user_email: userEmail,
        user_id: userId || null,
        conversion_type: conversionType,
        product_name: productName || null,
        gross_amount_cents: grossAmountCents,
        processing_fee_cents: processingFeeCents || 0,
        tax_cents: taxCents || 0,
        net_amount_cents: netAmountCents,
        external_payment_id: externalPaymentId || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[affiliate-conversion] Insert error:', error.message)
      return null
    }

    return { conversionId: conversion.id, creatorSlug: ctx.slug }
  } catch (error) {
    console.error('[affiliate-conversion] Error:', error)
    return null
  }
}
