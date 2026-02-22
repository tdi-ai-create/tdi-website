import { supabase, getServiceSupabase } from './supabase';
import type {
  Creator,
  CreatorMilestone,
  CreatorNote,
  CreatorProject,
  Phase,
  PhaseId,
  Milestone,
  MilestoneStatus,
  MilestoneWithStatus,
  PhaseWithMilestones,
  CreatorDashboardData,
  CreatorListItem,
  ProgressBreakdown,
} from '@/types/creator-portal';

// Phase order for progression
const PHASE_ORDER: PhaseId[] = [
  'onboarding',
  'agreement',
  'course_design',
  'test_prep',
  'production',
  'launch',
];

// ============================================
// Creator Functions
// ============================================

export async function getCreatorByEmail(email: string): Promise<Creator | null> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    console.error('Error fetching creator by email:', error);
    return null;
  }
  return data;
}

export async function getCreatorById(id: string): Promise<Creator | null> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching creator by id:', error);
    return null;
  }
  return data;
}

export async function getAllCreators(): Promise<CreatorListItem[]> {
  const { data: creators, error: creatorsError } = await supabase
    .from('creators')
    .select('*')
    .order('created_at', { ascending: false });

  if (creatorsError || !creators) {
    console.error('Error fetching creators:', creatorsError);
    return [];
  }

  // Get total milestone count
  const { count: totalMilestones } = await supabase
    .from('milestones')
    .select('*', { count: 'exact', head: true });

  // Get milestones for each creator with optional status
  const creatorList: CreatorListItem[] = await Promise.all(
    creators.map(async (creator) => {
      // Get all creator milestones with their metadata
      const { data: creatorMilestones } = await supabase
        .from('creator_milestones')
        .select('status, metadata')
        .eq('creator_id', creator.id);

      const milestones = creatorMilestones || [];

      // Separate core (required) and bonus (optional) milestones
      // Check is_optional in metadata since we store it there
      const coreMilestones = milestones.filter(m => {
        const meta = m.metadata as Record<string, unknown> | null;
        return !meta?.is_optional;
      });
      const bonusMilestones = milestones.filter(m => {
        const meta = m.metadata as Record<string, unknown> | null;
        return meta?.is_optional === true;
      });

      const coreCompleted = coreMilestones.filter(m => m.status === 'completed').length;
      const coreTotal = coreMilestones.length;
      const corePercent = coreTotal > 0 ? Math.round((coreCompleted / coreTotal) * 100) : 100;

      const bonusCompleted = bonusMilestones.filter(m => m.status === 'completed').length;
      const bonusAvailable = bonusMilestones.filter(m => m.status === 'available' || m.status === 'in_progress').length;
      const bonusTotal = bonusMilestones.length;

      // Total progress (for backwards compatibility)
      const completed = coreCompleted + bonusCompleted;
      const total = totalMilestones || 27;

      const progress: ProgressBreakdown = {
        coreTotal,
        coreCompleted,
        corePercent,
        bonusTotal,
        bonusCompleted,
        bonusAvailable,
        isComplete: corePercent === 100,
      };

      return {
        ...creator,
        completedMilestones: completed,
        totalMilestones: total,
        // Use core percent as main progress (creator is "done" when core is 100%)
        progressPercentage: corePercent,
        progress,
      };
    })
  );

  return creatorList;
}

export async function createCreator(data: {
  email: string;
  name: string;
  course_title?: string;
  course_audience?: string;
  target_launch_month?: string;
}): Promise<Creator | null> {
  const serviceSupabase = getServiceSupabase();

  // Create the creator
  const { data: creator, error: creatorError } = await serviceSupabase
    .from('creators')
    .insert({
      email: data.email.toLowerCase(),
      name: data.name,
      course_title: data.course_title || null,
      course_audience: data.course_audience || null,
      target_launch_month: data.target_launch_month || null,
      current_phase: 'onboarding',
    })
    .select()
    .single();

  if (creatorError || !creator) {
    console.error('Error creating creator:', creatorError);
    return null;
  }

  // Get all milestones
  const { data: milestones, error: milestonesError } = await serviceSupabase
    .from('milestones')
    .select('*')
    .order('sort_order');

  if (milestonesError || !milestones) {
    console.error('Error fetching milestones:', milestonesError);
    return creator;
  }

  // Create milestone progress records
  // When admin adds a creator, intake is already done (completed)
  // Second milestone (content path selection) should be available
  const milestoneRecords = milestones.map((milestone, index) => ({
    creator_id: creator.id,
    milestone_id: milestone.id,
    status: index === 0 ? 'completed' : index === 1 ? 'available' : 'locked',
    completed_at: index === 0 ? new Date().toISOString() : null,
  }));

  const { error: progressError } = await serviceSupabase
    .from('creator_milestones')
    .insert(milestoneRecords);

  if (progressError) {
    console.error('Error creating milestone progress:', progressError);
  }

  return creator;
}

