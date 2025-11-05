// Custom Web Components for SpaceCamp includes
class SpaceHeader extends HTMLElement {
    connectedCallback() {
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
            <h1><img src="images/spacecamplogo.png" width="753" height="37" alt="Space Camp" /></h1>
        `;
    }
}

class SpaceNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <dl>
                <dt><a href="index.html" id="homenav" title="Homepage @ Space Camp">
                    <img src="images/homenav.png" alt="Home" />
                </a></dt>
                <dt><a href="pages/activities/activities.html" id="activitiesnav" title="Activities @ Space Camp">
                    <img src="images/activitiesnav.png" alt="Activities" />
                </a></dt>
                <dt><a href="pages/qualifications.html" id="qualificationsnav" title="How do you qualify? @ Space Camp">
                    <img src="images/qualificationsnav.png" alt="Qualifications" />
                </a></dt>
                <dt><a href="pages/staff.html" id="staffnav" title="Staff @ Space Camp">
                    <img src="images/staffnav.png" alt="Staff" />
                </a></dt>
                <dt><a href="mailto:cory.fugate@gmail.com" id="contactnav" title="Contact us">
                    <img src="images/contactnav.png" alt="Contact" />
                </a></dt>
            </dl>
        `;
    }
}

class SpaceFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <a href="pages/copyright.html" title="View Copyright Information">
                &copy;2010 Space Camp, All Rights Reserved.
            </a>
            <div id="footernav">
                <dl>
                    <dt><a href="mailto:cory.fugate@gmail.com" title="Contact">Contact</a></dt>
                    <dt> | <a href="pages/colophon.html" title="View the Colophon for SpaceCamp.">Colophon</a></dt>
                    <dt> | <a href="pages/siteplan.html" title="View the Site Plan for SpaceCamp">Site Plan</a></dt>
                    <dt> | <a href="pages/resources.html" title="View the Resources used in SpaceCamp">Resources</a></dt>
                </dl>
                <br />Last Update: 7 April 2010
            </div>
            <br /><br />Designed by Cory Fugate | <em>*This site uses CSS 3.</em>
        `;
    }
}

class ActivitiesNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <p class="activitiesnavheading"><strong>&copy;Space Exploration Programs:</strong></p>
            <dl>
                <dt><a href="pages/activities/zerogravity.html" id="zerogravnav" title="Zero-Gravity @spacecamp.com">
                    Zero-Gravity Training
                </a></dt>
                <dt><a href="pages/activities/gforce.html" id="gforcenav" title="G-Force Training @spacecamp.com">
                    G-Force Training
                </a></dt>
                <dt><a href="pages/activities/marswallclimb.html" id="marswallnav" title="Mars Wall Climb @spacecamp.com">
                    Mars Wall Climb
                </a></dt>
                <dt><a href="pages/activities/commandcenter.html" id="commandnav" title="Command Center @spacecamp.com">
                    Command Center Training
                </a></dt>
            </dl>
        `;
    }
}

// Register the custom elements
customElements.define('space-header', SpaceHeader);
customElements.define('space-nav', SpaceNav);
customElements.define('space-footer', SpaceFooter);
customElements.define('activities-nav', ActivitiesNav);