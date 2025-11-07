class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer>
                <div>
                    <ul>
                        <li>&copy;2012 Cory Fugate</li>
                    </ul>
                </div>
            </footer>
        `;
    }
}

customElements.define('site-footer', SiteFooter);