export declare enum ErrorMessages {
    EMAIL_NOT_FOUND = "User with provided email address was not found",
    INVALID_LOGIN = "Invalid email or password",
    INVALID_REQUEST = "Invalid request",
    ACCOUNT_INACTIVE = "Your account is either suspended, deactivated, or has been terminated. Please contact support for more information.",
    INTERNAL_ERROR = "Something went wrong. Please try again later",
    USER_NOT_FOUND = "User with provided id not found",
    USER_EXIST = "User with provided email address already exists",
    VERIFICATION_EXPIRED = "Your verification code has expired",
    UNAUTHORIZED = "Your user is not authorized to carry out this operation",
    UPLOAD_ERROR = "Something went wrong while uploading the file",
    FORBIDDEN = "Your forbidden to access this resource.",
    GOOGLE_OAUTH_FAILED = "Unable to verify your Google account",
    TOKEN_EMAIL_MISMATCH = "The email address on the decoded token was not the same as the one in the database"
}
export declare const MAX_QUESTION_PER_QUIZ = 500;
export declare const ACCESS_TOKEN_COOKIE_NAME = "_access_token";
export declare const REMEMBER_ME_COOKIE_NAME = "_remember_me_";
export declare const SPACES_ROOT = "uploads";
export declare const DEFAULT_DATABASE_CONNECTION = "fahoot_database_connection";
export declare const MAX_FILE_SIZE = 11000000;
export declare enum QuizStatus {
    PUBLISHED = "published",
    DRAFT = "draft"
}
export declare enum UploadDestination {
    PROFILE = "profile",
    QUESTION_MEDIA = "question_media",
    DEFAULT = "default"
}
export declare enum CollectName {
    USER = "users",
    PLAYER = "players",
    QUIZ = "quizzes",
    PLAY = "plays"
}
export declare enum Status {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare enum QuestionType {
    BOOLEAN = "boolean",
    MCQ = "mcq"
}
export declare enum EmailPurpose {
    EMAIL_VERIFICATION = "email verification",
    PASSWORD_RESET = "password reset"
}
export declare enum JWT_TTL {
    ACCESS_TOKEN_TTL = 3600,
    REMEMBER_ME_TOKEN_TTL = 86400
}
export declare enum COOKIE {
    ACCESS_TOKEN_COOKIE_TTL = 3600000,
    REMEMBER_ME_COOKIE_TTL = 86400000
}
export declare enum VERIFICATION_TOKEN_TTL {
    TTL = 86400
}
export declare enum AuthenticationMethod {
    MANUAL = "manual",
    GOOGLE_OAUTH = "google_oauth"
}
export declare enum EMAIL_VERIFICATION_REQUEST {
    LIMIT = 5,
    TTL = 60
}
export declare enum SEND_VERIFICATION_EMAIL_REQUEST {
    LIMIT = 5,
    TTL = 60
}
export declare enum PASSWORD_RESET_REQUEST {
    LIMIT = 5,
    TTL = 60
}
export declare enum PASSWORD_RESET {
    LIMIT = 5,
    TTL = 60
}
export declare enum CREATE_USER_REQUEST {
    LIMIT = 15,
    TTL = 60
}
export declare enum GET_USER_REQUEST {
    LIMIT = 30,
    TTL = 60
}
export declare enum UPDATE_USER_REQUEST {
    LIMIT = 30,
    TTL = 60
}
export declare enum DELETE_USER_REQUEST {
    LIMIT = 1,
    TTL = 60
}
export declare enum CREATE_QUIZ_REQUEST {
    LIMIT = 25,
    TTL = 60
}
export declare enum GET_QUIZ_REQUEST {
    LIMIT = 25,
    TTL = 60
}
export declare enum GET_QUIZZES_REQUEST {
    LIMIT = 25,
    TTL = 60
}
export declare enum UPDATE_QUIZ_REQUEST {
    LIMIT = 25,
    TTL = 60
}
export declare enum DELETE_QUIZ_REQUEST {
    LIMIT = 100,
    TTL = 60
}
export declare enum SIGNUP_REQUEST {
    LIMIT = 100,
    TTL = 60
}
export declare enum SIGNIN_REQUEST {
    LIMIT = 100,
    TTL = 60
}
export declare enum LOGOUT_REQUEST {
    LIMIT = 10,
    TTL = 60
}
export declare enum UPDATE_PASSWORD_REQUEST {
    LIMIT = 20,
    TTL = 60
}
export declare enum UPDATE_EMAIL_REQUEST {
    LIMIT = 20,
    TTL = 60
}
export declare enum UPLOAD_REQUEST {
    LIMIT = 50,
    TTL = 60
}
export declare enum LOG_REQUEST {
    LIMIT = 500,
    TTL = 60
}
