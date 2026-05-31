import { NextRequest } from 'next/server'
import { handleQAGet, handleQAPost } from '@/lib/hub/qa-handler'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleQAGet('quick_win', id)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleQAPost('quick_win', id, request)
}
