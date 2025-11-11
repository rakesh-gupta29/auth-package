# Getting Started with Automatic Token Management

## 🎉 What's New?

The auth package now **automatically manages authentication tokens** for you! No more manual token handling - everything just works.

## 📋 Your API Response Format

Your login API returns:

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

✅ **The package automatically handles this structure!**

## 🚀 Quick Start (3 Steps)

### Step 1: Initialize the Auth Service

Do this **once** when your app starts:

```typescript
import { initAuth } from "rakesh-ds-common/auth";

initAuth({
  apiBaseUrl: "https://api.redrob.io",
});
```

### Step 2: Login

```typescript
import { login } from "rakesh-ds-common/auth";

const { user, token } = await login({
  email: "rakesh.gupta+124@mckinleyrice.co",
  password: "your-password",
});

console.log("Logged in as:", user.email);
// ✅ Tokens are now stored in cookies automatically!
```

**What happens behind the scenes:**

1. API called: `POST /auth/login`
2. Response: `{ data: { access_token: "...", refresh_token: "..." } }`
3. ✅ `access_token` stored in cookie: `redrob_auth_token` (expires in 7 days)
4. ✅ `refresh_token` stored in cookie: `redrob_refresh_token` (expires in 30 days)
5. ✅ User profile fetched automatically via `GET /user`
6. ✅ User data cached in memory

### Step 3: Get User Profile

```typescript
import { getUserProfile } from "rakesh-ds-common/auth";

// Get profile - automatically uses token from cookies!
const profile = await getUserProfile();
console.log("Profile:", profile);
```

**What happens behind the scenes:**

1. Token retrieved from cookie: `redrob_auth_token`
2. API called: `GET /user` with `Authorization: Bearer <token>` header
3. Profile data returned

## 🎯 Complete Example

```typescript
import {
  initAuth,
  login,
  logout,
  getUserProfile,
  getUserCredits,
  isAuthenticated,
  getCurrentUser,
  AUTH_STATE_CHANGED,
} from "rakesh-ds-common/auth";

// ========================================
// 1. Initialize (do this once at app startup)
// ========================================
initAuth({
  apiBaseUrl: "https://api.redrob.io",
});

// ========================================
// 2. Listen for auth state changes
// ========================================
window.addEventListener(AUTH_STATE_CHANGED, (event) => {
  const { authenticated, user } = event.detail;

  if (authenticated) {
    console.log("✅ User logged in:", user.email);
    // Update UI, show protected content, etc.
  } else {
    console.log("❌ User logged out");
    // Show login form, hide protected content, etc.
  }
});

// ========================================
// 3. Login
// ========================================
async function handleLogin() {
  try {
    const { user, token } = await login({
      email: "rakesh.gupta+124@mckinleyrice.co",
      password: "your-password",
    });

    console.log("✅ Login successful!");
    console.log("👤 User:", user);

    // Tokens are automatically stored in cookies!
    // You don't need to do anything!
  } catch (error) {
    console.error("❌ Login failed:", error.message);
  }
}

// ========================================
// 4. Get User Profile (uses token automatically)
// ========================================
async function getProfile() {
  try {
    // No need to pass token - it's automatically retrieved from cookies!
    const profile = await getUserProfile();
    console.log("👤 Profile:", profile);
  } catch (error) {
    console.error("❌ Failed to get profile:", error.message);
  }
}

// ========================================
// 5. Get User Credits (uses token automatically)
// ========================================
async function getCredits() {
  try {
    // No need to pass token - it's automatically retrieved from cookies!
    const credits = await getUserCredits();
    console.log("💰 Credits:", credits);
    console.log(`   Available: ${credits.available}`);
    console.log(`   Total: ${credits.total}`);
    console.log(`   Used: ${credits.used}`);
  } catch (error) {
    console.error("❌ Failed to get credits:", error.message);
  }
}

// ========================================
// 6. Check Authentication Status
// ========================================
function checkAuth() {
  if (isAuthenticated()) {
    console.log("✅ User is authenticated");

    // Get cached user (no API call)
    const user = getCurrentUser();
    console.log("👤 Current user:", user.email);
  } else {
    console.log("❌ User is not authenticated");
  }
}

// ========================================
// 7. Logout
// ========================================
async function handleLogout() {
  try {
    await logout();
    console.log("✅ Logged out successfully");

    // Tokens are automatically removed from cookies!
    // You don't need to do anything!
  } catch (error) {
    console.error("❌ Logout failed:", error.message);
  }
}
```

## 🔑 Key Takeaways

### ✅ Tokens are Automatically Stored

- No need to manually save tokens
- Stored in secure cookies
- Access token: 7 days expiry
- Refresh token: 30 days expiry

### ✅ Tokens are Automatically Used

