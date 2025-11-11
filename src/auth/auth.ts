import type {
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
  AuthConfig,
} from "./types.js";
import { setCookie, getCookie, deleteCookie } from "./cookies.js";

// Auth state change event
export const AUTH_STATE_CHANGED = "redrob:auth:changed";

class AuthService {
  private config: AuthConfig;
  private tokenKey: string;
  private refreshTokenKey: string;
  private currentUser: User | null = null;

  constructor(config: AuthConfig) {
    this.config = config;
    this.tokenKey = config.tokenKey || "redrob_auth_token";
    this.refreshTokenKey = config.refreshTokenKey || "redrob_refresh_token";
  }

  /**
   * Signup new user with email and password
   */
  async signup(
    credentials: SignupCredentials
  ): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Signup failed" }));
        throw new Error(error.message || "Signup failed");
      }

      const result = await response.json();

      // Handle the new response structure: { message: {...}, data: { access_token, refresh_token } }
      const data = result.data || result;
      const accessToken = data.access_token || data.token;
      const refreshToken = data.refresh_token || data.refreshToken;

      if (!accessToken) {
        throw new Error("No access token received from server");
      }

      // Store tokens in cookies (7 days for access, 30 days for refresh)
      setCookie(this.tokenKey, accessToken, 7);
      if (refreshToken) {
        setCookie(this.refreshTokenKey, refreshToken, 30);
      }

      // Fetch user profile using the new token
      const user = await this.getUserProfile();

      // Store user data
      this.currentUser = user;

      // Dispatch auth state change event
      this.dispatchAuthStateChange(true, user);

      return { user, token: accessToken };
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Include cookies in request
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Login failed" }));
        throw new Error(error.message || "Login failed");
      }

      const result = await response.json();

      // Handle the new response structure: { message: {...}, data: { access_token, refresh_token } }
      const data = result.data || result;
      const accessToken = data.access_token || data.token;
      const refreshToken = data.refresh_token || data.refreshToken;

      if (!accessToken) {
        throw new Error("No access token received from server");
      }

      // Store tokens in cookies (7 days for access, 30 days for refresh)
      setCookie(this.tokenKey, accessToken, 7);
      if (refreshToken) {
        setCookie(this.refreshTokenKey, refreshToken, 30);
      }

      // Fetch user profile using the new token
      const user = await this.getUserProfile();

      // Store user data
      this.currentUser = user;

      // Dispatch auth state change event
      this.dispatchAuthStateChange(true, user);

      return { user, token: accessToken };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();

      if (token) {
        await fetch(`${this.config.apiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }).catch((err) => {
          console.warn("Logout request failed:", err);
        });
      }

      // Clear token and user
      deleteCookie(this.tokenKey);
      deleteCookie(this.refreshTokenKey);
      this.currentUser = null;

      // Dispatch auth state change event
      this.dispatchAuthStateChange(false, null);
    } catch (error) {
      console.error("Logout error:", error);
      // Clear token and user even if request fails
      deleteCookie(this.tokenKey);
      deleteCookie(this.refreshTokenKey);
      this.currentUser = null;
      this.dispatchAuthStateChange(false, null);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = getCookie(this.refreshTokenKey);

      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      const response = await fetch(`${this.config.apiBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const result = await response.json();

      // Handle the new response structure: { message: {...}, data: { access_token, refresh_token } }
      const data = result.data || result;
      const accessToken = data.access_token || data.token;
      const newRefreshToken = data.refresh_token || data.refreshToken;

      if (!accessToken) {
        throw new Error("No access token received from server");
      }

      // Store new tokens
      setCookie(this.tokenKey, accessToken, 7);
      if (newRefreshToken) {
        setCookie(this.refreshTokenKey, newRefreshToken, 30);
      }

      // Fetch user profile using the new token
      const user = await this.getUserProfile();

      // Update user data
      this.currentUser = user;

      // Dispatch auth state change event
      this.dispatchAuthStateChange(true, user);

      return { token: accessToken, user };
    } catch (error) {
      console.error("Refresh token error:", error);
      // Clear tokens on failure
      deleteCookie(this.tokenKey);
      deleteCookie(this.refreshTokenKey);
      this.currentUser = null;
      this.dispatchAuthStateChange(false, null);
      throw error;
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(
    data: VerifyEmailData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Email verification failed" }));
        throw new Error(error.message || "Email verification failed");
      }

      const result = await response.json();

      // Update current user if we have one
      if (this.currentUser && this.currentUser.email === data.email) {
        this.currentUser.emailVerified = true;
        this.dispatchAuthStateChange(true, this.currentUser);
      }

      return result;
    } catch (error) {
      console.error("Verify email error:", error);
      throw error;
    }
  }

  /**
   * Regenerate OTP for email verification
   */
  async regenerateOTP(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/auth/regenerate-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to regenerate OTP" }));
        throw new Error(error.message || "Failed to regenerate OTP");
      }

      return await response.json();
    } catch (error) {
      console.error("Regenerate OTP error:", error);
      throw error;
    }
  }

  /**
   * Google SSO Authentication
   */
  async googleSSO(data: GoogleSSOData): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/auth/google-sso`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Google SSO failed" }));
        throw new Error(error.message || "Google SSO failed");
      }

      const result = await response.json();

      // Handle the new response structure: { message: {...}, data: { access_token, refresh_token } }
      const responseData = result.data || result;
      const accessToken = responseData.access_token || responseData.token;
      const refreshToken =
        responseData.refresh_token || responseData.refreshToken;

      if (!accessToken) {
        throw new Error("No access token received from server");
      }

      // Store tokens in cookies (7 days for access, 30 days for refresh)
      setCookie(this.tokenKey, accessToken, 7);
      if (refreshToken) {
        setCookie(this.refreshTokenKey, refreshToken, 30);
      }

      // Fetch user profile using the new token
      const user = await this.getUserProfile();

      // Store user data
      this.currentUser = user;

      // Dispatch auth state change event
      this.dispatchAuthStateChange(true, user);

      return { user, token: accessToken };
    } catch (error) {
      console.error("Google SSO error:", error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async passwordResetRequest(
    data: PasswordResetRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/auth/password-lost`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to send password reset email" }));
        throw new Error(error.message || "Failed to send password reset email");
      }

      return await response.json();
    } catch (error) {
      console.error("Password reset request error:", error);
      throw error;
    }
  }

  /**
   * Reset password with OTP
   */
  async passwordReset(
    data: PasswordResetData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/auth/password-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Password reset failed" }));
        throw new Error(error.message || "Password reset failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async checkEmail(email: string): Promise<CheckEmailResponse> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/auth/check-email?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check email");
      }

      return await response.json();
    } catch (error) {
      console.error("Check email error:", error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<User> {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${this.config.apiBaseUrl}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const result = await response.json();

      // Handle the new response structure: { message: {...}, data: { user } }
      const user = result.data || result;

      this.currentUser = user;
      return user;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  /**
   * Get user credits information
   */
  async getUserCredits(): Promise<UserCredits> {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${this.config.apiBaseUrl}/auth/credits`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user credits");
      }

      const credits = await response.json();
      return credits;
    } catch (error) {
      console.error("Get credits error:", error);
      throw error;
    }
  }

  /**
   * Get stored authentication token from cookie
   */
  getToken(): string | null {
    return getCookie(this.tokenKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get cached current user (without API call)
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Dispatch auth state change event
   */
  private dispatchAuthStateChange(
    authenticated: boolean,
    user: User | null
  ): void {
    const event = new CustomEvent(AUTH_STATE_CHANGED, {
      detail: { authenticated, user },
      bubbles: true,
      composed: true,
    });
    window.dispatchEvent(event);
  }
}

// Singleton instance
let authServiceInstance: AuthService | null = null;

/**
 * Initialize auth service with configuration
 */
export function initAuth(config: AuthConfig): AuthService {
  authServiceInstance = new AuthService(config);
  return authServiceInstance;
}

/**
 * Get auth service instance
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    throw new Error("Auth service not initialized. Call initAuth() first.");
  }
  return authServiceInstance;
}

/**
 * Signup new user
 */
export async function signup(credentials: SignupCredentials) {
  return getAuthService().signup(credentials);
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials) {
  return getAuthService().login(credentials);
}

/**
 * Logout user
 */
export async function logout() {
  return getAuthService().logout();
}

/**
 * Refresh authentication token
 */
export async function refreshToken() {
  return getAuthService().refreshToken();
}

/**
 * Verify email with OTP
 */
export async function verifyEmail(data: VerifyEmailData) {
  return getAuthService().verifyEmail(data);
}

/**
 * Regenerate OTP for email verification
 */
export async function regenerateOTP(email: string) {
  return getAuthService().regenerateOTP(email);
}

/**
 * Google SSO Authentication
 */
export async function googleSSO(data: GoogleSSOData) {
  return getAuthService().googleSSO(data);
}

/**
 * Send password reset email
 */
export async function passwordResetRequest(data: PasswordResetRequest) {
  return getAuthService().passwordResetRequest(data);
}

/**
 * Reset password with OTP
 */
export async function passwordReset(data: PasswordResetData) {
  return getAuthService().passwordReset(data);
}

/**
 * Check if email exists
 */
export async function checkEmail(email: string) {
  return getAuthService().checkEmail(email);
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  return getAuthService().getUserProfile();
}

/**
 * Get user credits
 */
export async function getUserCredits() {
  return getAuthService().getUserCredits();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return authServiceInstance?.isAuthenticated() || false;
}

/**
 * Get current user (cached, no API call)
 */
export function getCurrentUser(): User | null {
  return authServiceInstance?.getCurrentUser() || null;
}
