-- ============================================
-- UPDATE CONTENT PATH DESCRIPTIONS
-- Makes cumulative nature of paths clear
-- Run this in Supabase SQL Editor
-- ============================================

-- Update the content_path_selection milestone with clearer descriptions
UPDATE public.milestones
SET action_config = '{
  "label": "Select Your Path",
  "options": [
    {
      "value": "blog",
      "label": "Blog Post",
      "emoji": "✍️",
      "description": "Write and publish a blog post on the TDI platform."
    },
    {
      "value": "download",
      "label": "Digital Download",
      "emoji": "📦",
      "description": "Create a downloadable resource for educators. This path includes a blog post to support your launch."
    },
    {
      "value": "course",
      "label": "Online Course",
      "emoji": "🎓",
      "description": "Build a full online course with video modules. This path includes a digital download and blog post to support your launch."
    }
  ]
}'
WHERE id = 'content_path_selection';

-- Verify the update
SELECT id, name, action_config
FROM public.milestones
WHERE id = 'content_path_selection';
