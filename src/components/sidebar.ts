import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('redrob-sidebar')
export class RedrobSidebar extends LitElement {
  @property({ type: Boolean }) open = true;
  @property({ type: String }) position: 'left' | 'right' = 'left';
  @property({ type: Array }) items: Array<{ label: string; href: string; icon?: string }> = [];

  static styles = css`
    :host {
      display: block;
    }

    .sidebar {
      position: fixed;
      top: 0;
      height: 100vh;
      width: 250px;
      background-color: #ffffff;
      border-right: 1px solid #e5e7eb;
      transition: transform 0.3s ease-in-out;
      overflow-y: auto;
      z-index: 1000;
    }

    .sidebar.left {
      left: 0;
    }

    .sidebar.right {
      right: 0;
      border-right: none;
      border-left: 1px solid #e5e7eb;
    }

    .sidebar.closed.left {
      transform: translateX(-100%);
    }

    .sidebar.closed.right {
      transform: translateX(100%);
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .sidebar-content {
      padding: 1rem 0;
    }

    .sidebar-items {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .sidebar-item {
      margin: 0;
    }

    .sidebar-item a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      color: #6b7280;
      text-decoration: none;
      transition: background-color 0.2s, color 0.2s;
    }

    .sidebar-item a:hover {
      background-color: #f3f4f6;
      color: #111827;
    }

    .sidebar-item .icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      display: none;
    }

    .overlay.visible {
      display: block;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 280px;
      }
    }
  `;

  private handleOverlayClick() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('toggle', { detail: { open: false } }));
  }

  render() {
    return html`
      <div class="overlay ${this.open ? 'visible' : ''}" @click=${this.handleOverlayClick}></div>

      <aside class="sidebar ${this.position} ${this.open ? '' : 'closed'}">
        <div class="sidebar-header">
          <slot name="header"></slot>
        </div>

        <div class="sidebar-content">
          ${this.items.length > 0
            ? html`
                <ul class="sidebar-items">
                  ${this.items.map(
                    (item) => html`
                      <li class="sidebar-item">
                        <a href="${item.href}">
                          ${item.icon ? html`<span class="icon">${item.icon}</span>` : ''}
                          <span>${item.label}</span>
                        </a>
                      </li>
                    `
                  )}
                </ul>
              `
            : html`<slot></slot>`}
        </div>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'redrob-sidebar': RedrobSidebar;
  }
}
