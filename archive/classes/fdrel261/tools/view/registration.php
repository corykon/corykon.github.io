<?php
    $sid = session_id();
    if(empty($sid)){
        session_start();
    }

    if (isset($_SESSION['message'])){
        $message = $_SESSION['message'];
    }

    if (isset($_SESSION['errors'])){
        $errors = $_SESSION['errors'];
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
        <title>Registration | BofR</title>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="../../css/borstyle.css" />
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"></script>
        <script type="text/javascript" src="/scripts/jquery.validate.js"></script>
        <script type="text/javascript" src="/scripts/regrules.js"></script>
    </head>
    <body>
        <header>
        <h1><span>Cory K. Fugate</span></h1>
        <h2><span>Book of Remembrance</span></h2>

        </header>

    <div id="flourish"></div>
    <section id="content">
        <h3>Registration</h3>
        <p>*An account is needed to view Personal History pages. You can register 
        here, but you'll need to send me an email so 
        I can verify/activate your account. </p>
        <?php
            if ($message) {
                echo "<p class='notice'>$message</p>"; //--Notice the double quotes...
                if ($errors) {
                    echo "<ul class='notice'>";
                    foreach ($errors as $error) {
                         echo "<li>$error</li>";
                    }
                    echo "</ul>";
                }
            }
            $_SESSION['message'] = false;
        ?>
        <form action=".." id="regform" method="post">
            <fieldset>
                <legend>Enter User Information:</legend>
                <ul class="nolist">
                    <li><label for="txtfname">First Name:</label><input type="text" name="txtfname" id="txtfname" size="12"
                    <?php if (!empty($_SESSION['txtfname'])) { echo "value='$_SESSION[txtfname]'"; } ?>></li>

                    <li><label for="txtlname">Last Name:</label><input type="text" name="txtlname" id="txtlname" size="20"
                    <?php if (!empty($_SESSION['txtlname'])) { echo "value='$_SESSION[txtlname]'"; } ?>></li>

                    <li><label for="username">Username:</label><input type="text" name="username" id="username" size="20"
                    <?php if (!empty($_SESSION['username'])) { echo "value='$_SESSION[username]'"; } ?>></li>

                    <li><label for="emailaddress">Email:</label><input type="email" name="emailaddress"  id="emailaddress" size="30"
                    <?php if (!empty($_SESSION['emailaddress'])) { echo "value='$_SESSION[emailaddress]'"; } ?>></li>

                    <li><label for="pswd">Password:</label><input type="password" name="pswd" id="pswd" size="12"
                    <?php if (!empty($_SESSION['pswd'])) { echo "value='$_SESSION[pswd]'"; } ?>></li>

                    <li><input type="submit" name="registration" id="registration" value="Register"></li>
                </ul>
            </fieldset>

                    <?php
                        //Set SESSION variables to zero after they've been used:
                        $_SESSION['txtfname'] = 0;
                        $_SESSION['txtlname'] = 0;
                        $_SESSION['username'] = 0;
                        $_SESSION['emailaddress'] = 0;
                        $_SESSION['pswd'] = 0;
                    ?>

        </form>

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
