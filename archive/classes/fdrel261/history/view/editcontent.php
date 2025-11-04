<?php
 include '../../modules/phphead.inc';

    if (isset($_SESSION['contenttoedit'])){
        $contentitem = $_SESSION['contenttoedit'];
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
        <title>Admin Edit Life Journal Content | BofR</title>
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
        <h3>Edit Life Journal Content</h3>
        <?php
        if ($message) {
            echo "<p class='notice'>$message</p>";
        }
        $_SESSION['message'] = false;
        ?>

        <form action=".." method="post">
            <fieldset>
                <legend>Edit Content</legend>
                <ul class="nolist">
                    <li><label for="title">Content Title:</label>
                        <input type="text" name="title" id="title" size="50"
                               <?php echo "value='$contentitem[0]'";?>></li>

                    <li><label for="ctext">Content Text:</label>
                        <textarea name="ctext" id="ctext" cols="40" rows="10">
                            <?php echo $contentitem[1]; ?>
                        </textarea></li>
                        <li><input type="submit" name="editcontent" id="editcontent" value="Update"></li>

                    <li><input type="hidden" name="bofrid" id="bofrid" value="<?php echo $contentitem[2] ?>"></li>
                </ul>
            </fieldset>

        </form>
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