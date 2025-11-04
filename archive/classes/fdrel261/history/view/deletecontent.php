<?php
include '../../modules/phphead.inc';

    if (isset($_SESSION['contenttodel'])){
        $contentitem = $_SESSION['contenttodel'];
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
        <title>Admin Delete Content | BofR</title>
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
        <h3>Delete Life Journal Content</h3>
        <?php
        if ($message) {
        echo "<p class='notice'>$message</p>";
        }
        $_SESSION['message'] = false;
        ?>

        <?php if (!is_null($_SESSION['contenttodel'])){ ?>
        <table>
            <tr><td>ID:</td><td> <?php echo $contentitem[0] ?></td></tr>
            <tr><td>Title:</td><td> <?php echo $contentitem[1] ?></td></tr>
            <tr><td></td>
                <td><form method="post" action="..">
                <input type="submit" name="delsubmit" value="Delete">
                <input type="hidden" name="deleteid" value="<?php echo $contentitem[0] ?>">
                </form></td></tr>
        </table>


        
        <?php } $_SESSION['contenttodel']= NULL ?>
         <p><a href=".." title="View Content"> View Full Personal History Content List &gt;&gt; </a></p>
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