# Token Management Update - Changelog

## Overview

Updated the auth package to handle the new API response structure and implement automatic token management with secure cookie storage.

## API Response Structure

The API now returns tokens in this format:

```json
{
  "message": {
    "title": "Success",
    "subTitle": "Login successful"
  },
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Changes Made

### 1. Updated `login()` Method

- **File**: `src/auth/auth.ts`
- **Changes**:
  - Now handles response structure: `result.data.access_token` and `result.data.refresh_token`
  - Backwards compatible with old structure (`data.token` and `data.refreshToken`)
  - Automatically stores tokens in cookies
  - Fetches user profile after storing tokens
  - Returns `{ user, token }` with complete user information

### 2. Updated `signup()` Method

- **File**: `src/auth/auth.ts`
- **Changes**:
  - Same response handling as login
  - Stores tokens in cookies automatically
  - Fetches user profile after signup
  - Returns `{ user, token }`

### 3. Updated `googleSSO()` Method

- **File**: `src/auth/auth.ts`
- **Changes**:
  - Handles new response structure
  - Automatic token storage in cookies
  - Fetches user profile
  - Returns `{ user, token }`

### 4. Updated `refreshToken()` Method

- **File**: `src/auth/auth.ts`
- **Changes**:
  - Handles new response structure
  - Stores new access_token and refresh_token in cookies
  - Fetches updated user profile
  - Returns `{ user, token }`

### 5. Updated `getUserProfile()` Method

- **File**: `src/auth/auth.ts`
- **Changes**:
  - Handles new response structure: `result.data || result`
  - Automatically uses token from cookies via `Authorization: Bearer <token>` header
  - No manual token parameter needed

## How It Works

### Complete Authentication Flow

```typescript
import { initAuth, login, getUserProfile, getUserCredits } from "redrob/auth";

// 1. Initialize (do this once at app startup)
initAuth({ apiBaseUrl: "https://api.redrob.io" });

// 2. Login
const { user, token } = await login({
  email: "user@example.com",
  password: "password123",
});

// Behind the scenes:
// ✅ API called: POST /auth/login
// ✅ Response: { data: { access_token: "...", refresh_token: "..." } }
// ✅ access_token stored in cookie: redrob_auth_token (7 days)
// ✅ refresh_token stored in cookie: redrob_refresh_token (30 days)
// ✅ getUserProfile() called automatically
// ✅ user data cached
// ✅ AUTH_STATE_CHANGED event dispatched

// 3. Get profile (uses token from cookies automatically)
const profile = await getUserProfile();

// Behind the scenes:
// ✅ Token retrieved from cookie: redrob_auth_token
// ✅ API called: GET /user with Authorization: Bearer <token>
// ✅ User profile returned

// 4. Get credits (uses token from cookies automatically)
const credits = await getUserCredits();

