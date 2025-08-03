import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";

/**
 * Formatting utilities for StudyStreaks
 * Centralized formatting logic for dates, numbers, strings, etc.
 */

// Date formatting utilities
export const dateFormats = {
  short: "dd/MM/yyyy",
  long: "dd MMMM yyyy", 
  dateTime: "dd/MM/yyyy HH:mm",
  time: "HH:mm",
  dayMonth: "dd MMM",
  monthYear: "MMM yyyy",
  iso: "yyyy-MM-dd",
} as const;

/**
 * Format a date according to UK conventions
 */
export function formatDate(
  date: Date | string | number,
  formatString: keyof typeof dateFormats | string = "short"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  const formatStr = dateFormats[formatString as keyof typeof dateFormats] || formatString;
  
  return format(dateObj, formatStr, { locale: enGB });
}

/**
 * Format date relative to now (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeDate(date: Date | string | number): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, "HH:mm")}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, "HH:mm")}`;
  }
  
  return formatDistanceToNow(dateObj, { 
    addSuffix: true,
    locale: enGB 
  });
}

/**
 * Format homework due date with contextual information
 */
export function formatHomeworkDueDate(dueDate: Date | string): string {
  const dateObj = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const now = new Date();
  const diffInHours = (dateObj.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 0) {
    return `Overdue by ${formatDistanceToNow(dateObj, { locale: enGB })}`;
  }
  
  if (diffInHours < 24) {
    return `Due in ${Math.ceil(diffInHours)} hours`;
  }
  
  if (diffInHours < 48) {
    return `Due tomorrow at ${format(dateObj, "HH:mm")}`;
  }
  
  return `Due ${format(dateObj, "dd/MM/yyyy 'at' HH:mm")}`;
}

// Number formatting utilities

/**
 * Format points/scores with appropriate suffixes
 */
export function formatPoints(points: number): string {
  if (points === 1) return "1 point";
  if (points < 1000) return `${points} points`;
  if (points < 1000000) return `${(points / 1000).toFixed(1)}K points`;
  return `${(points / 1000000).toFixed(1)}M points`;
}

/**
 * Format streak count with appropriate suffixes
 */
export function formatStreak(streak: number): string {
  if (streak === 0) return "No streak";
  if (streak === 1) return "1 day streak";
  return `${streak} day streak`;
}

/**
 * Format percentage with appropriate decimal places
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format time duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// String formatting utilities

/**
 * Capitalize first letter of each word
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert string to sentence case
 */
export function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format user's full name
 */
export function formatName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`;
}

/**
 * Format user's initials
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number, suffix: string = "..."): string {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Format phone number to UK format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Handle UK mobile numbers
  if (cleaned.startsWith("44")) {
    const withoutCountryCode = cleaned.substring(2);
    if (withoutCountryCode.startsWith("7")) {
      return `+44 ${withoutCountryCode.substring(0, 4)} ${withoutCountryCode.substring(4, 7)} ${withoutCountryCode.substring(7)}`;
    }
  }
  
  if (cleaned.startsWith("07")) {
    return `${cleaned.substring(0, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Format postcode to UK standard
 */
export function formatPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s/g, "").toUpperCase();
  
  if (cleaned.length <= 4) return cleaned;
  
  const outward = cleaned.slice(0, -3);
  const inward = cleaned.slice(-3);
  
  return `${outward} ${inward}`;
}

// Year group formatting

/**
 * Convert year group enum to display name
 */
export function formatYearGroup(yearGroup: string): string {
  const yearGroupMap: Record<string, string> = {
    reception: "Reception",
    year_1: "Year 1",
    year_2: "Year 2", 
    year_3: "Year 3",
    year_4: "Year 4",
    year_5: "Year 5",
    year_6: "Year 6",
    year_7: "Year 7",
    year_8: "Year 8",
    year_9: "Year 9",
    year_10: "Year 10",
    year_11: "Year 11",
    year_12: "Year 12",
    year_13: "Year 13",
  };
  
  return yearGroupMap[yearGroup] || toTitleCase(yearGroup.replace(/_/g, " "));
}

/**
 * Convert role enum to display name
 */
export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    student: "Student",
    teacher: "Teacher",
    parent: "Parent",
    school_admin: "School Admin",
    super_admin: "Super Admin",
  };
  
  return roleMap[role] || toTitleCase(role.replace(/_/g, " "));
}

/**
 * Format homework type to display name
 */
export function formatHomeworkType(type: string): string {
  const typeMap: Record<string, string> = {
    reading: "📖 Reading",
    spelling: "✍️ Spelling",
    math: "🔢 Math",
    science: "🔬 Science",
    writing: "📝 Writing",
    project: "📋 Project",
    research: "🔍 Research",
    practice: "💪 Practice",
    creative: "🎨 Creative",
    other: "📚 Other",
  };
  
  return typeMap[type] || toTitleCase(type);
}

// CSS class utilities (using clsx)

/**
 * Combine class names conditionally
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Generate status-based classes
 */
export function getStatusClasses(status: string): string {
  const statusClasses: Record<string, string> = {
    // Homework status
    assigned: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
    submitted: "bg-green-100 text-green-800 border-green-200", 
    reviewed: "bg-purple-100 text-purple-800 border-purple-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
    
    // Streak status
    active: "bg-orange-100 text-orange-800 border-orange-200",
    broken: "bg-gray-100 text-gray-800 border-gray-200",
    paused: "bg-slate-100 text-slate-800 border-slate-200",
    completed: "bg-green-100 text-green-800 border-green-200",
  };
  
  return cn(
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
    statusClasses[status] || "bg-gray-100 text-gray-800 border-gray-200"
  );
}

/**
 * Generate priority-based classes
 */
export function getPriorityClasses(priority: "low" | "medium" | "high"): string {
  const priorityClasses = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800", 
    high: "bg-red-100 text-red-800",
  };
  
  return cn(
    "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
    priorityClasses[priority]
  );
}