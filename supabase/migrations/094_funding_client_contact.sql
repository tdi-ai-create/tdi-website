-- ============================================================
-- Migration 094: Client contact fields + pursuit summary view
-- ============================================================

-- Client contact on pursuits
ALTER TABLE funding_pursuits ADD COLUMN IF NOT EXISTS client_contact_name TEXT;
ALTER TABLE funding_pursuits ADD COLUMN IF NOT EXISTS client_contact_email TEXT;
ALTER TABLE funding_pursuits ADD COLUMN IF NOT EXISTS client_contact_phone TEXT;
ALTER TABLE funding_pursuits ADD COLUMN IF NOT EXISTS client_contact_role TEXT;

-- Summary view for dashboard queries
CREATE OR REPLACE VIEW funding_pursuit_summary AS
SELECT
  fp.id,
  fp.pursuit_name,
  fp.district_name,
  fp.total_amount,
  fp.contract_gap,
  fp.current_phase,
  fp.implementation_date,
  fp.is_stalled,
  fp.client_contact_name,
  fp.client_contact_email,
  fp.client_contact_role,
  fp.created_at,
  fp.updated_at,

  -- Opportunity rollups
  COALESCE(SUM(fo.amount) FILTER (WHERE fo.status = 'awarded'), 0) AS total_awarded,
  COALESCE(SUM(fo.awarded_amount) FILTER (WHERE fo.status = 'awarded'), 0) AS total_awarded_actual,
  COALESCE(SUM(fo.amount) FILTER (WHERE fo.status IN ('applied', 'waiting')), 0) AS total_pending,
  COALESCE(SUM(fo.amount) FILTER (WHERE fo.status = 'researching'), 0) AS total_researching,
  COALESCE(fp.contract_gap - COALESCE(SUM(fo.amount) FILTER (WHERE fo.status = 'awarded'), 0), fp.contract_gap) AS remaining_gap,
  COUNT(fo.id)::INTEGER AS opportunity_count,
  COUNT(fo.id) FILTER (WHERE fo.waiting_on = 'client')::INTEGER AS waiting_on_client_count,
  COUNT(fo.id) FILTER (
    WHERE fo.status NOT IN ('awarded', 'denied')
    AND fo.last_activity_at < now() - INTERVAL '14 days'
  )::INTEGER AS stale_count,
  MIN(fo.application_closes) FILTER (
    WHERE fo.application_closes >= CURRENT_DATE
    AND fo.status NOT IN ('awarded', 'denied')
  ) AS next_deadline,

  -- Action item rollups
  COALESCE(ai_counts.pending_tdi, 0) AS pending_tdi_actions,
  COALESCE(ai_counts.pending_client, 0) AS pending_client_actions,
  COALESCE(ai_counts.overdue_count, 0) AS overdue_action_count

FROM funding_pursuits fp
LEFT JOIN funding_opportunities fo ON fo.pursuit_id = fp.id
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE ai.owner_type = 'tdi' AND ai.status IN ('pending', 'in_progress'))::INTEGER AS pending_tdi,
    COUNT(*) FILTER (WHERE ai.owner_type = 'client' AND ai.status IN ('pending', 'in_progress'))::INTEGER AS pending_client,
    COUNT(*) FILTER (WHERE ai.status IN ('pending', 'in_progress') AND ai.due_date < CURRENT_DATE)::INTEGER AS overdue_count
  FROM funding_action_items ai
  WHERE ai.pursuit_id = fp.id
) ai_counts ON true
GROUP BY fp.id, ai_counts.pending_tdi, ai_counts.pending_client, ai_counts.overdue_count;
