-- Migration: Hub RLS Policies
-- Description: Enable Row Level Security on hub_enrollments and hub_lesson_progress tables
-- to allow authenticated users to manage their own data

-- ============================================
-- hub_enrollments RLS Policies
-- ============================================

-- Enable RLS on hub_enrollments (if not already enabled)
ALTER TABLE hub_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Users can view own enrollments" ON hub_enrollments;
DROP POLICY IF EXISTS "Users can enroll themselves" ON hub_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON hub_enrollments;

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
ON hub_enrollments FOR SELECT
USING (auth.uid() = user_id);

-- Users can create enrollments for themselves
CREATE POLICY "Users can enroll themselves"
ON hub_enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own enrollments (e.g., progress)
CREATE POLICY "Users can update own enrollments"
ON hub_enrollments FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- hub_lesson_progress RLS Policies
-- ============================================

-- Enable RLS on hub_lesson_progress (if not already enabled)
ALTER TABLE hub_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own lesson progress" ON hub_lesson_progress;
DROP POLICY IF EXISTS "Users can create own lesson progress" ON hub_lesson_progress;
DROP POLICY IF EXISTS "Users can update own lesson progress" ON hub_lesson_progress;

-- Users can view their own lesson progress
CREATE POLICY "Users can view own lesson progress"
ON hub_lesson_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can create lesson progress for themselves
CREATE POLICY "Users can create own lesson progress"
ON hub_lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own lesson progress
CREATE POLICY "Users can update own lesson progress"
ON hub_lesson_progress FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- hub_courses - Public Read Access
-- ============================================

-- Enable RLS on hub_courses (if not already enabled)
ALTER TABLE hub_courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published courses" ON hub_courses;

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses"
ON hub_courses FOR SELECT
USING (is_published = true);

-- ============================================
-- hub_lessons - Access based on enrollment
-- ============================================

-- Enable RLS on hub_lessons (if not already enabled)
ALTER TABLE hub_lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view lessons for enrolled courses" ON hub_lessons;
DROP POLICY IF EXISTS "Anyone can view free preview lessons" ON hub_lessons;

-- Anyone can view lessons (enrollment check happens at app level)
-- This is simpler and more performant than complex RLS joins
CREATE POLICY "Anyone can view lessons"
ON hub_lessons FOR SELECT
USING (true);

-- ============================================
-- hub_modules - Public Read Access
-- ============================================

-- Enable RLS on hub_modules (if not already enabled)
ALTER TABLE hub_modules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view modules" ON hub_modules;

-- Anyone can view modules
CREATE POLICY "Anyone can view modules"
ON hub_modules FOR SELECT
USING (true);

-- ============================================
-- hub_quick_wins - Public Read Access
-- ============================================

-- Enable RLS on hub_quick_wins (if not already enabled)
ALTER TABLE hub_quick_wins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published quick wins" ON hub_quick_wins;

-- Anyone can view published quick wins
CREATE POLICY "Anyone can view published quick wins"
ON hub_quick_wins FOR SELECT
USING (is_published = true);
