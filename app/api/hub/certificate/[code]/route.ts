import { NextRequest, NextResponse } from 'next/server';
import { getCertificateByCode, formatCertificateDate } from '@/lib/certificate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.json({ error: 'Verification code required' }, { status: 400 });
  }

  try {
    const certificate = await getCertificateByCode(code);

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Dynamically import jsPDF to handle case where it's not installed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let jsPDF: any;
    try {
      const jspdfModule = await import('jspdf');
      jsPDF = jspdfModule.jsPDF;
    } catch {
      // jspdf not installed - return certificate data as JSON instead
      return NextResponse.json({
        message: 'PDF generation requires jspdf package. Run: npm install jspdf',
        certificate: {
          user_name: certificate.user_name,
          course_title: certificate.course_title,
          pd_hours: certificate.pd_hours,
          issued_at: certificate.issued_at,
          verification_code: certificate.verification_code,
        },
      }, { status: 200 });
    }

    // Create PDF in landscape letter size (11 x 8.5 inches)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: 'letter',
    });

    const pageWidth = 11;
    const pageHeight = 8.5;

    // Background color - soft cream
    doc.setFillColor(255, 252, 245);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(43, 58, 103); // Navy
    doc.setLineWidth(0.03);
    doc.rect(0.4, 0.4, pageWidth - 0.8, pageHeight - 0.8, 'S');

    // Inner decorative border
    doc.setDrawColor(232, 184, 75); // Gold
    doc.setLineWidth(0.02);
    doc.rect(0.5, 0.5, pageWidth - 1, pageHeight - 1, 'S');

    // Header - "Certificate of Completion"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128); // Gray
    doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 1.3, { align: 'center' });

    // Organization name
    doc.setFont('times', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(43, 58, 103); // Navy
    doc.text('The Teacher Development Initiative', pageWidth / 2, 1.9, { align: 'center' });

    // "This certifies that"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('This certifies that', pageWidth / 2, 2.6, { align: 'center' });

    // Recipient name
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(32);
    doc.setTextColor(43, 58, 103);
    doc.text(certificate.user_name || 'Teacher', pageWidth / 2, 3.3, { align: 'center' });

    // Decorative line under name
    doc.setDrawColor(232, 184, 75);
    doc.setLineWidth(0.01);
    doc.line(3.5, 3.5, 7.5, 3.5);

    // "has successfully completed"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('has successfully completed the professional development course', pageWidth / 2, 4.0, {
      align: 'center',
    });

    // Course title
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(43, 58, 103);

    // Handle long course titles by wrapping
    const courseTitle = certificate.course_title || 'Course';
    const maxWidth = 7;
    const titleLines = doc.splitTextToSize(courseTitle, maxWidth);
    let yPos = 4.6;
    titleLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      yPos += 0.35;
    });

    // PD Hours badge
    const pdHours = certificate.pd_hours || 0;
    const hoursText = `${pdHours} Professional Development Hour${pdHours !== 1 ? 's' : ''}`;

    doc.setFillColor(232, 184, 75); // Gold background
    const badgeWidth = 3;
    const badgeHeight = 0.4;
    const badgeX = pageWidth / 2 - badgeWidth / 2;
    const badgeY = yPos + 0.2;
    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 0.1, 0.1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(hoursText, pageWidth / 2, badgeY + 0.27, { align: 'center' });

    // Issue date
    const issueDate = formatCertificateDate(certificate.issued_at);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text(`Issued: ${issueDate}`, pageWidth / 2, 6.5, { align: 'center' });

    // Verification code
    doc.setFont('courier', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text(`Verification Code: ${certificate.verification_code}`, pageWidth / 2, 7.0, {
      align: 'center',
    });

    // Verification URL
    doc.setFontSize(9);
    doc.text('Verify at: tdi.education/hub/verify', pageWidth / 2, 7.3, { align: 'center' });

    // TDI Logo placeholder (simple text version)
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(43, 58, 103);
    doc.text('TDI', 0.8, 7.8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Learning Hub', 0.8, 8.0);

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="TDI-Certificate-${code}.pdf"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
