export enum ErrorMessages {
  AUTH_GUARD_ERROR = 'You are not authorized to perform this action',
  INTERNAL_SERVER_ERROR = 'Something went wrong. Please try again later',
}

export enum Events {
  ERROR = 'fahoot:error', // emitted when an error is encountered
  CONNECTED = 'fahoot:connected', // emitted when a user successfully connects
  DISCONNECTED = 'fahoot:disconnected', // emitted when a user disconnects
  PLAYER_JOINED = 'fahoot:player_join', // emitted when a player joins the game
  LOCK_GAME = 'fahoot:lock_game', // emitted when the organizer locks the game
  REMOVE_PLAYER = 'fahoot:remove_player', // emitted when the organizer removes a player
  PLAYER_ANSWER = 'fahoot:player_answer', // emitted when a player submits their answer
  QUESTION_TIME_OUT = 'fahoot:question_timeout', // emitted when a question timeout is reached
  NEXT_QUESTION = 'fahoot:next_question', // emitted when the next question is received
  START_GAME = 'fahoot:start_game', // emitted when the game starts
  END_GAME = 'fahoot:end_game', // emitted when the game
}

export enum PlayStatus {
  PENDING = 'pending',
  PLAYING = 'playing',
  COMPLETED = 'completed',
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export const MAX_QUESTION_PER_QUIZ = 500;
export const ACCESS_TOKEN_COOKIE_NAME = '_access_token';
export const PLAY_TOKEN_COOKIE_NAME = '_play_access_token';
export const REMEMBER_ME_COOKIE_NAME = '_remember_me_';
export const SPACES_ROOT = 'uploads';
export const DEFAULT_DATABASE_CONNECTION = 'fahoot_database_connection';
export const PLAY_NAMESPACE = 'fahoot_play';
export const MAX_FILE_SIZE = 1.1e7;
export const MAX_PLAYER_PER_PLAY = 5;
export const PLAYER_COLLECTION_NAME = 'players';

export enum QuizStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
}

export enum UploadDestination {
  PROFILE = 'profile',
  QUESTION_MEDIA = 'question_media',
  DEFAULT = 'default',
}

export enum CollectName {
  USER = 'users',
  PLAYER = 'players',
  QUIZ = 'quizzes',
  PLAY = 'plays',
  TOKEN = 'tokens',
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

export enum GameExitType {
  PLAYER_EXIT = 'player_exit',
  ORGANIZER_EXIT = 'organizer_exit',
}

export enum JWT_TTL {
  ACCESS_TOKEN_TTL = 3600, // in seconds = 1 hour
  REMEMBER_ME_TOKEN_TTL = 86400, // in seconds = 24 hours
  PLAYER_TOKEN_TTL = 3600, // in seconds = 1 hour
}

export enum COOKIE {
  ACCESS_TOKEN_COOKIE_TTL = 3.6e6, // in milliseconds = 1 hour
  REMEMBER_ME_COOKIE_TTL = 8.64e7, // in milliseconds = 24 hours
  PLAY_ACCESS_TOKEN_COOKIE_TTL = 3.6e6, // in milliseconds = 1 hour
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
   * 5 requests in 600 seconds (10 minutes)
   */
  LIMIT = 5,
  TTL = 600,
}

export enum SEND_VERIFICATION_EMAIL_REQUEST {
  /**
   * 5 requests in 600 seconds (10 minutes)
   */
  LIMIT = 5,
  TTL = 600,
}

export enum PASSWORD_RESET_REQUEST {
  /**
   * 5 requests in 600 seconds (10 minutes)
   */
  LIMIT = 5,
  TTL = 600,
}

export enum PASSWORD_RESET {
  /**
   * 5 requests in 600 seconds (10 minutes)
   */
  LIMIT = 5,
  TTL = 600,
}

export enum CREATE_USER_REQUEST {
  /**
   * 10 requests in 600 seconds (10 minutes)
   */
  LIMIT = 10,
  TTL = 600,
}

export enum GET_USER_REQUEST {
  /**
   * 100 requests in 600 seconds (10 minutes)
   */
  LIMIT = 100,
  TTL = 600,
}

export enum UPDATE_USER_REQUEST {
  /**
   * 100 requests in 600 seconds (10 minutes)
   */
  LIMIT = 100,
  TTL = 600,
}

export enum DELETE_USER_REQUEST {
  /**
   * 1 requests in 600 seconds (10 minutes)
   */
  LIMIT = 1,
  TTL = 600,
}

export enum CREATE_QUIZ_REQUEST {
  /**
   * 10 requests in 600 seconds (10 minutes)
   */
  LIMIT = 10,
  TTL = 600,
}

export enum GET_QUIZ_REQUEST {
  /**
   * 100 requests in 600 seconds (10 minutes)
   */
  LIMIT = 100,
  TTL = 600,
}

export enum GET_QUIZZES_REQUEST {
  /**
   * 100 requests in 600 seconds (10 minutes)
   */
  LIMIT = 100,
  TTL = 600,
}

export enum CREATE_PLAY_REQUEST {
  /**
   * 25 requests in 600 seconds (10 minutes)
   */
  LIMIT = 25,
  TTL = 600,
}

export enum GET_PLAY_REQUEST {
  /**
   * 100 requests in 600 seconds (10 minutes)
   */
  LIMIT = 100,
  TTL = 600,
}

export enum UPDATE_QUIZ_REQUEST {
  /**
   * 25 requests in 600 seconds (10 minutes)
   */
  LIMIT = 25,
  TTL = 600,
}

export enum DELETE_QUIZ_REQUEST {
  /**
   * 100 requests in 600 seconds (10 minutes)
   */
  LIMIT = 100,
  TTL = 600,
}

export enum SIGNUP_REQUEST {
  /**
   * 10 requests in 600 seconds (10 minutes)
   */
  LIMIT = 10,
  TTL = 600,
}

export enum SIGNIN_REQUEST {
  /**
   * 5 requests in 600 seconds (10 minutes)
   */
  LIMIT = 5,
  TTL = 300,
}

export enum LOGOUT_REQUEST {
  /**
   * 5 requests in 600 seconds (10 minutes)
   */
  LIMIT = 25,
  TTL = 600,
}

export enum UPDATE_PASSWORD_REQUEST {
  /**
   * 10 requests in 600 seconds (10 minutes)
   */
  LIMIT = 10,
  TTL = 600,
}

export enum UPDATE_EMAIL_REQUEST {
  /**
   * 10 requests in 600 seconds (10 minutes)
   */
  LIMIT = 10,
  TTL = 600,
}

export enum UPLOAD_REQUEST {
  /**
   * 10 requests in 600 seconds (10 minutes)
   */
  LIMIT = 10,
  TTL = 600,
}

export enum LOG_REQUEST {
  LIMIT = 500,
  TTL = 60,
}
