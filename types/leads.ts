// Lead enrichment type definitions
// Source of truth for the enrichment payload structure

export type EnrichmentStatus = 'pending' | 'in_progress' | 'complete' | 'failed' | 'skipped';

export type LeadSource =
  | 'podcast_guest'
  | 'conference'
  | 'referral'
  | 'cold_inbound'
  | 'jim_outreach'
  | 'existing_customer_renewal'
  | 'iasa'
  | 'linkedin'
  | 'other';

export type LeadHeat = 'hot' | 'warm' | 'cold';

export type ContactRole =
  | 'superintendent'
  | 'assistant_superintendent'
  | 'principal'
  | 'assistant_principal'
  | 'director_of_curriculum'
  | 'director_of_special_ed'
  | 'teacher'
  | 'paraprofessional'
  | 'board_member'
  | 'other';

export interface DistrictProfile {
  enrollment: number | null;
  num_schools: number | null;
  num_teachers_estimate: number | null;
  demographics: {
    frl_percent: number | null;
    el_percent: number | null;
    sped_percent: number | null;
  };
  title_i_status: string | null;
  state_rating: string | null;
  per_pupil_spending: string | null;
  sources: string[];
}

export interface DecisionMaker {
  superintendent_name: string | null;
  tenure_start: string | null;
  prior_districts: string[];
  public_priorities: string[];
  burnout_or_retention_signals: string[];
  sources: string[];
}

export interface FundingSignals {
  esser_status: string | null;
  title_i_estimate: string | null;
  recent_grants: string[];
  local_education_foundation: string | null;
  sources: string[];
}

export interface WarmthSignals {
  geographic_proximity_to_tdi_partners: string;
  iasa_member: boolean | null;
  podcast_or_linkedin_connection: string | null;
  notes: string;
}

export interface ScoreBreakdown {
  fit_score: number;     // 0-25
  pain_score: number;    // 0-25
  funding_score: number; // 0-25
  warmth_score: number;  // 0-25
  rationale: {
    fit: string;
    pain: string;
    funding: string;
    warmth: string;
  };
}

export interface EnrichmentData {
  district_profile: DistrictProfile;
  decision_maker: DecisionMaker;
  funding_signals: FundingSignals;
  warmth_signals: WarmthSignals;
  scoring: ScoreBreakdown;
  strategic_brief: string;
  data_quality_note: string;
}

export interface CreateLeadInput {
  district_name: string;
  contact_name?: string;
  contact_role?: ContactRole;
  contact_email?: string;
  contact_phone?: string;
  source: LeadSource;
  state_code?: string;
  estimated_deal_size?: number;
  initial_heat?: LeadHeat;
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source: string;
  state_code: string | null;
  stage: string;
  heat: string | null;
  value: number | null;
  notes: string | null;
  enrichment_status: EnrichmentStatus;
  enrichment_data: EnrichmentData | null;
  ai_strategic_brief: string | null;
  lead_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  nces_district_id: string | null;
  enriched_at: string | null;
  enrichment_error: string | null;
  created_at: string;
  updated_at: string;
}
