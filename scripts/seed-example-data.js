#!/usr/bin/env node

/**
 * Seed Example Data for TDI Admin Portal
 *
 * Creates realistic example data for the Learning Hub admin dashboard.
 * All example data uses is_example = true and @example.tdi.test emails.
 *
 * Usage:
 *   node scripts/seed-example-data.js           # Seed example data
 *   node scripts/seed-example-data.js --cleanup # Remove all example data
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error('Error loading .env.local:', error.message);
    process.exit(1);
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ============================================
// DATA GENERATORS
// ============================================

const FIRST_NAMES = [
  'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn',
  'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Ella', 'Madison', 'Scarlett', 'Victoria', 'Aria', 'Grace',
  'Chloe', 'Camila', 'Penelope', 'Riley', 'Layla', 'Lillian', 'Nora', 'Zoey', 'Mila', 'Aubrey',
  'Hannah', 'Lily', 'Addison', 'Eleanor', 'Natalie', 'Luna', 'Savannah', 'Brooklyn', 'Leah', 'Zoe',
  'Stella', 'Hazel', 'Ellie', 'Paisley', 'Audrey', 'Skylar', 'Violet', 'Claire', 'Bella', 'Aurora',
  'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Theodore',
  'Jack', 'Levi', 'Alexander', 'Mason', 'Ethan', 'Jacob', 'Michael', 'Daniel', 'Logan', 'Sebastian',
  'Matthew', 'David', 'Samuel', 'Joseph', 'Carter', 'Owen', 'Wyatt', 'John', 'Ryan', 'Luke',
  'Gabriel', 'Anthony', 'Dylan', 'Isaac', 'Grayson', 'Leo', 'Jayden', 'Caleb', 'Asher', 'Nathan',
  'Thomas', 'Aaron', 'Isaiah', 'Charles', 'Julian', 'Christopher', 'Joshua', 'Ezra', 'Andrew', 'Lincoln'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Chen', 'Kim', 'Patel', 'Singh', 'Cohen', 'Murphy', 'Sullivan', 'Kelly', 'Bennett', 'Collins',
  'Stewart', 'Morris', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Cooper', 'Richardson',
  'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks'
];

const SCHOOLS = [
  { name: 'Maple Grove Elementary', staff: 72, type: 'elementary' },
  { name: 'Riverside Middle School', staff: 65, type: 'middle' },
  { name: 'Oakwood High School', staff: 58, type: 'high' },
  { name: 'Sunflower Academy', staff: 45, type: 'k8' },
  { name: 'Pine Valley School District', staff: 80, type: 'district' },
  { name: 'Horizon Charter School', staff: 35, type: 'charter' },
  { name: 'Cedar Ridge Elementary', staff: 55, type: 'elementary' },
  { name: 'Lakeview Middle School', staff: 48, type: 'middle' },
];

const STATES = ['IL', 'TX', 'CA', 'NY', 'FL', 'OH', 'GA', 'NC', 'PA', 'MI'];

const GRADE_LEVELS = ['Pre-K', 'K-2', '3-5', '6-8', '9-12', 'Higher Ed'];
const GRADE_WEIGHTS = [5, 20, 25, 20, 20, 10];

const GOALS = [
  'stress-management', 'time-management', 'classroom-strategies',
  'work-life-balance', 'leadership', 'student-engagement', 'self-care'
];

const ROLES = [
  { role: 'classroom_teacher', weight: 70 },
  { role: 'para', weight: 15 },
  { role: 'coach', weight: 10 },
  { role: 'school_leader', weight: 5 },
];

const EXAMPLE_COURSES = [
  { title: 'Managing Stress in the Classroom', slug: 'managing-stress-classroom', category: 'Stress & Wellness', pd_hours: 3, level: 'beginner' },
  { title: 'Time Management for Educators', slug: 'time-management-educators', category: 'Productivity', pd_hours: 2, level: 'beginner' },
  { title: 'Building Classroom Community', slug: 'building-classroom-community', category: 'Classroom Tools', pd_hours: 4, level: 'intermediate' },
  { title: 'Effective Communication with Parents', slug: 'effective-parent-communication', category: 'Communication', pd_hours: 2, level: 'beginner' },
  { title: 'Self-Care Strategies for Teachers', slug: 'self-care-strategies', category: 'Self-Care', pd_hours: 3, level: 'beginner' },
  { title: 'Data-Driven Instruction', slug: 'data-driven-instruction', category: 'Classroom Tools', pd_hours: 5, level: 'advanced' },
  { title: 'Paraprofessional Excellence', slug: 'paraprofessional-excellence', category: 'Professional Growth', pd_hours: 4, level: 'beginner' },
  { title: 'Leadership for Teacher Leaders', slug: 'leadership-teacher-leaders', category: 'Leadership', pd_hours: 3, level: 'intermediate' },
];

const ACTIVITY_ACTIONS = [
  'lesson_complete', 'course_complete', 'enrollment_created', 'quiz_passed',
  'reflection_submitted', 'quick_win_completed', 'stress_checkin',
  'certificate_earned', 'pd_request', 'moment_mode_used', 'tip_shared'
];

const FEEDBACK_COMMENTS = [
  'Really helpful strategies I could use right away',
  'Changed how I think about my mornings',
  'Wish there were more video examples',
  'Perfect for my first year',
  'Finally someone understands what we deal with',
  'Shared this with my whole team',
  'The reflection prompts were powerful',
  'Made me feel seen as a para',
  'Practical and no fluff',
  'I actually look forward to these modules',
  'Great content, easy to follow',
  'This should be required PD for everyone',
  'The activities were engaging and relevant',
  'Helped me set better boundaries',
  'My stress levels have genuinely improved',
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandomChoice(items, weights) {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return new Date(start + Math.random() * (end - start));
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function generateVerificationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EX-${code.slice(0, 4)}-${code.slice(4)}`;
}

async function batchInsert(table, records, batchSize = 50) {
  const batches = [];
  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }

  let inserted = 0;
  for (const batch of batches) {
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      console.error(`Error inserting into ${table}:`, error.message);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${records.length} into ${table}`);
  }
  console.log('');
}

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedProfiles() {
  console.log('\n📝 Seeding example profiles...');
  console.log('  Creating auth users and profiles (this may take a minute)...');

  const profiles = [];
  const startDate = new Date('2025-08-01');
  const endDate = new Date('2026-02-13');

  // Assign staff to schools
  const schoolAssignments = [];

  for (const school of SCHOOLS) {
    for (let i = 0; i < school.staff; i++) {
      schoolAssignments.push(school.name);
    }
  }

  // Add independent teachers (42)
  for (let i = 0; i < 42; i++) {
    schoolAssignments.push(null);
  }

  // Shuffle assignments
  schoolAssignments.sort(() => Math.random() - 0.5);

  // Create users in batches
  const TARGET_USERS = 500;
  let created = 0;
  let failed = 0;

  for (let i = 0; i < TARGET_USERS; i++) {
    const firstName = randomChoice(FIRST_NAMES);
    const lastName = randomChoice(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.tdi.test`;

    const roleObj = weightedRandomChoice(ROLES, ROLES.map(r => r.weight));
    const gradeLevel = weightedRandomChoice(GRADE_LEVELS, GRADE_WEIGHTS);
    const school = schoolAssignments[i] || null;

    const initialStress = randomInt(5, 9);
    const currentStress = randomInt(3, Math.min(8, initialStress));
    const yearsExp = Math.round(Math.abs(randomInt(0, 30) - 15 + Math.random() * 10));

    const createdAt = randomDate(startDate, endDate);
    const onboardingCompleted = Math.random() < 0.9;

    try {
      // Create auth user first
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'ExampleUser123!',
        email_confirm: true,
        user_metadata: {
          display_name: `${firstName} ${lastName}`,
          is_example: true,
        }
      });

      if (authError) {
        failed++;
        continue;
      }

      // Now create the profile with the auth user's ID
      const profileData = {
        id: authUser.user.id,
        display_name: `${firstName} ${lastName}`,
        role: roleObj.role,
        onboarding_completed: onboardingCompleted,
        onboarding_data: {
          grade_level: gradeLevel,
          years_experience: yearsExp,
          goals: [randomChoice(GOALS), randomChoice(GOALS)].filter((v, idx, a) => a.indexOf(v) === idx),
          initial_stress_level: initialStress,
          current_stress_level: currentStress,
          school_name: school,
          state: randomChoice(STATES),
          gender: weightedRandomChoice(['female', 'male', 'non-binary', 'prefer_not_to_say'], [55, 38, 4, 3]),
        },
        preferences: {
          email_notifications: Math.random() > 0.2,
          dark_mode: Math.random() > 0.85,
        },
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
        is_example: true,
      };

      const { error: profileError } = await supabase.from('hub_profiles').insert(profileData);

      if (!profileError) {
        profiles.push(profileData);
        created++;
      } else {
        failed++;
      }

      // Progress indicator
      if ((created + failed) % 50 === 0) {
        process.stdout.write(`\r  Progress: ${created} created, ${failed} failed of ${TARGET_USERS}`);
      }

    } catch (err) {
      failed++;
    }
  }

  console.log(`\n  ✓ Created ${profiles.length} example profiles (${failed} failed)`);
  return profiles;
}

async function seedCourses() {
  console.log('\n📚 Fetching existing courses...');

  // Just use existing published courses - don't create new ones
  // (hub_courses doesn't have is_example column)
  const { data: existingCourses } = await supabase
    .from('hub_courses')
    .select('id, title, pd_hours')
    .eq('is_published', true);

  if (existingCourses && existingCourses.length > 0) {
    console.log(`  ✓ Found ${existingCourses.length} existing courses to use`);
    return existingCourses;
  }

  // If no courses exist, create minimal set without is_example
  console.log('  ⚠️ No published courses found, creating example courses...');
  const newCourses = EXAMPLE_COURSES.slice(0, 4).map(course => ({
    id: generateUUID(),
    title: course.title,
    slug: course.slug,
    category: course.category,
    pd_hours: course.pd_hours,
    description: `Learn essential ${course.category.toLowerCase()} skills for educators.`,
    is_published: true,
    created_at: new Date('2025-07-01').toISOString(),
  }));

  await batchInsert('hub_courses', newCourses);
  console.log(`  ✓ Added ${newCourses.length} courses`);
  return newCourses;
}

async function seedEnrollments(profiles, courses) {
  console.log('\n📊 Seeding enrollments...');

  const enrollments = [];
  const statusWeights = { completed: 45, active: 35, dropped: 15, not_started: 5 };
  const statuses = Object.keys(statusWeights);
  const weights = Object.values(statusWeights);

  for (const profile of profiles) {
    const numEnrollments = weightedRandomChoice([1, 2, 3, 4], [20, 40, 30, 10]);
    const selectedCourses = [...courses].sort(() => Math.random() - 0.5).slice(0, numEnrollments);

    for (const course of selectedCourses) {
      const status = weightedRandomChoice(statuses, weights);
      const enrolledAt = randomDate(profile.created_at, new Date('2026-02-10'));

      let progressPct, completedAt;
      switch (status) {
        case 'completed':
          progressPct = 100;
          completedAt = new Date(enrolledAt.getTime() + randomInt(14, 56) * 24 * 60 * 60 * 1000);
          break;
        case 'active':
          progressPct = randomInt(20, 85);
          completedAt = null;
          break;
        case 'dropped':
          progressPct = randomInt(5, 40);
          completedAt = null;
          break;
        default:
          progressPct = 0;
          completedAt = null;
      }

      enrollments.push({
        id: generateUUID(),
        user_id: profile.id,
        course_id: course.id,
        enrolled_at: enrolledAt.toISOString(),
        status: status === 'dropped' || status === 'not_started' ? 'active' : status,
        progress_pct: progressPct,
        completed_at: completedAt ? completedAt.toISOString() : null,
        is_example: true,
      });
    }
  }

  await batchInsert('hub_enrollments', enrollments);
  console.log(`  ✓ Created ${enrollments.length} enrollments`);
  return enrollments;
}

async function seedCertificates(enrollments, courses) {
  console.log('\n🎓 Seeding certificates...');

  const completedEnrollments = enrollments.filter(e => e.status === 'completed' && e.progress_pct === 100);
  const courseMap = new Map(courses.map(c => [c.id, c]));

  const certificates = completedEnrollments.map(enrollment => {
    const course = courseMap.get(enrollment.course_id);
    return {
      id: generateUUID(),
      user_id: enrollment.user_id,
      course_id: enrollment.course_id,
      verification_code: generateVerificationCode(),
      pd_hours: course?.pd_hours || 2,
      issued_at: enrollment.completed_at,
      certificate_url: null,
      is_example: true,
    };
  });

  await batchInsert('hub_certificates', certificates);
  console.log(`  ✓ Created ${certificates.length} certificates`);
  return certificates;
}

async function seedActivityLog(profiles, enrollments) {
  console.log('\n📋 Seeding activity log...');

  const activities = [];
  const startDate = new Date('2025-08-01');
  const endDate = new Date('2026-02-13');

  // Generate diverse activities
  for (const profile of profiles) {
    const numActivities = randomInt(2, 8);

    for (let i = 0; i < numActivities; i++) {
      const action = randomChoice(ACTIVITY_ACTIONS);
      const createdAt = randomDate(profile.created_at, endDate);

      let metadata = {};
      switch (action) {
        case 'lesson_complete':
          metadata = { lesson_title: `Lesson ${randomInt(1, 10)}`, duration_minutes: randomInt(5, 30) };
          break;
        case 'course_complete':
          metadata = { course_title: randomChoice(EXAMPLE_COURSES).title };
          break;
        case 'stress_checkin':
          metadata = { score: randomInt(3, 9), mood: randomChoice(['calm', 'stressed', 'hopeful', 'tired']) };
          break;
        case 'pd_request':
          metadata = { hours: randomInt(1, 5), status: randomChoice(['pending', 'approved', 'submitted']) };
          break;
        case 'moment_mode_used':
          metadata = { duration_seconds: randomInt(30, 180), type: randomChoice(['breathing', 'grounding', 'affirmation']) };
          break;
        case 'tip_shared':
          metadata = { tip_category: randomChoice(['self-care', 'classroom', 'time-management']) };
          break;
        default:
          metadata = {};
      }

      activities.push({
        id: generateUUID(),
        user_id: profile.id,
        action,
        metadata,
        created_at: createdAt.toISOString(),
        is_example: true,
      });
    }
  }

  // Add extra pd_requests (30-40 total)
  const pdRequestCount = randomInt(30, 40);
  for (let i = 0; i < pdRequestCount; i++) {
    const profile = randomChoice(profiles);
    activities.push({
      id: generateUUID(),
      user_id: profile.id,
      action: 'pd_request',
      metadata: {
        hours: randomInt(1, 5),
        status: weightedRandomChoice(['pending', 'approved', 'submitted'], [40, 35, 25]),
        school: profile.onboarding_data?.school_name || 'Independent',
      },
      created_at: randomDate(startDate, endDate).toISOString(),
      is_example: true,
    });
  }

  // Add extra moment_mode_used (50-60 total)
  const momentModeCount = randomInt(50, 60);
  for (let i = 0; i < momentModeCount; i++) {
    const profile = randomChoice(profiles);
    activities.push({
      id: generateUUID(),
      user_id: profile.id,
      action: 'moment_mode_used',
      metadata: {
        duration_seconds: randomInt(30, 180),
        type: randomChoice(['breathing', 'grounding', 'affirmation', 'visualization'])
      },
      created_at: randomDate(startDate, endDate).toISOString(),
      is_example: true,
    });
  }

  await batchInsert('hub_activity_log', activities);
  console.log(`  ✓ Created ${activities.length} activity log entries`);
  return activities;
}

// Note: hub_assessments table doesn't exist in current schema
// Stress data is stored in hub_activity_log with action='stress_checkin'

async function seedFeedback(enrollments) {
  console.log('\n⭐ Seeding course ratings and feedback...');

  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  const feedbackEntries = [];

  // 60% of completed enrollments get ratings
  const enrollmentsWithRatings = completedEnrollments
    .filter(() => Math.random() < 0.6);

  for (const enrollment of enrollmentsWithRatings) {
    const rating = weightedRandomChoice([3, 4, 5], [10, 35, 55]);
    const hasComment = Math.random() < 0.3;

    feedbackEntries.push({
      id: generateUUID(),
      user_id: enrollment.user_id,
      action: 'feedback',
      metadata: {
        type: 'course_rating',
        course_id: enrollment.course_id,
        rating,
        comment: hasComment ? randomChoice(FEEDBACK_COMMENTS) : null,
      },
      created_at: enrollment.completed_at || new Date().toISOString(),
      is_example: true,
    });
  }

  await batchInsert('hub_activity_log', feedbackEntries);
  console.log(`  ✓ Created ${feedbackEntries.length} ratings/feedback entries`);
  return feedbackEntries;
}

// ============================================
// CLEANUP FUNCTION
// ============================================

async function cleanup() {
  console.log('\n🧹 Cleaning up example data...');

  // Only tables that have is_example column
  const tables = [
    'hub_activity_log',
    'hub_certificates',
    'hub_lesson_progress',
    'hub_enrollments',
    'hub_profiles',
  ];

  const results = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('is_example', true)
        .select('id');

      if (error) {
        console.log(`  ⚠️ ${table}: ${error.message}`);
        results[table] = 0;
      } else {
        const count = data?.length || 0;
        results[table] = count;
        console.log(`  ✓ ${table}: deleted ${count} rows`);
      }
    } catch (err) {
      console.log(`  ⚠️ ${table}: ${err.message}`);
      results[table] = 0;
    }
  }

  // Clean up auth users with example emails
  console.log('  Cleaning up auth users...');
  try {
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const exampleUsers = (users?.users || []).filter(u => u.email?.endsWith('@example.tdi.test'));

    let deleted = 0;
    for (const user of exampleUsers) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (!error) deleted++;
    }
    console.log(`  ✓ auth.users: deleted ${deleted} example users`);
    results['auth.users'] = deleted;
  } catch (err) {
    console.log(`  ⚠️ auth.users: ${err.message}`);
  }

  console.log('\n✨ Cleanup complete!');
  return results;
}

// ============================================
// MAIN
// ============================================

async function main() {
  const isCleanup = process.argv.includes('--cleanup');

  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     TDI Admin Portal - Example Data Seeder     ║');
  console.log('╚════════════════════════════════════════════════╝');

  if (isCleanup) {
    await cleanup();
    return;
  }

  console.log('\nThis will create example data for the Learning Hub admin dashboard.');
  console.log('All data will use @example.tdi.test emails and is_example = true.\n');

  try {
    // First cleanup any existing example data
    console.log('Cleaning up any existing example data first...');
    await cleanup();

    // Seed new data
    const profiles = await seedProfiles();
    const courses = await seedCourses();
    const enrollments = await seedEnrollments(profiles, courses);
    await seedCertificates(enrollments, courses);
    await seedActivityLog(profiles, enrollments);
    await seedFeedback(enrollments);

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║           ✨ Seeding Complete! ✨               ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║  Profiles:     ${profiles.length.toString().padStart(5)}                          ║`);
    console.log(`║  Courses:      ${courses.length.toString().padStart(5)}                          ║`);
    console.log(`║  Enrollments:  ${enrollments.length.toString().padStart(5)}                          ║`);
    console.log('╚════════════════════════════════════════════════╝');
    console.log('\nView your data at: /tdi-admin/hub');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