- `getUserProfile()` - uses token automatically
- `getUserCredits()` - uses token automatically
- All protected API calls include the token automatically

### ✅ User Profile is Automatically Fetched

- After login, user profile is fetched
- After signup, user profile is fetched
- After token refresh, user profile is updated

### ✅ Auth State is Automatically Managed

- `AUTH_STATE_CHANGED` event fired on login/logout
- Components can listen and update automatically
- Footer component shows user info automatically

### ✅ Everything is Automatic!

**You never have to manually handle tokens again!** 🎉

## 📱 Using in Your App

### React Example

```tsx
import React, { useState, useEffect } from "react";
import {
  initAuth,
  login,
  logout,
  getUserProfile,
  isAuthenticated,
  getCurrentUser,
  AUTH_STATE_CHANGED,
} from "rakesh-ds-common/auth";
import type { User } from "rakesh-ds-common/auth";

// Initialize once
initAuth({ apiBaseUrl: "https://api.redrob.io" });

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already logged in
    setAuthenticated(isAuthenticated());
    setUser(getCurrentUser());

    // Listen for auth changes
    const handleAuthChange = (event: Event) => {
      const e = event as CustomEvent<{
        authenticated: boolean;
        user: User | null;
      }>;
      setAuthenticated(e.detail.authenticated);
      setUser(e.detail.user);
    };

    window.addEventListener(AUTH_STATE_CHANGED, handleAuthChange);
    return () =>
      window.removeEventListener(AUTH_STATE_CHANGED, handleAuthChange);
  }, []);

  const handleLogin = async () => {
    try {
      const result = await login({
        email: "rakesh.gupta+124@mckinleyrice.co",
        password: "your-password",
      });
      console.log("Logged in:", result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logged out");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      {authenticated ? (
        <div>
          <h1>Welcome, {user?.email}!</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h1>Please login</h1>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
```

### Vue Example

```vue
<template>
  <div>
    <div v-if="authenticated">
      <h1>Welcome, {{ user?.email }}!</h1>
      <button @click="handleLogout">Logout</button>
    </div>
    <div v-else>
      <h1>Please login</h1>
      <button @click="handleLogin">Login</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  initAuth,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  AUTH_STATE_CHANGED,
} from "rakesh-ds-common/auth";

// Initialize once
initAuth({ apiBaseUrl: "https://api.redrob.io" });

const authenticated = ref(false);
const user = ref(null);

onMounted(() => {
  // Check if already logged in
  authenticated.value = isAuthenticated();
  user.value = getCurrentUser();

  // Listen for auth changes
  window.addEventListener(AUTH_STATE_CHANGED, (event) => {
    authenticated.value = event.detail.authenticated;
    user.value = event.detail.user;
  });
});

async function handleLogin() {
  try {
    const result = await login({
      email: "rakesh.gupta+124@mckinleyrice.co",
      password: "your-password",
    });
    console.log("Logged in:", result.user);
  } catch (error) {
    console.error("Login failed:", error);
  }
}

async function handleLogout() {
  try {
    await logout();
    console.log("Logged out");
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
</script>
```

## 🔐 Cookie Details

| Cookie Name            | Purpose       | Expiry  | Configurable |
| ---------------------- | ------------- | ------- | ------------ |
| `redrob_auth_token`    | Access token  | 7 days  | Yes          |
| `redrob_refresh_token` | Refresh token | 30 days | Yes          |

### Custom Cookie Names (Optional)

```typescript
initAuth({
  apiBaseUrl: "https://api.redrob.io",
  tokenKey: "my_custom_token", // default: 'redrob_auth_token'
  refreshTokenKey: "my_refresh_token", // default: 'redrob_refresh_token'
});
```

## 📚 More Resources

- **example-simple.js** - Complete example with detailed comments
- **example-react.tsx** - Full React implementation
- **example-vue.vue** - Full Vue implementation
- **USAGE.md** - Complete API documentation
- **CHANGELOG-TOKEN-MANAGEMENT.md** - Technical details of changes

## 🎯 Summary

The auth package now provides a **complete, zero-configuration authentication system** that:

1. ✅ Automatically stores tokens in secure cookies
2. ✅ Automatically uses tokens for all API calls
3. ✅ Automatically fetches user profile after authentication
4. ✅ Dispatches auth state change events
5. ✅ Handles token refresh
6. ✅ Manages logout and cleanup

**You never have to manually handle tokens again!** 🎉

---

## 🆘 Need Help?

If you have any questions or run into issues, check:

1. Make sure `initAuth()` is called before any other auth functions
2. Make sure your API returns the correct response structure
3. Check browser console for any error messages
4. Verify cookies are being set (check browser DevTools > Application > Cookies)

Enjoy the automatic token management! 🚀