export async function updateCreator(
  id: string,
  data: Partial<Pick<Creator, 'content_path' | 'course_title' | 'course_description' | 'author_bio' | 'course_audience' | 'target_launch_month' | 'discount_code' | 'display_on_website' | 'website_display_name' | 'website_title' | 'website_bio' | 'headshot_url' | 'display_order'>>
): Promise<Creator | null> {
  const serviceSupabase = getServiceSupabase();

  const { data: creator, error } = await serviceSupabase
    .from('creators')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating creator:', error);
    return null;
  }
  return creator;
}

// ============================================
// Milestone Functions
// ============================================

export async function getCreatorMilestones(
  creatorId: string
): Promise<CreatorMilestone[]> {
  const { data, error } = await supabase
    .from('creator_milestones')
    .select('*')
    .eq('creator_id', creatorId);

  if (error) {
    console.error('Error fetching creator milestones:', error);
    return [];
  }
  return data || [];
}

export async function updateMilestoneStatus(
  creatorId: string,
  milestoneId: string,
  status: MilestoneStatus,
  completedBy?: string
): Promise<boolean> {
  const serviceSupabase = getServiceSupabase();

  // Update the milestone status
  const updateData: Partial<CreatorMilestone> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
    updateData.completed_by = completedBy || null;
  }

  const { error: updateError } = await serviceSupabase
    .from('creator_milestones')
    .update(updateData)
    .eq('creator_id', creatorId)
    .eq('milestone_id', milestoneId);

  if (updateError) {
    console.error('Error updating milestone status:', updateError);
    return false;
  }

  // If completed, unlock the next milestone
  if (status === 'completed') {
    await unlockNextMilestone(creatorId, milestoneId);
  }

  return true;
}

