"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_REQUEST = exports.UPLOAD_REQUEST = exports.UPDATE_EMAIL_REQUEST = exports.UPDATE_PASSWORD_REQUEST = exports.LOGOUT_REQUEST = exports.SIGNIN_REQUEST = exports.SIGNUP_REQUEST = exports.DELETE_QUIZ_REQUEST = exports.UPDATE_QUIZ_REQUEST = exports.GET_QUIZZES_REQUEST = exports.GET_QUIZ_REQUEST = exports.CREATE_QUIZ_REQUEST = exports.DELETE_USER_REQUEST = exports.UPDATE_USER_REQUEST = exports.GET_USER_REQUEST = exports.CREATE_USER_REQUEST = exports.PASSWORD_RESET = exports.PASSWORD_RESET_REQUEST = exports.SEND_VERIFICATION_EMAIL_REQUEST = exports.EMAIL_VERIFICATION_REQUEST = exports.AuthenticationMethod = exports.VERIFICATION_TOKEN_TTL = exports.COOKIE = exports.JWT_TTL = exports.EmailPurpose = exports.QuestionType = exports.Status = exports.CollectName = exports.UploadDestination = exports.QuizStatus = exports.MAX_FILE_SIZE = exports.DEFAULT_DATABASE_CONNECTION = exports.SPACES_ROOT = exports.REMEMBER_ME_COOKIE_NAME = exports.ACCESS_TOKEN_COOKIE_NAME = exports.MAX_QUESTION_PER_QUIZ = exports.ErrorMessages = void 0;
var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["EMAIL_NOT_FOUND"] = "User with provided email address was not found";
    ErrorMessages["INVALID_LOGIN"] = "Invalid email or password";
    ErrorMessages["INVALID_REQUEST"] = "Invalid request";
    ErrorMessages["ACCOUNT_INACTIVE"] = "Your account is either suspended, deactivated, or has been terminated. Please contact support for more information.";
    ErrorMessages["INTERNAL_ERROR"] = "Something went wrong. Please try again later";
    ErrorMessages["USER_NOT_FOUND"] = "User with provided id not found";
    ErrorMessages["USER_EXIST"] = "User with provided email address already exists";
    ErrorMessages["VERIFICATION_EXPIRED"] = "Your verification code has expired";
    ErrorMessages["UNAUTHORIZED"] = "Your user is not authorized to carry out this operation";
    ErrorMessages["UPLOAD_ERROR"] = "Something went wrong while uploading the file";
    ErrorMessages["FORBIDDEN"] = "Your forbidden to access this resource.";
    ErrorMessages["GOOGLE_OAUTH_FAILED"] = "Unable to verify your Google account";
    ErrorMessages["TOKEN_EMAIL_MISMATCH"] = "The email address on the decoded token was not the same as the one in the database";
})(ErrorMessages || (exports.ErrorMessages = ErrorMessages = {}));
exports.MAX_QUESTION_PER_QUIZ = 500;
exports.ACCESS_TOKEN_COOKIE_NAME = '_access_token';
exports.REMEMBER_ME_COOKIE_NAME = '_remember_me_';
exports.SPACES_ROOT = 'uploads';
exports.DEFAULT_DATABASE_CONNECTION = 'fahoot_database_connection';
exports.MAX_FILE_SIZE = 1.1e7;
var QuizStatus;
(function (QuizStatus) {
    QuizStatus["PUBLISHED"] = "published";
    QuizStatus["DRAFT"] = "draft";
})(QuizStatus || (exports.QuizStatus = QuizStatus = {}));
var UploadDestination;
(function (UploadDestination) {
    UploadDestination["PROFILE"] = "profile";
    UploadDestination["QUESTION_MEDIA"] = "question_media";
    UploadDestination["DEFAULT"] = "default";
})(UploadDestination || (exports.UploadDestination = UploadDestination = {}));
var CollectName;
(function (CollectName) {
    CollectName["USER"] = "users";
    CollectName["PLAYER"] = "players";
    CollectName["QUIZ"] = "quizzes";
    CollectName["PLAY"] = "plays";
})(CollectName || (exports.CollectName = CollectName = {}));
var Status;
(function (Status) {
    Status["ACTIVE"] = "active";
    Status["INACTIVE"] = "inactive";
})(Status || (exports.Status = Status = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["BOOLEAN"] = "boolean";
    QuestionType["MCQ"] = "mcq";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var EmailPurpose;
(function (EmailPurpose) {
    EmailPurpose["EMAIL_VERIFICATION"] = "email verification";
    EmailPurpose["PASSWORD_RESET"] = "password reset";
})(EmailPurpose || (exports.EmailPurpose = EmailPurpose = {}));
var JWT_TTL;
(function (JWT_TTL) {
    JWT_TTL[JWT_TTL["ACCESS_TOKEN_TTL"] = 3600] = "ACCESS_TOKEN_TTL";
    JWT_TTL[JWT_TTL["REMEMBER_ME_TOKEN_TTL"] = 86400] = "REMEMBER_ME_TOKEN_TTL";
})(JWT_TTL || (exports.JWT_TTL = JWT_TTL = {}));
var COOKIE;
(function (COOKIE) {
    COOKIE[COOKIE["ACCESS_TOKEN_COOKIE_TTL"] = 3600000] = "ACCESS_TOKEN_COOKIE_TTL";
    COOKIE[COOKIE["REMEMBER_ME_COOKIE_TTL"] = 86400000] = "REMEMBER_ME_COOKIE_TTL";
})(COOKIE || (exports.COOKIE = COOKIE = {}));
var VERIFICATION_TOKEN_TTL;
(function (VERIFICATION_TOKEN_TTL) {
    VERIFICATION_TOKEN_TTL[VERIFICATION_TOKEN_TTL["TTL"] = 86400] = "TTL";
})(VERIFICATION_TOKEN_TTL || (exports.VERIFICATION_TOKEN_TTL = VERIFICATION_TOKEN_TTL = {}));
var AuthenticationMethod;
(function (AuthenticationMethod) {
    AuthenticationMethod["MANUAL"] = "manual";
    AuthenticationMethod["GOOGLE_OAUTH"] = "google_oauth";
})(AuthenticationMethod || (exports.AuthenticationMethod = AuthenticationMethod = {}));
var EMAIL_VERIFICATION_REQUEST;
(function (EMAIL_VERIFICATION_REQUEST) {
    EMAIL_VERIFICATION_REQUEST[EMAIL_VERIFICATION_REQUEST["LIMIT"] = 5] = "LIMIT";
    EMAIL_VERIFICATION_REQUEST[EMAIL_VERIFICATION_REQUEST["TTL"] = 60] = "TTL";
})(EMAIL_VERIFICATION_REQUEST || (exports.EMAIL_VERIFICATION_REQUEST = EMAIL_VERIFICATION_REQUEST = {}));
var SEND_VERIFICATION_EMAIL_REQUEST;
(function (SEND_VERIFICATION_EMAIL_REQUEST) {
    SEND_VERIFICATION_EMAIL_REQUEST[SEND_VERIFICATION_EMAIL_REQUEST["LIMIT"] = 5] = "LIMIT";
    SEND_VERIFICATION_EMAIL_REQUEST[SEND_VERIFICATION_EMAIL_REQUEST["TTL"] = 60] = "TTL";
})(SEND_VERIFICATION_EMAIL_REQUEST || (exports.SEND_VERIFICATION_EMAIL_REQUEST = SEND_VERIFICATION_EMAIL_REQUEST = {}));
var PASSWORD_RESET_REQUEST;
(function (PASSWORD_RESET_REQUEST) {
    PASSWORD_RESET_REQUEST[PASSWORD_RESET_REQUEST["LIMIT"] = 5] = "LIMIT";
    PASSWORD_RESET_REQUEST[PASSWORD_RESET_REQUEST["TTL"] = 60] = "TTL";
})(PASSWORD_RESET_REQUEST || (exports.PASSWORD_RESET_REQUEST = PASSWORD_RESET_REQUEST = {}));
var PASSWORD_RESET;
(function (PASSWORD_RESET) {
    PASSWORD_RESET[PASSWORD_RESET["LIMIT"] = 5] = "LIMIT";
    PASSWORD_RESET[PASSWORD_RESET["TTL"] = 60] = "TTL";
})(PASSWORD_RESET || (exports.PASSWORD_RESET = PASSWORD_RESET = {}));
var CREATE_USER_REQUEST;
(function (CREATE_USER_REQUEST) {
    CREATE_USER_REQUEST[CREATE_USER_REQUEST["LIMIT"] = 15] = "LIMIT";
    CREATE_USER_REQUEST[CREATE_USER_REQUEST["TTL"] = 60] = "TTL";
})(CREATE_USER_REQUEST || (exports.CREATE_USER_REQUEST = CREATE_USER_REQUEST = {}));
var GET_USER_REQUEST;
(function (GET_USER_REQUEST) {
    GET_USER_REQUEST[GET_USER_REQUEST["LIMIT"] = 30] = "LIMIT";
    GET_USER_REQUEST[GET_USER_REQUEST["TTL"] = 60] = "TTL";
})(GET_USER_REQUEST || (exports.GET_USER_REQUEST = GET_USER_REQUEST = {}));
var UPDATE_USER_REQUEST;
(function (UPDATE_USER_REQUEST) {
    UPDATE_USER_REQUEST[UPDATE_USER_REQUEST["LIMIT"] = 30] = "LIMIT";
    UPDATE_USER_REQUEST[UPDATE_USER_REQUEST["TTL"] = 60] = "TTL";
})(UPDATE_USER_REQUEST || (exports.UPDATE_USER_REQUEST = UPDATE_USER_REQUEST = {}));
var DELETE_USER_REQUEST;
(function (DELETE_USER_REQUEST) {
    DELETE_USER_REQUEST[DELETE_USER_REQUEST["LIMIT"] = 1] = "LIMIT";
    DELETE_USER_REQUEST[DELETE_USER_REQUEST["TTL"] = 60] = "TTL";
})(DELETE_USER_REQUEST || (exports.DELETE_USER_REQUEST = DELETE_USER_REQUEST = {}));
var CREATE_QUIZ_REQUEST;
(function (CREATE_QUIZ_REQUEST) {
    CREATE_QUIZ_REQUEST[CREATE_QUIZ_REQUEST["LIMIT"] = 25] = "LIMIT";
    CREATE_QUIZ_REQUEST[CREATE_QUIZ_REQUEST["TTL"] = 60] = "TTL";
})(CREATE_QUIZ_REQUEST || (exports.CREATE_QUIZ_REQUEST = CREATE_QUIZ_REQUEST = {}));
var GET_QUIZ_REQUEST;
(function (GET_QUIZ_REQUEST) {
    GET_QUIZ_REQUEST[GET_QUIZ_REQUEST["LIMIT"] = 25] = "LIMIT";
    GET_QUIZ_REQUEST[GET_QUIZ_REQUEST["TTL"] = 60] = "TTL";
})(GET_QUIZ_REQUEST || (exports.GET_QUIZ_REQUEST = GET_QUIZ_REQUEST = {}));
var GET_QUIZZES_REQUEST;
(function (GET_QUIZZES_REQUEST) {
    GET_QUIZZES_REQUEST[GET_QUIZZES_REQUEST["LIMIT"] = 25] = "LIMIT";
    GET_QUIZZES_REQUEST[GET_QUIZZES_REQUEST["TTL"] = 60] = "TTL";
})(GET_QUIZZES_REQUEST || (exports.GET_QUIZZES_REQUEST = GET_QUIZZES_REQUEST = {}));
var UPDATE_QUIZ_REQUEST;
(function (UPDATE_QUIZ_REQUEST) {
    UPDATE_QUIZ_REQUEST[UPDATE_QUIZ_REQUEST["LIMIT"] = 25] = "LIMIT";
    UPDATE_QUIZ_REQUEST[UPDATE_QUIZ_REQUEST["TTL"] = 60] = "TTL";
})(UPDATE_QUIZ_REQUEST || (exports.UPDATE_QUIZ_REQUEST = UPDATE_QUIZ_REQUEST = {}));
var DELETE_QUIZ_REQUEST;
(function (DELETE_QUIZ_REQUEST) {
    DELETE_QUIZ_REQUEST[DELETE_QUIZ_REQUEST["LIMIT"] = 100] = "LIMIT";
    DELETE_QUIZ_REQUEST[DELETE_QUIZ_REQUEST["TTL"] = 60] = "TTL";
})(DELETE_QUIZ_REQUEST || (exports.DELETE_QUIZ_REQUEST = DELETE_QUIZ_REQUEST = {}));
var SIGNUP_REQUEST;
(function (SIGNUP_REQUEST) {
    SIGNUP_REQUEST[SIGNUP_REQUEST["LIMIT"] = 100] = "LIMIT";
    SIGNUP_REQUEST[SIGNUP_REQUEST["TTL"] = 60] = "TTL";
})(SIGNUP_REQUEST || (exports.SIGNUP_REQUEST = SIGNUP_REQUEST = {}));
var SIGNIN_REQUEST;
(function (SIGNIN_REQUEST) {
    SIGNIN_REQUEST[SIGNIN_REQUEST["LIMIT"] = 100] = "LIMIT";
    SIGNIN_REQUEST[SIGNIN_REQUEST["TTL"] = 60] = "TTL";
})(SIGNIN_REQUEST || (exports.SIGNIN_REQUEST = SIGNIN_REQUEST = {}));
var LOGOUT_REQUEST;
(function (LOGOUT_REQUEST) {
    LOGOUT_REQUEST[LOGOUT_REQUEST["LIMIT"] = 10] = "LIMIT";
    LOGOUT_REQUEST[LOGOUT_REQUEST["TTL"] = 60] = "TTL";
})(LOGOUT_REQUEST || (exports.LOGOUT_REQUEST = LOGOUT_REQUEST = {}));
var UPDATE_PASSWORD_REQUEST;
(function (UPDATE_PASSWORD_REQUEST) {
    UPDATE_PASSWORD_REQUEST[UPDATE_PASSWORD_REQUEST["LIMIT"] = 20] = "LIMIT";
    UPDATE_PASSWORD_REQUEST[UPDATE_PASSWORD_REQUEST["TTL"] = 60] = "TTL";
})(UPDATE_PASSWORD_REQUEST || (exports.UPDATE_PASSWORD_REQUEST = UPDATE_PASSWORD_REQUEST = {}));
var UPDATE_EMAIL_REQUEST;
(function (UPDATE_EMAIL_REQUEST) {
    UPDATE_EMAIL_REQUEST[UPDATE_EMAIL_REQUEST["LIMIT"] = 20] = "LIMIT";
    UPDATE_EMAIL_REQUEST[UPDATE_EMAIL_REQUEST["TTL"] = 60] = "TTL";
})(UPDATE_EMAIL_REQUEST || (exports.UPDATE_EMAIL_REQUEST = UPDATE_EMAIL_REQUEST = {}));
var UPLOAD_REQUEST;
(function (UPLOAD_REQUEST) {
    UPLOAD_REQUEST[UPLOAD_REQUEST["LIMIT"] = 50] = "LIMIT";
    UPLOAD_REQUEST[UPLOAD_REQUEST["TTL"] = 60] = "TTL";
})(UPLOAD_REQUEST || (exports.UPLOAD_REQUEST = UPLOAD_REQUEST = {}));
var LOG_REQUEST;
(function (LOG_REQUEST) {
    LOG_REQUEST[LOG_REQUEST["LIMIT"] = 500] = "LIMIT";
    LOG_REQUEST[LOG_REQUEST["TTL"] = 60] = "TTL";
})(LOG_REQUEST || (exports.LOG_REQUEST = LOG_REQUEST = {}));
//# sourceMappingURL=constant.js.map