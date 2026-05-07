-- Grant Omar (support@secureplusfinancial.com) owner access
UPDATE tdi_team_members
SET
  role = 'owner',
  is_active = true,
  permissions = permissions || '{
    "cmo": {"access": true},
    "sales": {"access": true},
    "funding": {"access": true},
    "learning_hub": {"view_enrollments": true, "export_reports": true, "manage_courses": true, "view_financial": true, "view_analytics": true, "manage_content": true},
    "creator_studio": {"view_creators": true, "manage_creators": true, "content_pipeline": true, "financial_payouts": true, "approve_content": true},
    "leadership": {"view_partnerships": true, "manage_schools": true, "view_diagnostics": true, "financial_data": true, "export_reports": true},
    "intelligence": {"view_districts": true, "manage_districts": true, "view_collections": true, "manage_collections": true, "financial_data": true},
    "team_access": true
  }'::jsonb,
  updated_at = now()
WHERE email = 'support@secureplusfinancial.com' AND is_active = true;

-- Grant Kristin (team@whatwilllast.com) owner access
UPDATE tdi_team_members
SET
  role = 'owner',
  is_active = true,
  permissions = permissions || '{
    "cmo": {"access": true},
    "sales": {"access": true},
    "funding": {"access": true},
    "learning_hub": {"view_enrollments": true, "export_reports": true, "manage_courses": true, "view_financial": true, "view_analytics": true, "manage_content": true},
    "creator_studio": {"view_creators": true, "manage_creators": true, "content_pipeline": true, "financial_payouts": true, "approve_content": true},
    "leadership": {"view_partnerships": true, "manage_schools": true, "view_diagnostics": true, "financial_data": true, "export_reports": true},
    "intelligence": {"view_districts": true, "manage_districts": true, "view_collections": true, "manage_collections": true, "financial_data": true},
    "team_access": true
  }'::jsonb,
  updated_at = now()
WHERE email = 'team@whatwilllast.com' AND is_active = true;

-- Also grant Rae full portal access flags (she's already owner but may not have the new keys)
UPDATE tdi_team_members
SET
  permissions = permissions || '{
    "cmo": {"access": true},
    "sales": {"access": true},
    "funding": {"access": true}
  }'::jsonb,
  updated_at = now()
WHERE email = 'rae@teachersdeserveit.com';

-- Leave deactivated records untouched
-- omar@secureplusfinancial.com and kristin@whatwilllast.com stay deactivated

-- Verification
SELECT email, display_name, role, is_active,
  permissions->'cmo' as cmo,
  permissions->'sales' as sales,
  permissions->'funding' as funding,
  permissions->'team_access' as team_access
FROM tdi_team_members
ORDER BY role, email;