async function unlockNextMilestone(
  creatorId: string,
  completedMilestoneId: string
): Promise<void> {
  const serviceSupabase = getServiceSupabase();

  // Get the completed milestone details
  const { data: completedMilestone, error: milestoneError } = await serviceSupabase
    .from('milestones')
    .select('*')
    .eq('id', completedMilestoneId)
    .single();

  if (milestoneError || !completedMilestone) {
    console.error('Error fetching completed milestone:', milestoneError);
    return;
  }

  // Get all milestones in the same phase
  const { data: phaseMilestones, error: phaseError } = await serviceSupabase
    .from('milestones')
    .select('*')
    .eq('phase_id', completedMilestone.phase_id)
    .order('sort_order');

  if (phaseError || !phaseMilestones) {
    console.error('Error fetching phase milestones:', phaseError);
    return;
  }

  // Find the next milestone in this phase
  const currentIndex = phaseMilestones.findIndex(
    (m) => m.id === completedMilestoneId
  );
  const nextMilestone = phaseMilestones[currentIndex + 1];

  if (nextMilestone) {
    // Unlock the next milestone in this phase
    await serviceSupabase
      .from('creator_milestones')
      .update({ status: 'available', updated_at: new Date().toISOString() })
      .eq('creator_id', creatorId)
      .eq('milestone_id', nextMilestone.id)
      .eq('status', 'locked');
  } else {
    // This was the last milestone in the phase
    // Check if ALL milestones in this phase are completed
    const { data: creatorPhaseMilestones } = await serviceSupabase
      .from('creator_milestones')
      .select('*, milestones!inner(*)')
      .eq('creator_id', creatorId)
      .eq('milestones.phase_id', completedMilestone.phase_id);

    const allPhaseComplete = creatorPhaseMilestones?.every(
      (cm) => cm.status === 'completed'
    );

    if (allPhaseComplete) {
      // Find the next phase
      const currentPhaseIndex = PHASE_ORDER.indexOf(
        completedMilestone.phase_id as PhaseId
      );
      const nextPhaseId = PHASE_ORDER[currentPhaseIndex + 1];

      if (nextPhaseId) {
        // Update creator's current phase
        await serviceSupabase
          .from('creators')
          .update({
            current_phase: nextPhaseId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', creatorId);

        // Get first milestone of next phase
        const { data: nextPhaseMilestones } = await serviceSupabase
          .from('milestones')
          .select('*')
          .eq('phase_id', nextPhaseId)
          .order('sort_order')
          .limit(1);

        if (nextPhaseMilestones && nextPhaseMilestones[0]) {
          // Unlock first milestone of next phase
          await serviceSupabase
            .from('creator_milestones')
            .update({ status: 'available', updated_at: new Date().toISOString() })
            .eq('creator_id', creatorId)
            .eq('milestone_id', nextPhaseMilestones[0].id)
            .eq('status', 'locked');
        }
      }
    }
  }
}

// ============================================
// Notes Functions
// ============================================

export async function getCreatorNotes(
  creatorId: string,
  includeInternal = false
): Promise<CreatorNote[]> {
  let query = supabase
    .from('creator_notes')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  if (!includeInternal) {
    query = query.eq('visible_to_creator', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching creator notes:', error);
    return [];
  }
  return data || [];
}

export async function addNote(data: {
  creator_id: string;
  note: string;
  created_by: string;
  visible_to_creator: boolean;
}): Promise<CreatorNote | null> {
  const serviceSupabase = getServiceSupabase();

  const { data: note, error } = await serviceSupabase
    .from('creator_notes')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error adding note:', error);
    return null;
  }
  return note;
}

// ============================================
// Dashboard Data Functions
// ============================================

export async function getCreatorDashboardData(
  creatorId: string
): Promise<CreatorDashboardData | null> {
  // Get creator
  const creator = await getCreatorById(creatorId);
  if (!creator) return null;

  // Get all phases
  const { data: phases, error: phasesError } = await supabase
    .from('phases')
    .select('*')
    .order('sort_order');

  if (phasesError || !phases) {
    console.error('Error fetching phases:', phasesError);
    return null;
  }

  // Get all milestones
  const { data: milestones, error: milestonesError } = await supabase
    .from('milestones')
    .select('*')
    .order('sort_order');

  if (milestonesError || !milestones) {
    console.error('Error fetching milestones:', milestonesError);
    return null;
  }

  // Get creator's milestone progress
  const creatorMilestones = await getCreatorMilestones(creatorId);

  // Get visible notes
  const notes = await getCreatorNotes(creatorId, false);

  // Get content path from creator
  const contentPath = (creator.content_path as 'blog' | 'download' | 'course' | null) || null;

  // Helper to check if milestone applies to content path
  const milestoneAppliesTo = (milestone: { applies_to?: string[] | null }) => {
    if (!contentPath) {
      if (!milestone.applies_to) return true;
      return milestone.applies_to.includes('blog') &&
             milestone.applies_to.includes('download') &&
             milestone.applies_to.includes('course');
    }
    if (!milestone.applies_to || milestone.applies_to.length === 0) {
      return contentPath === 'course';
    }
    return milestone.applies_to.includes(contentPath);
  };

  // Build phases with milestones
  const phasesWithMilestones: PhaseWithMilestones[] = phases.map((phase) => {
    const phaseMilestones = milestones.filter((m) => m.phase_id === phase.id);

    const milestonesWithStatus: MilestoneWithStatus[] = phaseMilestones.map(
      (milestone) => {
        const progress = creatorMilestones.find(
          (cm) => cm.milestone_id === milestone.id
        );
        const isApplicable = milestoneAppliesTo(milestone);
        return {
          ...milestone,
          status: (progress?.status || 'locked') as MilestoneStatus,
          completed_at: progress?.completed_at || null,
          progress_id: progress?.id || null,
          metadata: progress?.metadata || null,
          isApplicable,
        };
      }
    );

    const applicableMilestones = milestonesWithStatus.filter(m => m.isApplicable);
    const isComplete = applicableMilestones.length > 0 && applicableMilestones.every(
      (m) => m.status === 'completed'
    );
    const isCurrentPhase = phase.id === creator.current_phase;
    const isSkipped = applicableMilestones.length === 0;

    return {
      ...phase,
      milestones: milestonesWithStatus,
      isComplete,
      isCurrentPhase,
      isSkipped,
      applicableMilestoneCount: applicableMilestones.length,
    };
  });

  // Calculate progress based only on applicable milestones
  const applicableMilestones = milestones.filter(m => milestoneAppliesTo(m));
  const applicableMilestoneIds = new Set(applicableMilestones.map(m => m.id));

  // Get applicable creator milestones
  const applicableCreatorMilestones = creatorMilestones.filter(
    cm => applicableMilestoneIds.has(cm.milestone_id)
  );

  // Separate core (required) and bonus (optional) milestones
  const coreMilestones = applicableCreatorMilestones.filter(cm => {
    const meta = cm.metadata as Record<string, unknown> | null;
    return !meta?.is_optional;
  });
  const bonusMilestones = applicableCreatorMilestones.filter(cm => {
    const meta = cm.metadata as Record<string, unknown> | null;
    return meta?.is_optional === true;
  });

  const coreCompleted = coreMilestones.filter(cm => cm.status === 'completed').length;
  const coreTotal = coreMilestones.length;
  const corePercent = coreTotal > 0 ? Math.round((coreCompleted / coreTotal) * 100) : 100;

  const bonusCompleted = bonusMilestones.filter(cm => cm.status === 'completed').length;
  const bonusAvailable = bonusMilestones.filter(cm => cm.status === 'available' || cm.status === 'in_progress').length;
  const bonusTotal = bonusMilestones.length;

  // Total progress (for backwards compatibility)
  const totalMilestones = applicableMilestones.length;
  const completedMilestones = coreCompleted + bonusCompleted;
  // Use core percent as main progress (creator is "done" when core is 100%)
  const progressPercentage = corePercent;

  const progress: ProgressBreakdown = {
    coreTotal,
    coreCompleted,
    corePercent,
    bonusTotal,
    bonusCompleted,
    bonusAvailable,
    isComplete: corePercent === 100,
  };

  // Get projects for this creator
  const { data: projects } = await supabase
    .from('creator_projects')
    .select('*')
    .eq('creator_id', creatorId)
    .order('project_number', { ascending: false });

  // Separate active and past projects
  const activeProject = projects?.find(p => p.status === 'active') as CreatorProject | undefined;
  const pastProjects = projects?.filter(p => p.status !== 'active') as CreatorProject[] | undefined;

  return {
    creator,
    phases: phasesWithMilestones,
    notes,
    totalMilestones,
    completedMilestones,
    progressPercentage,
    contentPath,
    progress,
    activeProject,
    pastProjects,
  };
}

// ============================================
// Admin Functions
// ============================================

export async function isAdmin(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    return false;
  }
  return !!data;
}

export async function creatorExists(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('creators')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    return false;
  }
  return !!data;
}

