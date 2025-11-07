class SiteNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav>
                <ul>
                    <li><a href="index.html" id="homenav" title="Home | coryfugate.com">Home</a></li>
                    <li><a href="resume.html" id="resumenav" title="Resume | coryfugate.com">Resume</a></li>
                    <li><a href="portfolio.html" id="portfolionav" title="Portfolio | coryfugate.com">Portfolio</a></li>
                    <li><a href="contact.html" id="contactnav" title="Contact | coryfugate.com">Contact</a></li>
                </ul>
            </nav>
        `;
    }
}

customElements.define('site-nav', SiteNav);