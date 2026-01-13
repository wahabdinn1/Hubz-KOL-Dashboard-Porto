-- Add status column to campaign_deliverables for Kanban Board
-- Statuses: to_contact, negotiating, content_creation, posted, completed

ALTER TABLE campaign_deliverables 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'to_contact';

-- Add constraint to ensure valid statuses
ALTER TABLE campaign_deliverables 
DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE campaign_deliverables 
ADD CONSTRAINT valid_status 
CHECK (status IN ('to_contact', 'negotiating', 'content_creation', 'posted', 'completed'));
