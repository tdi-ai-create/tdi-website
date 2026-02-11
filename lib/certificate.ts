import { getSupabase } from '@/lib/supabase';

// Characters for verification code (no I/O/0/1 to avoid confusion)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a unique verification code in format "TDI-XXXXXXXX"
 */
export function generateVerificationCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return `TDI-${code}`;
}

/**
 * Check if a certificate already exists for a user + course
 */
export async function certificateExists(
  userId: string,
  courseId: string
): Promise<boolean> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_certificates')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  return !!data;
}

/**
 * Create a certificate for a completed course
 */
export async function createCertificate(
  userId: string,
  courseId: string
): Promise<{ success: boolean; verificationCode?: string; pdHours?: number; error?: string }> {
  const supabase = getSupabase();

  try {
    // Check if certificate already exists
    const exists = await certificateExists(userId, courseId);
    if (exists) {
      return { success: true, error: 'Certificate already exists' };
    }

    // Get course PD hours
    const { data: course, error: courseError } = await supabase
      .from('hub_courses')
      .select('pd_hours, title')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return { success: false, error: 'Course not found' };
    }

    // Generate unique verification code
    let verificationCode = generateVerificationCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('hub_certificates')
        .select('id')
        .eq('verification_code', verificationCode)
        .single();

      if (!existing) break;

      verificationCode = generateVerificationCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return { success: false, error: 'Failed to generate unique verification code' };
    }

    // Create the certificate
    const { error: insertError } = await supabase.from('hub_certificates').insert({
      user_id: userId,
      course_id: courseId,
      verification_code: verificationCode,
      pd_hours: course.pd_hours,
      issued_at: new Date().toISOString(),
      certificate_url: null, // Will be set after PDF generation if needed
    });

    if (insertError) {
      console.error('Error creating certificate:', insertError);
      return { success: false, error: 'Failed to create certificate' };
    }

    return {
      success: true,
      verificationCode,
      pdHours: course.pd_hours,
    };
  } catch (err) {
    console.error('Error in createCertificate:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get certificate by verification code
 */
export async function getCertificateByCode(code: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('hub_certificates')
    .select(`
      id,
      verification_code,
      pd_hours,
      issued_at,
      certificate_url,
      user:hub_profiles!hub_certificates_user_id_fkey(display_name),
      course:hub_courses!hub_certificates_course_id_fkey(title, category)
    `)
    .eq('verification_code', code)
    .single();

  if (error || !data) {
    return null;
  }

  // Handle Supabase join results
  return {
    id: data.id,
    verification_code: data.verification_code,
    pd_hours: data.pd_hours,
    issued_at: data.issued_at,
    certificate_url: data.certificate_url,
    user_name: Array.isArray(data.user)
      ? data.user[0]?.display_name
      : (data.user as { display_name: string } | null)?.display_name || 'Teacher',
    course_title: Array.isArray(data.course)
      ? data.course[0]?.title
      : (data.course as { title: string; category: string } | null)?.title || 'Course',
    course_category: Array.isArray(data.course)
      ? data.course[0]?.category
      : (data.course as { title: string; category: string } | null)?.category || '',
  };
}

/**
 * Format date for certificate display
 */
export function formatCertificateDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
