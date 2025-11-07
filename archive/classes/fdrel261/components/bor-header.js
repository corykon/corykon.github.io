class BorHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <header>
                <h1><span>Cory K. Fugate</span></h1>
                <h2><span>Book of Remembrance</span></h2>
            </header>
        `;
    }
}

customElements.define('bor-header', BorHeader);