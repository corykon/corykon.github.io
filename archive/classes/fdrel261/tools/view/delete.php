<?php
 $sid = session_id();
    if(empty($sid)){
        session_start();
    }

    if (isset($_SESSION['membertodel'])){
        $person = $_SESSION['membertodel'];
    }

    if (isset($_SESSION['errors'])){
        $errors = $_SESSION['errors'];
    }

    if (isset($_SESSION['message'])){
        $message = $_SESSION['message'];
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Delete User | BofR</title>
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
        <h2>Delete Confirmation</h2>
        <?php
        if ($message) {
        echo "<p class='notice'>$message</p>";
        }
        $_SESSION['message'] = false;
        ?>

        <?php if (!is_null($_SESSION['membertodel'])){ ?>
        <ul>
            <li>First Name: <?php echo $person[0] ?></li>
            <li>Last Name: <?php echo $person[1] ?></li>
            <li>Email Address: <?php echo $person[2] ?></li>
            <li>
                <form method="post" action="..">
                <input type="submit" name="delsubmit" value="Delete">
                <input type="hidden" name="deleteid" value="<?php echo $person[3] ?>">
                </form>
            </li>

        </ul>
        <?php } $_SESSION['membertodel']= NULL ?>
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