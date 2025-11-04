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
        <title>Edit User Information | BofR</title>
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
        <h3>Edit User Information</h3>
        <?php
        if ($message) {
            echo "<p class='notice'>$message</p>";
        }
        $_SESSION['message'] = false;
        ?>

        <form action=".." method="post">
            <fieldset>
                <legend>Edit Information</legend>
                <ul class="nolist">
                    <li><label for="txtfname">First Name:</label><input type="text" name="txtfname" id="txtfname" size="12"
                    <?php echo "value ='$person[0]'"?>></li>

                    <li><label for="txtlname">Last Name:</label><input type="text" name="txtlname" id="txtlname" size="20"
                    <?php echo "value ='$person[1]'"?>></li>
                    
                     <li><label for="emailaddress">Email:</label><input type="email" name="emailaddress"  id="emailaddress" size="30"
                     <?php echo "value ='$person[2]'"?>></li>

                     <li><label for="pswd">Password:</label><input type="password" name="pswd" id="pswd" size="12" value ="">
                     <?php echo "(Leave blank to keep same password)"?></li>

                    <li><input type="submit" name="update" id="update" value="Update"></li>

                    <li><input type="hidden" name="updateId" id="updateId" value="<?php echo $person[3] ?>"></li>
                </ul>
            </fieldset>

        </form>
        <p><a href=".." title="View Registered Users"> Back to Registered Users Page &gt;&gt; </a></p>
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