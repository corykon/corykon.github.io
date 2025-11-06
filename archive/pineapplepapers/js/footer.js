class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer>
                <h6>&copy;2011 Pineapple Papers</h6>
            </footer>
        `;
    }
}

customElements.define('pp-footer', FooterComponent);