
// Security utility functions for input validation and sanitization

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Kenya phone number validation (supports various formats)
  const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const validateTaxId = (taxId: string): boolean => {
  // Kenya KRA PIN validation (example: A001234567P)
  const taxIdRegex = /^[A-Z]\d{9}[A-Z]$/;
  return taxIdRegex.test(taxId);
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove dangerous characters from file names
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255); // Limit length
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const sanitizeSearchQuery = (query: string): string => {
  // Sanitize search queries to prevent injection attacks
  return query
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100); // Limit search query length
};
