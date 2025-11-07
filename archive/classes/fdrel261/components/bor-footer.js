class BorFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <ul>
                <li>&copy; 2011 Cory Fugate </li>
                <li class="subdetail">Created for a family history class at BYU-Idaho</li>
            </ul>
        `;
    }
}

customElements.define('bor-footer', BorFooter);