

<h4>Personal History</h4>

<ul>
    <li><a href="/classes/fdrel261/birth.php" title="Birth and Infancy">Birth and Infancy</a></li>
    <li><a href="/classes/fdrel261/toddler.php" title="As a Toddler">As a Toddler</a></li>
    <li><a href="/classes/fdrel261/childhood.php" title="Early Childhood">Early Childhood</a></li>
    <li><a href="/classes/fdrel261/firsthome.php" title="Memories of Stonehenge Drive">Memories of Stonehenge Drive</a></li>
    <li><a href="/classes/fdrel261/extendedfam.php" title="Memories with Extended Family">Memories with Extended Family</a></li>
    <li><a href="/classes/fdrel261/kindergarten.php" title="Kindergarten">Kindergarten (93'-94' - Age 5)</a></li>
    <li><a href="/classes/fdrel261/firstgrade.php" title="First Grade">First Grade (94'-95' - Age 6)</a></li>
    <li><a href="/classes/fdrel261/secondgrade.php" title="Second Grade">Second Grade (95'-96' - Age 7)</a></li>
    <li><a href="/classes/fdrel261/thirdgrade.php" title="Third Grade">Third Grade (96'-97' - Age 8)</a></li>
    <li><a href="/classes/fdrel261/fourthgrade.php" title="Fourth Grade">Fourth Grade (97'-98' - Age 9)</a></li>
    <li><a href="/classes/fdrel261/fifthgrade.php" title="Fifth Grade">Fifth Grade (98'-99' - Age 10)</a></li>
    <li><a href="/classes/fdrel261/sixthgrade.php" title="Sixth Grade">Sixth Grade (99'-00' - Age 11)</a></li>
    <li><a href="/classes/fdrel261/seventhgrade.php" title="Seventh Grade">Seventh Grade (00'-01' - Age 12)</a></li>
    <li><a href="/classes/fdrel261/eighthgrade.php" title="Eighth Grade">Eighth Grade (01'-02' - Age 13)</a></li>
    <li><a href="/classes/fdrel261/freshman.php" title="Freshman Year">Freshman Year (02'-03' - Age 14)</a></li>
    <li><a href="/classes/fdrel261/sophomore.php" title="Sophomore Year">Sophomore Year (03'-04' - Age 15)</a></li>
    <li><a href="/classes/fdrel261/junior.php" title="Junior Year">Junior Year (04'-05' - Age 16)</a></li>
    <li><a href="/classes/fdrel261/senior.php" title="Senior Year">Senior Year (05'-06' - Age 17)</a></li>
    <li><a href="/classes/fdrel261/missionprep.php" title="Mission Prep">Mission Prep (06'-07' - Age 18)</a></li>
    <li><a href="/classes/fdrel261/missionyear1.php" title="Mission Year 1">1st Yr Missionary Service (07'-08' - Age 19)</a></li>
    <li><a href="/classes/fdrel261/missionyear2.php" title="Mission Year 2">2nd Yr Missionary Service (08'-09' - Age 20)</a></li>
    <li><a href="/classes/fdrel261/byui.php" title="Attending BYU-I">Attending BYU-I (09'-11' - Ages 21-22)</a></li>

</ul>

<ul>
    <li><a href="/classes/fdrel261/timeline.php" title="Personal History Timeline">Personal History Timeline</a></li>
    <li><a href="/classes/fdrel261/viewoflife.php" title="View of Life">View of Life/Testimony</a></li>
    <li><a href="/classes/fdrel261/goals.php" title="Personal Goals">Goals and Plans</a></li>
    <li><a href="/classes/fdrel261/mydocs.php" title="Documents">Documents of Note</a></li>

</ul>

<h4>Family History</h4>
<ul>
    <li><a href="/classes/fdrel261/pedigreecharts.php" title="Pedigree Charts">Pedigree Charts</a></li>
    <li><a href="/classes/fdrel261/famgroupsheets.php" title="Family Group Sheets">Family Group Sheets</a></li>
    <li><a href="/classes/fdrel261/writtenhistories.php" title="Written Histories">Written Histories</a></li>
</ul>

<div id="contact"><a href="/classes/fdrel261/contact.php" title="Send Cory an email!"><div><span>Contact Me</span></div></a></div>

<?php if (!$loginflag) { ?>
<p> *You don't currently have permission to view personal history content.</p>
<?php } ?>
    

<div id="loginlinks">

    <?php
    if($loginflag){
        echo '<h6>Welcome, '.$loginfirst.'.</h6>
            | <a href="/classes/fdrel261/tools/?logout=yes.php" title="Logout">Logout</a>';
        if($loginlevel > 3){
            echo ' | <a href="/classes/fdrel261/tools/admin.php" title="Admin Tools">Admin Tools</a>';
        }
    }else{
        echo '<a href="/classes/fdrel261/tools/view/registration.php" title="Register">Register</a>&nbsp;|&nbsp;';
        echo '<a href="/classes/fdrel261/tools/view/login.php" title="Login">Login</a>';
    } ?>
</div>