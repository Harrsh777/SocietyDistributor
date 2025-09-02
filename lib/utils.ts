import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to match the database column format used in dse_attendance table
 * @param date - The date to format
 * @returns Formatted date string in format "02-Sep-25" (with zero-padded day)
 */
export function formatDateForDB(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0'); // Zero-pad single digits
  
  // Map month numbers to the exact 3-letter abbreviations used in database columns
  const monthAbbreviations = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthAbbreviations[date.getMonth()];
  
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
}
