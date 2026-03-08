import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/client';
import { sendCareerApplicationNotification } from '@/lib/email/resend';

const applicationSchema = z.object({
  applicant_name: z.string().min(1, 'Name is required'),
  applicant_email: z.string().email('Invalid email address'),
  applicant_phone: z.string().min(10, 'Phone number is required'),
  cover_letter: z.string().optional().default(''),
  position: z.string().optional().default(''),
});

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const supabase = createServerClient();

    // Extract text fields
    const fields = {
      applicant_name: formData.get('applicant_name') as string,
      applicant_email: formData.get('applicant_email') as string,
      applicant_phone: formData.get('applicant_phone') as string,
      cover_letter: (formData.get('cover_letter') as string) || '',
      position: (formData.get('position') as string) || '',
    };

    const validated = applicationSchema.parse(fields);

    // Handle resume file upload
    let resumeUrl: string | null = null;
    const resumeFile = formData.get('resume') as File | null;

    if (resumeFile && resumeFile.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(resumeFile.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Accepted: PDF, DOC, DOCX' },
          { status: 400 }
        );
      }
      if (resumeFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File too large. Maximum size: 5MB' },
          { status: 400 }
        );
      }

      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${Date.now()}-${validated.applicant_name.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, {
          contentType: resumeFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        // Non-fatal — continue without resume
      } else {
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        resumeUrl = urlData.publicUrl;
      }
    }

    // Insert application record
    const { data, error } = await supabase
      .from('career_applications')
      .insert([{
        applicant_name: validated.applicant_name,
        applicant_email: validated.applicant_email,
        applicant_phone: validated.applicant_phone,
        cover_letter: validated.cover_letter,
        position: validated.position,
        resume_url: resumeUrl,
        status: 'pending',
      }] as never)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit application', details: error.message },
        { status: 500 }
      );
    }

    // Non-blocking email notification
    sendCareerApplicationNotification({
      applicantName: validated.applicant_name,
      applicantEmail: validated.applicant_email,
      applicantPhone: validated.applicant_phone,
      positionTitle: validated.position || 'General Application',
      department: 'General',
      coverLetter: validated.cover_letter || '',
      resumeUrl,
    }).catch((err) => console.error('Email send failed:', err));

    return NextResponse.json(
      {
        success: true,
        application: data,
        message: 'Your application has been submitted successfully! We will review it and get back to you.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('career_applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications', applications: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', applications: [] },
      { status: 500 }
    );
  }
}
