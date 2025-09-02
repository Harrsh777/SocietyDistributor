-- Migration script to standardize date column names from single-digit to double-digit format
-- This script renames columns like "2-Jun-25" to "02-Jun-25" for consistency

-- Start transaction for safety
BEGIN;

-- Create a function to generate all the ALTER TABLE statements for renaming columns
-- This handles the pattern: single-digit day -> double-digit day with leading zero

-- Rename columns for June 2025 (1-9 to 01-09)
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Jun-25" TO "01-Jun-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Jun-25" TO "02-Jun-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Jun-25" TO "03-Jun-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Jun-25" TO "04-Jun-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Jun-25" TO "05-Jun-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Jun-25" TO "06-Jun-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Jun-25" TO "07-Jun-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Jun-25" TO "08-Jun-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Jun-25" TO "09-Jun-25";

-- Rename corresponding reason columns for June 2025
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Jun-25_reason" TO "01-Jun-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Jun-25_reason" TO "02-Jun-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Jun-25_reason" TO "03-Jun-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Jun-25_reason" TO "04-Jun-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Jun-25_reason" TO "05-Jun-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Jun-25_reason" TO "06-Jun-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Jun-25_reason" TO "07-Jun-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Jun-25_reason" TO "08-Jun-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Jun-25_reason" TO "09-Jun-25_reason";

-- Rename columns for July 2025 (1-9 to 01-09)
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Jul-25" TO "01-Jul-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Jul-25" TO "02-Jul-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Jul-25" TO "03-Jul-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Jul-25" TO "04-Jul-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Jul-25" TO "05-Jul-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Jul-25" TO "06-Jul-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Jul-25" TO "07-Jul-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Jul-25" TO "08-Jul-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Jul-25" TO "09-Jul-25";

-- Rename corresponding reason columns for July 2025
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Jul-25_reason" TO "01-Jul-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Jul-25_reason" TO "02-Jul-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Jul-25_reason" TO "03-Jul-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Jul-25_reason" TO "04-Jul-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Jul-25_reason" TO "05-Jul-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Jul-25_reason" TO "06-Jul-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Jul-25_reason" TO "07-Jul-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Jul-25_reason" TO "08-Jul-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Jul-25_reason" TO "09-Jul-25_reason";

-- Rename columns for August 2025 (1-9 to 01-09)
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Aug-25" TO "01-Aug-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Aug-25" TO "02-Aug-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Aug-25" TO "03-Aug-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Aug-25" TO "04-Aug-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Aug-25" TO "05-Aug-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Aug-25" TO "06-Aug-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Aug-25" TO "07-Aug-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Aug-25" TO "08-Aug-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Aug-25" TO "09-Aug-25";

-- Rename corresponding reason columns for August 2025
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Aug-25_reason" TO "01-Aug-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Aug-25_reason" TO "02-Aug-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Aug-25_reason" TO "03-Aug-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Aug-25_reason" TO "04-Aug-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Aug-25_reason" TO "05-Aug-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Aug-25_reason" TO "06-Aug-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Aug-25_reason" TO "07-Aug-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Aug-25_reason" TO "08-Aug-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Aug-25_reason" TO "09-Aug-25_reason";

-- Rename columns for September 2025 (1-9 to 01-09)
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Sep-25" TO "01-Sep-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Sep-25" TO "02-Sep-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Sep-25" TO "03-Sep-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Sep-25" TO "04-Sep-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Sep-25" TO "05-Sep-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Sep-25" TO "06-Sep-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Sep-25" TO "07-Sep-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Sep-25" TO "08-Sep-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Sep-25" TO "09-Sep-25";

-- Rename corresponding reason columns for September 2025
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Sep-25_reason" TO "01-Sep-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Sep-25_reason" TO "02-Sep-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Sep-25_reason" TO "03-Sep-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Sep-25_reason" TO "04-Sep-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Sep-25_reason" TO "05-Sep-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Sep-25_reason" TO "06-Sep-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Sep-25_reason" TO "07-Sep-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Sep-25_reason" TO "08-Sep-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Sep-25_reason" TO "09-Sep-25_reason";

-- Rename columns for October 2025 (1-9 to 01-09)
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Oct-25" TO "01-Oct-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Oct-25" TO "02-Oct-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Oct-25" TO "03-Oct-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Oct-25" TO "04-Oct-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Oct-25" TO "05-Oct-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Oct-25" TO "06-Oct-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Oct-25" TO "07-Oct-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Oct-25" TO "08-Oct-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Oct-25" TO "09-Oct-25";

-- Rename corresponding reason columns for October 2025
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Oct-25_reason" TO "01-Oct-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Oct-25_reason" TO "02-Oct-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Oct-25_reason" TO "03-Oct-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Oct-25_reason" TO "04-Oct-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Oct-25_reason" TO "05-Oct-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Oct-25_reason" TO "06-Oct-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Oct-25_reason" TO "07-Oct-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Oct-25_reason" TO "08-Oct-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Oct-25_reason" TO "09-Oct-25_reason";

-- Rename columns for November 2025 (1-9 to 01-09)
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Nov-25" TO "01-Nov-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Nov-25" TO "02-Nov-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Nov-25" TO "03-Nov-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Nov-25" TO "04-Nov-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Nov-25" TO "05-Nov-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Nov-25" TO "06-Nov-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Nov-25" TO "07-Nov-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Nov-25" TO "08-Nov-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Nov-25" TO "09-Nov-25";

-- Rename corresponding reason columns for November 2025
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Nov-25_reason" TO "01-Nov-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Nov-25_reason" TO "02-Nov-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Nov-25_reason" TO "03-Nov-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Nov-25_reason" TO "04-Nov-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Nov-25_reason" TO "05-Nov-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Nov-25_reason" TO "06-Nov-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Nov-25_reason" TO "07-Nov-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Nov-25_reason" TO "08-Nov-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Nov-25_reason" TO "09-Nov-25_reason";

-- Rename columns for December 2025 (1-9 to 01-09)
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Dec-25" TO "01-Dec-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Dec-25" TO "02-Dec-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Dec-25" TO "03-Dec-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Dec-25" TO "04-Dec-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Dec-25" TO "05-Dec-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Dec-25" TO "06-Dec-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Dec-25" TO "07-Dec-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Dec-25" TO "08-Dec-25";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Dec-25" TO "09-Dec-25";

-- Rename corresponding reason columns for December 2025
ALTER TABLE public.dse_attendance RENAME COLUMN "1-Dec-25_reason" TO "01-Dec-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "2-Dec-25_reason" TO "02-Dec-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "3-Dec-25_reason" TO "03-Dec-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "4-Dec-25_reason" TO "04-Dec-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "5-Dec-25_reason" TO "05-Dec-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "6-Dec-25_reason" TO "06-Dec-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "7-Dec-25_reason" TO "07-Dec-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "8-Dec-25_reason" TO "08-Dec-25_reason";
ALTER TABLE public.dse_attendance RENAME COLUMN "9-Dec-25_reason" TO "09-Dec-25_reason";

-- Commit the transaction
COMMIT;

-- Verification query to check the new column names
-- Uncomment the following lines to verify the migration was successful:
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'dse_attendance' 
--   AND table_schema = 'public'
--   AND column_name LIKE '%Jun-25%' 
--   OR column_name LIKE '%Jul-25%'
--   OR column_name LIKE '%Aug-25%'
--   OR column_name LIKE '%Sep-25%'
--   OR column_name LIKE '%Oct-25%'
--   OR column_name LIKE '%Nov-25%'
--   OR column_name LIKE '%Dec-25%'
-- ORDER BY column_name;
