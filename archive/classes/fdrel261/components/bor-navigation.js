class BorNavigation extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <h4>Personal History</h4>
            <ul>
            <li><a href="home.html" title="Home page">Home</a></li>
                <li><a href="toddler.html" title="As a Toddler">As a Toddler</a></li>
                <li><a href="childhood.html" title="Early Childhood">Early Childhood</a></li>
                <li><a href="firsthome.html" title="Memories of Stonehenge Drive">Memories of Stonehenge Drive</a></li>
                <li><a href="extendedfam.html" title="Memories with Extended Family">Memories with Extended Family</a></li>
                <li><a href="kindergarten.html" title="Kindergarten">Kindergarten (93'-94' - Age 5)</a></li>
                <li><a href="firstgrade.html" title="First Grade">First Grade (94'-95' - Age 6)</a></li>
                <li><a href="secondgrade.html" title="Second Grade">Second Grade (95'-96' - Age 7)</a></li>
                <li><a href="thirdgrade.html" title="Third Grade">Third Grade (96'-97' - Age 8)</a></li>
                <li><a href="fourthgrade.html" title="Fourth Grade">Fourth Grade (97'-98' - Age 9)</a></li>
                <li><a href="fifthgrade.html" title="Fifth Grade">Fifth Grade (98'-99' - Age 10)</a></li>
                <li><a href="sixthgrade.html" title="Sixth Grade">Sixth Grade (99'-00' - Age 11)</a></li>
                <li><a href="seventhgrade.html" title="Seventh Grade">Seventh Grade (00'-01' - Age 12)</a></li>
                <li><a href="eighthgrade.html" title="Eighth Grade">Eighth Grade (01'-02' - Age 13)</a></li>
                <li><a href="freshman.html" title="Freshman Year">Freshman Year (02'-03' - Age 14)</a></li>
                <li><a href="sophomore.html" title="Sophomore Year">Sophomore Year (03'-04' - Age 15)</a></li>
                <li><a href="junior.html" title="Junior Year">Junior Year (04'-05' - Age 16)</a></li>
                <li><a href="senior.html" title="Senior Year">Senior Year (05'-06' - Age 17)</a></li>
                <li><a href="missionprep.html" title="Mission Prep">Mission Prep (06'-07' - Age 18)</a></li>
                <li><a href="missionyear1.html" title="Mission Year 1">1st Yr Missionary Service (07'-08' - Age 19)</a></li>
                <li><a href="missionyear2.html" title="Mission Year 2">2nd Yr Missionary Service (08'-09' - Age 20)</a></li>
                <li><a href="byui.html" title="Attending BYU-I">Attending BYU-I (09'-11' - Ages 21-22)</a></li>
            </ul>

            <ul>
                <li><a href="timeline.html" title="Personal History Timeline">Personal History Timeline</a></li>
                <li><a href="viewoflife.html" title="View of Life">View of Life/Testimony</a></li>
                <li><a href="goals.html" title="Personal Goals">Goals and Plans</a></li>
            </ul>

            <h4>Family History</h4>
            <ul>
                <li><a href="pedigreecharts.html" title="Pedigree Charts">Pedigree Charts</a></li>
                <li><a href="famgroupsheets.html" title="Family Group Sheets">Family Group Sheets</a></li>
                <li><a href="writtenhistories.html" title="Written Histories">Written Histories</a></li>
            </ul>

            <div id="contact"><a href="contact.html" title="Send Cory an email!"><div><span>Contact Me</span></div></a></div>
        `;
    }
}

customElements.define('bor-navigation', BorNavigation);