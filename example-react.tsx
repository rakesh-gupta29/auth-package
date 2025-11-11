import React, { useState, useEffect } from "react";
import "rakesh-ds-common/components";
import {
  initAuth,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  AUTH_STATE_CHANGED,
} from "rakesh-ds-common/auth";
import type { User } from "rakesh-ds-common/auth";

// Initialize auth service once when app starts
initAuth({
  apiBaseUrl: "https://api.redrob.io",
  tokenKey: "redrob_auth_token", // optional
  refreshTokenKey: "redrob_refresh_token", // optional
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if user is already authenticated
    setAuthenticated(isAuthenticated());
    setUser(getCurrentUser());

    // Listen for auth state changes
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        authenticated: boolean;
        user: User | null;
      }>;
      setAuthenticated(customEvent.detail.authenticated);
      setUser(customEvent.detail.user);
    };

    window.addEventListener(AUTH_STATE_CHANGED, handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED, handleAuthChange);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login({
        email,
        password,
      });
      console.log("Login successful:", result.user);
      // State will be updated automatically via AUTH_STATE_CHANGED event
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      await logout();
      console.log("Logout successful");
      // State will be updated automatically via AUTH_STATE_CHANGED event
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
  ];

  const footerLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { platform: "Twitter", href: "https://twitter.com/yourapp" },
    { platform: "GitHub", href: "https://github.com/yourapp" },
    { platform: "LinkedIn", href: "https://linkedin.com/company/yourapp" },
  ];

  return (
    <div className="app">
      {/* Navbar with login/logout button */}
      <redrob-navbar
        title="My App"
        logo="/logo.png"
        links={JSON.stringify(navLinks)}
      >
        <div
          slot="actions"
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        >
          {authenticated ? (
            <>
              <span style={{ color: "white" }}>Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                disabled={loading}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                document.getElementById("login-modal")?.classList.add("show")
              }
              disabled={loading}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Login
            </button>
          )}
        </div>
      </redrob-navbar>

      {/* Main content */}
      <main style={{ minHeight: "70vh", padding: "2rem" }}>
        <h1>Welcome to My App</h1>

        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              borderRadius: "0.375rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {authenticated ? (
          <div>
            <h2>You are logged in!</h2>
            <p>Email: {user?.email}</p>
            {user?.name && <p>Name: {user.name}</p>}
          </div>
        ) : (
          <div>
            <h2>Please log in to continue</h2>
          </div>
        )}
      </main>

      {/* Footer with user info - will automatically show user details when logged in */}
      <redrob-footer
        copyright="© 2024 My App. All rights reserved."
        links={JSON.stringify(footerLinks)}
        socialLinks={JSON.stringify(socialLinks)}
        show-user
      >
        <div slot="brand">
          <h3 style={{ color: "white", marginBottom: "0.5rem" }}>My App</h3>
          <p style={{ fontSize: "0.875rem" }}>
            Building amazing things together
          </p>
        </div>
        <div slot="extra">
          <p style={{ fontSize: "0.875rem" }}>
            Need help? <a href="/support">Contact Support</a>
          </p>
        </div>
      </redrob-footer>

      {/* Login Modal */}
      <div
        id="login-modal"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.currentTarget.classList.remove("show");
          }
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "0.5rem",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>Login</h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("login-modal")
                    ?.classList.remove("show")
                }
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        #login-modal.show {
          display: flex !important;
        }
      `}</style>
    </div>
  );
}

export default App;
