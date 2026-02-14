export type ApplicationStatus = 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
export type JobType = 'full-time' | 'part-time' | 'contract';

export interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string | null;
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobListingFormData {
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string;
  salary_range: string;
}

export interface CareerApplication {
  id: string;
  job_listing_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  resume_url: string | null;
  cover_letter: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  job_listing?: JobListing;
}

export interface CareerApplicationFormData {
  job_listing_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  cover_letter: string;
}
