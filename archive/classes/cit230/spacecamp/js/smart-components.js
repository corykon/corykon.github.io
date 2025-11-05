// Enhanced Web Components with smart path resolution
class SpaceHeader extends HTMLElement {
    connectedCallback() {
        const basePath = this.getBasePath();
        this.innerHTML = `
            <form method="get" action="http://www.google.com/search">
                <div style="width:300px;float:right; color:#FFFFFF;">
                    <table border="0" cellpadding="0">
                        <tr>
                            <td><input type="text" name="q" size="25" maxlength="255" value="" /></td>
                            <td><input type="submit" value="Search the Web" /></td>
                        </tr>
                    </table>
                </div>
            </form>
            <h1><img src="${basePath}images/spacecamplogo.png" width="753" height="37" alt="Space Camp" /></h1>
        `;
    }

    getBasePath() {
        // Determine relative path based on current page location
        const path = window.location.pathname;
        if (path.includes('/pages/activities/')) {
            return '../../';
        } else if (path.includes('/pages/')) {
            return '../';
        }
        return '';
    }
}

class SpaceNav extends HTMLElement {
    connectedCallback() {
        const basePath = this.getBasePath();
        const pagePath = this.getPagePath();
        
        this.innerHTML = `
            <dl>
                <dt><a href="${pagePath}index.html" id="homenav" title="Homepage @ Space Camp">
                    <img src="${basePath}images/homenav.png" alt="Home" />
                </a></dt>
                <dt><a href="${pagePath}pages/activities/activities.html" id="activitiesnav" title="Activities @ Space Camp">
                    <img src="${basePath}images/activitiesnav.png" alt="Activities" />
                </a></dt>
                <dt><a href="${pagePath}pages/qualifications.html" id="qualificationsnav" title="How do you qualify? @ Space Camp">
                    <img src="${basePath}images/qualificationsnav.png" alt="Qualifications" />
                </a></dt>
                <dt><a href="${pagePath}pages/staff.html" id="staffnav" title="Staff @ Space Camp">
                    <img src="${basePath}images/staffnav.png" alt="Staff" />
                </a></dt>
                <dt><a href="mailto:cory.fugate@gmail.com" id="contactnav" title="Contact us">
                    <img src="${basePath}images/contactnav.png" alt="Contact" />
                </a></dt>
            </dl>
        `;
    }

    getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/activities/')) {
            return '../../';
        } else if (path.includes('/pages/')) {
            return '../';
        }
        return '';
    }

    getPagePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/activities/')) {
            return '../../';
        } else if (path.includes('/pages/')) {
            return '../';
        }
        return '';
    }
}

class SpaceFooter extends HTMLElement {
    connectedCallback() {
        const pagePath = this.getPagePath();
        
        this.innerHTML = `
            <a href="${pagePath}pages/copyright.html" title="View Copyright Information">
                &copy;2010 Space Camp, All Rights Reserved.
            </a>
            <div id="footernav">
                <dl>
                    <dt><a href="mailto:cory.fugate@gmail.com" title="Contact">Contact</a></dt>
                    <dt> | <a href="${pagePath}pages/colophon.html" title="View the Colophon for SpaceCamp.">Colophon</a></dt>
                    <dt> | <a href="${pagePath}pages/siteplan.html" title="View the Site Plan for SpaceCamp">Site Plan</a></dt>
                    <dt> | <a href="${pagePath}pages/resources.html" title="View the Resources used in SpaceCamp">Resources</a></dt>
                </dl>
                <br />Last Update: 7 April 2010
            </div>
            <br /><br />Designed by Cory Fugate | <em>*This site uses CSS 3.</em>
        `;
    }

    getPagePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/activities/')) {
            return '../../';
        } else if (path.includes('/pages/')) {
            return '../';
        }
        return '';
    }
}

class ActivitiesNav extends HTMLElement {
    connectedCallback() {
        const pagePath = this.getPagePath();
        
        this.innerHTML = `
            <p class="activitiesnavheading"><strong>&copy;Space Exploration Programs:</strong></p>
            <dl>
                <dt><a href="${pagePath}pages/activities/zerogravity.html" id="zerogravnav" title="Zero-Gravity @spacecamp.com">
                    Zero-Gravity Training
                </a></dt>
                <dt><a href="${pagePath}pages/activities/gforce.html" id="gforcenav" title="G-Force Training @spacecamp.com">
                    G-Force Training
                </a></dt>
                <dt><a href="${pagePath}pages/activities/marswallclimb.html" id="marswallnav" title="Mars Wall Climb @spacecamp.com">
                    Mars Wall Climb
                </a></dt>
                <dt><a href="${pagePath}pages/activities/commandcenter.html" id="commandnav" title="Command Center @spacecamp.com">
                    Command Center Training
                </a></dt>
            </dl>
        `;
    }

    getPagePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/activities/')) {
            return '../../';
        } else if (path.includes('/pages/')) {
            return '../';
        }
        return '';
    }
}

// Register the custom elements
customElements.define('space-header', SpaceHeader);
customElements.define('space-nav', SpaceNav);
customElements.define('space-footer', SpaceFooter);
customElements.define('activities-nav', ActivitiesNav);