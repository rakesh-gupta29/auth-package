# Redrob

Shared web components and authentication utilities for React and Vue applications.

## Features

- **🔐 Automatic Token Management**: Zero-config authentication
  - Tokens automatically stored in secure cookies
  - All API calls automatically authenticated
  - No manual token handling required
  - Automatic token refresh
- **🔒 Complete Auth System**: Full authentication flow
  - Login/Logout with email & password
  - Google SSO
  - Email verification with OTP
  - Password reset with OTP
  - Token refresh
  - User profile & credits
- **🎨 Web Components**: Framework-agnostic UI components built with Lit
  - Navbar
  - Sidebar
  - Footer with auto user display

## Installation

```bash
npm install redrob
```

## Quick Start

The package automatically manages authentication tokens for you - no manual token handling required!

```typescript
import { initAuth, login, getUserProfile } from "redrob/auth";

// 1. Initialize once at app startup
initAuth({ apiBaseUrl: "https://api.redrob.io" });

// 2. Login - tokens automatically stored in cookies
const { user, token } = await login({
  email: "user@example.com",
  password: "password123",
});

// 3. Get profile - automatically uses token from cookies
const profile = await getUserProfile();
console.log("Profile:", profile);

// That's it! No need to manually manage tokens! 🎉
```

**How it works:**

- Login/Signup response: `{ data: { access_token, refresh_token } }`
- Package automatically stores tokens in secure cookies
- All subsequent API calls automatically include the token
- Token refresh automatically updates cookies
- Logout automatically clears all tokens

See [example-simple.js](example-simple.js) for a complete example.

## Backend Requirements

Your backend API must implement specific endpoints for authentication. See [API.md](API.md) for detailed requirements including:

**Authentication:**

- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Email/password authentication
- `POST /auth/logout` - Logout endpoint
- `POST /auth/refresh` - Refresh authentication token
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/regenerate-otp` - Regenerate OTP for email verification
- `POST /auth/google-sso` - Google SSO authentication
- `POST /auth/password-lost` - Request password reset
- `POST /auth/password-reset` - Reset password with OTP
- `GET /auth/check-email` - Check if email exists

**User:**

- `GET /auth/profile` - Get user profile
- `GET /user` - Get detailed user information
- `GET /auth/credits` - Get user credits

The package uses **cookie-based session management** with Bearer token authentication and refresh tokens.

## Usage

### 1. Initialize Authentication

First, initialize the auth service with your API configuration:

```typescript
import { initAuth } from "redrob/auth";

initAuth({
  apiBaseUrl: "https://api.redrob.io",
  tokenKey: "redrob_auth_token", // optional
  refreshTokenKey: "redrob_refresh_token", // optional
});
```

### 2. Use Auth Functions

Authentication is managed via **cookies** and supports automatic session management with refresh tokens.

```typescript
import {
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
} from "redrob/auth";

// Signup new user
const { user, token } = await signup({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});

// Login with email and password
const result = await login({
  email: "user@example.com",
  password: "password123",
});

// Check if user is authenticated
if (isAuthenticated()) {
  // Get user profile (cached after login)
  const profile = await getUserProfile();

  // Get user credits
  const credits = await getUserCredits();
}

// Refresh token
const newToken = await refreshToken();

// Verify email with OTP
await verifyEmail({
  email: "user@example.com",
  otp: "123456",
});

// Regenerate OTP
await regenerateOTP("user@example.com");

// Google SSO
const googleResult = await googleSSO({
  idToken: "google-id-token",
});

// Password reset flow
await passwordResetRequest({ email: "user@example.com" });
await passwordReset({
  email: "user@example.com",
  otp: "123456",
  newPassword: "newpassword123",
});

// Check if email exists
const { exists } = await checkEmail("user@example.com");

// Logout
await logout();
```

### 3. Listen to Auth State Changes

The package dispatches events when authentication state changes:

```typescript
import { AUTH_STATE_CHANGED } from "redrob/auth";

window.addEventListener(AUTH_STATE_CHANGED, (event) => {
  const { authenticated, user } = event.detail;
  console.log("Auth state changed:", authenticated, user);
});
```

### 4. Use Web Components

The web components work in both React and Vue (or any framework).

#### In HTML/Vanilla JS

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import "redrob/components";
    </script>
  </head>
  <body>
    <redrob-navbar title="My App" logo="/logo.png"> </redrob-navbar>

    <redrob-sidebar></redrob-sidebar>

    <redrob-footer copyright="© 2024 My App" show-user> </redrob-footer>
  </body>
</html>
```

#### In React

```tsx
import { useEffect } from "react";
import "redrob/components";

function App() {
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
  ];

  return (
    <div>
      <redrob-navbar title="My App" links={JSON.stringify(navLinks)}>
        <div slot="actions">
          <button>Login</button>
        </div>
      </redrob-navbar>

      <main>Your content</main>

      <redrob-footer
        copyright="© 2024 My App"
        show-user
        links={JSON.stringify([
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ])}
      />
    </div>
  );
}
```

#### In Vue

```vue
<template>
  <div>
    <redrob-navbar :title="appTitle" :links="navLinks">
      <template #actions>
        <button @click="handleLogin">Login</button>
      </template>
    </redrob-navbar>

    <main>Your content</main>

    <redrob-footer :copyright="copyright" :links="footerLinks" show-user />
  </div>
</template>

<script setup>
import { ref } from "vue";
import "redrob/components";

const appTitle = ref("My App");
const navLinks = ref([
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
]);
const copyright = ref("© 2024 My App");
const footerLinks = ref([
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]);
</script>
```

## Component Properties

### Navbar (`<redrob-navbar>`)

- `title` (string): Application title
- `logo` (string): Logo image URL
- `links` (array): Navigation links `[{ label, href }]`
- Slot `actions`: Custom actions (buttons, etc.)

### Sidebar (`<redrob-sidebar>`)

- `open` (boolean): Open/close state
- `position` ('left' | 'right'): Sidebar position
- `items` (array): Sidebar items `[{ label, href, icon? }]`
- Slot `header`: Custom header content
- Default slot: Custom content

### Footer (`<redrob-footer>`)

- `copyright` (string): Copyright text
- `links` (array): Footer links `[{ label, href }]`
- `socialLinks` (array): Social media links `[{ platform, href, icon? }]`
- `show-user` (boolean): Show authenticated user info (email, name, credits)
- Slot `brand`: Brand content
- Slot `extra`: Extra content
- Slot `copyright`: Custom copyright content

**Note:** When `show-user` is enabled, the footer will automatically fetch and display the logged-in user's email and credits. It listens to auth state changes and updates automatically.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Clean
npm run clean
```

## Folder Structure

```
redrob/
├── src/
│   ├── auth/
│   │   ├── auth.ts          # Auth service implementation
│   │   ├── types.ts         # TypeScript types
│   │   └── index.ts         # Auth exports
│   ├── components/
│   │   ├── navbar.ts        # Navbar component
│   │   ├── sidebar.ts       # Sidebar component
│   │   ├── footer.ts        # Footer component
│   │   └── index.ts         # Component exports
│   └── index.ts             # Main entry point
├── dist/                    # Built files
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
