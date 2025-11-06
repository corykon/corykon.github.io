// Web Components for COMM310 Site

// Header Component
class Comm310Header extends HTMLElement {
    connectedCallback() {
        // Get the current page path to determine relative image path
        const currentPath = window.location.pathname;
        let imagePath = 'images/comm310header.jpg';
        
        // If we're in a subdirectory, adjust the path
        if (currentPath.includes('/htmlpgs/') || currentPath.includes('/csspgs/') || currentPath.includes('/phppgs/') || currentPath.includes('/assignmentpgs/')) {
            imagePath = '../images/comm310header.jpg';
        }
        
        this.innerHTML = `
            <h1>
                <span>COMM310 Guide</span>
                <img src="${imagePath}" alt="A Guide to COMM 310: Creating Online Media" />
            </h1>
        `;
    }
}

// Navigation Component  
class Comm310Nav extends HTMLElement {
    connectedCallback() {
        // Get the current page path to determine relative navigation paths
        const currentPath = window.location.pathname;
        let basePath = '';
        
        // If we're in a subdirectory, adjust the base path
        if (currentPath.includes('/htmlpgs/') || currentPath.includes('/csspgs/') || currentPath.includes('/phppgs/') || currentPath.includes('/assignmentpgs/')) {
            basePath = '../';
        }
        
        this.innerHTML = `
            <div id="nav">
                <ul>
                    <li><a href="${basePath}index.html" title="Home | COM310 Guide">| Home</a></li>
                    <li><a href="${basePath}overview.html" title="Overview | COM310 Guide">| Overview</a></li>
                    <li><a href="${basePath}htmlpgs/index.html" title="HTML | COM310 Guide">| HTML</a>
                        <ul>
                            <li><a href="${basePath}htmlpgs/index.html" title="HTML | COM310 Guide">Intro</a></li>
                            <li><a href="${basePath}htmlpgs/htmlbasics.html" title ="HTML basics | CIT330 GUIDE">Basics</a></li>
                            <li><a href="${basePath}htmlpgs/text.html" title ="HTML Text | CIT330 GUIDE">Text</a></li>
                            <li><a href="${basePath}htmlpgs/links.html" title ="HTML Links | CIT330 GUIDE">Links</a></li>
                        </ul>
                    </li>
                    <li><a href="${basePath}csspgs/index.html" title="CSS | COM310 Guide">| CSS</a>
                        <ul>
                            <li><a href="${basePath}csspgs/index.html" title="CSS | COM310 Guide">Intro</a></li>
                            <li><a href="${basePath}csspgs/cssbasics.html" title ="CSS basics | CIT330 GUIDE">Basics</a></li>
                            <li><a href="${basePath}csspgs/text.html" title ="CSS Text | CIT330 GUIDE">Text</a></li>
                            <li><a href="${basePath}csspgs/links.html" title ="CSS Links | CIT330 GUIDE">Links</a></li>
                        </ul>
                    </li>
                    <li><a href="${basePath}phppgs/index.html" title="PHP | COM310 Guide">| PHP</a>
                        <ul>
                            <li><a href="${basePath}phppgs/index.html" title="PHP | COM310 Guide">Intro</a></li>
                            <li><a href="${basePath}phppgs/phpprimer.html" title ="PHP primer | CIT330 GUIDE">Primer</a></li>
                        </ul>
                    </li>
                    <li><a href="${basePath}assignmentpgs/index.html" title="Assignments | COM310 Guide">| Assignments</a>
                        <ul>
                            <li><a href="${basePath}csszen/index.html" title= "Css Zen assignment">Css Jurrasic Garden</a></li>
                            <li><a href="${basePath}bigjuds/index.html" title ="Big Jud's Redesign">Big Jud's Redesign</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        `;
    }
}

// Footer Component
class Comm310Footer extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div id="footer">
                <p>&copy; 2011 Cory Fugate</p>
            </div>
        `;
    }
}

// Register the custom elements
customElements.define('comm310-header', Comm310Header);
customElements.define('comm310-nav', Comm310Nav);
customElements.define('comm310-footer', Comm310Footer);