-- ============================================================
-- CMO Dashboard: Real seed data (calibrated to actual analytics)
-- Run AFTER migration 040_cmo_dashboard.sql has been applied
-- ============================================================

-- Clear existing seed data (if any)
DELETE FROM cmo_tiktok_posts;
DELETE FROM cmo_substack_posts;
DELETE FROM cmo_utm_tracking;
DELETE FROM cmo_rae_brief;
DELETE FROM cmo_subscriber_sources;
DELETE FROM cmo_weekly_metrics;

-- ============================================================
-- WEEKLY METRICS (4 weeks)
-- ============================================================

INSERT INTO cmo_weekly_metrics (
  week_start,
  tiktok_views, tiktok_followers, tiktok_posts_count,
  substack_subscribers, substack_open_rate, substack_views,
  ig_followers, ig_reach,
  fb_group_members, fb_group_active,
  form_clicks, applications, discovery_calls
) VALUES
('2026-04-06', 8420, 4280, 4, 2802, 23.0, 66429, 2861, 2180, 1638, 387, 35, 1, 0),
('2026-04-13', 24680, 4520, 5, 2818, 23.0, 63282, 2914, 3840, 1672, 478, 64, 2, 1),
('2026-04-20', 11240, 4680, 4, 2821, 23.3, 86885, 2947, 2940, 1694, 412, 62, 2, 2),
('2026-04-27', 6840, 4750, 3, 2832, 22.8, 82390, 2962, 1840, 1712, 358, 41, 1, 1);

-- ============================================================
-- TIKTOK POSTS (16 posts, most recent first by post_date)
-- ============================================================

INSERT INTO cmo_tiktok_posts (week_start, post_date, title, views, likes, comments, shares) VALUES
('2026-04-27', '2026-04-30', 'Teacher contracts are negotiable', 1460, 112, 14, 19),
('2026-04-27', '2026-04-29', 'Real talk: should you stay in teaching?', 2180, 163, 28, 41),
('2026-04-27', '2026-04-27', 'What 100K teachers across 50 states have in common', 3200, 247, 38, 56),
('2026-04-20', '2026-04-24', 'What every first-year teacher needs to hear', 1380, 102, 11, 16),
('2026-04-20', '2026-04-23', 'Teacher PD that doesn''t waste your time', 2140, 162, 19, 28),
('2026-04-20', '2026-04-22', 'Standards-based grading is changing teaching', 2920, 218, 31, 48),
('2026-04-20', '2026-04-20', 'Things admin says vs what they mean', 4800, 384, 67, 92),
('2026-04-13', '2026-04-17', 'How I plan a week in 30 minutes', 1220, 87, 8, 14),
('2026-04-13', '2026-04-16', 'Teacher mental load is invisible labor', 2320, 156, 22, 41),
('2026-04-13', '2026-04-15', 'Reading the room as a substitute', 2840, 198, 18, 32),
('2026-04-13', '2026-04-14', 'If your principal won''t let you do this, leave', 4100, 287, 56, 81),
('2026-04-13', '2026-04-13', 'Why I left teaching to build TDI', 14200, 1840, 312, 524),
('2026-04-06', '2026-04-11', 'Teacher tax write-offs you didn''t know', 920, 64, 7, 8),
('2026-04-06', '2026-04-10', 'When the IEP meeting goes 30 min over', 1560, 98, 9, 11),
('2026-04-06', '2026-04-08', 'Things teachers actually need', 1840, 156, 14, 22),
('2026-04-06', '2026-04-06', 'POV: Sunday before back-to-school', 4100, 312, 28, 67);

-- ============================================================
-- SUBSTACK POSTS (16 posts)
-- ============================================================

INSERT INTO cmo_substack_posts (week_start, post_date, title, audience, views, open_rate, engagement_rate, free_subs_gained) VALUES
('2026-04-27', '2026-05-01', 'From Burnout to Regeneration with Ruth Poulsen', 'everyone', 18333, 22.0, 7.49, 0),
('2026-04-27', '2026-04-29', 'The End-of-April Energy Audit', 'paid', 21485, 23.0, 5.95, 0),
('2026-04-27', '2026-04-28', 'Quick update for Title I or Title II Schools. Read This.', 'everyone', 21729, 23.0, 6.04, 0),
('2026-04-27', '2026-04-27', 'You Keep Getting Pulled. Here Is What to Do About It.', 'everyone', 20843, 23.0, 6.49, 0),
('2026-04-20', '2026-04-24', 'You''re Not Alone, Educator, and Neither Are Your Kids', 'everyone', 20292, 23.0, 6.29, 0),
('2026-04-20', '2026-04-22', 'Scripts for the End-of-Year Talks Students Actually Remember', 'paid', 22401, 23.0, 5.63, 2),
('2026-04-20', '2026-04-21', 'What "Progressive" Actually Looks Like in a Building (Bonus Recap)', 'everyone', 20456, 23.0, 6.46, 0),
('2026-04-20', '2026-04-20', 'The Last Six Weeks Are Not Extra Credit', 'everyone', 23736, 24.0, 4.71, 1),
('2026-04-13', '2026-04-17', 'Double Drop: Culture-First Leadership + Executive Functioning', 'everyone', 20357, 23.0, 5.02, 1),
('2026-04-13', '2026-04-15', 'The April Reset: 3 Moves to Finish Strong When You''re Running on Empty', 'paid', 21421, 23.0, 3.92, 2),
('2026-04-13', '2026-04-13', 'What You Write Down in April Is What Saves You in August', 'everyone', 21504, 23.0, 5.65, 3),
('2026-04-06', '2026-04-10', 'When Students Feel Seen, Everything Changes', 'everyone', 21923, 23.0, 4.62, 2),
('2026-04-06', '2026-04-08', '4 Scripts for When Someone Asks You to Do One More Thing This April', 'paid', 22002, 23.0, 3.88, 2),
('2026-04-06', '2026-04-06', 'The April Wall', 'everyone', 22504, 23.0, 5.02, 2),
('2026-03-30', '2026-04-03', 'You Deserve a Campus That Works For You (Not Against You)', 'everyone', 22612, 23.0, 4.01, 1),
('2026-03-30', '2026-04-01', '5.7 out of 10: What''s Actually Lowering Teacher Stress', 'paid', 22965, 23.0, 4.6, 1);

