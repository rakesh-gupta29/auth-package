import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { User, UserCredits } from '../auth/types.js';
import { AUTH_STATE_CHANGED } from '../auth/auth.js';

@customElement('redrob-footer')
export class RedrobFooter extends LitElement {
  @property({ type: String }) copyright = '';
  @property({ type: Array }) links: Array<{ label: string; href: string }> = [];
  @property({ type: Array }) socialLinks: Array<{ platform: string; href: string; icon?: string }> = [];
  @property({ type: Boolean, attribute: 'show-user' }) showUser = false;

  @state() private user: User | null = null;
  @state() private credits: UserCredits | null = null;
  @state() private isAuthenticated = false;

  static styles = css`
    :host {
      display: block;
    }

    footer {
      background-color: #111827;
      color: #9ca3af;
      padding: 2rem;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .footer-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .footer-section {
      flex: 1;
      min-width: 200px;
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .footer-links a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: #ffffff;
    }

    .social-links {
      display: flex;
      gap: 1rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .social-links a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s;
      font-size: 1.25rem;
    }

    .social-links a:hover {
      color: #ffffff;
    }

    .footer-bottom {
      border-top: 1px solid #374151;
      padding-top: 1.5rem;
      text-align: center;
    }

    .copyright {
      font-size: 0.875rem;
    }

    .user-info {
      padding: 0.75rem 1rem;
      background-color: #1f2937;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-email {
      font-size: 0.875rem;
      color: #d1d5db;
      font-weight: 500;
    }

    .user-name {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .user-credits {
      font-size: 0.75rem;
      color: #60a5fa;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .footer-main {
        flex-direction: column;
      }

      .footer-section {
        width: 100%;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();

    if (this.showUser) {
      // Fetch user data when component is mounted
      this.loadUserData();

      // Listen for auth state changes
      window.addEventListener(AUTH_STATE_CHANGED, this.handleAuthStateChange);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(AUTH_STATE_CHANGED, this.handleAuthStateChange);
  }

  private handleAuthStateChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ authenticated: boolean; user: User | null }>;
    this.isAuthenticated = customEvent.detail.authenticated;
    this.user = customEvent.detail.user;

    if (this.isAuthenticated && this.user) {
      this.loadCredits();
    } else {
      this.user = null;
      this.credits = null;
    }
  };

  private async loadUserData() {
    try {
      // Dynamically import to avoid circular dependencies
      const { isAuthenticated, getUserProfile, getUserCredits } = await import('../auth/auth.js');

      if (isAuthenticated()) {
        this.isAuthenticated = true;
        const [user, credits] = await Promise.all([
          getUserProfile().catch(() => null),
          getUserCredits().catch(() => null),
        ]);
        this.user = user;
        this.credits = credits;
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  private async loadCredits() {
    try {
      const { getUserCredits } = await import('../auth/auth.js');
      this.credits = await getUserCredits().catch(() => null);
    } catch (error) {
      console.error('Failed to load credits:', error);
    }
  }

  render() {
    return html`
      <footer>
        <div class="footer-content">
          <div class="footer-main">
            <div class="footer-section">
              <slot name="brand"></slot>
            </div>

            ${this.links.length > 0
              ? html`
                  <div class="footer-section">
                    <ul class="footer-links">
                      ${this.links.map(
                        (link) => html`
                          <li>
                            <a href="${link.href}">${link.label}</a>
                          </li>
                        `
                      )}
                    </ul>
                  </div>
                `
              : ''}

            ${this.socialLinks.length > 0
              ? html`
                  <div class="footer-section">
                    <ul class="social-links">
                      ${this.socialLinks.map(
                        (social) => html`
                          <li>
                            <a href="${social.href}" aria-label="${social.platform}">
                              ${social.icon ? social.icon : social.platform}
                            </a>
                          </li>
                        `
                      )}
                    </ul>
                  </div>
                `
              : ''}

            <div class="footer-section">
              <slot name="extra"></slot>
            </div>

            ${this.showUser && this.isAuthenticated && this.user
              ? html`
                  <div class="footer-section">
                    <div class="user-info">
                      <div class="user-details">
                        <div class="user-email">${this.user.email}</div>
                        ${this.user.name ? html`<div class="user-name">${this.user.name}</div>` : ''}
                        ${this.credits
                          ? html`<div class="user-credits">
                              Credits: ${this.credits.available}/${this.credits.total}
                            </div>`
                          : ''}
                      </div>
                    </div>
                  </div>
                `
              : ''}
          </div>

          <div class="footer-bottom">
            <p class="copyright">
              ${this.copyright || html`<slot name="copyright"></slot>`}
            </p>
          </div>
        </div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'redrob-footer': RedrobFooter;
  }
}
