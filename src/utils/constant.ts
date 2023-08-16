export enum ErrorMessages {
  EMAIL_NOT_FOUND = 'User with provided email address was not found',
  INVALID_LOGIN = 'Invalid email or password',
  ACCOUNT_INACTIVE = 'Your account is either suspended, deactivated, or has been terminated. Please contact support for more information.',
  INTERNAL_ERROR = 'Something went wrong. Please try again later',
  USER_NOT_FOUND = 'User with provided id not found',
  USER_EXIST = 'User with provided email address already exists',
  VERIFICATION_EXPIRED = 'Your verification code has expired',
  UNAUTHORIZED = 'Your user is not authorized to carry out this operation',
  UPLOAD_ERROR = 'Something went wrong while uploading the file',
  FORBIDDEN = 'Your forbidden to access this resource.',
  TOKEN_EMAIL_MISMATCH = 'The email address on the decoded token was not the same as the one in the database',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum EmailPurpose {
  EMAIL_VERIFICATION = 'email verification',
  PASSWORD_RESET = 'password reset',
}

export enum JWT_TTL {
  JWT_ACCESS_TOKEN_TTL = 84600, // in seconds = 1 day
}

export enum EMAIL_VERIFICATION_REQUEST {
  /**
   * 5 request in 60 seconds
   */
  LIMIT = 5,
  TTL = 60,
}

export enum SEND_VERIFICATION_LINK_REQUEST {
  /**
   * 5 request in 60 seconds
   */
  LIMIT = 5,
  TTL = 60,
}

export enum PASSWORD_RESET_REQUEST {
  /**
   * 5 request in 60 seconds
   */
  LIMIT = 5,
  TTL = 60,
}

export enum PASSWORD_RESET {
  /**
   * 5 request in 60 seconds
   */
  LIMIT = 5,
  TTL = 60,
}

export enum CREATE_USER_REQUEST {
  /**
   * 15 request in 60 seconds
   */
  LIMIT = 15,
  TTL = 60,
}

export enum GET_USER_REQUEST {
  /**
   * 30 request in 60 seconds
   */
  LIMIT = 30,
  TTL = 60,
}

export enum UPDATE_USER_REQUEST {
  /**
   * 30 request in 60 seconds
   */
  LIMIT = 30,
  TTL = 60,
}

export enum DELETE_USER_REQUEST {
  /**
   * 5 request in 60 seconds
   */
  LIMIT = 5,
  TTL = 60,
}
