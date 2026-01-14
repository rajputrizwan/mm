/**
 * Form Validation Utilities
 * Common validation functions for forms across the application
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }
  return { valid: true };
};

// Name validation
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

// Required field validation
export const validateRequired = (value: string | undefined | null): boolean => {
  return typeof value === "string" && value.trim().length > 0;
};

// Login form validation
export const validateLoginForm = (
  email: string,
  password: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!validateRequired(email)) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!validateEmail(email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address",
    });
  }

  if (!validateRequired(password)) {
    errors.push({ field: "password", message: "Password is required" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Register form validation
export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!validateRequired(name)) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (!validateName(name)) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long",
    });
  }

  if (!validateRequired(email)) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!validateEmail(email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address",
    });
  }

  if (!validateRequired(password)) {
    errors.push({ field: "password", message: "Password is required" });
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      errors.push({
        field: "password",
        message:
          passwordValidation.message || "Password does not meet requirements",
      });
    }
  }

  if (!validateRequired(confirmPassword)) {
    errors.push({
      field: "confirmPassword",
      message: "Please confirm your password",
    });
  } else if (password !== confirmPassword) {
    errors.push({
      field: "confirmPassword",
      message: "Passwords do not match",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Profile form validation
export const validateProfileForm = (data: {
  name?: string;
  email?: string;
  bio?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (data.name && !validateName(data.name)) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long",
    });
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address",
    });
  }

  if (data.bio && data.bio.length > 500) {
    errors.push({
      field: "bio",
      message: "Bio must be 500 characters or less",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get error message for field
export const getFieldError = (
  errors: ValidationError[],
  field: string
): string | undefined => {
  return errors.find((error) => error.field === field)?.message;
};
