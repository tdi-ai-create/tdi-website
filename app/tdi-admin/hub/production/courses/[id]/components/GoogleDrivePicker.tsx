'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * GoogleDrivePicker -- lets users pick video files from Google Drive
 * and upload them to Cloudflare Stream without downloading to their computer first.
 *
 * Requires env vars:
 *   NEXT_PUBLIC_GOOGLE_PICKER_API_KEY
 *   NEXT_PUBLIC_GOOGLE_PICKER_CLIENT_ID
 */

declare global {
  interface Window {
    google?: any
    gapi?: any
  }
}

export function GoogleDrivePicker({
  onFileSelected,
}: {
  onFileSelected: (file: { id: string; name: string; mimeType: string; size: number; downloadUrl: string; accessToken: string }) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [gapiLoaded, setGapiLoaded] = useState(false)
  const [gisLoaded, setGisLoaded] = useState(false)
  const [accessToken, setAccessToken] = useState<string>('')

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_PICKER_CLIENT_ID

  // Load Google API scripts
  useEffect(() => {
    if (!apiKey || !clientId) return

    // Load GAPI (for Picker)
    if (!document.getElementById('google-api-script')) {
      const gapiScript = document.createElement('script')
      gapiScript.id = 'google-api-script'
      gapiScript.src = 'https://apis.google.com/js/api.js'
      gapiScript.onload = () => {
        window.gapi?.load('picker', () => setGapiLoaded(true))
      }
      document.body.appendChild(gapiScript)
    } else if (window.gapi) {
      window.gapi.load('picker', () => setGapiLoaded(true))
    }

    // Load GIS (for OAuth)
    if (!document.getElementById('google-gis-script')) {
      const gisScript = document.createElement('script')
      gisScript.id = 'google-gis-script'
      gisScript.src = 'https://accounts.google.com/gsi/client'
      gisScript.onload = () => setGisLoaded(true)
      document.body.appendChild(gisScript)
    } else {
      setGisLoaded(true)
    }
  }, [apiKey, clientId])

  const openPicker = useCallback(() => {
    if (!gapiLoaded || !gisLoaded || !apiKey || !clientId) return

    setIsLoading(true)

    // First, get an access token via OAuth
    const tokenClient = window.google?.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response: any) => {
        if (response.error) {
          console.error('OAuth error:', response.error)
          setIsLoading(false)
          return
        }

        const token = response.access_token
        setAccessToken(token)

        // Now open the Picker
        const picker = new window.google.picker.PickerBuilder()
          .addView(
            new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
              .setMimeTypes('video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska')
              .setLabel('Select a video file')
          )
          .setOAuthToken(token)
          .setDeveloperKey(apiKey)
          .setCallback((data: any) => {
            if (data.action === window.google.picker.Action.PICKED) {
              const doc = data.docs[0]
              onFileSelected({
                id: doc.id,
                name: doc.name,
                mimeType: doc.mimeType,
                size: doc.sizeBytes || 0,
                downloadUrl: `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
                accessToken: token,
              })
            }
            setIsLoading(false)
          })
          .setTitle('Select a video from Google Drive')
          .setMaxItems(1)
          .build()

        picker.setVisible(true)
      },
    })

    tokenClient.requestAccessToken({ prompt: '' })
  }, [gapiLoaded, gisLoaded, apiKey, clientId, onFileSelected])

  // Don't render if env vars not set
  if (!apiKey || !clientId) return null

  return (
    <button
      onClick={openPicker}
      disabled={isLoading || !gapiLoaded || !gisLoaded}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg width="16" height="16" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
        <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L3.45 44.65c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z" fill="#00AC47"/>
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.85L73.55 76.8z" fill="#EA4335"/>
        <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2L43.65 25z" fill="#00832D"/>
        <path d="M59.85 53H87.3c0-1.55-.4-3.1-1.2-4.5L73.55 25l-13.7 23.65L59.85 53z" fill="#2684FC"/>
        <path d="M73.4 25l-13.75-23.8c-1.35 1.4-2.5 2.5-3.3 3.3L43.65 25l16.2 28h27.5L73.4 25z" fill="#FFBA00"/>
      </svg>
      {isLoading ? 'Opening Drive...' : 'Google Drive'}
    </button>
  )
}

/**
 * Downloads a file from Google Drive and returns it as a File object.
 * Used after the picker selects a file.
 */
export async function downloadDriveFile(
  fileId: string,
  fileName: string,
  accessToken: string
): Promise<File> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to download from Drive: ${response.status}`)
  }

  const blob = await response.blob()
  return new File([blob], fileName, { type: blob.type || 'video/mp4' })
}
