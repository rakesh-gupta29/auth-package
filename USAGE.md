# Redrob Usage Guide

Complete guide for using the Redrob authentication package with all available features.

## Table of Contents

1. [Installation](#installation)
2. [Setup](#setup)
3. [Authentication Methods](#authentication-methods)
4. [User Management](#user-management)
5. [Web Components](#web-components)
6. [Framework Integration](#framework-integration)

---

## Installation

```bash
npm install rakesh-ds-common
```

---

## Setup

Initialize the auth service at the start of your application:

```typescript
import { initAuth } from "rakesh-ds-common/auth";

initAuth({
  apiBaseUrl: "https://api.redrob.io",
  tokenKey: "redrob_auth_token", // optional
  refreshTokenKey: "redrob_refresh_token", // optional
});
```

---

## How Authentication Works

The auth package automatically manages authentication tokens for you using secure cookies. Here's how it works:

### Token Management Flow

1. **Login/Signup** - Stores tokens automatically

   ```typescript
   import { login, getUserProfile } from "rakesh-ds-common/auth";

   // When you login, the package automatically:
   // 1. Calls the API with your credentials
   // 2. Receives access_token and refresh_token
   // 3. Stores them in secure cookies
   // 4. Fetches user profile
   const { user, token } = await login({
     email: "user@example.com",
     password: "password123",
   });

   console.log("Logged in as:", user.email);
   // Tokens are now stored in cookies!
   ```

2. **Automatic Token Usage** - All API calls use stored tokens

   ```typescript
   // getUserProfile automatically uses the token from cookies
   // You don't need to pass any token manually!
   const profile = await getUserProfile();
   console.log("Profile:", profile);

   // Same for credits
   const credits = await getUserCredits();
   console.log("Credits:", credits);
   ```

3. **Token Refresh** - Keeps you logged in

   ```typescript
   import { refreshToken } from "rakesh-ds-common/auth";

   // Refreshes your access token using the refresh token
   // New tokens are automatically stored in cookies
   const { user, token } = await refreshToken();
   ```

4. **Logout** - Clears all tokens

   ```typescript
   import { logout } from "rakesh-ds-common/auth";

   // Removes all tokens from cookies
   await logout();
   ```

### API Response Structure

The package handles the standard API response format:

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

The package automatically:

- Extracts `access_token` and `refresh_token` from the response
- Stores them in secure cookies (7 days for access token, 30 days for refresh token)
- Uses them in the `Authorization: Bearer <token>` header for all subsequent API calls
- Fetches your user profile after authentication

### Cookie Storage Details

- **Access Token Cookie**: `redrob_auth_token` (expires in 7 days)
- **Refresh Token Cookie**: `redrob_refresh_token` (expires in 30 days)
- **Custom Names**: You can customize cookie names in `initAuth()`

```typescript
initAuth({
  apiBaseUrl: "https://api.redrob.io",
  tokenKey: "my_custom_token", // default: 'redrob_auth_token'
  refreshTokenKey: "my_refresh_token", // default: 'redrob_refresh_token'
});
```

---

## Authentication Methods

### 1. Signup

Create a new user account:

```typescript
import { signup } from "rakesh-ds-common/auth";

try {
  const { user, token } = await signup({
    email: "user@example.com",
    password: "password123",
    name: "John Doe", // optional
  });

  console.log("Signup successful:", user);
  // User is now logged in automatically
} catch (error) {
  console.error("Signup failed:", error.message);
}
```

### 2. Login

Login with email and password:

```typescript
import { login } from "rakesh-ds-common/auth";

try {
  const { user, token } = await login({
    email: "user@example.com",
    password: "password123",
  });

  console.log("Login successful:", user);
} catch (error) {
  console.error("Login failed:", error.message);
}
```

### 3. Google SSO

Authenticate with Google:

```typescript
import { googleSSO } from "rakesh-ds-common/auth";

// After getting the Google ID token from Google Sign-In
try {
  const { user, token } = await googleSSO({
    idToken: "google-id-token-here",
  });

  console.log("Google login successful:", user);
} catch (error) {
  console.error("Google SSO failed:", error.message);
}
```

### 4. Email Verification

Verify user's email with OTP:

```typescript
import { verifyEmail, regenerateOTP } from "rakesh-ds-common/auth";

// Verify with OTP
try {
  const result = await verifyEmail({
    email: "user@example.com",
    otp: "123456",
  });

  console.log(result.message);
} catch (error) {
  console.error("Verification failed:", error.message);
}

// Regenerate OTP if expired
try {
  const result = await regenerateOTP("user@example.com");
  console.log(result.message);
} catch (error) {
  console.error("Failed to regenerate OTP:", error.message);
}
```

### 5. Password Reset

Reset password with OTP:

```typescript
import { passwordResetRequest, passwordReset } from "rakesh-ds-common/auth";

// Step 1: Request password reset (sends OTP to email)
try {
  const result = await passwordResetRequest({
    email: "user@example.com",
  });

  console.log(result.message);
} catch (error) {
  console.error("Failed to send reset email:", error.message);
}

// Step 2: Reset password with OTP
try {
  const result = await passwordReset({
    email: "user@example.com",
    otp: "123456",
    newPassword: "newpassword123",
  });

  console.log(result.message);
} catch (error) {
  console.error("Password reset failed:", error.message);
}
```

### 6. Token Refresh

Refresh authentication token:

```typescript
import { refreshToken } from "rakesh-ds-common/auth";

try {
  const { user, token } = await refreshToken();
  console.log("Token refreshed successfully");
} catch (error) {
  console.error("Token refresh failed:", error.message);
  // User needs to login again
}
```

### 7. Logout

Logout the current user:

```typescript
import { logout } from "rakesh-ds-common/auth";

try {
  await logout();
  console.log("Logged out successfully");
} catch (error) {
  console.error("Logout failed:", error.message);
}
```

### 8. Check Email Availability

Check if an email is already registered:

```typescript
import { checkEmail } from "rakesh-ds-common/auth";

try {
  const { exists, email } = await checkEmail("user@example.com");

  if (exists) {
    console.log("Email is already registered");
  } else {
    console.log("Email is available");
  }
} catch (error) {
  console.error("Failed to check email:", error.message);
}
```

---

## User Management

### Get User Profile

```typescript
import { getUserProfile } from "rakesh-ds-common/auth";

try {
  const user = await getUserProfile();
  console.log("User profile:", user);
} catch (error) {
  console.error("Failed to get profile:", error.message);
}
```

### Get User Credits

```typescript
import { getUserCredits } from "rakesh-ds-common/auth";

try {
  const credits = await getUserCredits();
  console.log(`Credits: ${credits.available}/${credits.total}`);
} catch (error) {
  console.error("Failed to get credits:", error.message);
}
```

### Check Authentication Status

```typescript
import { isAuthenticated, getCurrentUser } from "rakesh-ds-common/auth";

// Check if user is authenticated
if (isAuthenticated()) {
  console.log("User is logged in");

  // Get cached user data (no API call)
  const user = getCurrentUser();
  console.log("Current user:", user);
} else {
  console.log("User is not logged in");
}
```

---

## Auth State Changes

Listen for authentication state changes across your app:

```typescript
import { AUTH_STATE_CHANGED } from "rakesh-ds-common/auth";

window.addEventListener(AUTH_STATE_CHANGED, (event) => {
  const { authenticated, user } = event.detail;

  if (authenticated) {
    console.log("User logged in:", user);
    // Update UI, redirect, etc.
  } else {
    console.log("User logged out");
    // Clear UI, redirect to login, etc.
  }
});
```

---

## Web Components

### Footer Component

The footer component automatically displays user information when authenticated:

```html
<redrob-footer
  copyright="© 2024 My App"
  show-user
  links='[{"label":"Privacy","href":"/privacy"}]'
  socialLinks='[{"platform":"Twitter","href":"https://twitter.com/app"}]'
>
  <div slot="brand">
    <h3>My Brand</h3>
  </div>
</redrob-footer>
```

**Properties:**

- `copyright` - Copyright text
- `show-user` - Show authenticated user info (email, name, credits)
- `links` - Footer navigation links (JSON array)
- `socialLinks` - Social media links (JSON array)

**Slots:**

- `brand` - Brand content section
- `extra` - Extra content section
- `copyright` - Custom copyright section

### Navbar Component

```html
<redrob-navbar
  title="My App"
  logo="/logo.png"
  links='[{"label":"Home","href":"/"}]'
>
  <div slot="actions">
    <button>Login</button>
  </div>
</redrob-navbar>
```

### Sidebar Component

```html
<redrob-sidebar
  open
  position="left"
  items='[{"label":"Dashboard","href":"/dashboard"}]'
>
  <div slot="header">
    <h3>Menu</h3>
  </div>
</redrob-sidebar>
```

---

## Framework Integration

See the example files for complete implementations:

- **React**: [example-react.tsx](example-react.tsx)
- **Vue**: [example-vue.vue](example-vue.vue)

### React Example (Abbreviated)

```tsx
import { useEffect, useState } from "react";
import "rakesh-ds-common/components";
import {
  initAuth,
  login,
  logout,
  AUTH_STATE_CHANGED,
} from "rakesh-ds-common/auth";

initAuth({ apiBaseUrl: "https://api.redrob.io" });

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const handleAuthChange = (event) => {
      setAuthenticated(event.detail.authenticated);
    };

    window.addEventListener(AUTH_STATE_CHANGED, handleAuthChange);
    return () =>
      window.removeEventListener(AUTH_STATE_CHANGED, handleAuthChange);
  }, []);

  return (
    <div>
      <redrob-footer show-user copyright="© 2024" />
    </div>
  );
}
```

### Vue Example (Abbreviated)

```vue
<template>
  <div>
    <redrob-footer show-user :copyright="copyright" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import "rakesh-ds-common/components";
import { initAuth, AUTH_STATE_CHANGED } from "rakesh-ds-common/auth";

initAuth({ apiBaseUrl: "https://api.redrob.io" });

const authenticated = ref(false);

onMounted(() => {
  window.addEventListener(AUTH_STATE_CHANGED, (event) => {
    authenticated.value = event.detail.authenticated;
  });
});
</script>
```

---

## Error Handling

All auth functions throw errors that can be caught:

```typescript
try {
  await login({ email, password });
} catch (error) {
  if (error.message.includes("Invalid credentials")) {
    // Handle wrong password
  } else if (error.message.includes("Network")) {
    // Handle network error
  } else {
    // Handle other errors
  }
}
```

---

## TypeScript Support

The package includes full TypeScript support with type definitions:

```typescript
import type {
  User,
  UserCredits,
  LoginCredentials,
  SignupCredentials,
  VerifyEmailData,
  PasswordResetRequest,
  PasswordResetData,
  GoogleSSOData,
  CheckEmailResponse,
  AuthConfig,
} from "rakesh-ds-common/auth";

const credentials: LoginCredentials = {
  email: "user@example.com",
  password: "password123",
};
```

---

## Best Practices

1. **Initialize Once**: Call `initAuth()` once at app startup
2. **Error Handling**: Always wrap auth calls in try-catch blocks
3. **State Management**: Listen to `AUTH_STATE_CHANGED` for global state updates
4. **Token Refresh**: Implement automatic token refresh before expiry
5. **Security**: Never store sensitive data in localStorage, use cookies
6. **HTTPS**: Always use HTTPS in production
7. **OTP Expiry**: Inform users that OTP codes expire after a certain time

---

## Support

For issues and feature requests, visit: [GitHub Issues](https://github.com/rakesh/rakesh-ds-common/issues)
