class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <h1><a href="index.html" title="Homepage :: Cory Fugate"><img src="images/logo.png" alt="Design and Development Patch"></a></h1>

            <nav>
            <ul>
                <li><a href ="bio.html" id="bionav" title="Bio | coryfugate.com">Bio</a></li>
                <li><a href ="resume.html" id="resumenav" title="Resume | coryfugate.com">Resume</a></li>
                <li id="portfolionav"><a href ="portfolio.html" title="Portfolio | coryfugate.com">Portfolio</a>
                    <ul>
                        <li><a href="photos.html" title ="Photography Portfolio | coryfugate.com">Photography</a></li>
                        <li><a href="product.html" title ="Product Redesign | coryfugate.com">Product Redesign</a></li>
                        <li><a href="logo.html" title ="Logo Design Portfolio | coryfugate.com">Logo Design</a></li>
                        <li><a href="web.html" title ="Web Design Portfolio | coryfugate.com">Web Design</a></li>
                        <li><a href="print.html" title ="Print Design Portfolio | coryfugate.com">Print Design</a></li>
                        <li><a href="podcast.html" title ="Podcast | coryfugate.com">Podcast</a></li>
                        <li><a href="selfport.html" title ="Self-portrait | coryfugate.com">Self-portrait</a></li>
                    </ul>
                </li>
                <li> <a href ="contact.html" id="contactnav" title="Contact | coryfugate.com">Contact</a></li>
            </ul>
            </nav>
        `;
    }
}

customElements.define('site-header', SiteHeader);