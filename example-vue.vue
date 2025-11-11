<template>
  <div class="app">
    <!-- Navbar with login/logout button -->
    <redrob-navbar
      :title="appTitle"
      :logo="appLogo"
      :links="JSON.stringify(navLinks)"
    >
      <template #actions>
        <div class="nav-actions">
          <template v-if="authenticated">
            <span class="welcome-text">Welcome, {{ user?.email }}</span>
            <button
              @click="handleLogout"
              :disabled="loading"
              class="btn btn-danger"
            >
              {{ loading ? 'Logging out...' : 'Logout' }}
            </button>
          </template>
          <template v-else>
            <button
              @click="showLoginModal = true"
              :disabled="loading"
              class="btn btn-primary"
            >
              Login
            </button>
          </template>
        </div>
      </template>
    </redrob-navbar>

    <!-- Main content -->
    <main class="main-content">
      <h1>Welcome to My App</h1>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <template v-if="authenticated">
        <div>
          <h2>You are logged in!</h2>
          <p>Email: {{ user?.email }}</p>
          <p v-if="user?.name">Name: {{ user.name }}</p>
        </div>
      </template>
      <template v-else>
        <div>
          <h2>Please log in to continue</h2>
        </div>
      </template>
    </main>

    <!-- Footer with user info - will automatically show user details when logged in -->
    <redrob-footer
      :copyright="copyright"
      :links="JSON.stringify(footerLinks)"
      :socialLinks="JSON.stringify(socialLinks)"
      show-user
    >
      <template #brand>
        <h3 class="brand-title">My App</h3>
        <p class="brand-subtitle">Building amazing things together</p>
      </template>
      <template #extra>
        <p class="extra-text">
          Need help? <a href="/support">Contact Support</a>
        </p>
      </template>
    </redrob-footer>

    <!-- Login Modal -->
    <div
      v-if="showLoginModal"
      class="modal-overlay"
      @click.self="showLoginModal = false"
    >
      <div class="modal-content">
        <h2 class="modal-title">Login</h2>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="email"
              type="email"
              required
              :disabled="loading"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="password"
              type="password"
              required
              :disabled="loading"
              class="form-input"
            />
          </div>

          <div class="form-actions">
            <button
              type="submit"
              :disabled="loading"
              class="btn btn-primary btn-block"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>

            <button
              type="button"
              @click="showLoginModal = false"
              :disabled="loading"
              class="btn btn-secondary btn-block"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import 'rakesh-ds-common/components';
import {
  initAuth,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  AUTH_STATE_CHANGED
} from 'rakesh-ds-common/auth';
import type { User } from 'rakesh-ds-common/auth';

// Initialize auth service once when app starts
initAuth({
  apiBaseUrl: 'https://api.redrob.io',
  tokenKey: 'redrob_auth_token', // optional
  refreshTokenKey: 'redrob_refresh_token' // optional
});

// State
const user = ref<User | null>(null);
const authenticated = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const showLoginModal = ref(false);

// Form state
const email = ref('');
const password = ref('');

// App data
const appTitle = ref('My App');
const appLogo = ref('/logo.png');

const navLinks = ref([
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' }
]);

const footerLinks = ref([
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' }
]);

const socialLinks = ref([
  { platform: 'Twitter', href: 'https://twitter.com/yourapp' },
  { platform: 'GitHub', href: 'https://github.com/yourapp' },
  { platform: 'LinkedIn', href: 'https://linkedin.com/company/yourapp' }
]);

const copyright = ref('© 2024 My App. All rights reserved.');

// Auth state change handler
const handleAuthChange = (event: Event) => {
  const customEvent = event as CustomEvent<{ authenticated: boolean; user: User | null }>;
  authenticated.value = customEvent.detail.authenticated;
  user.value = customEvent.detail.user;
};

// Login handler
const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    const result = await login({
      email: email.value,
      password: password.value
    });
    console.log('Login successful:', result.user);
    // State will be updated automatically via AUTH_STATE_CHANGED event
    email.value = '';
    password.value = '';
    showLoginModal.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed';
  } finally {
    loading.value = false;
  }
};

// Logout handler
const handleLogout = async () => {
  loading.value = true;
  error.value = null;

  try {
    await logout();
    console.log('Logout successful');
    // State will be updated automatically via AUTH_STATE_CHANGED event
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Logout failed';
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  // Check if user is already authenticated
  authenticated.value = isAuthenticated();
  user.value = getCurrentUser();

  // Listen for auth state changes
  window.addEventListener(AUTH_STATE_CHANGED, handleAuthChange);
});

onUnmounted(() => {
  window.removeEventListener(AUTH_STATE_CHANGED, handleAuthChange);
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.welcome-text {
  color: white;
  font-size: 0.875rem;
}

.main-content {
  flex: 1;
  min-height: 70vh;
  padding: 2rem;
}

.error-message {
  padding: 1rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.brand-title {
  color: white;
  margin-bottom: 0.5rem;
}

.brand-subtitle {
  font-size: 0.875rem;
  margin: 0;
}

.extra-text {
  font-size: 0.875rem;
  margin: 0;
}

.extra-text a {
  color: #60a5fa;
  text-decoration: none;
}

.extra-text a:hover {
  text-decoration: underline;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 400px;
  width: 100%;
}

.modal-title {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Button styles */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-block {
  flex: 1;
}
</style>
