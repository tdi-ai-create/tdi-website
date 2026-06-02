-- Add pin color customization to polaroids
ALTER TABLE hub_polaroids ADD COLUMN IF NOT EXISTS pin_color TEXT DEFAULT 'gold';
