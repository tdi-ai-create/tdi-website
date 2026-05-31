import { NextRequest } from 'next/server'
import { handleQAGet, handleQAPost } from '@/lib/hub/qa-handler'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  return handleQAGet('lesson', lessonId)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  return handleQAPost('lesson', lessonId, request)
}
