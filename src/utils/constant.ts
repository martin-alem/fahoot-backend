export enum ErrorMessages {
  EMAIL_NOT_FOUND = 'User with provided email address was not found',
  INVALID_LOGIN = 'Invalid email or password',
  INVALID_REQUEST = 'Invalid request',
  ACCOUNT_INACTIVE = 'Your account is either suspended, deactivated, or has been terminated. Please contact support for more information.',
  INTERNAL_ERROR = 'Something went wrong. Please try again later',
  USER_NOT_FOUND = 'User with provided id not found',
  USER_EXIST = 'User with provided email address already exists',
  VERIFICATION_EXPIRED = 'Your verification code has expired',
  UNAUTHORIZED = 'Your user is not authorized to carry out this operation',
  UPLOAD_ERROR = 'Something went wrong while uploading the file',
  FORBIDDEN = 'Your forbidden to access this resource.',
  GOOGLE_OAUTH_FAILED = 'Unable to verify your Google account',
  TOKEN_EMAIL_MISMATCH = 'The email address on the decoded token was not the same as the one in the database',
}

export const MAX_QUESTION_PER_QUIZ = 500;
export const ACCESS_TOKEN_COOKIE_NAME = '_access_token';
export const REMEMBER_ME_COOKIE_NAME = '_remember_me_';

export enum QuizStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
}

export enum CollectName {
  USER = 'users',
  PLAYER = 'players',
  QUIZ = 'quizzes',
  PLAY = 'plays',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum QuestionType {
  BOOLEAN = 'boolean',
  MCQ = 'mcq',
}

export enum EmailPurpose {
  EMAIL_VERIFICATION = 'email verification',
  PASSWORD_RESET = 'password reset',
}

export enum JWT_TTL {
  ACCESS_TOKEN_TTL = 3600, // in seconds = 1 hour
  REMEMBER_ME_TOKEN_TTL = 86400, // in seconds = 24 hours
}

export enum COOKIE {
  ACCESS_TOKEN_COOKIE_TTL = 3.6e6, // in milliseconds = 1 hour
  REMEMBER_ME_COOKIE_TTL = 8.64e7, // in milliseconds = 24 hours
}

export enum VERIFICATION_TOKEN_TTL {
  TTL = 86400, // in seconds = 24 hours
}

export enum AuthenticationMethod {
  MANUAL = 'manual', // email/password combination
  GOOGLE_OAUTH = 'google_oauth', // google oauth
}

export enum EMAIL_VERIFICATION_REQUEST {
  /**
   * 5 request in 60 seconds
   */
  LIMIT = 5,
  TTL = 60,
}

export enum SEND_VERIFICATION_EMAIL_REQUEST {
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
   * 1 request in 60 seconds
   */
  LIMIT = 1,
  TTL = 60,
}

export enum CREATE_QUIZ_REQUEST {
  /**
   * 25 request in 60 seconds
   */
  LIMIT = 25,
  TTL = 60,
}

export enum GET_QUIZ_REQUEST {
  /**
   * 25 request in 60 seconds
   */
  LIMIT = 25,
  TTL = 60,
}

export enum GET_QUIZZES_REQUEST {
  /**
   * 25 request in 60 seconds
   */
  LIMIT = 25,
  TTL = 60,
}

export enum UPDATE_QUIZ_REQUEST {
  /**
   * 25 request in 60 seconds
   */
  LIMIT = 25,
  TTL = 60,
}

export enum DELETE_QUIZ_REQUEST {
  /**
   * 1 request in 60 seconds
   */
  LIMIT = 100,
  TTL = 60,
}

export enum SIGNUP_REQUEST {
  /**
   * 10 request in 60 seconds
   */
  LIMIT = 100,
  TTL = 60,
}

export enum SIGNIN_REQUEST {
  /**
   * 10 request in 60 seconds
   */
  LIMIT = 100,
  TTL = 60,
}

export enum LOGOUT_REQUEST {
  /**
   * 10 request in 60 seconds
   */
  LIMIT = 10,
  TTL = 60,
}
