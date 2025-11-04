<h4>Life Journal*</h4>

<ul>
    <?php
        foreach($contentlist as $item){
    echo '<li><a href="/classes/fdrel261/history/?view='.$item[0].'" title="'.$item[1].'">'.$item[1].'</a></li>';
        }?>
  
</ul>

<h4>Personal History</h4>
<ul>
    <li><a href="/classes/fdrel261/home.php" title="Home">Home</a></li>
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