-- ============================================================
-- UTM TRACKING (per-week, per-source)
-- ============================================================

INSERT INTO cmo_utm_tracking (week_start, source, form_clicks, applications, discovery_calls) VALUES
-- Week of Apr 6
('2026-04-06', 'substack_post', 14, 0, 0),
('2026-04-06', 'tiktok_bio', 8, 1, 0),
('2026-04-06', 'linkedin_post', 6, 0, 0),
('2026-04-06', 'ig_bio', 3, 0, 0),
('2026-04-06', 'fb_group', 4, 0, 0),
-- Week of Apr 13
('2026-04-13', 'substack_post', 18, 0, 0),
('2026-04-13', 'tiktok_bio', 26, 2, 1),
('2026-04-13', 'linkedin_post', 8, 0, 0),
('2026-04-13', 'ig_bio', 7, 0, 0),
('2026-04-13', 'fb_group', 5, 0, 0),
-- Week of Apr 20
('2026-04-20', 'substack_post', 22, 1, 1),
('2026-04-20', 'tiktok_bio', 18, 1, 1),
('2026-04-20', 'linkedin_post', 11, 0, 0),
('2026-04-20', 'ig_bio', 6, 0, 0),
('2026-04-20', 'fb_group', 5, 0, 0),
-- Week of Apr 27 (partial)
('2026-04-27', 'substack_post', 16, 0, 0),
('2026-04-27', 'tiktok_bio', 11, 1, 1),
('2026-04-27', 'linkedin_post', 7, 0, 0),
('2026-04-27', 'ig_bio', 4, 0, 0),
('2026-04-27', 'fb_group', 3, 0, 0);

-- ============================================================
-- RAE'S BRIEF (current week)
-- ============================================================

INSERT INTO cmo_rae_brief (week_start, section, body) VALUES
('2026-04-27', 'attract', 'The Apr 13 TikTok breakout ("Why I left teaching to build TDI") drove 26 form clicks and lifted Substack subs by +16 that week. Doubling down on origin-story content for the next 2-3 weeks. New posting cadence: 5 TikToks/week, target 1 personal-story post and 4 tactical posts.'),
('2026-04-27', 'warm', 'Substack engagement holding at 23% open rate (industry benchmark for EDU is 35-45%, so we have room). 7.49% engagement on the Ruth Poulsen post is the ceiling we want to chase weekly. Ruth''s interview format may be worth productizing into a guest series.'),
('2026-04-27', 'convert', '6 applications in 4 weeks is the highest 4-week count this quarter. TikTok bio link is converting at 4.8% (apps per click) vs Substack at 2.9%. Question for Kristin: should we A/B test the bio link CTA copy?');

-- ============================================================
-- SUBSCRIBER SOURCES (90-day snapshot)
-- ============================================================

INSERT INTO cmo_subscriber_sources (month, source, subscribers, percent) VALUES
('2026-04', 'Imported accounts', 2482, 88),
('2026-04', 'Substack App', 198, 7),
('2026-04', 'Substack existing accounts', 88, 3),
('2026-04', 'Other Substack Network', 37, 1),
('2026-04', 'New accounts', 27, 1);

-- ============================================================
-- VERIFY
-- ============================================================

SELECT 'weekly_metrics' AS table_name, COUNT(*) AS rows FROM cmo_weekly_metrics
UNION ALL SELECT 'tiktok_posts', COUNT(*) FROM cmo_tiktok_posts
UNION ALL SELECT 'substack_posts', COUNT(*) FROM cmo_substack_posts
UNION ALL SELECT 'utm_tracking', COUNT(*) FROM cmo_utm_tracking
UNION ALL SELECT 'rae_brief', COUNT(*) FROM cmo_rae_brief
UNION ALL SELECT 'subscriber_sources', COUNT(*) FROM cmo_subscriber_sources;
