export {
  initAuth,
  signup,
  login,
  logout,
  refreshToken,
  verifyEmail,
  regenerateOTP,
  googleSSO,
  passwordResetRequest,
  passwordReset,
  checkEmail,
  getUserProfile,
  getUserCredits,
  isAuthenticated,
  getCurrentUser,
  getAuthService,
  AUTH_STATE_CHANGED
} from './auth.js';

export type {
  User,
  UserCredits,
  LoginCredentials,
  SignupCredentials,
  VerifyEmailData,
  PasswordResetRequest,
  PasswordResetData,
  RefreshTokenResponse,
  GoogleSSOData,
  CheckEmailResponse,
  AuthConfig
} from './types.js';

export { setCookie, getCookie, deleteCookie } from './cookies.js';
