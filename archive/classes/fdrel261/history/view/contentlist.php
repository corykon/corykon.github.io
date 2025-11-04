<?php
    $sid = session_id();
    if(empty($sid)){
        session_start();
    }

    if (isset($_SESSION['content'])){
        $contentlist = $_SESSION['content'];
    }
    /*Get info for currently logged in user */
    $loginflag = $_SESSION['userlogin'];
    $loginfirst = $_SESSION['userfirst'];
    $loginlast = $_SESSION['userlast'];
    $loginlevel = $_SESSION['userlevel'];

    if(!$loginflag || $loginlevel < 2){
        header('Location: ../../');
        exit;

    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Admin Life Journal Content List | BofR</title>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="../../css/borstyle.css" />
    </head>
    <body>
        <header>
        <h1><span>Cory K. Fugate</span></h1>
        <h2><span>Book of Remembrance</span></h2>

        </header>

    <div id="flourish"></div>
    <section id="content">
        <?php
        $count = count($contentlist);
        if ($count > 0){
            echo "<h3>List of Life Journal Content</h3>";
            echo "<table>";
            echo "<tr class='firstrow'><td>Num</td><td>Content Title</td></tr>";

            for($i=0; $i<$count; $i++){
                 echo "<tr>";
                 $subcount = count($contentlist[$i]);
                 if ($loginlevel < 3){
                     --$subcount;
                 }
                 for($n=0; $n<$subcount; $n++){
                    echo "<td>".$contentlist[$i][$n]."</td>";
                 }
                 echo "</tr>";

            }
            echo "</table>";
        }
        ?>
        <p><a href="addcontent.php" title="Register Page"> Add New Content &gt;&gt;</a></p>

         <footer>

             <?php include '../../modules/borfooter.inc'; ?>

         </footer>

</section>

<div id="side">
    <?php include '../../modules/bornav.inc'; ?>
    <div id="flourish2"></div>
</div>
    </body>

</html>
