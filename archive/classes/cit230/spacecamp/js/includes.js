// Simple JavaScript include system
const SpaceComponents = {
    // Determine base path for current page
    getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/activities/')) return '../../';
        if (path.includes('/pages/')) return '../';
        return '';
    },

    // Load header content
    loadHeader(containerId) {
        const basePath = this.getBasePath();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
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
    },

    // Load navigation content  
    loadNav(containerId) {
        const basePath = this.getBasePath();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <dl>
                    <dt><a href="${basePath}index.html" id="homenav" title="Homepage @ Space Camp">
                        <img src="${basePath}images/homenav.png" alt="Home" />
                    </a></dt>
                    <dt><a href="${basePath}pages/activities/activities.html" id="activitiesnav" title="Activities @ Space Camp">
                        <img src="${basePath}images/activitiesnav.png" alt="Activities" />
                    </a></dt>
                    <dt><a href="${basePath}pages/qualifications.html" id="qualificationsnav" title="How do you qualify? @ Space Camp">
                        <img src="${basePath}images/qualificationsnav.png" alt="Qualifications" />
                    </a></dt>
                    <dt><a href="${basePath}pages/staff.html" id="staffnav" title="Staff @ Space Camp">
                        <img src="${basePath}images/staffnav.png" alt="Staff" />
                    </a></dt>
                    <dt><a href="mailto:cory.fugate@gmail.com" id="contactnav" title="Contact us">
                        <img src="${basePath}images/contactnav.png" alt="Contact" />
                    </a></dt>
                </dl>
            `;
        }
    },

    // Load footer content
    loadFooter(containerId) {
        const basePath = this.getBasePath();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <a href="${basePath}pages/copyright.html" title="View Copyright Information">
                    &copy;2010 Space Camp, All Rights Reserved.
                </a>
                <div id="footernav">
                    <dl>
                        <dt><a href="mailto:cory.fugate@gmail.com" title="Contact">Contact</a></dt>
                        <dt> | <a href="${basePath}pages/colophon.html" title="View the Colophon for SpaceCamp.">Colophon</a></dt>
                        <dt> | <a href="${basePath}pages/siteplan.html" title="View the Site Plan for SpaceCamp">Site Plan</a></dt>
                        <dt> | <a href="${basePath}pages/resources.html" title="View the Resources used in SpaceCamp">Resources</a></dt>
                    </dl>
                    <br />Last Update: 7 April 2010
                </div>
                <br /><br />Designed by Cory Fugate | <em>*This site uses CSS 3.</em>
            `;
        }
    },

    // Load activities navigation
    loadActivitiesNav(containerId) {
        const basePath = this.getBasePath();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <p class="activitiesnavheading"><strong>&copy;Space Exploration Programs:</strong></p>
                <dl>
                    <dt><a href="${basePath}pages/activities/zerogravity.html" id="zerogravnav" title="Zero-Gravity @spacecamp.com">
                        Zero-Gravity Training
                    </a></dt>
                    <dt><a href="${basePath}pages/activities/gforce.html" id="gforcenav" title="G-Force Training @spacecamp.com">
                        G-Force Training
                    </a></dt>
                    <dt><a href="${basePath}pages/activities/marswallclimb.html" id="marswallnav" title="Mars Wall Climb @spacecamp.com">
                        Mars Wall Climb
                    </a></dt>
                    <dt><a href="${basePath}pages/activities/commandcenter.html" id="commandnav" title="Command Center @spacecamp.com">
                        Command Center Training
                    </a></dt>
                </dl>
            `;
        }
    },

    // Initialize all components on page load
    init() {
        this.loadHeader('header-content');
        this.loadNav('nav-content');
        this.loadFooter('footer-content');
        this.loadActivitiesNav('activities-nav-content');
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SpaceComponents.init();
});