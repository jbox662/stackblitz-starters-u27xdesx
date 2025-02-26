-- Add job-related columns
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS salary_min decimal(10,2),
ADD COLUMN IF NOT EXISTS salary_max decimal(10,2),
ADD COLUMN IF NOT EXISTS posted_date timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS deadline_date timestamptz;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);

-- Update existing jobs with default values
UPDATE jobs
SET 
  department = 'Engineering',
  salary_min = 70000,
  salary_max = 100000,
  posted_date = COALESCE(posted_date, created_at),
  deadline_date = COALESCE(deadline_date, created_at + interval '30 days');

-- Add not null constraints after setting default values
ALTER TABLE jobs
ALTER COLUMN posted_date SET NOT NULL,
ALTER COLUMN deadline_date SET NOT NULL;

-- Add check constraints
ALTER TABLE jobs
ADD CONSTRAINT salary_range_check 
CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min);