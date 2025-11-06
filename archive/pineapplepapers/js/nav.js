class NavComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav>
                <ul>
                    <li><a href="index.html" title="homepage">home</a></li>
                    <li><a href="howitworks.html" title="how it works">how it works</a></li>
                    <li><a href="designs.html" title="view our wedding, invite, and greeting stationery designs">designs</a></li>
                    <li><a href="shop.html" title="purchase printable DIY stationery from our etsy shop">shop</a></li>
                    <li><a href="blog.html" title="visit my blog">blog</a></li>
                    <li><a href="contact.html" title="get in touch with me">contact</a></li>
                </ul>
            </nav>
        `;
    }
}

customElements.define('pp-nav', NavComponent);