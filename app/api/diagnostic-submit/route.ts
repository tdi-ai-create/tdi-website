import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      email,
      name,
      schoolName,
      pdType,
      pdTypeName,
      answers,
      completedAt,
    } = data;

    // Send email notification using Formspree
    // This posts to Formspree which will forward to Olivia@TeachersDeserveIt.com
    const formspreeResponse = await fetch('https://formspree.io/f/xpwzgvkd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New PD Diagnostic Result: ${pdTypeName}`,
        email: email,
        name: name || 'Not provided',
        school_name: schoolName || 'Not provided',
        pd_type: pdTypeName,
        pd_type_code: pdType,
        answers: JSON.stringify(answers),
        completed_at: completedAt,
        _replyto: email,
      }),
    });

    if (!formspreeResponse.ok) {
      console.error('Formspree error:', await formspreeResponse.text());
      // Still return success - we don't want to block the user from seeing results
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Diagnostic submission error:', error);
    // Return success anyway so user can see their results
    return NextResponse.json({ success: true });
  }
}
