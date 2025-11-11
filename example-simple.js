/**
 * Simple example demonstrating the complete authentication flow
 * with automatic token management
 */

import {
  initAuth,
  login,
  logout,
  getUserProfile,
  getUserCredits,
  isAuthenticated,
  getCurrentUser,
  refreshToken,
  AUTH_STATE_CHANGED,
} from "rakesh-ds-common/auth";

// ========================================
// Step 1: Initialize the auth service
// ========================================
// Do this ONCE when your app starts
initAuth({
  apiBaseUrl: "https://api.redrob.io",
  tokenKey: "redrob_auth_token", // optional - default: 'redrob_auth_token'
  refreshTokenKey: "redrob_refresh_token", // optional - default: 'redrob_refresh_token'
});

// ========================================
// Step 2: Listen for auth state changes
// ========================================
// This event fires whenever login/logout/token refresh happens
window.addEventListener(AUTH_STATE_CHANGED, (event) => {
  const { authenticated, user } = event.detail;

  if (authenticated) {
    console.log("✅ User is authenticated:", user.email);
  } else {
    console.log("❌ User is not authenticated");
  }
});

// ========================================
// Step 3: Login
// ========================================
async function performLogin() {
  try {
    console.log("🔐 Logging in...");

    // Call login with credentials
    const { user, token } = await login({
      email: "rakesh.gupta+124@mckinleyrice.co",
      password: "your-password",
    });

    console.log("✅ Login successful!");
    console.log("👤 User:", user);
    console.log("🔑 Token:", token.substring(0, 20) + "...");

    // ⚠️ IMPORTANT: You don't need to manually store the token!
    // The auth package automatically:
    // 1. Stored access_token in cookie: redrob_auth_token
    // 2. Stored refresh_token in cookie: redrob_refresh_token
    // 3. Fetched and cached the user profile
  } catch (error) {
    console.error("❌ Login failed:", error.message);
  }
}

// ========================================
// Step 4: Get User Profile
// ========================================
async function getProfile() {
  try {
    console.log("👤 Getting user profile...");

    // getUserProfile automatically uses the token from cookies
    // You don't need to pass any token manually!
    const profile = await getUserProfile();

    console.log("✅ Profile fetched:", profile);
  } catch (error) {
    console.error("❌ Failed to get profile:", error.message);
  }
}

// ========================================
// Step 5: Get User Credits
// ========================================
async function getCredits() {
  try {
    console.log("💰 Getting user credits...");

    // getUserCredits automatically uses the token from cookies
    const credits = await getUserCredits();

    console.log("✅ Credits:", credits);
    console.log(`   Available: ${credits.available}`);
    console.log(`   Total: ${credits.total}`);
    console.log(`   Used: ${credits.used}`);
  } catch (error) {
    console.error("❌ Failed to get credits:", error.message);
  }
}

// ========================================
// Step 6: Check Authentication Status
// ========================================
function checkAuth() {
  console.log("🔍 Checking authentication status...");

  if (isAuthenticated()) {
    console.log("✅ User is authenticated");

    // Get cached user (no API call)
    const user = getCurrentUser();
    console.log("👤 Current user:", user);
  } else {
    console.log("❌ User is not authenticated");
  }
}

// ========================================
// Step 7: Refresh Token
// ========================================
async function refreshAuthToken() {
  try {
    console.log("🔄 Refreshing token...");

    // Refreshes the access token using the refresh token
    // New tokens are automatically stored in cookies
    const { user, token } = await refreshToken();

    console.log("✅ Token refreshed successfully");
    console.log("👤 User:", user);
  } catch (error) {
    console.error("❌ Token refresh failed:", error.message);
    console.log("⚠️  User needs to login again");
  }
}

// ========================================
// Step 8: Logout
// ========================================
async function performLogout() {
  try {
    console.log("👋 Logging out...");

    // Logout automatically:
    // 1. Calls the logout API endpoint
    // 2. Removes all tokens from cookies
    // 3. Clears cached user data
    // 4. Dispatches AUTH_STATE_CHANGED event
    await logout();

    console.log("✅ Logout successful");
  } catch (error) {
    console.error("❌ Logout failed:", error.message);
  }
}

// ========================================
// Complete Flow Example
// ========================================
async function completeFlow() {
  console.log("\n========================================");
  console.log("🚀 Starting Complete Auth Flow Example");
  console.log("========================================\n");

  // Check initial auth status
  checkAuth();
  console.log("\n");

  // Login
  await performLogin();
  console.log("\n");

  // Wait a bit for auth state to update
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check auth status after login
  checkAuth();
  console.log("\n");

  // Get profile (uses token from cookies automatically)
  await getProfile();
  console.log("\n");

  // Get credits (uses token from cookies automatically)
  await getCredits();
  console.log("\n");

  // Refresh token
  await refreshAuthToken();
  console.log("\n");

  // Logout
  await performLogout();
  console.log("\n");

  // Check auth status after logout
  checkAuth();
  console.log("\n");

  console.log("========================================");
  console.log("✅ Complete Auth Flow Example Finished");
  console.log("========================================\n");
}

// ========================================
// Key Takeaways
// ========================================
console.log(`
🎯 KEY TAKEAWAYS:

1. ✅ Tokens are AUTOMATICALLY stored in cookies
   - No need to manually save them
   - Secure cookie storage

2. ✅ Tokens are AUTOMATICALLY used in API calls
   - getUserProfile() - uses token automatically
   - getUserCredits() - uses token automatically
   - All protected endpoints use the token

3. ✅ Token refresh is simple
   - Call refreshToken() to get new tokens
   - New tokens automatically stored

4. ✅ Complete auth state management
   - Listen to AUTH_STATE_CHANGED event
   - Automatic updates across your app

5. ✅ Clean logout
   - Removes all tokens
   - Clears cached data
   - Notifies your app

========================================
📦 The auth package manages EVERYTHING for you!
========================================
`);

// Run the complete flow
// Uncomment the line below to run the example:
// completeFlow();
