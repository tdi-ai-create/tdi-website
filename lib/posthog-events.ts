'use client'

import posthog from 'posthog-js'

// Key conversion events for TDI
export function trackFormClick(source: string, utmParams?: Record<string, string>) {
  posthog.capture('form_click', { source, ...utmParams })
}

export function trackHubSignup(tier: string, source: string) {
  posthog.capture('hub_signup', { tier, source })
}

export function trackCourseEnrollment(courseId: string, courseName: string) {
  posthog.capture('course_enrollment', { course_id: courseId, course_name: courseName })
}

export function trackCourseCompletion(courseId: string, courseName: string) {
  posthog.capture('course_completion', { course_id: courseId, course_name: courseName })
}

export function trackPartnershipInquiry(source: string, districtName?: string) {
  posthog.capture('partnership_inquiry', { source, district_name: districtName })
}

export function trackQuickWinDownload(quickWinId: string, quickWinTitle: string) {
  posthog.capture('quick_win_download', { quick_win_id: quickWinId, quick_win_title: quickWinTitle })
}

export function trackNewsletterSignup(source: string) {
  posthog.capture('newsletter_signup', { source })
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  posthog.identify(userId, properties)
}
