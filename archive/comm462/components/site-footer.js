class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <ul class="social">
                <li><a href="http://www.facebook.com/ckfugate" title="facebook me" class="fb"></a></li>
                <li><a href="https://twitter.com/#!/corykonfugate" title="follow me" class="twitter"></a></li>
                <li><a href="http://www.linkedin.com/pub/cory-fugate/44/434/768" title="connect with me" class="linkedin"></a></li>
            </ul>
            <ul class="copyright">
                <li><a href ="copyright.html" title="Copyright Stuff | coryfugate.com">&copy;2012 Cory Fugate</a> | </li>
                <li><a href ="sitemap.html" title="Site Map | coryfugate.com">Site Map</a></li>
                <li class="comm462">Made for COMM462</li>
            </ul>
        `;
    }
}

customElements.define('site-footer', SiteFooter);