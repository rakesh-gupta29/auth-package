import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("redrob-navbar")
export class RedrobNavbar extends LitElement {
  @property({ type: String }) logo = "";
  @property({ type: String }) title = "My App";
  @property({ type: Array }) links: Array<{ label: string; href: string }> = [];

  static styles = css`
    :host {
      display: block;
    }

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      background-color: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      text-decoration: none;
    }

    .nav-brand img {
      height: 2rem;
      width: auto;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      color: #6b7280;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-links a:hover {
      color: #111827;
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      nav {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-links {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `;

  render() {
    return html`
      <nav>
        <a href="/" class="nav-brand">
          ${this.logo
            ? html`<img src="${this.logo}" alt="${this.title}" />`
            : ""}
          <span>${this.title}</span>
        </a>

        ${this.links.length > 0
          ? html`
              <ul class="nav-links">
                ${this.links.map(
                  (link) => html`
                    <li>
                      <a href="${link.href}">${link.label}</a>
                    </li>
                  `
                )}
              </ul>
            `
          : ""}

        <div class="nav-actions">
          <slot name="actions"></slot>
        </div>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "redrob-navbar": RedrobNavbar;
  }
}