// Behind the scenes:
// ✅ Token retrieved from cookie: redrob_auth_token
// ✅ API called: GET /auth/credits with Authorization: Bearer <token>
// ✅ Credits returned
```

## Key Features

### ✅ Automatic Token Storage

- Tokens stored in secure cookies
- Access token: 7 days expiry
- Refresh token: 30 days expiry
- Configurable cookie names

### ✅ Automatic Token Usage

- All protected API calls automatically include the token
- No need to manually pass tokens
- Token retrieved from cookies automatically

### ✅ Automatic User Profile Fetching

- After login/signup, user profile is automatically fetched
- User data is cached in memory
- Available via `getCurrentUser()`

### ✅ Backwards Compatibility

- Supports both old and new response structures
- Checks for `access_token` OR `token`
- Checks for `refresh_token` OR `refreshToken`

### ✅ Auth State Management

- `AUTH_STATE_CHANGED` event dispatched on login/logout
- Components can listen and update automatically
- Footer component shows user info automatically

## Cookie Storage Details

| Cookie Name   | Default Value          | Expiry  | Configurable              |
| ------------- | ---------------------- | ------- | ------------------------- |
| Access Token  | `redrob_auth_token`    | 7 days  | Yes via `tokenKey`        |
| Refresh Token | `redrob_refresh_token` | 30 days | Yes via `refreshTokenKey` |

### Custom Cookie Names

```typescript
initAuth({
  apiBaseUrl: "https://api.redrob.io",
  tokenKey: "my_access_token", // custom access token cookie name
  refreshTokenKey: "my_refresh_token", // custom refresh token cookie name
});
```

## API Endpoints Expected

The package expects these API endpoints:

### Authentication Endpoints

| Endpoint           | Method | Request                      | Response                                    |
| ------------------ | ------ | ---------------------------- | ------------------------------------------- |
| `/auth/login`      | POST   | `{ email, password }`        | `{ data: { access_token, refresh_token } }` |
| `/auth/signup`     | POST   | `{ email, password, name? }` | `{ data: { access_token, refresh_token } }` |
| `/auth/logout`     | POST   | -                            | `{ success: true }`                         |
| `/auth/refresh`    | POST   | `{ refreshToken }`           | `{ data: { access_token, refresh_token } }` |
| `/auth/google-sso` | POST   | `{ idToken }`                | `{ data: { access_token, refresh_token } }` |

### User Endpoints (Protected - Require Bearer Token)

| Endpoint        | Method | Headers                         | Response                                 |
| --------------- | ------ | ------------------------------- | ---------------------------------------- |
| `/user`         | GET    | `Authorization: Bearer <token>` | `{ data: User }` or `User`               |
| `/auth/credits` | GET    | `Authorization: Bearer <token>` | `{ data: UserCredits }` or `UserCredits` |

## Examples

### Complete Example Files

1. **example-simple.js** - Comprehensive example with detailed comments
2. **example-react.tsx** - React implementation
3. **example-vue.vue** - Vue implementation

### Quick Example

```typescript
import {
  initAuth,
  login,
  logout,
  getUserProfile,
  isAuthenticated,
  AUTH_STATE_CHANGED,
} from "redrob/auth";

// Initialize
initAuth({ apiBaseUrl: "https://api.redrob.io" });

// Listen for auth changes
window.addEventListener(AUTH_STATE_CHANGED, (event) => {
  const { authenticated, user } = event.detail;
  console.log("Auth state:", authenticated, user);
});

// Login
async function handleLogin() {
  try {
    const { user, token } = await login({
      email: "rakesh.gupta+124@mckinleyrice.co",
      password: "password123",
    });

    console.log("Logged in:", user.email);

    // Get profile (uses token automatically)
    const profile = await getUserProfile();
    console.log("Profile:", profile);
  } catch (error) {
    console.error("Login failed:", error.message);
  }
}

// Logout
async function handleLogout() {
  try {
    await logout();
    console.log("Logged out");
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
}

// Check auth status
if (isAuthenticated()) {
  console.log("User is logged in");
}
```

## Migration Guide

If you're upgrading from a previous version:

### Before (Manual Token Handling)

```typescript
// Old way - manual token handling
const response = await fetch("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
const data = await response.json();

// Manually store token
localStorage.setItem("token", data.token);

// Manually pass token to get profile
const profile = await getUserProfile(data.token);
```

### After (Automatic Token Management)

```typescript
// New way - automatic token handling
const { user, token } = await login({ email, password });

// Token automatically stored in cookies
// Get profile without passing token
const profile = await getUserProfile();
```

**No migration needed!** The package is backwards compatible and handles everything automatically.

## Testing

Build the package:

```bash
cd /home/rk/work/mf/redrob
npm run build
```

## Documentation

- **README.md** - Updated with Quick Start section highlighting automatic token management
- **USAGE.md** - Added comprehensive "How Authentication Works" section
- **example-simple.js** - New complete example file

## Benefits

✅ **Zero Configuration** - Works out of the box
✅ **Automatic** - No manual token handling
✅ **Secure** - Cookies instead of localStorage
✅ **Simple** - Clean API, no complexity
✅ **Flexible** - Customizable cookie names
✅ **Complete** - Full auth flow covered
✅ **Compatible** - Works with old and new response structures

## Summary

The auth package now provides a complete, zero-configuration authentication system that:

1. Automatically stores tokens in secure cookies
2. Automatically uses tokens for all API calls
3. Automatically fetches user profile after authentication
4. Dispatches auth state change events
5. Handles token refresh
6. Manages logout and cleanup

**You never have to manually handle tokens again!** 🎉
