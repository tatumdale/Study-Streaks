/**
 * Data sanitization utilities for StudyStreaks
 * Security-focused input cleaning and validation
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[^\w\s\-.,!?@()]/g, ""); // Remove special characters except basic punctuation
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\-_\.]/g, "_") // Replace unsafe characters with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
    .toLowerCase();
}

/**
 * Remove potentially dangerous SQL injection patterns
 */
export function sanitizeSqlInput(input: string): string {
  const dangerousPatterns = [
    /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bCREATE\b|\bALTER\b)/gi,
    /(\bUNION\b|\bSELECT\b|\bFROM\b|\bWHERE\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
  ];
  
  let sanitized = input;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, "");
  });
  
  return sanitized.trim();
}

/**
 * Clean and validate email address
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, ""); // Keep only alphanumeric, @, ., and -
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>'"&]/g, "") // Remove HTML-like characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .substring(0, 100); // Limit length
}

/**
 * Sanitize user bio/description content
 */
export function sanitizeUserContent(content: string): string {
  return content
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocols
    .replace(/data:/gi, "") // Remove data: protocols
    .substring(0, 500); // Limit length
}

/**
 * Clean phone number input
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone
    .replace(/[^\d\+\-\s\(\)]/g, "") // Keep only digits and phone formatting characters
    .trim();
}

/**
 * Sanitize postcode input
 */
export function sanitizePostcode(postcode: string): string {
  return postcode
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "") // Keep only alphanumeric and spaces
    .trim();
}

/**
 * Remove profanity and inappropriate content
 */
export function sanitizeProfanity(text: string): string {
  // Basic profanity filter - in production, use a comprehensive service
  const profanityWords = [
    // Add appropriate filtering based on age group
    // This is a placeholder - implement proper content filtering
  ];
  
  let sanitized = text;
  profanityWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    sanitized = sanitized.replace(regex, "*".repeat(word.length));
  });
  
  return sanitized;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    
    // Remove dangerous parameters
    parsed.searchParams.delete("javascript");
    parsed.searchParams.delete("data");
    parsed.searchParams.delete("vbscript");
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize homework submission content
 */
export function sanitizeHomeworkContent(content: string): string {
  return content
    .trim()
    .replace(/[<>]/g, "") // Remove HTML brackets
    .replace(/javascript:/gi, "") // Remove javascript protocols
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .substring(0, 5000); // Limit content length
}

/**
 * Validate and sanitize student age for GDPR compliance
 */
export function validateStudentAge(dateOfBirth: Date): {
  isValid: boolean;
  age: number;
  requiresParentalConsent: boolean;
  canGiveDigitalConsent: boolean;
} {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate()) 
    ? age - 1 
    : age;
  
  return {
    isValid: actualAge >= 4 && actualAge <= 18, // Reception to Year 13
    age: actualAge,
    requiresParentalConsent: actualAge < 16, // Under 16 requires parental consent
    canGiveDigitalConsent: actualAge >= 13, // Can give digital consent at 13
  };
}

/**
 * Remove personal identifiable information from logs
 */
export function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    "password",
    "email", 
    "phone",
    "address",
    "postcode",
    "dateOfBirth",
    "parentEmail",
    "ssn",
    "nationalInsurance",
  ];
  
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = "[REDACTED]";
    }
    
    // Recursively sanitize nested objects
    if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });
  
  return sanitized;
}

/**
 * Validate file upload safety
 */
export function validateFileUpload(file: {
  name: string;
  type: string;
  size: number;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check file size (5MB limit)
  if (file.size > 5242880) {
    errors.push("File size exceeds 5MB limit");
  }
  
  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp", 
    "application/pdf",
    "text/plain",
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push("File type not allowed");
  }
  
  // Check filename for suspicious content
  const dangerousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com"];
  const hasUnsafeExtension = dangerousExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (hasUnsafeExtension) {
    errors.push("File extension not allowed");
  }
  
  // Check for double extensions (e.g., image.jpg.exe)
  const extensionCount = (file.name.match(/\./g) || []).length;
  if (extensionCount > 1) {
    errors.push("Multiple file extensions not allowed");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize classroom/student communication
 */
export function sanitizeStudentMessage(message: string, senderAge: number): string {
  let sanitized = message
    .trim()
    .substring(0, 500) // Limit message length
    .replace(/[<>]/g, "") // Remove HTML brackets
    .replace(/https?:\/\/[^\s]+/gi, "[LINK REMOVED]"); // Remove URLs for safety
  
  // For younger students (under 13), apply stricter filtering
  if (senderAge < 13) {
    sanitized = sanitized.replace(/\b\d{4,}\b/g, "[NUMBER]"); // Remove long numbers
    sanitized = sanitizeProfanity(sanitized);
  }
  
  return sanitized;
}

// Export all sanitization functions
export const sanitizers = {
  html: sanitizeHtml,
  input: sanitizeInput,
  filename: sanitizeFilename,
  sql: sanitizeSqlInput,
  email: sanitizeEmail,
  search: sanitizeSearchQuery,
  userContent: sanitizeUserContent,
  phone: sanitizePhoneNumber,
  postcode: sanitizePostcode,
  profanity: sanitizeProfanity,
  url: sanitizeUrl,
  homework: sanitizeHomeworkContent,
  logData: sanitizeLogData,
  studentMessage: sanitizeStudentMessage,
};