<?php
 $sid = session_id();
    if(empty($sid)){
        session_start();
    }

    if (isset($_SESSION['membertoedit'])){
        $person = $_SESSION['membertoedit'];
    }

    if (isset($_SESSION['errors'])){
        $errors = $_SESSION['errors'];
    }

    if (isset($_SESSION['message'])){
        $message = $_SESSION['message'];
    }

    /*Get info for currently logged in user */
    $loginflag = $_SESSION['userlogin'];
    $loginfirst = $_SESSION['userfirst'];
    $loginlast = $_SESSION['userlast'];
    $loginlevel = $_SESSION['userlevel'];
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Login Page | BofR</title>
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
        <h3>Login Page</h3>
        <p>*You must be logged in order to view Personal History pages. If you need
        an account, send me an email.</p>
        <?php
        if ($message) {
            echo "<p class='notice'>$message</p>";
        }
        $_SESSION['message'] = false;
        ?>

        <form action=".." method="post">
            <fieldset>
                <legend>Login Information</legend>
                <ul class="nolist">
                    <li><label for="txtfname">Username:</label><input type="text" name="txtuname" id="txtuname" size="12"></li>

                     <li><label for="pswd">Password:</label><input type="password" name="pswd" id="pswd" size="12"></li>

                    <li><input type="submit" name="login" id="login" value="Login"></li>
                </ul>
            </fieldset>

        </form>

         <footer>

             <?php include '../../modules/borfooter.inc'; ?>

         </footer>

</section>

<div id="side">

       <?php include '../../modules/bornav.inc';  ?>
    <div id="flourish2"></div>
</div>
    </body>

</html>