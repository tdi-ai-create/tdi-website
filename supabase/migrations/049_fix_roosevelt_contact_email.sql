-- ============================================================
-- Fix Roosevelt School contact email to Jack Lipari's actual address.
-- The seed (023) used hello@teachersdeserveit.com as a placeholder,
-- which caused the invite-accept API to reject Jack's lodi.k12.nj.us
-- email, making it impossible for him to claim his account.
-- ============================================================

UPDATE partnerships
SET
  contact_name          = 'Jack Lipari',
  contact_email         = 'jack.lipari@lodi.k12.nj.us',
  primary_contact_name  = 'Jack Lipari',
  primary_contact_email = 'jack.lipari@lodi.k12.nj.us',
  updated_at            = now()
WHERE slug = 'roosevelt-school';
