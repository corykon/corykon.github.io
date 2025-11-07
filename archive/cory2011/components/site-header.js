class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <h1><span>coryfugate.com</span><img src="images/cory-logo.png" alt="coryfugate.com" /></h1>
        `;
    }
}

customElements.define('site-header', SiteHeader);