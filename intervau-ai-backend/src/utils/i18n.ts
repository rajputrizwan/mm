/**
 * Backend i18n System - Error Codes
 * 
 * This file defines all error codes used across the backend.
 * Frontend will translate these codes to user's language.
 * 
 * Benefits:
 * - Language-agnostic error handling
 * - Consistent error messaging
 * - Easy to maintain translations
 * - Better client-side error UX
 */

export const ErrorCodes = {
    // ========================================
    // Authentication Errors
    // ========================================
    AUTH_INVALID_CREDENTIALS: 'error.auth.invalidCredentials',
    AUTH_USER_EXISTS: 'error.auth.userExists',
    AUTH_USER_NOT_FOUND: 'error.auth.userNotFound',
    AUTH_ACCOUNT_DEACTIVATED: 'error.auth.accountDeactivated',
    AUTH_TOKEN_EXPIRED: 'error.auth.tokenExpired',
    AUTH_INVALID_TOKEN: 'error.auth.invalidToken',
    AUTH_TOKEN_REQUIRED: 'error.auth.tokenRequired',
    AUTH_UNAUTHORIZED: 'error.auth.unauthorized',
    AUTH_FORBIDDEN: 'error.auth.forbidden',

    // ========================================
    // Validation Errors
    // ========================================
    VALIDATION_EMAIL_REQUIRED: 'error.validation.emailRequired',
    VALIDATION_EMAIL_INVALID: 'error.validation.emailInvalid',
    VALIDATION_PASSWORD_REQUIRED: 'error.validation.passwordRequired',
    VALIDATION_PASSWORD_WEAK: 'error.validation.passwordWeak',
    VALIDATION_PASSWORD_MISMATCH: 'error.validation.passwordMismatch',
    VALIDATION_NAME_REQUIRED: 'error.validation.nameRequired',
    VALIDATION_ROLE_REQUIRED: 'error.validation.roleRequired',
    VALIDATION_ROLE_INVALID: 'error.validation.roleInvalid',
    VALIDATION_COMPANY_REQUIRED: 'error.validation.companyRequired',
    VALIDATION_LANGUAGE_INVALID: 'error.validation.invalidLanguage',
    VALIDATION_FIELD_REQUIRED: 'error.validation.fieldRequired',
    VALIDATION_INVALID_INPUT: 'error.validation.invalidInput',

    // ========================================
    // Resource Errors
    // ========================================
    RESOURCE_NOT_FOUND: 'error.resource.notFound',
    RESOURCE_ALREADY_EXISTS: 'error.resource.alreadyExists',
    RESOURCE_DELETED: 'error.resource.deleted',

    // ========================================
    // File Upload Errors
    // ========================================
    FILE_TOO_LARGE: 'error.file.tooLarge',
    FILE_INVALID_TYPE: 'error.file.invalidType',
    FILE_UPLOAD_FAILED: 'error.file.uploadFailed',

    // ========================================
    // Generic Errors
    // ========================================
    INTERNAL_SERVER_ERROR: 'error.internalServer',
    BAD_REQUEST: 'error.badRequest',
    SERVICE_UNAVAILABLE: 'error.serviceUnavailable',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Standard i18n-ready API response structure
 */
export interface I18nApiResponse<T = any> {
    success: boolean;
    message?: string;  // Optional human-readable message (en only)
    messageKey?: ErrorCode; // i18n translation key
    data?: T;
    errors?: Array<{
        field?: string;
        messageKey: ErrorCode | string;
        message?: string;
    }>;
    timestamp?: string;
}

/**
 * Helper function to create error response
 * 
 * @example
 * return createErrorResponse(ErrorCodes.AUTH_INVALID_CREDENTIALS, 401);
 */
export function createErrorResponse(
    errorCode: ErrorCode,
    statusCode: number = 400,
    additionalData?: any
): { statusCode: number; body: I18nApiResponse } {
    return {
        statusCode,
        body: {
            success: false,
            messageKey: errorCode,
            timestamp: new Date().toISOString(),
            ...additionalData,
        },
    };
}

/**
 * Helper function to create success response
 * 
 * @example
 * return createSuccessResponse({ user: userData });
 */
export function createSuccessResponse<T>(
    data: T,
    message?: string
): I18nApiResponse<T> {
    return {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Validation error helper
 * 
 * @example
 * return createValidationError([
 *   { field: 'email', messageKey: ErrorCodes.VALIDATION_EMAIL_REQUIRED }
 * ]);
 */
export function createValidationError(
    errors: Array<{ field: string; messageKey: ErrorCode | string }>
): I18nApiResponse {
    return {
        success: false,
        messageKey: ErrorCodes.VALIDATION_INVALID_INPUT,
        errors,
        timestamp: new Date().toISOString(),
    };
}
