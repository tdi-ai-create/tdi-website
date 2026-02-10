'use client';

import { getSupabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface HubProfile {
  id: string;
  display_name: string | null;
  role: 'classroom_teacher' | 'para' | 'coach' | 'school_leader' | 'district_staff' | 'other' | null;
  school_id: string | null;
  district_id: string | null;
  avatar_url: string | null;
  avatar_id: string | null;
  onboarding_completed: boolean;
  onboarding_data: Record<string, unknown>;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Get the current authenticated user
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

// Get the Hub profile for a user
export async function getHubProfile(userId: string): Promise<HubProfile | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('hub_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as HubProfile;
}

// Create a new Hub profile for a user
export async function createHubProfile(
  userId: string,
  data?: Partial<Omit<HubProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<HubProfile | null> {
  const supabase = getSupabase();

  const profileData = {
    id: userId,
    display_name: data?.display_name || null,
    role: data?.role || null,
    school_id: data?.school_id || null,
    district_id: data?.district_id || null,
    avatar_url: data?.avatar_url || null,
    avatar_id: data?.avatar_id || null,
    onboarding_completed: data?.onboarding_completed || false,
    onboarding_data: data?.onboarding_data || {},
    preferences: data?.preferences || {},
  };

  const { data: profile, error } = await supabase
    .from('hub_profiles')
    .insert(profileData)
    .select()
    .single();

  if (error) {
    console.error('Error creating Hub profile:', error);
    return null;
  }

  return profile as HubProfile;
}

// Update an existing Hub profile
export async function updateHubProfile(
  userId: string,
  data: Partial<Omit<HubProfile, 'id' | 'created_at'>>
): Promise<HubProfile | null> {
  const supabase = getSupabase();

  const { data: profile, error } = await supabase
    .from('hub_profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating Hub profile:', error);
    return null;
  }

  return profile as HubProfile;
}

// Check if a user has completed onboarding
export async function isOnboarded(userId: string): Promise<boolean> {
  const profile = await getHubProfile(userId);
  return profile?.onboarding_completed || false;
}

// Sign out and redirect to main site
export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  window.location.href = '/';
}

// Get user's first name from display_name or email
export function getFirstName(profile: HubProfile | null, email?: string): string {
  if (profile?.display_name) {
    return profile.display_name.split(' ')[0];
  }
  if (email) {
    return email.split('@')[0];
  }
  return 'Teacher';
}

// Increment hard day aggregate count (for Moment Mode)
export async function incrementHardDayCount(): Promise<void> {
  const supabase = getSupabase();

  // Call the database function that handles the upsert
  const { error } = await supabase.rpc('increment_hard_day_count');

  if (error) {
    // Silently fail - this is non-critical and we don't want to disrupt the user experience
    console.error('Error incrementing hard day count:', error);
  }
}

// Listen for auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = getSupabase();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return subscription;
}