// Check if email can log in (either as creator or admin)
export async function canLogin(email: string): Promise<{ canLogin: boolean; userType: 'creator' | 'admin' | null }> {
  const normalizedEmail = email.toLowerCase();

  // Check creators table first
  const { data: creatorData } = await supabase
    .from('creators')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (creatorData) {
    return { canLogin: true, userType: 'creator' };
  }

  // Check admin_users table
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (adminData) {
    return { canLogin: true, userType: 'admin' };
  }

  return { canLogin: false, userType: null };
}

// Get user type for redirect after login
export async function getUserType(email: string): Promise<'creator' | 'admin' | null> {
  const normalizedEmail = email.toLowerCase();

  // Check creators table first
  const { data: creatorData } = await supabase
    .from('creators')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (creatorData) {
    return 'creator';
  }

  // Check admin_users table
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (adminData) {
    return 'admin';
  }

  return null;
}

// ============================================
// Notification Functions
// ============================================

export type NotificationType =
  | 'milestone_waiting'
  | 'new_creator'
  | 'agreement_signed'
  | 'milestone_completed'
  | 'phase_completed';

export interface NotifyTeamParams {
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  milestoneId?: string;
  notificationType: NotificationType;
  title: string;
  message?: string;
}

/**
 * Send a notification to the TDI team about a creator action
 * This creates a database notification and optionally sends an email
 */
export async function notifyTeam(params: NotifyTeamParams): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error('[notifyTeam] Failed to send notification');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[notifyTeam] Error:', error);
    return false;
  }
}

/**
 * Server-side notification function (for use in API routes)
 */
export async function notifyTeamServer(params: NotifyTeamParams): Promise<boolean> {
  const serviceSupabase = getServiceSupabase();

  try {
    // Save notification to database
    const { error } = await serviceSupabase.from('admin_notifications').insert({
      creator_id: params.creatorId,
      milestone_id: params.milestoneId || null,
      notification_type: params.notificationType,
      title: params.title,
      message: params.message || null,
    });

    if (error) {
      console.error('[notifyTeamServer] Failed to save notification:', error);
      return false;
    }

    // Email sending is handled by the API route
    return true;
  } catch (error) {
    console.error('[notifyTeamServer] Error:', error);
    return false;
  }
}
